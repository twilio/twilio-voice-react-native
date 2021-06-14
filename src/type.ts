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
  call_disconnect(nativeScope: string): void;
  call_hold(nativeScope: string): void;
  call_getFrom(nativeScope: string): string;
  call_getTo(nativeScope: string): string;
  call_getSid(nativeScope: string): string;
  call_getState(nativeScope: string): NativeCallState;
  call_mute(nativeScope: string): void;
  call_sendDigits(nativeScope: string, digits: string): void;

  /**
   * Call Invite bindings.
   */
  callInvite_getFrom(nativeScope: string): string;
  callInvite_getTo(nativeScope: string): string;
  callInvite_getCallSid(nativeScope: string): string;
  callInvite_accept(
    nativeScope: string,
    acceptOptions: CallInvite.AcceptOptions
  ): Call;
  callInvite_reject(nativeScope: string): void;
  callInvite_isValid(nativeScope: string): boolean;

  /**
   * CanceledCallInvite bindings.
   */
  canceledCallInvite_getFrom(nativeScope: string): string;
  canceledCallInvite_getTo(nativeScope: string): string;
  canceledCallInvite_getCallSid(nativeScope: string): string;

  /**
   * Voice bindings.
   */
  voice_connect(
    nativeScope: string,
    token: string,
    params: Record<string, string>
  ): Promise<void>;
  voice_getVersion(): Promise<string>;
  voice_register(
    accessToken: string,
    registrationChannel: RegistrationChannel,
    registrationToken: string
  ): Promise<void>;
  voice_unregister(
    accessToken: string,
    registrationChannel: RegistrationChannel,
    registrationToken: string
  ): Promise<void>;
}
