import type { EventSubscriptionVendor } from 'react-native';
import type { CallInvite } from './CallInvite';
import type { AudioDevice } from './AudioDevice';

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

export enum NativeEventScope {
  'Call' = 'Call',
  'Voice' = 'Voice',
}

export interface NativeErrorInfo {
  code: number;
  message: string;
}

export type Uuid = string;

export enum NativeCallEventType {
  /**
   * Call State
   */
  'Connected' = 'connected',
  'ConnectFailure' = 'connectFailure',
  'Reconnecting' = 'reconnecting',
  'Reconnected' = 'reconnected',
  'Disconnected' = 'disconnected',
  'Ringing' = 'ringing',

  /**
   * Call Quality
   */
  'QualityWarningsChanged' = 'qualityWarningsChanged',
}

export interface NativeCallConnectedEvent {
  type: NativeCallEventType.Connected;
  call: NativeCallInfo;
}

export interface NativeCallConnectFailureEvent {
  type: NativeCallEventType.ConnectFailure;
  call: NativeCallInfo;
  error: NativeErrorInfo;
}

export interface NativeCallReconnectingEvent {
  type: NativeCallEventType.Reconnecting;
  call: NativeCallInfo;
  error: NativeErrorInfo;
}

export interface NativeCallReconnectedEvent {
  type: NativeCallEventType.Reconnected;
  call: NativeCallInfo;
}

export interface NativeCallDisconnectedEvent {
  type: NativeCallEventType.Disconnected;
  call: NativeCallInfo;
  error?: NativeErrorInfo;
}

export interface NativeCallRingingEvent {
  type: NativeCallEventType.Ringing;
  call: NativeCallInfo;
}

export type NativeCallQualityWarnings = string[];

export interface NativeCallQualityWarningsEvent {
  type: NativeCallEventType.QualityWarningsChanged;
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

export enum NativeVoiceEventType {
  /**
   * Common
   */
  'Error' = 'error',

  /**
   * Call Invite Events
   */
  'CallInvite' = 'callInvite',
  'CallInviteAccepted' = 'callInviteAccepted',
  'CallInviteRejected' = 'callInviteRejected',
  'CancelledCallInvite' = 'cancelledCallInvite',

  /**
   * Registration
   */
  'Registered' = 'registered',
  'Unregistered' = 'unregistered',

  /**
   * Audio Devices
   */
  'AudioDevicesUpdated' = 'audioDevicesUpdated',
}

export interface NativeCallInviteEvent {
  type: NativeVoiceEventType.CallInvite;
  callInvite: NativeCallInviteInfo;
}

export interface NativeCallInviteAcceptedEvent {
  type: NativeVoiceEventType.CallInviteAccepted;
  callInvite: NativeCallInviteInfo;
}

export interface NativeCallInviteRejectedEvent {
  type: NativeVoiceEventType.CallInviteRejected;
  callInvite: NativeCallInviteInfo;
}

export interface NativeCancelledCallInviteEvent {
  type: NativeVoiceEventType.CancelledCallInvite;
  cancelledCallInvite: NativeCancelledCallInviteInfo;
  error: NativeErrorInfo;
}

export interface NativeAudioDevicesInfo {
  audioDevices: NativeAudioDeviceInfo[];
  selectedDevice: NativeAudioDeviceInfo;
}

export interface NativeAudioDevicesUpdatedEvent extends NativeAudioDevicesInfo {
  type: NativeVoiceEventType.AudioDevicesUpdated;
}

export interface NativeErrorEvent {
  type: NativeVoiceEventType.Error;
  error: NativeErrorInfo;
}

export type NativeVoiceEvent =
  | NativeAudioDevicesUpdatedEvent
  | NativeCallInviteEvent
  | NativeCallInviteAcceptedEvent
  | NativeCallInviteRejectedEvent
  | NativeCancelledCallInviteEvent
  | NativeErrorEvent;

export enum NativeCallState {
  'Connected' = 'connected',
  'Connecting' = 'connecting',
  'Disconnected' = 'disconnected',
  'Reconnecting' = 'reconnected',
  'Ringing' = 'ringing',
}

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
