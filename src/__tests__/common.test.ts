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
  const loadCommon = (platform: 'android' | 'ios') => {
    let emitterArgs: unknown[] = [];

    jest.doMock('react-native', () => ({
      Platform: { OS: platform },
      NativeModules: {
        TwilioVoiceReactNative: { __tag: 'native-module' },
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
      expect(mod.NativeModule).toStrictEqual({ __tag: 'native-module' });
    });

    it('constructs the event emitter with the native module', () => {
      const { mod, getEmitterArgs } = loadCommon(platform);
      expect(mod.NativeEventEmitter).toBeDefined();
      expect(getEmitterArgs()).toStrictEqual([{ __tag: 'native-module' }]);
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

    expect(android.mod.NativeModule).toStrictEqual(ios.mod.NativeModule);
    expect(android.getEmitterArgs()).toStrictEqual(ios.getEmitterArgs());
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
});
