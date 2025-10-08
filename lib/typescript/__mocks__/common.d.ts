/**
 * This file is used by Jest manual mocking and meant to be utilized by
 * perfomring `jest.mock('../common')` in test files.
 */
/// <reference types="jest" />
import { EventEmitter } from 'eventemitter3';
export declare const NativeModule: {
    /**
     * Call Mocks
     */
    call_disconnect: jest.Mock<any, any>;
    call_getStats: jest.Mock<any, any>;
    call_hold: jest.Mock<Promise<boolean>, [_uuid: string, hold: boolean]>;
    call_isMuted: jest.Mock<any, any>;
    call_isOnHold: jest.Mock<any, any>;
    call_mute: jest.Mock<Promise<boolean>, [_uuid: string, mute: boolean]>;
    call_postFeedback: jest.Mock<any, any>;
    call_sendDigits: jest.Mock<any, any>;
    call_sendMessage: jest.Mock<any, any>;
    /**
     * Call Invite Mocks
     */
    callInvite_accept: jest.Mock<any, any>;
    callInvite_isValid: jest.Mock<any, any>;
    callInvite_reject: jest.Mock<any, any>;
    callInvite_updateCallerHandle: jest.Mock<any, any>;
    /**
     * Voice Mocks
     */
    voice_connect_android: jest.Mock<any, any>;
    voice_connect_ios: jest.Mock<any, any>;
    voice_getAudioDevices: jest.Mock<any, any>;
    voice_getCalls: jest.Mock<any, any>;
    voice_getCallInvites: jest.Mock<any, any>;
    voice_getDeviceToken: jest.Mock<any, any>;
    voice_getVersion: jest.Mock<any, any>;
    voice_handleEvent: jest.Mock<any, any>;
    voice_initializePushRegistry: jest.Mock<any, any>;
    voice_register: jest.Mock<any, any>;
    voice_selectAudioDevice: jest.Mock<any, any>;
    voice_setCallKitConfiguration: jest.Mock<any, any>;
    voice_showNativeAvRoutePicker: jest.Mock<any, any>;
    voice_setIncomingCallContactHandleTemplate: jest.Mock<any, any>;
    voice_unregister: jest.Mock<any, any>;
    voice_runPreflight: jest.Mock<any, any>;
    /**
     * PreflightTest mocks.
     */
    preflightTest_flushEvents: jest.Mock<any, any>;
    preflightTest_getCallSid: jest.Mock<any, any>;
    preflightTest_getEndTime: jest.Mock<any, any>;
    preflightTest_getLatestSample: jest.Mock<any, any>;
    preflightTest_getReport: jest.Mock<any, any>;
    preflightTest_getStartTime: jest.Mock<any, any>;
    preflightTest_getState: jest.Mock<any, any>;
    preflightTest_stop: jest.Mock<any, any>;
};
export declare class MockNativeEventEmitter extends EventEmitter {
    addListenerSpies: [string | symbol, jest.Mock][];
    addListener: jest.Mock<this, [event: string | symbol, fn: (...args: any[]) => void, context?: any]>;
    expectListenerAndReturnSpy(invocation: number, event: string | symbol, fn: (...args: any[]) => void): jest.Mock<any, any>;
    reset(): void;
}
export declare const NativeEventEmitter: MockNativeEventEmitter;
declare class MockPlatform {
    get OS(): string;
}
export declare const Platform: MockPlatform;
export declare const setTimeout: jest.Mock<any, any>;
export {};
