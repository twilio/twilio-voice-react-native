/**
 * Tests the real `src/common.ts`, not the mock in `src/__mocks__/common.ts`.
 *
 * Every other suite calls `jest.mock('../common')`, so until this file existed
 * the module was never loaded under test and reported no coverage at all. It is
 * also the module that decides how the native module is resolved, which is the
 * behaviour the 1.8.0 release changes, so it is the last place that should go
 * unexercised.
 */

describe('common', () => {
  /**
   * A resolved native promise, in the shape `settleNativePromise` expects.
   * Spelled out rather than imported so that this file does not depend on
   * module state that `jest.resetModules` clears between cases.
   */
  const resolvedNativePromise = () =>
    Promise.resolve({
      promiseKeyStatus: 'promiseStatusValueResolved',
      promiseKeyValue: undefined,
    });

  /**
   * Passed in place of a native module to load `common` as it loads in an
   * application whose native code is missing. `undefined` cannot be used: it
   * selects the default parameter value.
   */
  const ABSENT = Symbol('absent native module');

  const loadCommon = (
    platform: 'android' | 'ios',
    nativeModule: unknown = {
      __tag: 'native-module',
      voice_setExpoVersion: jest.fn(resolvedNativePromise),
    }
  ) => {
    let emitterArgs: unknown[] = [];

    jest.doMock('react-native', () => ({
      Platform: { OS: platform },
      NativeModules: {
        ...(nativeModule === ABSENT
          ? {}
          : { TwilioVoiceReactNative: nativeModule }),
      },
      NativeEventEmitter: class {
        constructor(...args: unknown[]) {
          emitterArgs = args;
        }
      },
    }));

    const mod = require('../common');
    return { mod, getEmitterArgs: () => emitterArgs };
  };

  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.dontMock('react-native');
  });

  describe.each(['android', 'ios'] as const)('on %s', (platform) => {
    it('resolves the native module from NativeModules', () => {
      const { mod } = loadCommon(platform);
      expect(mod.NativeModule.__tag).toBe('native-module');
    });

    it('constructs the event emitter with the native module', () => {
      const { mod, getEmitterArgs } = loadCommon(platform);
      expect(mod.NativeEventEmitter).toBeDefined();
      expect(getEmitterArgs()).toStrictEqual([mod.NativeModule]);
    });

    it('re-exports Platform', () => {
      const { mod } = loadCommon(platform);
      expect(mod.Platform.OS).toBe(platform);
    });
  });

  it('resolves identically on both platforms', () => {
    const android = loadCommon('android');
    jest.resetModules();
    const ios = loadCommon('ios');

    expect(android.mod.NativeModule.__tag).toStrictEqual(
      ios.mod.NativeModule.__tag
    );
    expect(android.getEmitterArgs()).toStrictEqual([android.mod.NativeModule]);
    expect(ios.getEmitterArgs()).toStrictEqual([ios.mod.NativeModule]);
  });

  it('re-exports getExpoVersion', () => {
    const { mod } = loadCommon('android');
    expect(typeof mod.getExpoVersion).toBe('function');
  });

  it('exposes setTimeout', () => {
    const { mod } = loadCommon('android');
    expect(typeof mod.setTimeout).toBe('function');
  });

  /**
   * Metro resolves imports statically, so an `expo-modules-core` import
   * anywhere reachable from this module makes the package unbundleable in a
   * bare React Native app. That is precisely the regression 1.8.0 undoes, and a
   * unit test is the cheapest place to catch it coming back.
   */
  it('does not import expo-modules-core', () => {
    const { readFileSync } = require('fs');
    const { join } = require('path');
    const source = readFileSync(join(__dirname, '..', 'common.ts'), 'utf8');

    expect(source).not.toMatch(/expo-modules-core/);
    expect(source).not.toMatch(/requireNativeModule/);
  });

  /**
   * Casting an absent module to the present type left the first symptom as a
   * bare `TypeError` naming a property, on the platform where React Native
   * stays silent about it: its own invariant fires on iOS but the branch that
   * would warn is skipped for `undefined` on Android.
   */
  describe.each(['android', 'ios'] as const)(
    'with no native module, on %s',
    (platform) => {
      it('throws naming the cause', () => {
        expect(() => loadCommon(platform, ABSENT)).toThrow(
          /native module could not be found/
        );
      });

      it('lists what to check', () => {
        let error: Error | undefined;
        try {
          loadCommon(platform, ABSENT);
        } catch (e) {
          error = e as Error;
        }

        expect(error).toBeDefined();
        const flat = (error as Error).message.replace(/\s+/g, ' ');
        expect(flat).toContain('was not rebuilt after adding this dependency');
        expect(flat).toContain('pod install');
        expect(flat).toContain('expo prebuild');
        expect(flat).toContain('Expo Go');
      });

      it('is an InvalidStateError', () => {
        let error: Error | undefined;
        try {
          loadCommon(platform, ABSENT);
        } catch (e) {
          error = e as Error;
        }

        expect((error as Error).name).toBe('InvalidStateError');
      });
    }
  );

  describe('recordExpoVersion', () => {
    it('records the version once per process', async () => {
      const voice_setExpoVersion = jest.fn(resolvedNativePromise);
      const { mod } = loadCommon('android', {
        __tag: 'native-module',
        voice_setExpoVersion,
      });

      await mod.recordExpoVersion();
      await mod.recordExpoVersion();

      expect(voice_setExpoVersion).toHaveBeenCalledTimes(1);
    });

    it('returns the same promise on every call', () => {
      const { mod } = loadCommon('android');
      expect(mod.recordExpoVersion()).toBe(mod.recordExpoVersion());
    });

    /**
     * The native call's argument is evaluated before any `.catch` could be
     * attached to its result, so a synchronous throw -- an unresolved binding
     * on the native module, for instance -- used to propagate straight out of
     * the `Voice` constructor, which the SDK documents as impossible.
     */
    it('swallows a synchronous throw from the native module', async () => {
      const { mod } = loadCommon('android', {
        __tag: 'native-module',
        voice_setExpoVersion: jest.fn(() => {
          throw new Error('mock synchronous native failure');
        }),
      });

      await expect(mod.recordExpoVersion()).resolves.toBeUndefined();
    });

    it('swallows a rejection from the native module', async () => {
      const { mod } = loadCommon('android', {
        __tag: 'native-module',
        voice_setExpoVersion: jest.fn(() =>
          Promise.reject(new Error('mock native failure'))
        ),
      });

      await expect(mod.recordExpoVersion()).resolves.toBeUndefined();
    });
  });
});
