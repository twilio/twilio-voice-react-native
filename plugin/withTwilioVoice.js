/**
 * Resolved through `expo` rather than `@expo/config-plugins` directly.
 *
 * `@expo/config-plugins` is not a dependency of this package; requiring it by
 * name works only while a hoisting node_modules layout happens to place it at
 * the top level. Under pnpm's strict linker or Yarn PnP that require fails with
 * MODULE_NOT_FOUND while `app.plugin.js` is loading, which aborts
 * `expo prebuild`. `expo` is already an optional peer dependency and re-exports
 * the same module, so this path resolves wherever the plugin can legitimately
 * run, and cannot end up as a second copy mismatched against the application's
 * own `expo`.
 */
const {
  AndroidConfig,
  withAndroidManifest,
  withMainApplication,
  withMainActivity,
  withInfoPlist,
  withEntitlementsPlist,
  createRunOncePlugin,
} = require('expo/config-plugins');

const TAG = 'twilio-voice-react-native';
const pkg = require('../package.json');

const MANUAL_WIRING =
  'Full manual wiring: https://github.com/twilio/twilio-voice-react-native' +
  '/blob/latest/docs/expo/app-config.md';

/**
 * Where the host application's Expo SDK version is recorded at build time.
 *
 * `Voice` also reports this version from JavaScript, but an incoming call on
 * Android runs no JavaScript at all before the native layer emits its first
 * insights event: on a cold start `VoiceFirebaseMessagingService` reaches
 * `Voice.handleMessage` before the application's JavaScript bundle has
 * constructed `Voice`. Baking the version into the built application lets the
 * native layer read it without JavaScript having run.
 */
const ANDROID_EXPO_VERSION_METADATA = 'com.twilio.voice.expo_version';
const IOS_EXPO_VERSION_KEY = 'TwilioVoiceExpoVersion';

const APS_ENVIRONMENT_DEFAULT = 'development';

/* ------------------------------------------------------------------ utils */

/**
 * Add each of `imports` that is not already present.
 *
 * Presence is decided by comparing whole trimmed lines. A substring test is
 * wrong here: `import android.content.Intent` is a prefix of
 * `import android.content.IntentFilter`, so a file that imported only
 * `IntentFilter` had the `Intent` import skipped while
 * `onNewIntent(intent: Intent)` was still emitted. Prebuild succeeded and
 * Gradle then failed on an unresolved reference, with nothing naming this
 * plugin.
 */
function addImports(src, imports) {
  let out = src;
  for (const imp of imports) {
    const wanted = imp.trim();
    const lines = out.split('\n');
    let last = -1;
    let present = false;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === wanted) {
        present = true;
      }
      if (/^import\s/.test(lines[i])) {
        last = i;
      }
    }
    if (present) continue;
    if (last === -1) throw new Error(`${TAG}: no import block found`);
    lines.splice(last + 1, 0, imp);
    out = lines.join('\n');
  }
  return out;
}

/**
 * Index of the brace that closes the block opened at `openIdx`.
 *
 * A plain depth counter is not enough for Kotlin source. A brace can appear in
 * a line comment, a block comment, a character literal or a string, where it
 * opens nothing; and `${...}` inside a string re-enters code, so the brace that
 * closes the template must return the scanner to the string rather than close a
 * block. This walks those contexts with a small stack of frames.
 *
 * @returns the index of the matching `}`, or -1 when the block never closes.
 */
function matchingBrace(src, openIdx) {
  // One frame per context the scanner is inside. A `code` frame counts the
  // braces open within it; the literal frames skip braces entirely.
  const frames = [{ kind: 'code', depth: 0 }];

  for (let i = openIdx; i < src.length; i++) {
    const frame = frames[frames.length - 1];
    const char = src[i];
    const pair = src.substr(i, 2);

    if (frame.kind === 'code') {
      if (pair === '//') {
        const eol = src.indexOf('\n', i);
        if (eol === -1) return -1;
        i = eol;
      } else if (pair === '/*') {
        const end = src.indexOf('*/', i + 2);
        if (end === -1) return -1;
        i = end + 1;
      } else if (src.startsWith('"""', i)) {
        frames.push({ kind: 'raw' });
        i += 2;
      } else if (char === '"') {
        frames.push({ kind: 'string' });
      } else if (char === "'") {
        frames.push({ kind: 'char' });
      } else if (char === '{') {
        frame.depth += 1;
      } else if (char === '}') {
        frame.depth -= 1;
        if (frame.depth === 0) {
          if (frames.length === 1) return i;
          // This brace closed a `${...}`, so resume the enclosing literal.
          frames.pop();
        }
      }
      continue;
    }

    if (pair === '${') {
      frames.push({ kind: 'code', depth: 1 });
      i += 1;
    } else if (frame.kind === 'raw') {
      if (src.startsWith('"""', i)) {
        frames.pop();
        i += 2;
      }
    } else if (char === '\\') {
      i += 1;
    } else if (
      (frame.kind === 'string' && char === '"') ||
      (frame.kind === 'char' && char === "'")
    ) {
      frames.pop();
    }
  }

  return -1;
}

/**
 * Index of the brace that opens the body of the class `classRegex` matches, or
 * -1 when the class is absent or has no body.
 */
function classBodyStart(src, classRegex) {
  const match = src.match(classRegex);
  if (!match) return -1;
  return src.indexOf('{', match.index + match[0].length - 1);
}

/**
 * Insert `body` into the method `signatureRegex` matches, immediately after
 * `anchorAfter`.
 *
 * The anchor is required and is searched only within the matched method's own
 * braces. Searching the rest of the file instead meant an `onCreate` with no
 * `super.onCreate()` of its own matched the `super.onCreate()` of some later
 * method and the statement was injected there, where the parameter it is given
 * is not in scope. Falling back to the top of the method instead would run the
 * SDK before the superclass had initialised.
 *
 * @returns the updated source, or null when the signature is not present.
 */
function insertAtStartOfMethod(src, signatureRegex, body, anchorAfter, what) {
  const match = src.match(signatureRegex);
  if (!match) return null;

  const end = match.index + match[0].length;

  /**
   * An expression body has no block to insert into. The old search for the
   * next `{` found whichever block the expression called and injected the
   * statement there, out of scope and uncompilable.
   */
  if (/^\s*=/.test(src.slice(end))) {
    throw new Error(expressionBodyMessage(what));
  }

  /**
   * Both guards below are invariants rather than reachable paths. `openIdx` is
   * -1 only for a method declared with no body at all, and `closeIdx` is -1
   * only for unbalanced braces; by the time this runs the enclosing class has
   * already been located and brace-matched, which cannot succeed if either is
   * true. They are kept so that a future caller running earlier cannot corrupt
   * the generated file silently, and excluded from coverage rather than reached
   * by a contrived test through a private door.
   */
  const openIdx = src.indexOf('{', end - 1);
  /* istanbul ignore next */
  if (openIdx === -1) return null;

  const closeIdx = matchingBrace(src, openIdx);
  /* istanbul ignore next */
  if (closeIdx === -1) throw new Error(unterminatedMessage(what));

  const methodBody = src.slice(openIdx, closeIdx);
  const anchor = methodBody.match(anchorAfter.regex);
  if (!anchor) {
    throw new Error(missingAnchorMessage(what, anchorAfter.description));
  }
  const insertAt = openIdx + anchor.index + anchor[0].length;

  return src.slice(0, insertAt) + '\n' + body + src.slice(insertAt);
}

/* --------------------------------------------------------------- messages */

/**
 * Build the error shown when another plugin already declares one of the
 * overrides this plugin adds. States what broke, why, and the exact remedy.
 */
function conflictMessage(method, proxy = 'voiceActivityProxy') {
  const host =
    proxy === 'voiceApplicationProxy' ? 'MainApplication' : 'MainActivity';
  const arg = method === 'onNewIntent' ? 'intent' : '';
  return [
    `${TAG}: cannot add "override fun ${method}" to ${host} because another`,
    'config plugin already declares it. Kotlin does not allow two declarations',
    'of the same method, and this plugin will not edit code it does not own.',
    '',
    "To resolve, remove this plugin's Android mods and wire the SDK by hand:",
    `add the following call inside your existing ${host}.${method}, keeping`,
    'whatever else that method already does.',
    '',
    `    ${proxy}.${method}(${arg})`,
    '',
    MANUAL_WIRING,
  ].join('\n');
}

function expressionBodyMessage(what) {
  return [
    `${TAG}: cannot hook ${what} because it has an expression body (\`= ...\`)`,
    'rather than a block body. This plugin adds a statement to the start of the',
    'method, and an expression body has nowhere to put one.',
    '',
    'To resolve, give the method a block body, or wire the SDK by hand.',
    '',
    MANUAL_WIRING,
  ].join('\n');
}

function missingAnchorMessage(what, anchor) {
  return [
    `${TAG}: cannot hook ${what} because it does not call ${anchor}.`,
    "This plugin inserts the SDK's setup call immediately after that call,",
    'because the SDK requires the superclass to have run first. Inserting it at',
    'the top of the method instead would run the SDK against a half-initialised',
    'object.',
    '',
    `To resolve, call ${anchor} in ${what}, or wire the SDK by hand.`,
    '',
    MANUAL_WIRING,
  ].join('\n');
}

function unterminatedMessage(what) {
  return [
    `${TAG}: could not find the end of ${what}: its braces do not balance.`,
    'Fix the Kotlin source and run prebuild again.',
  ].join('\n');
}

/**
 * Build the error shown when a file already carries some of this plugin's
 * members but not all of them.
 */
function partialWiringMessage(host, missing) {
  return [
    `${TAG}: ${host} already contains some of the members this plugin adds, so`,
    'this plugin will not edit it, but the following are missing:',
    '',
    ...missing.map((description) => `    ${description}`),
    '',
    'Without all of them the application builds and installs and then does not',
    "ring. Either add the missing members by hand, or remove this SDK's members",
    `from ${host} entirely and let this plugin add all of them.`,
    '',
    MANUAL_WIRING,
  ].join('\n');
}

/* ----------------------------------------------------------- wiring guard */

/**
 * Members this plugin adds to MainApplication, in the form the manual wiring
 * documentation tells developers to write them.
 */
const APPLICATION_MEMBERS = [
  {
    description:
      'private val voiceApplicationProxy = VoiceApplicationProxy(this)',
    regex: /\bvoiceApplicationProxy\s*=\s*VoiceApplicationProxy\b/,
  },
  {
    description: 'voiceApplicationProxy.onCreate(), inside onCreate',
    regex: /\bvoiceApplicationProxy\.onCreate\s*\(/,
  },
  {
    description:
      'voiceApplicationProxy.onTerminate(), inside an onTerminate override',
    regex: /\bvoiceApplicationProxy\.onTerminate\s*\(/,
  },
];

/**
 * Members this plugin adds to MainActivity.
 */
const ACTIVITY_MEMBERS = [
  {
    description:
      'private val voiceActivityProxy = VoiceActivityProxy(this) { ... }',
    regex: /\bvoiceActivityProxy\s*=\s*VoiceActivityProxy\b/,
  },
  {
    description:
      'voiceActivityProxy.onCreate(savedInstanceState), inside onCreate',
    regex: /\bvoiceActivityProxy\.onCreate\s*\(/,
  },
  {
    description: 'voiceActivityProxy.onDestroy(), inside an onDestroy override',
    regex: /\bvoiceActivityProxy\.onDestroy\s*\(/,
  },
  {
    description:
      'voiceActivityProxy.onNewIntent(intent), inside an onNewIntent override',
    regex: /\bvoiceActivityProxy\.onNewIntent\s*\(/,
  },
];

/**
 * Whether `src` is already wired for this SDK.
 *
 * Checks for each member the plugin owns rather than for the proxy name alone.
 * A name test cannot tell a fully wired file from a partially wired one, and
 * the manual wiring documentation asks developers to add all of these members
 * themselves, so a file carrying some of them is reachable. Returning such a
 * file unchanged added no overrides, no imports and no error, and the result
 * compiled.
 *
 * @returns true when every member is present, false when none are.
 * @throws when some are present and some are not, which no automatic edit can
 * resolve safely.
 */
function isAlreadyWired(src, members, host) {
  const missing = members.filter(({ regex }) => !regex.test(src));
  if (missing.length === 0) return true;
  if (missing.length === members.length) return false;
  throw new Error(
    partialWiringMessage(
      host,
      missing.map(({ description }) => description)
    )
  );
}

/* -------------------------------------------------------- android: app */

const CLASS_MAIN_APPLICATION = /class\s+MainApplication\s*:\s*[^{]*/;

function withVoiceMainApplication(config) {
  return withMainApplication(config, (cfg) => {
    if (cfg.modResults.language !== 'kt') {
      throw new Error(
        `${TAG}: MainApplication must be Kotlin (found ${cfg.modResults.language}).`
      );
    }
    let src = cfg.modResults.contents;

    if (isAlreadyWired(src, APPLICATION_MEMBERS, 'MainApplication')) {
      cfg.modResults.contents = src;
      return cfg;
    }

    src = addImports(src, [
      'import com.twiliovoicereactnative.VoiceApplicationProxy',
    ]);

    const classStart = classBodyStart(src, CLASS_MAIN_APPLICATION);
    if (classStart === -1) {
      throw new Error(`${TAG}: could not find class MainApplication`);
    }
    const classEnd = matchingBrace(src, classStart);
    if (classEnd === -1) {
      throw new Error(unterminatedMessage('class MainApplication'));
    }

    /**
     * Kotlin cannot declare onTerminate twice, so a conflict must fail the
     * prebuild rather than skip. Skipping would leave
     * voiceApplicationProxy.onTerminate() uncalled and the SDK would never
     * tear down.
     *
     * The wiring guard above means any onTerminate reaching here belongs to
     * another plugin, not to a previous run of ours.
     */
    if (/override\s+fun\s+onTerminate/.test(src)) {
      throw new Error(conflictMessage('onTerminate', 'voiceApplicationProxy'));
    }

    // Insert back to front, so `classStart` stays valid.
    src =
      src.slice(0, classEnd) +
      '\n  // @generated by ' +
      TAG +
      '\n  override fun onTerminate() {' +
      '\n    voiceApplicationProxy.onTerminate()' +
      '\n    super.onTerminate()' +
      '\n  }\n' +
      src.slice(classEnd);

    src =
      src.slice(0, classStart + 1) +
      '\n  // @generated by ' +
      TAG +
      '\n  private val voiceApplicationProxy = VoiceApplicationProxy(this)\n' +
      src.slice(classStart + 1);

    // hook onCreate, immediately after super.onCreate()
    const withOnCreate = insertAtStartOfMethod(
      src,
      /override\s+fun\s+onCreate\s*\(\s*\)\s*/,
      '    voiceApplicationProxy.onCreate() // @generated by ' + TAG,
      { regex: /super\.onCreate\(\)/, description: 'super.onCreate()' },
      'MainApplication.onCreate()'
    );
    if (!withOnCreate) {
      throw new Error(`${TAG}: could not find MainApplication.onCreate`);
    }
    src = withOnCreate;

    cfg.modResults.contents = src;
    return cfg;
  });
}

/* --------------------------------------------- android: activity overrides */

/**
 * Overrides this plugin adds to MainActivity. Each must be the only declaration
 * of that method in the generated file.
 */
const ACTIVITY_OVERRIDES = [
  {
    name: 'onDestroy',
    regex: /override\s+fun\s+onDestroy/,
    body: `
  // @generated by ${TAG}
  override fun onDestroy() {
    voiceActivityProxy.onDestroy()
    super.onDestroy()
  }
`,
  },
  {
    name: 'onNewIntent',
    regex: /override\s+fun\s+onNewIntent/,
    body: `
  // @generated by ${TAG}
  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    voiceActivityProxy.onNewIntent(intent)
  }
`,
  },
];

/* ---------------------------------------------------- android: activity */

const CLASS_MAIN_ACTIVITY = /class\s+MainActivity\s*:\s*[^{]*/;

function withVoiceMainActivity(config) {
  return withMainActivity(config, (cfg) => {
    if (cfg.modResults.language !== 'kt') {
      throw new Error(
        `${TAG}: MainActivity must be Kotlin (found ${cfg.modResults.language}).`
      );
    }
    let src = cfg.modResults.contents;

    if (isAlreadyWired(src, ACTIVITY_MEMBERS, 'MainActivity')) {
      cfg.modResults.contents = src;
      return cfg;
    }

    src = addImports(src, [
      'import android.Manifest',
      'import android.content.Intent',
      'import android.os.Build',
      'import android.os.Bundle',
      'import android.widget.Toast',
      'import com.twiliovoicereactnative.VoiceActivityProxy',
    ]);

    const classStart = classBodyStart(src, CLASS_MAIN_ACTIVITY);
    if (classStart === -1) {
      throw new Error(`${TAG}: could not find class MainActivity`);
    }
    const classEnd = matchingBrace(src, classStart);
    if (classEnd === -1) {
      throw new Error(unterminatedMessage('class MainActivity'));
    }

    /**
     * Kotlin cannot declare the same override twice, so if another config
     * plugin already added one of these we cannot add ours.
     *
     * Fail the prebuild instead of skipping. Skipping silently produces an app
     * that builds, installs and then never rings, with no error anywhere. A
     * build-time failure naming the conflict is a defect the developer can see
     * and act on.
     *
     * This cannot fire on a repeated prebuild against our own output: the
     * wiring guard above catches that case first, so any override reaching
     * this point belongs to someone else.
     */
    let extras = '';
    for (const { name, regex, body } of ACTIVITY_OVERRIDES) {
      if (regex.test(src)) {
        throw new Error(conflictMessage(name));
      }
      extras += body;
    }

    // Insert back to front, so `classStart` stays valid.
    src = src.slice(0, classEnd) + extras + '\n' + src.slice(classEnd);

    const field = `  // @generated by ${TAG}
  private val voiceActivityProxy = VoiceActivityProxy(this) { permission ->
    when {
      Manifest.permission.RECORD_AUDIO == permission ->
        Toast.makeText(this, "Microphone permissions needed. Please allow in your application settings.", Toast.LENGTH_LONG).show()
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.S &&
        Manifest.permission.BLUETOOTH_CONNECT == permission ->
        Toast.makeText(this, "Bluetooth permissions needed. Please allow in your application settings.", Toast.LENGTH_LONG).show()
      Build.VERSION.SDK_INT > Build.VERSION_CODES.S_V2 &&
        Manifest.permission.POST_NOTIFICATIONS == permission ->
        Toast.makeText(this, "Notification permissions needed. Please allow in your application settings.", Toast.LENGTH_LONG).show()
    }
  }
`;
    src =
      src.slice(0, classStart + 1) + '\n' + field + src.slice(classStart + 1);

    // Expo's template already overrides onCreate(savedInstanceState: Bundle?)
    const withOnCreate = insertAtStartOfMethod(
      src,
      /override\s+fun\s+onCreate\s*\(\s*savedInstanceState\s*:\s*Bundle\?\s*\)\s*/,
      `    voiceActivityProxy.onCreate(savedInstanceState) // @generated by ${TAG}`,
      { regex: /super\.onCreate\([^)]*\)/, description: 'super.onCreate(...)' },
      'MainActivity.onCreate(savedInstanceState)'
    );
    if (!withOnCreate) {
      throw new Error(`${TAG}: could not find MainActivity.onCreate(Bundle?)`);
    }
    src = withOnCreate;

    cfg.modResults.contents = src;
    return cfg;
  });
}

/* ------------------------------------------------- android: expo version */

/**
 * The Expo SDK version to bake into the built application, or undefined when it
 * cannot be determined.
 *
 * `sdkVersion` is resolved by `expo/config` before mods run. When it is absent
 * the mods below add nothing, which leaves the version reported from
 * JavaScript alone -- the behaviour of every release before this one.
 */
function expoSdkVersion(cfg) {
  return typeof cfg.sdkVersion === 'string' && cfg.sdkVersion.length > 0
    ? cfg.sdkVersion
    : undefined;
}

function withVoiceExpoVersionMetaData(config) {
  return withAndroidManifest(config, (cfg) => {
    const version = expoSdkVersion(cfg);
    if (!version) return cfg;

    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      AndroidConfig.Manifest.getMainApplicationOrThrow(cfg.modResults),
      ANDROID_EXPO_VERSION_METADATA,
      version
    );
    return cfg;
  });
}

/* ------------------------------------------------------------------ ios */

function withVoiceInfoPlist(config, { microphoneUsageDescription }) {
  return withInfoPlist(config, (cfg) => {
    cfg.modResults.NSMicrophoneUsageDescription =
      cfg.modResults.NSMicrophoneUsageDescription || microphoneUsageDescription;
    const modes = new Set(cfg.modResults.UIBackgroundModes || []);
    modes.add('audio');
    modes.add('voip');
    cfg.modResults.UIBackgroundModes = Array.from(modes);

    const version = expoSdkVersion(cfg);
    if (version) {
      cfg.modResults[IOS_EXPO_VERSION_KEY] = version;
    }

    return cfg;
  });
}

/**
 * Set `aps-environment`, the entitlement that decides which APNs environment
 * the application's VoIP token is issued against.
 *
 * Precedence puts the application's own app config first. Defaulting silently
 * to `development` meant the no-props plugin entry that every documentation
 * example shows produced a release build whose VoIP token was registered
 * against the APNs sandbox: the build succeeded, `Voice.register()` resolved,
 * and incoming calls never arrived. Falling back to the default now says so in
 * the prebuild output.
 */
function withVoiceEntitlements(config, { apsEnvironment }) {
  return withEntitlementsPlist(config, (cfg) => {
    const resolved =
      cfg.ios?.entitlements?.['aps-environment'] ||
      cfg.modResults['aps-environment'] ||
      apsEnvironment;

    if (resolved) {
      cfg.modResults['aps-environment'] = resolved;
      return cfg;
    }

    cfg.modResults['aps-environment'] = APS_ENVIRONMENT_DEFAULT;
    console.warn(
      [
        `${TAG}: "aps-environment" is not set, defaulting to`,
        `"${APS_ENVIRONMENT_DEFAULT}". A release, TestFlight or App Store build`,
        'needs "production", otherwise its VoIP token is registered against the',
        'APNs sandbox and incoming calls never arrive, with no error anywhere.',
        '',
        'Set it either in app config:',
        '',
        '    "ios": { "entitlements": { "aps-environment": "production" } }',
        '',
        'or as a plugin prop:',
        '',
        `    ["@twilio/voice-react-native-sdk", { "apsEnvironment": "production" }]`,
      ].join('\n')
    );
    return cfg;
  });
}

/* ---------------------------------------------------------------- plugin */

const withTwilioVoice = (config, props = {}) => {
  const opts = {
    microphoneUsageDescription: 'This app uses the microphone for voice calls.',
    ...props,
  };

  config = withVoiceMainApplication(config);
  config = withVoiceMainActivity(config);
  config = withVoiceExpoVersionMetaData(config);
  config = withVoiceInfoPlist(config, opts);
  config = withVoiceEntitlements(config, opts);
  return config;
};

module.exports = createRunOncePlugin(withTwilioVoice, pkg.name, pkg.version);
