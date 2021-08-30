import type { EventSubscriptionVendor } from 'react-native';
import type { CallInvite } from './CallInvite';
import type { AudioDevice } from './AudioDevice';

export interface NativeCallInviteInfo {
  uuid: Uuid;
  callSid: string;
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

export type CallException = any;

export type Uuid = string;

export enum NativeCallEventType {
  'Connected' = 'connected',
  'ConnectFailure' = 'connectFailure',
  'Reconnecting' = 'reconnecting',
  'Reconnected' = 'reconnected',
  'Disconnected' = 'disconnected',
  'Ringing' = 'ringing',
}

export interface NativeCallConnectedEvent {
  type: NativeCallEventType.Connected;
  call: NativeCallInfo;
}

export interface NativeCallConnectFailureEvent {
  type: NativeCallEventType.ConnectFailure;
  exception: CallException;
  call: NativeCallInfo;
}

export interface NativeCallReconnectingEvent {
  type: NativeCallEventType.Reconnecting;
  call: NativeCallInfo;
}

export interface NativeCallReconnectedEvent {
  type: NativeCallEventType.Reconnected;
  call: NativeCallInfo;
}

export interface NativeCallDisconnectedEvent {
  type: NativeCallEventType.Disconnected;
  call: NativeCallInfo;
}

export interface NativeCallRingingEvent {
  type: NativeCallEventType.Ringing;
  call: NativeCallInfo;
}

export type NativeCallEvent =
  | NativeCallConnectedEvent
  | NativeCallConnectFailureEvent
  | NativeCallReconnectingEvent
  | NativeCallReconnectedEvent
  | NativeCallDisconnectedEvent
  | NativeCallRingingEvent;

export enum NativeVoiceEventType {
  'CallInvite' = 'callInvite',
  'CallInviteAccepted' = 'callInviteAccepted',
  'CallInviteRejected' = 'callInviteRejected',
  'CancelledCallInvite' = 'cancelledCallInvite',
  'Error' = 'error',
  'Registered' = 'registered',
  'Unregistered' = 'unregistered',
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
  exception?: CallException;
}

interface NativeAudioDevicesInfo {
  audioDevices: NativeAudioDeviceInfo[];
  selectedDevice: NativeAudioDeviceInfo;
}

export interface NativeAudioDevicesUpdatedEvent extends NativeAudioDevicesInfo {
  type: NativeVoiceEventType.AudioDevicesUpdated;
}

export type NativeVoiceEvent =
  | NativeAudioDevicesUpdatedEvent
  | NativeCallInviteEvent
  | NativeCallInviteAcceptedEvent
  | NativeCallInviteRejectedEvent
  | NativeCancelledCallInviteEvent;

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
    twimlParams: Record<string, string>
  ): Promise<NativeCallInfo>;
  voice_getAudioDevices(): Promise<NativeAudioDevicesInfo>;
  voice_getCalls(): Promise<NativeCallInfo[]>;
  voice_getCallInvites(): Promise<NativeCallInviteInfo[]>;
  voice_getDeviceToken(): Promise<string>;
  voice_getVersion(): Promise<string>;
  voice_register(accessToken: string): Promise<void>;
  voice_selectAudioDevice(audioDeviceUuid: Uuid): Promise<void>;
  voice_unregister(accessToken: string): Promise<void>;
}
