import type { NativeModulesStatic } from 'react-native';
import type { CallInvite } from '../CallInvite';
import type { PreflightTest } from '../PreflightTest';
import type { NativeAudioDevicesInfo } from './AudioDevice';
import type {
  NativeCallInfo,
  NativeCallFeedbackIssue,
  NativeCallFeedbackScore,
} from './Call';
import type { NativeCallInviteInfo } from './CallInvite';
import type { Uuid } from './common';
import type { RTCStats } from './RTCStats';
import type { Constants } from '../constants';

export type NativePromiseResolution<T> = {
  [Constants.PromiseKeyStatus]: Constants.PromiseStatusValueResolved;
  [Constants.PromiseKeyValue]: T;
};

export type NativePromiseNamedRejection = {
  [Constants.PromiseKeyStatus]: Constants.PromiseStatusValueRejectedWithName;
  [Constants.PromiseKeyErrorName]:
    | Constants.ErrorCodeInvalidArgumentError
    | Constants.ErrorCodeInvalidStateError;
  [Constants.PromiseKeyErrorMessage]: string;
};

export type NativePromiseCodedRejection = {
  [Constants.PromiseKeyStatus]: Constants.PromiseStatusValueRejectedWithCode;
  [Constants.PromiseKeyErrorCode]: number;
  [Constants.PromiseKeyErrorMessage]: string;
};

export type NativePromise<T> = Promise<
  | NativePromiseResolution<T>
  | NativePromiseCodedRejection
  | NativePromiseNamedRejection
>;

export interface TwilioVoiceReactNative extends NativeModulesStatic {
  /**
   * Native types.
   *
   * The following event related functions are required by the React Native
   * bindings.
   */
  addListener: (eventType: string) => void;
  removeListeners: (count: number) => void;

  /**
   * Call bindings.
   */
  call_disconnect(callUuid: Uuid): NativePromise<void>;
  call_getStats(callUuid: Uuid): NativePromise<RTCStats.StatsReport>;
  call_hold(callUuid: Uuid, hold: boolean): NativePromise<boolean>;
  call_isOnHold(callUuid: Uuid): NativePromise<boolean>;
  call_isMuted(callUuid: Uuid): NativePromise<boolean>;
  call_mute(callUuid: Uuid, mute: boolean): NativePromise<boolean>;
  call_postFeedback(
    callUuid: Uuid,
    score: NativeCallFeedbackScore,
    issue: NativeCallFeedbackIssue
  ): NativePromise<void>;
  call_sendDigits(callUuid: Uuid, digits: string): NativePromise<void>;
  call_sendMessage(
    callUuid: Uuid,
    content: string,
    contentType: string,
    messageType: string
  ): NativePromise<string>;

  /**
   * Call Invite bindings.
   */
  callInvite_accept(
    callInviteUuid: Uuid,
    acceptOptions: CallInvite.AcceptOptions
  ): NativePromise<NativeCallInfo>;
  callInvite_isValid(callInviteUuid: Uuid): NativePromise<boolean>;
  callInvite_reject(callInviteUuid: Uuid): NativePromise<void>;
  callInvite_sendMessage(
    callInviteUuid: Uuid,
    content: string,
    contentType: string,
    messageType: string
  ): NativePromise<string>;
  callInvite_updateCallerHandle(
    callInviteUuid: Uuid,
    handle: string
  ): NativePromise<void>;

  /**
   * Voice bindings.
   */
  voice_connect_android(
    token: string,
    twimlParams: Record<string, any>,
    notificationDisplayName: string | undefined
  ): NativePromise<NativeCallInfo>;
  voice_connect_ios(
    token: string,
    twimlParams: Record<string, any>,
    contactHandle: string
  ): NativePromise<NativeCallInfo>;
  voice_initializePushRegistry(): NativePromise<void>;
  voice_setCallKitConfiguration(
    configuration: Record<string, any>
  ): NativePromise<void>;
  voice_setExpoVersion(expoVersion: string | undefined): NativePromise<void>;
  voice_setIncomingCallContactHandleTemplate(
    template?: string
  ): NativePromise<void>;
  voice_getAudioDevices(): NativePromise<NativeAudioDevicesInfo>;
  voice_getCalls(): NativePromise<NativeCallInfo[]>;
  voice_getCallInvites(): NativePromise<NativeCallInviteInfo[]>;
  voice_getDeviceToken(): NativePromise<string>;
  voice_getVersion(): NativePromise<string>;
  voice_handleEvent(
    remoteMessage: Record<string, string>
  ): NativePromise<boolean>;
  voice_register(accessToken: string): NativePromise<void>;
  voice_selectAudioDevice(audioDeviceUuid: Uuid): NativePromise<void>;
  voice_showNativeAvRoutePicker(): NativePromise<void>;
  voice_unregister(accessToken: string): NativePromise<void>;

  /**
   * Preflight related bindings.
   */
  voice_runPreflight(
    accessToken: string,
    options: PreflightTest.Options
  ): NativePromise<Uuid>;

  preflightTest_getCallSid(preflightTestUuid: Uuid): NativePromise<string>;
  preflightTest_getEndTime(preflightTestUuid: Uuid): NativePromise<string>;
  preflightTest_getLatestSample(preflightTestUuid: Uuid): NativePromise<string>;
  preflightTest_getReport(preflightTestUuid: Uuid): NativePromise<string>;
  preflightTest_getStartTime(preflightTestUuid: Uuid): NativePromise<string>;
  preflightTest_getState(preflightTestUuid: Uuid): NativePromise<string>;
  preflightTest_stop(preflightTestUuid: Uuid): NativePromise<void>;

  preflightTest_flushEvents(): NativePromise<void>;
}
