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

export const NativeModule = {
  /**
   * Call Mocks
   */
  call_disconnect: jest.fn().mockResolvedValue(undefined),
  call_getStats: jest.fn().mockResolvedValue(createStatsReport()),
  call_hold: jest.fn((_uuid: Uuid, hold: boolean) => Promise.resolve(hold)),
  call_isMuted: jest.fn().mockResolvedValue(false),
  call_isOnHold: jest.fn().mockResolvedValue(false),
  call_mute: jest.fn((_uuid: Uuid, mute: boolean) => Promise.resolve(mute)),
  call_postFeedback: jest.fn().mockResolvedValue(undefined),
  call_sendDigits: jest.fn().mockResolvedValue(undefined),
  call_sendMessage: jest
    .fn()
    .mockResolvedValue('mock-nativemodule-tracking-id'),

  /**
   * Call Invite Mocks
   */
  callInvite_accept: jest.fn().mockResolvedValue(createNativeCallInfo()),
  callInvite_isValid: jest.fn().mockResolvedValue(false),
  callInvite_reject: jest.fn().mockResolvedValue(undefined),
  callInvite_updateCallerHandle: jest.fn().mockResolvedValue(undefined),

  /**
   * Voice Mocks
   */
  voice_connect_android: jest.fn().mockResolvedValue(createNativeCallInfo()),
  voice_connect_ios: jest.fn().mockResolvedValue(createNativeCallInfo()),
  voice_getAudioDevices: jest
    .fn()
    .mockResolvedValue(createNativeAudioDevicesInfo()),
  voice_getCalls: jest.fn().mockResolvedValue([createNativeCallInfo()]),
  voice_getCallInvites: jest
    .fn()
    .mockResolvedValue([createNativeCallInviteInfo()]),
  voice_getDeviceToken: jest
    .fn()
    .mockResolvedValue('mock-nativemodule-devicetoken'),
  voice_getVersion: jest.fn().mockResolvedValue('mock-nativemodule-version'),
  voice_handleEvent: jest.fn().mockResolvedValue(true),
  voice_initializePushRegistry: jest.fn().mockResolvedValue(undefined),
  voice_register: jest.fn().mockResolvedValue(undefined),
  voice_selectAudioDevice: jest.fn().mockResolvedValue(undefined),
  voice_setCallKitConfiguration: jest.fn().mockResolvedValue(undefined),
  voice_showNativeAvRoutePicker: jest.fn().mockResolvedValue(undefined),
  voice_setIncomingCallContactHandleTemplate: jest
    .fn()
    .mockResolvedValue(undefined),
  voice_unregister: jest.fn().mockResolvedValue(undefined),
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
