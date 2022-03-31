import type { EventSubscriptionVendor } from 'react-native';
import type { CallInvite } from './CallInvite';
import type { AudioDevice } from './AudioDevice';
import type { Constants } from './constants';

export type CustomParameters = Record<string, any>;

export interface NativeCallInviteInfo {
  uuid: Uuid;
  callSid: string;
  customParameters?: CustomParameters;
  from: string;
  to: string;
}

export interface NativeCancelledCallInviteInfo {
  callSid: string;
  from: string;
  to: string;
}

export interface NativeCallInfo {
  uuid: Uuid;
  customParameters?: CustomParameters;
  from?: string;
  isMuted?: boolean;
  isOnHold?: boolean;
  sid?: string;
  to?: string;
}

export interface NativeAudioDeviceInfo {
  uuid: Uuid;
  type: AudioDevice.Type;
  name: string;
}

export interface NativeErrorInfo {
  code: number;
  message: string;
}

export type Uuid = string;

export interface NativeCallConnectedEvent {
  type: Constants.CallEventConnected;
  call: NativeCallInfo;
}

export interface NativeCallConnectFailureEvent {
  type: Constants.CallEventConnectFailure;
  call: NativeCallInfo;
  error: NativeErrorInfo;
}

export interface NativeCallReconnectingEvent {
  type: Constants.CallEventReconnecting;
  call: NativeCallInfo;
  error: NativeErrorInfo;
}

export interface NativeCallReconnectedEvent {
  type: Constants.CallEventReconnected;
  call: NativeCallInfo;
}

export interface NativeCallDisconnectedEvent {
  type: Constants.CallEventDisconnected;
  call: NativeCallInfo;
  error?: NativeErrorInfo;
}

export interface NativeCallRingingEvent {
  type: Constants.CallEventRinging;
  call: NativeCallInfo;
}

export type NativeCallQualityWarnings = string[];

export interface NativeCallQualityWarningsEvent {
  type: Constants.CallEventQualityWarningsChanged;
  call: NativeCallInfo;
  currentWarnings: NativeCallQualityWarnings;
  previousWarnings: NativeCallQualityWarnings;
}

export type NativeCallEvent =
  | NativeCallConnectedEvent
  | NativeCallConnectFailureEvent
  | NativeCallReconnectingEvent
  | NativeCallReconnectedEvent
  | NativeCallDisconnectedEvent
  | NativeCallRingingEvent
  | NativeCallQualityWarningsEvent;

export interface NativeCallInviteEvent {
  type: Constants.VoiceEventCallInvite;
  callInvite: NativeCallInviteInfo;
}

export interface NativeCallInviteAcceptedEvent {
  type: Constants.VoiceEventCallInviteAccepted;
  callInvite: NativeCallInviteInfo;
}

export interface NativeCallInviteRejectedEvent {
  type: Constants.VoiceEventCallInviteRejected;
  callInvite: NativeCallInviteInfo;
}

export interface NativeCancelledCallInviteEvent {
  type: Constants.VoiceEventCallInviteCancelled;
  cancelledCallInvite: NativeCancelledCallInviteInfo;
  error: NativeErrorInfo;
}

export interface NativeAudioDevicesInfo {
  audioDevices: NativeAudioDeviceInfo[];
  selectedDevice: NativeAudioDeviceInfo;
}

export interface NativeAudioDevicesUpdatedEvent extends NativeAudioDevicesInfo {
  type: Constants.VoiceEventAudioDevicesUpdated;
}

export interface NativeErrorEvent {
  type: Constants.VoiceEventError;
  error: NativeErrorInfo;
}

export type NativeVoiceEvent =
  | NativeAudioDevicesUpdatedEvent
  | NativeCallInviteEvent
  | NativeCallInviteAcceptedEvent
  | NativeCallInviteRejectedEvent
  | NativeCancelledCallInviteEvent
  | NativeErrorEvent;

export type NativeVoiceEventType =
  | Constants.VoiceEventAudioDevicesUpdated
  | Constants.VoiceEventCallInvite
  | Constants.VoiceEventCallInviteAccepted
  | Constants.VoiceEventCallInviteCancelled
  | Constants.VoiceEventCallInviteRejected
  | Constants.VoiceEventError
  | Constants.VoiceEventRegistered
  | Constants.VoiceEventUnregistered;

export type NativeCallEventType =
  | Constants.CallEventConnectFailure
  | Constants.CallEventConnected
  | Constants.CallEventDisconnected
  | Constants.CallEventQualityWarningsChanged
  | Constants.CallEventReconnected
  | Constants.CallEventReconnecting
  | Constants.CallEventRinging;

export interface TwilioVoiceReactNative extends EventSubscriptionVendor {
  /**
   * Call bindings.
   */
  call_disconnect(callUuid: Uuid): Promise<void>;
  call_hold(callUuid: Uuid, hold: boolean): Promise<boolean>;
  call_isOnHold(callUuid: Uuid): Promise<boolean>;
  call_isMuted(callUuid: Uuid): Promise<boolean>;
  call_mute(callUuid: Uuid, mute: boolean): Promise<boolean>;
  call_sendDigits(callUuid: Uuid, digits: string): Promise<void>;

  /**
   * Call Invite bindings.
   */
  callInvite_accept(
    callInviteUuid: Uuid,
    acceptOptions: CallInvite.AcceptOptions
  ): Promise<NativeCallInfo>;
  callInvite_isValid(callInviteUuid: Uuid): Promise<boolean>;
  callInvite_reject(callInviteUuid: Uuid): Promise<void>;

  /**
   * Voice bindings.
   */
  voice_connect(
    token: string,
    twimlParams: Record<string, any>
  ): Promise<NativeCallInfo>;
  voice_getAudioDevices(): Promise<NativeAudioDevicesInfo>;
  voice_showNativeAvRoutePicker(): Promise<void>;
  voice_getCalls(): Promise<NativeCallInfo[]>;
  voice_getCallInvites(): Promise<NativeCallInviteInfo[]>;
  voice_getDeviceToken(): Promise<string>;
  voice_getVersion(): Promise<string>;
  voice_register(accessToken: string): Promise<void>;
  voice_selectAudioDevice(audioDeviceUuid: Uuid): Promise<void>;
  voice_unregister(accessToken: string): Promise<void>;
}
