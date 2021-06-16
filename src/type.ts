import type { EventSubscriptionVendor } from 'react-native';
import type { Call } from './Call';
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
   *
   */
  util_generateId(): Promise<Uuid>;

  /**
   * Call bindings.
   */
  call_disconnect(uuid: Uuid): void;
  call_hold(uuid: Uuid): void;
  call_getFrom(uuid: Uuid): string;
  call_getTo(uuid: Uuid): string;
  call_getSid(uuid: Uuid): string;
  call_getState(uuid: Uuid): NativeCallState;
  call_mute(uuid: Uuid): void;
  call_sendDigits(uuid: Uuid, digits: string): void;

  /**
   * Call Invite bindings.
   */
  callInvite_getFrom(uuid: Uuid): string;
  callInvite_getTo(uuid: Uuid): string;
  callInvite_getCallSid(uuid: Uuid): string;
  callInvite_accept(uuid: Uuid, acceptOptions: CallInvite.AcceptOptions): Call;
  callInvite_reject(uuid: Uuid): void;
  callInvite_isValid(uuid: Uuid): boolean;

  /**
   * CanceledCallInvite bindings.
   */
  canceledCallInvite_getFrom(uuid: Uuid): string;
  canceledCallInvite_getTo(uuid: Uuid): string;
  canceledCallInvite_getCallSid(uuid: Uuid): string;

  /**
   * Voice bindings.
   */
  voice_connect(
    uuid: Uuid,
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
