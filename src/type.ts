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
  util_generateId(): Uuid;

  /**
   * Call bindings.
   */
  call_disconnect(callUuid: Uuid): void;
  call_hold(callUuid: Uuid, hold: boolean): void;
  call_isOnHold(callUuid: Uuid): boolean;
  call_isMuted(callUuid: Uuid): boolean;
  call_getFrom(callUuid: Uuid): string;
  call_getTo(callUuid: Uuid): string;
  call_getSid(callUuid: Uuid): string;
  call_getState(callUuid: Uuid): NativeCallState;
  call_mute(callUuid: Uuid, mute: boolean): void;
  call_sendDigits(callUuid: Uuid, digits: string): void;

  /**
   * Call Invite bindings.
   */
  callInvite_getFrom(callInviteUuid: Uuid): string;
  callInvite_getTo(callInviteUuid: Uuid): string;
  callInvite_getCallSid(callInviteUuid: Uuid): string;
  callInvite_accept(
    callInviteUuid: Uuid,
    newCallUuid: Uuid,
    acceptOptions: CallInvite.AcceptOptions
  ): void;
  callInvite_reject(callInviteUuid: Uuid): void;
  callInvite_isValid(callInviteUuid: Uuid): boolean;

  /**
   * CanceledCallInvite bindings.
   */
  canceledCallInvite_getFrom(canceledCallInviteUuid: Uuid): string;
  canceledCallInvite_getTo(canceledCallInviteUuid: Uuid): string;
  canceledCallInvite_getCallSid(canceledCallInviteUuid: Uuid): string;

  /**
   * Voice bindings.
   */
  voice_connect(
    newCallUuid: Uuid,
    token: string,
    params: Record<string, string>
  ): void;
  voice_getVersion(): string;
  voice_register(
    accessToken: string,
    registrationToken: string,
    registrationChannel?: RegistrationChannel
  ): void;
  voice_unregister(
    accessToken: string,
    registrationToken: string,
    registrationChannel?: RegistrationChannel
  ): void;
}
