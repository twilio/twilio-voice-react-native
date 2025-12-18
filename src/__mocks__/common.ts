/**
 * This file is used by Jest manual mocking and meant to be utilized by
 * perfomring `jest.mock('../common')` in test files.
 */

import { EventEmitter } from 'eventemitter3';
import type { Uuid } from '../type/common';
import { createNativeAudioDevicesInfo } from './AudioDevice';
import { createNativeCallInfo } from './Call';
import { createNativeCallInviteInfo } from './CallInvite';
import { createStatsReport } from './RTCStats';
import { Constants } from '../constants';

export function mockNativePromiseResolutionValue(value: any) {
  return {
    [Constants.PromiseKeyStatus]: Constants.PromiseStatusValueResolved as const,
    [Constants.PromiseKeyValue]: value,
  };
}

export function mockNativePromiseRejectionWithNameValue(
  name:
    | Constants.ErrorCodeInvalidArgumentError
    | Constants.ErrorCodeInvalidStateError,
  message: string
) {
  return {
    [Constants.PromiseKeyStatus]:
      Constants.PromiseStatusValueRejectedWithName as const,
    [Constants.PromiseKeyErrorName]: name,
    [Constants.PromiseKeyErrorMessage]: message,
  };
}

export function mockNativePromiseRejectionWithCodeValue(
  code: number,
  message: string
) {
  return {
    [Constants.PromiseKeyStatus]:
      Constants.PromiseStatusValueRejectedWithCode as const,
    [Constants.PromiseKeyErrorCode]: code,
    [Constants.PromiseKeyErrorMessage]: message,
  };
}

function createMockWithResolvedValue(value: any) {
  return jest.fn().mockResolvedValue(mockNativePromiseResolutionValue(value));
}

export const NativeModule = {
  /**
   * Call Mocks
   */
  call_disconnect: createMockWithResolvedValue(undefined),
  call_getStats: createMockWithResolvedValue(createStatsReport()),
  call_hold: jest.fn((_uuid: Uuid, hold: boolean) =>
    Promise.resolve(mockNativePromiseResolutionValue(hold))
  ),
  call_isMuted: createMockWithResolvedValue(false),
  call_isOnHold: createMockWithResolvedValue(false),
  call_mute: jest.fn((_uuid: Uuid, mute: boolean) =>
    Promise.resolve(mockNativePromiseResolutionValue(mute))
  ),
  call_postFeedback: createMockWithResolvedValue(undefined),
  call_sendDigits: createMockWithResolvedValue(undefined),
  call_sendMessage: createMockWithResolvedValue(
    'mock-nativemodule-tracking-id'
  ),

  /**
   * Call Invite Mocks
   */
  callInvite_accept: createMockWithResolvedValue(createNativeCallInfo()),
  callInvite_isValid: createMockWithResolvedValue(false),
  callInvite_reject: createMockWithResolvedValue(undefined),
  callInvite_sendMessage: createMockWithResolvedValue(
    'mock-nativemodule-tracking-id'
  ),
  callInvite_updateCallerHandle: createMockWithResolvedValue(undefined),

  /**
   * Voice Mocks
   */
  voice_connect_android: createMockWithResolvedValue(createNativeCallInfo()),
  voice_connect_ios: createMockWithResolvedValue(createNativeCallInfo()),
  voice_getAudioDevices: createMockWithResolvedValue(
    createNativeAudioDevicesInfo()
  ),
  voice_getCalls: createMockWithResolvedValue([createNativeCallInfo()]),
  voice_getCallInvites: createMockWithResolvedValue([
    createNativeCallInviteInfo(),
  ]),
  voice_getDeviceToken: createMockWithResolvedValue(
    'mock-nativemodule-devicetoken'
  ),
  voice_getVersion: createMockWithResolvedValue('mock-nativemodule-version'),
  voice_handleEvent: createMockWithResolvedValue(true),
  voice_initializePushRegistry: createMockWithResolvedValue(undefined),
  voice_register: createMockWithResolvedValue(undefined),
  voice_selectAudioDevice: createMockWithResolvedValue(undefined),
  voice_setCallKitConfiguration: createMockWithResolvedValue(undefined),
  voice_showNativeAvRoutePicker: createMockWithResolvedValue(undefined),
  voice_setIncomingCallContactHandleTemplate:
    createMockWithResolvedValue(undefined),
  voice_unregister: createMockWithResolvedValue(undefined),
  voice_runPreflight: createMockWithResolvedValue(undefined),

  /**
   * PreflightTest mocks.
   */
  preflightTest_flushEvents: jest.fn(),
  preflightTest_getCallSid: jest.fn(),
  preflightTest_getEndTime: jest.fn(),
  preflightTest_getLatestSample: jest.fn(),
  preflightTest_getReport: jest.fn(),
  preflightTest_getStartTime: jest.fn(),
  preflightTest_getState: jest.fn(),
  preflightTest_stop: jest.fn(),
};

export class MockNativeEventEmitter extends EventEmitter {
  addListenerSpies: [string | symbol, jest.Mock][] = [];

  addListener = jest.fn(
    (event: string | symbol, fn: (...args: any[]) => void, context?: any) => {
      const spy = jest.fn(fn);
      super.addListener(event, spy, context);
      this.addListenerSpies.push([event, spy]);
      return this;
    }
  );

  expectListenerAndReturnSpy(
    invocation: number,
    event: string | symbol,
    fn: (...args: any[]) => void
  ) {
    expect(invocation).toBeGreaterThanOrEqual(0);
    expect(invocation).toBeLessThan(this.addListenerSpies.length);

    const [spyEvent, spyFn] = this.addListenerSpies[invocation];
    expect(event).toBe(spyEvent);
    expect(fn).toEqual(spyFn.getMockImplementation());

    return spyFn;
  }

  reset() {
    this.addListenerSpies = [];
    this.removeAllListeners();
  }
}

export const NativeEventEmitter = new MockNativeEventEmitter();

class MockPlatform {
  get OS() {
    return 'uninitialized';
  }
}

export const Platform = new MockPlatform();

export const setTimeout = jest.fn();
