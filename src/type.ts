import type { EventSubscriptionVendor } from 'react-native';
import type { CallInvite } from './CallInvite';

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

export interface NativeCallEvent {
  exception?: CallException;
  type: NativeCallEventType;
  uuid: Uuid;
}

export enum NativeVoiceEventType {
  // 'Call' = 'call',
  'CallInvite' = 'callInvite',
  'CancelledCallInvite' = 'cancelledCallInvite',
  'Error' = 'error',
  'Registered' = 'registered',
  'Unregistered' = 'unregistered',
}

export interface NativeVoiceEvent {
  exception?: CallException;
  type: NativeVoiceEventType;
  uuid: Uuid;
}

export enum NativeCallState {
  'Connected' = 'CONNECTED',
  'Connecting' = 'CONNECTING',
  'Disconnected' = 'DISCONNECTED',
  'Reconnecting' = 'RECONNECTING',
  'Ringing' = 'RINGING',
}

export interface TwilioVoiceReactNative extends EventSubscriptionVendor {
  /**
   * Utilities.
   */
  util_generateId(): Promise<Uuid>;

  /**
   * Call bindings.
   */
  call_disconnect(callUuid: Uuid): Promise<void>;
  call_hold(callUuid: Uuid, hold: boolean): Promise<void>;
  call_getFrom(callUuid: Uuid): Promise<string>;
  call_getTo(callUuid: Uuid): Promise<string>;
  call_getSid(callUuid: Uuid): Promise<string>;
  call_getState(callUuid: Uuid): Promise<NativeCallState>;
  call_isOnHold(callUuid: Uuid): Promise<boolean>;
  call_isMuted(callUuid: Uuid): Promise<boolean>;
  call_mute(callUuid: Uuid, mute: boolean): Promise<void>;
  call_sendDigits(callUuid: Uuid, digits: string): Promise<void>;

  /**
   * Call Invite bindings.
   */
  callInvite_accept(
    callInviteUuid: Uuid,
    newCallUuid: Uuid,
    acceptOptions: CallInvite.AcceptOptions
  ): Promise<string>;
  callInvite_getCallSid(callInviteUuid: Uuid): Promise<string>;
  callInvite_getFrom(callInviteUuid: Uuid): Promise<string>;
  callInvite_getTo(callInviteUuid: Uuid): Promise<string>;
  callInvite_isValid(callInviteUuid: Uuid): Promise<boolean>;
  callInvite_reject(callInviteUuid: Uuid): Promise<void>;

  /**
   * CancelledCallInvite bindings.
   */
  cancelledCallInvite_getCallSid(
    cancelledCallInviteUuid: Uuid
  ): Promise<string>;
  cancelledCallInvite_getFrom(cancelledCallInviteUuid: Uuid): Promise<string>;
  cancelledCallInvite_getTo(cancelledCallInviteUuid: Uuid): Promise<string>;

  /**
   * Voice bindings.
   */
  voice_connect(
    newCallUuid: string,
    token: string,
    twimlParams: Record<string, string>
  ): Promise<Uuid>;
  voice_getCalls(): Promise<Uuid[]>;
  voice_getCallInvites(): Promise<Uuid[]>;
  voice_getCancelledCallInvites(): Promise<Uuid[]>;
  voice_getVersion(): Promise<string>;
  voice_register(accessToken: string): Promise<void>;
  voice_unregister(accessToken: string): Promise<void>;
}
