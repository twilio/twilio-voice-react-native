/**
 * Covers how the Android mods read and edit Kotlin source.
 *
 * Every case here is a shape of `MainActivity.kt` or `MainApplication.kt` that
 * the plugin previously mis-edited without saying so: prebuild succeeded and
 * the failure surfaced later as an unrelated Gradle error, or not at all.
 *
 * The mods are invoked through `config.mods`, the same path `expo prebuild`
 * uses, rather than by calling the plugin's internal helpers.
 */

const withTwilioVoice = require('../withTwilioVoice');

const runMod = async (platform, name, contents) => {
  const config = withTwilioVoice({ name: 't', slug: 't' });
  const mod = config.mods[platform][name];
  const out = await mod({
    ...config,
    modResults: { language: 'kt', contents },
    modRequest: {},
  });
  return out.modResults.contents;
};

const runActivity = (contents) => runMod('android', 'mainActivity', contents);
const runApplication = (contents) =>
  runMod('android', 'mainApplication', contents);

const flatten = (message) => message.replace(/\s+/g, ' ');

const expectThrows = async (promise) => {
  let error;
  try {
    await promise;
  } catch (e) {
    error = e;
  }
  expect(error).toBeDefined();
  return flatten(error.message);
};

describe('partially wired files', () => {
  /**
   * The manual wiring documentation asks developers to add these members
   * themselves, so a file carrying some of them is reachable. A test for the
   * proxy name alone could not tell a fully wired file from a partial one: the
   * mod returned the file unchanged, with no overrides, no imports and no
   * error, and the result compiled.
   */
  it('throws on a MainActivity with the field and the hook but no overrides', async () => {
    const src = `import android.os.Bundle

class MainActivity : ReactActivity() {
  private val voiceActivityProxy = VoiceActivityProxy(this) { }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
    voiceActivityProxy.onCreate(savedInstanceState)
  }
}
`;
    const flat = await expectThrows(runActivity(src));
    expect(flat).toContain(
      'MainActivity already contains some of the members this plugin adds'
    );
    expect(flat).toContain('voiceActivityProxy.onDestroy()');
    expect(flat).toContain('voiceActivityProxy.onNewIntent(intent)');
    expect(flat).not.toContain('private val voiceActivityProxy =');
    expect(flat).toContain('docs/expo/app-config.md');
  });

  it('throws on a MainApplication missing only onTerminate', async () => {
    const src = `import android.app.Application

class MainApplication : Application(), ReactApplication {
  private val voiceApplicationProxy = VoiceApplicationProxy(this)

  override fun onCreate() {
    super.onCreate()
    voiceApplicationProxy.onCreate()
  }
}
`;
    const flat = await expectThrows(runApplication(src));
    expect(flat).toContain(
      'MainApplication already contains some of the members this plugin adds'
    );
    expect(flat).toContain('voiceApplicationProxy.onTerminate()');
  });

  it('accepts a hand-wired file as complete and leaves it alone', async () => {
    const src = `import android.app.Application

class MainApplication : Application(), ReactApplication {
  private val voiceApplicationProxy = VoiceApplicationProxy(this)

  override fun onCreate() {
    super.onCreate()
    voiceApplicationProxy.onCreate()
  }

  override fun onTerminate() {
    voiceApplicationProxy.onTerminate()
    super.onTerminate()
  }
}
`;
    expect(await runApplication(src)).toBe(src);
  });
});

describe('import dedupe', () => {
  /**
   * `import android.content.Intent` is a prefix of
   * `import android.content.IntentFilter`. A substring test skipped the
   * `Intent` import while still emitting `onNewIntent(intent: Intent)`, so
   * prebuild succeeded and Gradle failed on an unresolved reference with
   * nothing naming this plugin.
   */
  it('adds Intent even when IntentFilter is already imported', async () => {
    const src = `import android.content.IntentFilter
import android.os.Bundle

class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
  }
}
`;
    const out = await runActivity(src);
    const lines = out.split('\n').map((line) => line.trim());
    expect(lines).toContain('import android.content.Intent');
    expect(lines).toContain('import android.content.IntentFilter');
    expect(out).toContain('override fun onNewIntent(intent: Intent)');
  });

  it('does not add an import that is already present', async () => {
    const src = `import android.content.Intent
import android.os.Bundle

class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
  }
}
`;
    const out = await runActivity(src);
    const count = out
      .split('\n')
      .filter((line) => line.trim() === 'import android.content.Intent').length;
    expect(count).toBe(1);
  });
});

describe('onCreate hook placement', () => {
  /**
   * An expression body has no block to insert a statement into. The old search
   * for the next `{` found whichever block the expression called and injected
   * the statement there, where `savedInstanceState` is not in scope.
   */
  it('throws on an expression-bodied onCreate', async () => {
    const src = `import android.os.Bundle

class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) = setUp(savedInstanceState)

  private fun setUp(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
  }
}
`;
    const flat = await expectThrows(runActivity(src));
    expect(flat).toContain(
      'cannot hook MainActivity.onCreate(savedInstanceState) because it has an expression body'
    );
    expect(flat).toContain('docs/expo/app-config.md');
  });

  /**
   * The anchor search used to span the rest of the file, so an onCreate with
   * no super.onCreate of its own matched a later method's and the statement
   * landed in that method.
   */
  it('does not take an anchor from a later method', async () => {
    const src = `import android.os.Bundle

class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    setUp()
  }

  private fun setUp() {
    super.onCreate(null)
  }
}
`;
    const flat = await expectThrows(runActivity(src));
    expect(flat).toContain(
      'cannot hook MainActivity.onCreate(savedInstanceState) because it does not call super.onCreate(...)'
    );
  });

  it('places the hook after super.onCreate within the method', async () => {
    const src = `import android.os.Bundle

class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
    other()
  }

  private fun other() {
    super.onCreate(null)
  }
}
`;
    const out = await runActivity(src);
    const hook = out.indexOf('voiceActivityProxy.onCreate(savedInstanceState)');
    expect(hook).toBeGreaterThan(out.indexOf('super.onCreate(null)'));
    expect(hook).toBeLessThan(out.indexOf('private fun other()'));
  });
});

describe('end-of-class insertion', () => {
  /**
   * The previous implementation used the file's last `}`, which is the class's
   * only when nothing follows the class. A trailing top-level declaration took
   * that brace instead and the overrides were injected into it, after its
   * `return`: uncompilable Kotlin, silently.
   */
  it('inserts into the class, not a trailing top-level function', async () => {
    const src = `import android.app.Application

class MainApplication : Application(), ReactApplication {
  override fun onCreate() {
    super.onCreate()
  }
}

fun helper(): Int {
  return 1
}
`;
    const out = await runApplication(src);
    expect(out.indexOf('override fun onTerminate()')).toBeLessThan(
      out.indexOf('fun helper(): Int')
    );
    expect(out.endsWith('fun helper(): Int {\n  return 1\n}\n')).toBe(true);
  });

  it('inserts into MainActivity ahead of a trailing object declaration', async () => {
    const src = `import android.os.Bundle

class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
  }
}

object Helpers {
  const val VALUE = 1
}
`;
    const out = await runActivity(src);
    expect(
      out.indexOf('override fun onNewIntent(intent: Intent)')
    ).toBeLessThan(out.indexOf('object Helpers'));
  });
});

describe('braces that do not open a block', () => {
  /**
   * Finding the class's closing brace needs more than a depth counter: a brace
   * inside a comment, a character literal or a string opens nothing, and a
   * `${...}` template inside a string re-enters code, so the brace closing the
   * template must not be read as closing a block.
   */
  it('is not confused by braces in comments, literals and templates', async () => {
    const src = `import android.app.Application

class MainApplication : Application(), ReactApplication {
  // a line comment with a brace }
  /* a block comment with a brace } */
  private val brace = '{'
  private val quoted = "a \\" and a brace }"
  private val raw = """a raw brace }"""
  private val interpolated = "value: \${brace}"

  override fun onCreate() {
    super.onCreate()
  }
}

fun helper(): Int {
  return 1
}
`;
    const out = await runApplication(src);
    expect(out.indexOf('override fun onTerminate()')).toBeLessThan(
      out.indexOf('fun helper(): Int')
    );
    expect(out).toContain('voiceApplicationProxy.onCreate()');
  });

  it('throws when the class body never closes', async () => {
    const src = `import android.app.Application

class MainApplication : Application(), ReactApplication {
  override fun onCreate() {
    super.onCreate()
  }
`;
    const flat = await expectThrows(runApplication(src));
    expect(flat).toContain('could not find the end of class MainApplication');
  });

  it('throws when the class body ends inside a line comment', async () => {
    const src =
      'import android.app.Application\n\n' +
      'class MainApplication : Application(), ReactApplication {\n' +
      '  override fun onCreate() {\n' +
      '    super.onCreate()\n' +
      '  }\n' +
      '  // unterminated';
    const flat = await expectThrows(runApplication(src));
    expect(flat).toContain('could not find the end of class MainApplication');
  });

  it('throws when the class body ends inside a block comment', async () => {
    const src = `import android.os.Bundle

class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
  }
  /* unterminated
`;
    const flat = await expectThrows(runActivity(src));
    expect(flat).toContain('could not find the end of class MainActivity');
  });
});
