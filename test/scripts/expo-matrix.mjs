#!/usr/bin/env node
/**
 * Build the SDK into a fresh Expo app for one Expo SDK version, to prove the
 * config plugin applies cleanly against that version's templates.
 *
 * The SDK is installed from an `npm pack` tarball rather than a workspace link.
 * That is the shape a customer gets. A link resolves the SDK's own
 * devDependencies from the monorepo, which is how a bare-app bundling failure
 * once passed unnoticed in this repository's own dev setup.
 *
 * Usage:
 *   node test/scripts/expo-matrix.mjs <sdkVersion> <tarball> <workDir> [--build]
 *
 * Without --build it stops after prebuild, which is the fast signal for whether
 * the plugin's Kotlin mods applied. With --build it also runs assembleDebug.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [sdkVersion, tarball, workDir] = process.argv.slice(2);
const doBuild = process.argv.includes('--build');

if (!sdkVersion || !tarball || !workDir) {
  console.error('usage: expo-matrix.mjs <sdkVersion> <tarball> <workDir> [--build]');
  process.exit(2);
}

const APP_PACKAGE = 'com.example.twiliovoicematrix';
const appDir = join(workDir, `sdk${sdkVersion}`);

const run = (cmd, args, opts = {}) => {
  process.stderr.write(`  $ ${cmd} ${args.join(' ')}\n`);
  return execFileSync(cmd, args, {
    cwd: appDir,
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    ...opts,
  });
};

const step = (name) => process.stderr.write(`\n[sdk ${sdkVersion}] ${name}\n`);

/**
 * Resolve the newest published template version for an Expo major.
 *
 * The obvious spelling is the `sdk-<major>` dist-tag, but this repository
 * resolves npm through an Artifactory virtual registry that mirrors versions
 * without mirroring dist-tags, and the public registry is not reachable. So
 * list versions and pick the highest matching major instead.
 */
function resolveTemplateVersion() {
  const out = execFileSync(
    'npm',
    ['view', 'expo-template-blank-typescript', 'versions', '--json'],
    { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }
  );
  const versions = JSON.parse(out);
  const matching = versions.filter((v) => v.startsWith(`${sdkVersion}.`));
  if (!matching.length) {
    throw new Error(
      `no expo-template-blank-typescript version for Expo ${sdkVersion}`
    );
  }
  return matching[matching.length - 1];
}

function scaffold() {
  step('scaffold');
  rmSync(appDir, { recursive: true, force: true });
  mkdirSync(appDir, { recursive: true });

  const templateVersion = resolveTemplateVersion();
  process.stderr.write(`  template: expo-template-blank-typescript@${templateVersion}\n`);

  execFileSync(
    'npx',
    [
      '--yes',
      'create-expo-app@latest',
      appDir,
      '--template',
      `expo-template-blank-typescript@${templateVersion}`,
      '--no-install',
    ],
    { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }
  );
}

function configure() {
  step('configure');
  const pkgPath = join(appDir, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  pkg.dependencies['@twilio/voice-react-native-sdk'] = `file:${tarball}`;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

  // A google-services.json is required because the SDK's Android manifest pulls
  // in Firebase messaging. Contents are irrelevant to a build.
  writeFileSync(
    join(appDir, 'google-services.json'),
    JSON.stringify(
      {
        project_info: {
          project_number: '000000000000',
          project_id: 'matrix-build-test',
          storage_bucket: 'matrix-build-test.appspot.com',
        },
        client: [
          {
            client_info: {
              mobilesdk_app_id: '1:000000000000:android:0000000000000000',
              android_client_info: { package_name: APP_PACKAGE },
            },
            oauth_client: [],
            // Deliberately not in Google's AIza[0-9A-Za-z_-]{35} shape, so secret
            // scanners do not flag this placeholder. The plugin only needs a
            // non-empty value; nothing here talks to FCM.
            api_key: [{ current_key: 'not-a-real-api-key' }],
            services: { appinvite_service: { other_platform_oauth_client: [] } },
          },
        ],
        configuration_version: '1',
      },
      null,
      2
    )
  );

  const appJsonPath = join(appDir, 'app.json');
  const appJson = JSON.parse(readFileSync(appJsonPath, 'utf8'));
  appJson.expo.android = {
    ...(appJson.expo.android || {}),
    package: APP_PACKAGE,
    googleServicesFile: './google-services.json',
  };
  appJson.expo.plugins = [
    ...(appJson.expo.plugins || []),
    '@twilio/voice-react-native-sdk',
  ];
  writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
}

function assertPluginApplied() {
  step('assert plugin output');
  const base = join(appDir, 'android/app/src/main/java', ...APP_PACKAGE.split('.'));
  const checks = [
    ['MainApplication.kt', 'import com.twiliovoicereactnative.VoiceApplicationProxy'],
    ['MainApplication.kt', 'private val voiceApplicationProxy'],
    ['MainApplication.kt', 'voiceApplicationProxy.onCreate()'],
    ['MainApplication.kt', 'override fun onTerminate()'],
    ['MainActivity.kt', 'import com.twiliovoicereactnative.VoiceActivityProxy'],
    ['MainActivity.kt', 'private val voiceActivityProxy'],
    ['MainActivity.kt', 'voiceActivityProxy.onCreate(savedInstanceState)'],
    ['MainActivity.kt', 'override fun onDestroy()'],
    ['MainActivity.kt', 'override fun onNewIntent(intent: Intent)'],
  ];
  const failures = [];
  for (const [file, needle] of checks) {
    const path = join(base, file);
    if (!existsSync(path)) {
      failures.push(`${file} missing`);
      continue;
    }
    if (!readFileSync(path, 'utf8').includes(needle)) {
      failures.push(`${file} lacks: ${needle}`);
    }
  }

  /**
   * The Expo SDK version the plugin bakes into the manifest. The native layer
   * reads it before any JavaScript runs, which is the only way an incoming call
   * that launches the process cold can report the version, so a prebuild that
   * silently stopped emitting it would go unnoticed until the insights data came
   * back wrong.
   */
  const manifest = join(appDir, 'android/app/src/main/AndroidManifest.xml');
  if (!existsSync(manifest)) {
    failures.push('AndroidManifest.xml missing');
  } else {
    const meta = readFileSync(manifest, 'utf8').match(
      /android:name="com\.twilio\.voice\.expo_version"\s+android:value="([^"]*)"/
    );
    if (!meta) {
      failures.push('AndroidManifest.xml lacks com.twilio.voice.expo_version');
    } else if (!/^\d+\.\d+\.\d+$/.test(meta[1])) {
      failures.push(`com.twilio.voice.expo_version unresolved: "${meta[1]}"`);
    }
  }

  if (failures.length) {
    throw new Error(`plugin output incomplete:\n  - ${failures.join('\n  - ')}`);
  }
  process.stderr.write(`  all ${checks.length + 1} assertions passed\n`);
}

function main() {
  const started = Date.now();
  scaffold();
  configure();
  step('install');
  run('npm', ['install', '--no-audit', '--no-fund']);
  step('prebuild');
  run('npx', ['expo', 'prebuild', '--clean', '--platform', 'android']);
  assertPluginApplied();

  let apk = null;
  if (doBuild) {
    step('assembleDebug');
    /**
     * Restrict the ABI. The default builds four, and every emulator in the
     * matrix is arm64, so three quarters of the native compile is wasted. Passed
     * as a flag rather than set in gradle.properties because hosted CI runners
     * use x86_64 emulators and would need the opposite value.
     */
    const abi = process.env.MATRIX_ABI || 'arm64-v8a';
    run('./gradlew', [':app:assembleDebug', `-PreactNativeArchitectures=${abi}`], {
      cwd: join(appDir, 'android'),
    });
    apk = join(appDir, 'android/app/build/outputs/apk/debug/app-debug.apk');
    if (!existsSync(apk)) throw new Error('no APK produced');
  }

  const expoVersion = JSON.parse(
    readFileSync(join(appDir, 'node_modules/expo/package.json'), 'utf8')
  ).version;
  const rnVersion = JSON.parse(
    readFileSync(join(appDir, 'node_modules/react-native/package.json'), 'utf8')
  ).version;

  console.log(
    JSON.stringify({
      sdk: sdkVersion,
      expo: expoVersion,
      reactNative: rnVersion,
      prebuild: 'pass',
      pluginAssertions: 'pass',
      build: doBuild ? 'pass' : 'skipped',
      apk,
      appPackage: APP_PACKAGE,
      seconds: Math.round((Date.now() - started) / 1000),
    })
  );
}

main();
