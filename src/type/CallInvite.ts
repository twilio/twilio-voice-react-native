import type { Constants } from '../constants';
import type { CustomParameters, Uuid } from './common';
import type { NativeErrorInfo } from './Error';
import type { NativeCallMessageInfo } from './CallMessage';

export interface BaseNativeCallInviteEvent {
  callSid: string;
}

export interface NativeCallInviteInfo {
  uuid: Uuid;
  callSid: string;
  customParameters?: CustomParameters;
  from: string;
  to: string;
}

export interface NativeCallInviteAcceptedEvent
  extends BaseNativeCallInviteEvent {
  type: Constants.CallInviteEventTypeValueAccepted;
  callInvite: NativeCallInviteInfo;
}

export interface NativeCallInviteNotificationTappedEvent
  extends BaseNativeCallInviteEvent {
  type: Constants.CallInviteEventTypeValueNotificationTapped;
}

export interface NativeCallInviteRejectedEvent
  extends BaseNativeCallInviteEvent {
  type: Constants.CallInviteEventTypeValueRejected;
  callInvite: NativeCallInviteInfo;
}

export interface NativeCallInviteCancelledEvent
  extends BaseNativeCallInviteEvent {
  type: Constants.CallInviteEventTypeValueCancelled;
  cancelledCallInvite: NativeCancelledCallInviteInfo;
  error?: NativeErrorInfo;
}

export interface NativeCancelledCallInviteInfo {
  callSid: string;
  from: string;
  to: string;
}

export interface NativeCallInviteMessageReceivedEvent
  extends BaseNativeCallInviteEvent {
  type: Constants.CallEventMessageReceived;
  [Constants.CallMessage]: NativeCallMessageInfo;
}

export type NativeCallInviteEvent =
  | NativeCallInviteNotificationTappedEvent
  | NativeCallInviteAcceptedEvent
  | NativeCallInviteRejectedEvent
  | NativeCallInviteCancelledEvent
  | NativeCallInviteMessageReceivedEvent;
