/**
 * Exercises the public entry point and the runtime enums it re-exports.
 *
 * These modules are barrels and enum declarations, so they carry no logic, but
 * they do emit runtime JavaScript and they define the package's public surface.
 * Loading them here both closes the coverage gap and turns an accidental
 * removal from `src/index.tsx` into a failing test rather than a silent
 * breaking change for consumers.
 */

jest.mock('../common');

import * as sdk from '../index';
import * as TwilioErrors from '../error';
import { Constants } from '../constants';
import { IceTransportPolicy } from '../type/Ice';
import { AudioCodecType } from '../type/AudioCodec';
import { CallKit } from '../type/CallKit';
import { RTCStats } from '../type/RTCStats';

describe('public entry point', () => {
  /**
   * Exports that carry a runtime value: classes, enums and namespaces.
   * Mirrors `api/voice-react-native-sdk.api.md`; update both together.
   */
  const RUNTIME_EXPORTS = [
    'AudioCodecType',
    'AudioDevice',
    'Call',
    'CallInvite',
    'CallKit',
    'IceTransportPolicy',
    'IncomingCallMessage',
    'OutgoingCallMessage',
    'PreflightTest',
    'RTCStats',
    'TwilioErrors',
    'Voice',
  ];

  /**
   * Exports that are interfaces or type aliases. These are erased at runtime,
   * so they are legitimately `undefined` when imported as values, and consumers
   * may only use them in type position. Asserted so that a type accidentally
   * gaining a runtime value, or a runtime export being downgraded to a type,
   * fails here rather than surprising a consumer.
   */
  const TYPE_ONLY_EXPORTS = [
    'AudioCodec',
    'CallMessage',
    'CustomParameters',
    'IceServer',
    'OpusAudioCodec',
    'PCMUAudioCodec',
  ];

  it.each(RUNTIME_EXPORTS)('exports %s with a runtime value', (name) => {
    expect((sdk as Record<string, unknown>)[name]).toBeDefined();
  });

  it.each(TYPE_ONLY_EXPORTS)('exports %s as a type only', (name) => {
    expect(Object.keys(sdk)).toContain(name);
    expect((sdk as Record<string, unknown>)[name]).toBeUndefined();
  });

  it('exports nothing beyond the documented surface', () => {
    expect(Object.keys(sdk).sort()).toStrictEqual(
      [...RUNTIME_EXPORTS, ...TYPE_ONLY_EXPORTS].sort()
    );
  });
});

describe('error barrel', () => {
  const EXPECTED_ERRORS = [
    'InvalidArgumentError',
    'InvalidStateError',
    'TwilioError',
    'UnexpectedNativeError',
    'UnsupportedPlatformError',
  ];

  it.each(EXPECTED_ERRORS)('exports %s', (name) => {
    expect(TwilioErrors).toHaveProperty(name);
  });

  it('constructs each error as a TwilioError subclass', () => {
    for (const name of EXPECTED_ERRORS) {
      const Ctor = (TwilioErrors as Record<string, any>)[name];
      const instance = new Ctor('message');
      expect(instance).toBeInstanceOf(Error);
      expect(instance.message).toBe('message');
      expect(instance.name).toBe(name);
    }
  });
});

describe('runtime enums', () => {
  it('Constants carries the SDK version used by the native layers', () => {
    expect(Constants.ReactNativeVoiceSDKVer).toBe(
      require('../../package.json').version
    );
    expect(Constants.ReactNativeVoiceSDK).toBe('react-native');
  });

  it('IceTransportPolicy has the documented members', () => {
    expect(Object.values(IceTransportPolicy).sort()).toStrictEqual([
      'all',
      'relay',
    ]);
  });

  it('AudioCodecType has the documented members', () => {
    expect(Object.values(AudioCodecType).sort()).toStrictEqual([
      'opus',
      'pcmu',
    ]);
  });

  it('CallKit.HandleType is defined', () => {
    expect(Object.values(CallKit.HandleType).length).toBeGreaterThan(0);
  });

  it('RTCStats.IceCandidatePairState is defined', () => {
    expect(
      Object.values(RTCStats.IceCandidatePairState).length
    ).toBeGreaterThan(0);
  });
});
