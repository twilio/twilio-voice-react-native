import type { EventSubscriptionVendor } from 'react-native';
import type { CallInvite } from './CallInvite';

export enum RegistrationChannel {
  GCM = 'GCM',
  FCM = 'FCM',
}

export type CallException = any;

export type Uuid = string;

export type NativeCallEventType =
  | 'connected'
  | 'connectFailure'
  | 'reconnecting'
  | 'reconnected'
  | 'disconnected'
  | 'ringing';

export interface NativeCallEvent {
  exception?: CallException;
  type: NativeCallEventType;
  uuid: Uuid;
}

export type NativeMessageEventType = 'callInvite' | 'canceledCallInvite';

export interface NativeMessageEvent {
  exception?: CallException;
  type: NativeMessageEventType;
  uuid: Uuid;
}

export type NativeCallState =
  | 'connected'
  | 'connecting'
  | 'disconnected'
  | 'reconnecting'
  | 'ringing';

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
  call_isOnHold(callUuid: Uuid): Promise<boolean>;
  call_isMuted(callUuid: Uuid): Promise<boolean>;
  call_getFrom(callUuid: Uuid): Promise<string>;
  call_getTo(callUuid: Uuid): Promise<string>;
  call_getSid(callUuid: Uuid): Promise<string>;
  call_getState(callUuid: Uuid): Promise<NativeCallState>;
  call_mute(callUuid: Uuid, mute: boolean): Promise<void>;
  call_sendDigits(callUuid: Uuid, digits: string): Promise<void>;

  /**
   * Call Invite bindings.
   */
  callInvite_getFrom(callInviteUuid: Uuid): Promise<string>;
  callInvite_getTo(callInviteUuid: Uuid): Promise<string>;
  callInvite_getCallSid(callInviteUuid: Uuid): Promise<string>;
  callInvite_accept(
    callInviteUuid: Uuid,
    newCallUuid: Uuid,
    acceptOptions: CallInvite.AcceptOptions
  ): Promise<void>;
  callInvite_reject(callInviteUuid: Uuid): Promise<void>;
  callInvite_isValid(callInviteUuid: Uuid): Promise<boolean>;

  /**
   * CanceledCallInvite bindings.
   */
  canceledCallInvite_getFrom(canceledCallInviteUuid: Uuid): Promise<string>;
  canceledCallInvite_getTo(canceledCallInviteUuid: Uuid): Promise<string>;
  canceledCallInvite_getCallSid(canceledCallInviteUuid: Uuid): Promise<string>;

  /**
   * Voice bindings.
   */
  voice_connect(
    newCallUuid: Uuid,
    token: string,
    params: Record<string, string>
  ): Promise<void>;
  voice_getVersion(): Promise<string>;
  voice_register(
    accessToken: string,
    registrationToken: string,
    registrationChannel?: RegistrationChannel
  ): Promise<void>;
  voice_unregister(
    accessToken: string,
    registrationToken: string,
    registrationChannel?: RegistrationChannel
  ): Promise<void>;
}
