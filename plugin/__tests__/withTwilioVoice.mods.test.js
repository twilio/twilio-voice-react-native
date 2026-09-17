/**
 * Covers the Gradle and iOS mods, the plugin options, and the error paths.
 *
 * `withTwilioVoice.test.js` covers the Kotlin mods and the collision behaviour.
 * This file covers everything else the plugin does, so that the whole published
 * plugin is exercised rather than only its most interesting half.
 */

const withTwilioVoice = require('../withTwilioVoice');

const baseConfig = (props, extra = {}) =>
  withTwilioVoice({ name: 't', slug: 't', ...extra }, props);

const runMod = async (config, platform, name, modResults) => {
  const mod = config.mods?.[platform]?.[name];
  if (!mod) {
    throw new Error(`mod ${platform}.${name} not registered`);
  }
  const out = await mod({ ...config, modResults, modRequest: {} });
  return out.modResults;
};

/**
 * The Gradle mods were removed after a real Expo 52 prebuild showed that Expo's
 * own `android.googleServicesFile` handling already adds both the
 * google-services classpath and the plugin. Ours early-returned and did
 * nothing, while still carrying a throw path if a template ever lacked the
 * anchor they searched for. Setting `android.googleServicesFile` in app config
 * is now a documented requirement instead.
 */

describe('Info.plist', () => {
  it('sets the microphone usage description and both background modes', async () => {
    const out = await runMod(baseConfig(), 'ios', 'infoPlist', {});
    expect(out.NSMicrophoneUsageDescription).toBe(
      'This app uses the microphone for voice calls.'
    );
    expect(out.UIBackgroundModes.sort()).toStrictEqual(['audio', 'voip']);
  });

  it('honours a custom microphone usage description', async () => {
    const out = await runMod(
      baseConfig({ microphoneUsageDescription: 'Custom reason' }),
      'ios',
      'infoPlist',
      {}
    );
    expect(out.NSMicrophoneUsageDescription).toBe('Custom reason');
  });

  it('does not overwrite a usage description the app already set', async () => {
    const out = await runMod(baseConfig(), 'ios', 'infoPlist', {
      NSMicrophoneUsageDescription: 'App owns this string',
    });
    expect(out.NSMicrophoneUsageDescription).toBe('App owns this string');
  });

  it('unions background modes rather than replacing them', async () => {
    const out = await runMod(baseConfig(), 'ios', 'infoPlist', {
      UIBackgroundModes: ['fetch', 'audio'],
    });
    expect(out.UIBackgroundModes.sort()).toStrictEqual([
      'audio',
      'fetch',
      'voip',
    ]);
  });

  it('is idempotent', async () => {
    const once = await runMod(baseConfig(), 'ios', 'infoPlist', {});
    const twice = await runMod(baseConfig(), 'ios', 'infoPlist', once);
    expect(twice.UIBackgroundModes.sort()).toStrictEqual(['audio', 'voip']);
  });
});

describe('entitlements', () => {
  let warn;

  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warn.mockRestore();
  });

  /**
   * The severe case is a release build that silently registers its VoIP token
   * against the APNs sandbox: it builds, `Voice.register()` resolves, and
   * incoming calls never arrive. Nothing at runtime reports it, so the only
   * place it can be caught is the prebuild output.
   */
  it('defaults aps-environment to development and says so', async () => {
    const out = await runMod(baseConfig(), 'ios', 'entitlements', {});
    expect(out['aps-environment']).toBe('development');

    expect(warn).toHaveBeenCalledTimes(1);
    const flat = warn.mock.calls[0][0].replace(/\s+/g, ' ');
    expect(flat).toContain('defaulting to "development"');
    expect(flat).toContain('"aps-environment": "production"');
    expect(flat).toContain('"apsEnvironment": "production"');
  });

  it('honours a custom apsEnvironment without warning', async () => {
    const out = await runMod(
      baseConfig({ apsEnvironment: 'production' }),
      'ios',
      'entitlements',
      {}
    );
    expect(out['aps-environment']).toBe('production');
    expect(warn).not.toHaveBeenCalled();
  });

  it('does not overwrite a value the app already set', async () => {
    const out = await runMod(baseConfig(), 'ios', 'entitlements', {
      'aps-environment': 'production',
    });
    expect(out['aps-environment']).toBe('production');
    expect(warn).not.toHaveBeenCalled();
  });

  it('honours ios.entitlements from app config', async () => {
    const out = await runMod(
      baseConfig(undefined, {
        ios: { entitlements: { 'aps-environment': 'production' } },
      }),
      'ios',
      'entitlements',
      {}
    );
    expect(out['aps-environment']).toBe('production');
    expect(warn).not.toHaveBeenCalled();
  });

  it('prefers app config over the plugin prop', async () => {
    const out = await runMod(
      baseConfig(
        { apsEnvironment: 'development' },
        { ios: { entitlements: { 'aps-environment': 'production' } } }
      ),
      'ios',
      'entitlements',
      {}
    );
    expect(out['aps-environment']).toBe('production');
  });
});

describe('Expo SDK version recorded at build time', () => {
  /**
   * An incoming call on Android runs no JavaScript before the native layer
   * emits its first insights event, so the version reported from `Voice` is
   * absent on that path. These mods bake it into the built application
   * instead.
   */
  it('adds the Android manifest meta-data', async () => {
    const manifest = {
      manifest: {
        application: [{ $: { 'android:name': '.MainApplication' } }],
      },
    };
    const out = await runMod(
      baseConfig(undefined, { sdkVersion: '52.0.0' }),
      'android',
      'manifest',
      manifest
    );
    const metaData = out.manifest.application[0]['meta-data'];
    expect(metaData).toStrictEqual([
      {
        $: {
          'android:name': 'com.twilio.voice.expo_version',
          'android:value': '52.0.0',
        },
      },
    ]);
  });

  it('adds nothing to the manifest when the sdk version is unknown', async () => {
    const manifest = {
      manifest: {
        application: [{ $: { 'android:name': '.MainApplication' } }],
      },
    };
    const out = await runMod(baseConfig(), 'android', 'manifest', manifest);
    expect(out.manifest.application[0]['meta-data']).toBeUndefined();
  });

  it('adds the iOS Info.plist key', async () => {
    const out = await runMod(
      baseConfig(undefined, { sdkVersion: '52.0.0' }),
      'ios',
      'infoPlist',
      {}
    );
    expect(out.TwilioVoiceExpoVersion).toBe('52.0.0');
  });

  it('adds nothing to Info.plist when the sdk version is unknown', async () => {
    const out = await runMod(baseConfig(), 'ios', 'infoPlist', {});
    expect('TwilioVoiceExpoVersion' in out).toBe(false);
  });

  it('ignores a non-string sdk version', async () => {
    const out = await runMod(
      baseConfig(undefined, { sdkVersion: 52 }),
      'ios',
      'infoPlist',
      {}
    );
    expect('TwilioVoiceExpoVersion' in out).toBe(false);
  });

  it('ignores an empty sdk version', async () => {
    const out = await runMod(
      baseConfig(undefined, { sdkVersion: '' }),
      'ios',
      'infoPlist',
      {}
    );
    expect('TwilioVoiceExpoVersion' in out).toBe(false);
  });
});

describe('MainApplication error paths', () => {
  const run = (contents, language = 'kt') =>
    runMod(baseConfig(), 'android', 'mainApplication', { language, contents });

  it('rejects a non-Kotlin MainApplication', async () => {
    await expect(run('class MainApplication {}', 'java')).rejects.toThrow(
      /must be Kotlin/
    );
  });

  it('throws when the MainApplication class cannot be found', async () => {
    await expect(
      run('import android.app.Application\n\nclass NotIt : Application() {}')
    ).rejects.toThrow(/could not find class MainApplication/);
  });

  it('throws when onCreate cannot be found', async () => {
    await expect(
      run(
        'import android.app.Application\n\nclass MainApplication : Application() {\n}'
      )
    ).rejects.toThrow(/could not find MainApplication.onCreate/);
  });

  it('throws when the file has no import block to extend', async () => {
    await expect(
      run(
        'class MainApplication : Application() {\n  override fun onCreate() {\n    super.onCreate()\n  }\n}'
      )
    ).rejects.toThrow(/no import block/);
  });
});

describe('MainActivity error paths', () => {
  const run = (contents, language = 'kt') =>
    runMod(baseConfig(), 'android', 'mainActivity', { language, contents });

  it('throws when the MainActivity class cannot be found', async () => {
    await expect(
      run('import android.os.Bundle\n\nclass NotIt : ReactActivity() {}')
    ).rejects.toThrow(/could not find class MainActivity/);
  });

  it('throws when onCreate(Bundle?) cannot be found', async () => {
    await expect(
      run(
        'import android.os.Bundle\n\nclass MainActivity : ReactActivity() {\n}'
      )
    ).rejects.toThrow(/could not find MainActivity.onCreate/);
  });
});

describe('remaining conflict and defensive paths', () => {
  const runActivity = (contents) =>
    runMod(baseConfig(), 'android', 'mainActivity', {
      language: 'kt',
      contents,
    });
  const runApplication = (contents) =>
    runMod(baseConfig(), 'android', 'mainApplication', {
      language: 'kt',
      contents,
    });

  it('throws when another plugin already declares onDestroy', async () => {
    const src = `import android.os.Bundle

class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
  }

  override fun onDestroy() {
    super.onDestroy()
  }
}
`;
    let error;
    try {
      await runActivity(src);
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    const flat = error.message.replace(/\s+/g, ' ');
    expect(flat).toContain(
      'cannot add "override fun onDestroy" to MainActivity'
    );
    // onDestroy takes no argument, unlike onNewIntent.
    expect(flat).toContain('voiceActivityProxy.onDestroy()');
  });

  it('throws when another plugin already declares onTerminate', async () => {
    const src = `import android.app.Application

class MainApplication : Application(), ReactApplication {
  override fun onCreate() {
    super.onCreate()
  }

  override fun onTerminate() {
    super.onTerminate()
  }
}
`;
    let error;
    try {
      await runApplication(src);
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    const flat = error.message.replace(/\s+/g, ' ');
    expect(flat).toContain(
      'cannot add "override fun onTerminate" to MainApplication'
    );
    expect(flat).toContain('voiceApplicationProxy.onTerminate()');
  });

  it('throws when onCreate does not call super.onCreate', async () => {
    /**
     * The anchor is required. Inserting at the top of the method instead runs
     * the proxy before the superclass has initialised: on MainActivity that
     * means requestPermissions() against an activity whose super.onCreate has
     * not run. A prebuild failure naming the method is visible; a half
     * initialised activity at runtime is not.
     */
    const src = `import android.app.Application

class MainApplication : Application(), ReactApplication {
  override fun onCreate() {
    doSomethingElse()
  }
}
`;
    let error;
    try {
      await runApplication(src);
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    const flat = error.message.replace(/\s+/g, ' ');
    expect(flat).toContain(
      'cannot hook MainApplication.onCreate() because it does not call super.onCreate()'
    );
    expect(flat).toContain('docs/expo/app-config.md');
  });

  it('throws when a matched class declaration has no body', async () => {
    const src =
      'import android.app.Application\n\nclass MainApplication : Application()';
    await expect(runApplication(src)).rejects.toThrow(
      /could not find class MainApplication/
    );
  });
});
