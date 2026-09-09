const fs = require('fs');
const path = require('path');

const withTwilioVoice = require('../withTwilioVoice');

const fixture = (name) =>
  fs.readFileSync(path.join(__dirname, '__fixtures__', name), 'utf8');

/**
 * Run the plugin and return the contents each `withMainActivity` /
 * `withMainApplication` mod produced.
 *
 * `@expo/config-plugins` mods are async functions stored on `config.mods`, so
 * the plugin is exercised through the same path `expo prebuild` uses rather
 * than by calling internal helpers.
 */
async function runAndroidMods({ mainActivity, mainApplication }) {
  const config = withTwilioVoice({ name: 'test', slug: 'test' });
  const results = {};

  if (config.mods?.android?.mainActivity) {
    const out = await config.mods.android.mainActivity({
      ...config,
      modResults: { language: 'kt', contents: mainActivity },
      modRequest: {},
    });
    results.mainActivity = out.modResults.contents;
  }

  if (config.mods?.android?.mainApplication) {
    const out = await config.mods.android.mainApplication({
      ...config,
      modResults: { language: 'kt', contents: mainApplication },
      modRequest: {},
    });
    results.mainApplication = out.modResults.contents;
  }

  return results;
}

describe('withTwilioVoice', () => {
  describe('MainApplication', () => {
    it('adds the proxy field, the onCreate call and onTerminate', async () => {
      const { mainApplication } = await runAndroidMods({
        mainActivity: fixture('MainActivity.kt'),
        mainApplication: fixture('MainApplication.kt'),
      });

      expect(mainApplication).toContain(
        'import com.twiliovoicereactnative.VoiceApplicationProxy'
      );
      expect(mainApplication).toContain(
        'private val voiceApplicationProxy = VoiceApplicationProxy(this)'
      );
      expect(mainApplication).toContain('voiceApplicationProxy.onCreate()');
      expect(mainApplication).toContain('override fun onTerminate()');
    });

    it('places the onCreate call after super.onCreate', async () => {
      const { mainApplication } = await runAndroidMods({
        mainActivity: fixture('MainActivity.kt'),
        mainApplication: fixture('MainApplication.kt'),
      });

      expect(mainApplication.indexOf('super.onCreate()')).toBeLessThan(
        mainApplication.indexOf('voiceApplicationProxy.onCreate()')
      );
    });
  });

  describe('MainActivity', () => {
    it('adds the proxy field, the onCreate hook and both overrides', async () => {
      const { mainActivity } = await runAndroidMods({
        mainActivity: fixture('MainActivity.kt'),
        mainApplication: fixture('MainApplication.kt'),
      });

      expect(mainActivity).toContain(
        'import com.twiliovoicereactnative.VoiceActivityProxy'
      );
      expect(mainActivity).toContain('private val voiceActivityProxy');
      expect(mainActivity).toContain(
        'voiceActivityProxy.onCreate(savedInstanceState)'
      );
      expect(mainActivity).toContain('override fun onDestroy()');
      expect(mainActivity).toContain(
        'override fun onNewIntent(intent: Intent)'
      );
    });

    it('rejects a non-Kotlin MainActivity rather than silently skipping', async () => {
      const config = withTwilioVoice({ name: 'test', slug: 'test' });
      await expect(
        config.mods.android.mainActivity({
          ...config,
          modResults: { language: 'java', contents: 'class MainActivity {}' },
          modRequest: {},
        })
      ).rejects.toThrow(/must be Kotlin/);
    });
  });

  describe('idempotency', () => {
    it('is a no-op when run twice, as a prebuild without --clean does', async () => {
      const first = await runAndroidMods({
        mainActivity: fixture('MainActivity.kt'),
        mainApplication: fixture('MainApplication.kt'),
      });
      const second = await runAndroidMods({
        mainActivity: first.mainActivity,
        mainApplication: first.mainApplication,
      });

      expect(second.mainActivity).toBe(first.mainActivity);
      expect(second.mainApplication).toBe(first.mainApplication);

      const count = (s, needle) => s.split(needle).length - 1;
      expect(count(second.mainActivity, 'override fun onNewIntent')).toBe(1);
      expect(count(second.mainActivity, 'override fun onDestroy')).toBe(1);
      expect(count(second.mainApplication, 'override fun onTerminate')).toBe(1);
    });
  });

  describe('collision with another library', () => {
    /**
     * The defect this release exists to avoid. The prototype skipped silently
     * here, producing an app that builds and installs but never forwards an
     * incoming-call intent. It must fail the prebuild instead.
     */
    it('throws when another plugin already declares onNewIntent', async () => {
      await expect(
        runAndroidMods({
          mainActivity: fixture('MainActivity.conflicting.kt'),
          mainApplication: fixture('MainApplication.kt'),
        })
      ).rejects.toThrow(/onNewIntent/);
    });

    it('names the conflict and gives the manual remedy', async () => {
      let error;
      try {
        await runAndroidMods({
          mainActivity: fixture('MainActivity.conflicting.kt'),
          mainApplication: fixture('MainApplication.kt'),
        });
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();

      // The message wraps across lines; compare on collapsed whitespace.
      const flat = error.message.replace(/\s+/g, ' ');
      expect(flat).toContain('another config plugin already declares it');
      expect(flat).toContain('cannot add "override fun onNewIntent"');
      expect(flat).toContain('voiceActivityProxy.onNewIntent(intent)');
      expect(flat).toContain('docs/expo/app-config.md');
    });

    it('does not silently produce output missing the intent forwarding', async () => {
      let result;
      try {
        result = await runAndroidMods({
          mainActivity: fixture('MainActivity.conflicting.kt'),
          mainApplication: fixture('MainApplication.kt'),
        });
      } catch {
        result = undefined;
      }

      expect(result).toBeUndefined();
    });
  });
});
