import type { Constants } from '../constants';
import type { CustomParameters, Uuid } from './common';
import type { NativeErrorInfo } from './Error';

export interface NativeCallInviteInfo {
  uuid: Uuid;
  callSid: string;
  customParameters?: CustomParameters;
  from: string;
  to: string;
}

export interface NativeCallInviteEvent {
  type: Constants.VoiceEventCallInvite;
  callInvite: NativeCallInviteInfo;
}

export interface NativeCallInviteAcceptedEvent {
  type: Constants.VoiceEventCallInviteAccepted;
  callInvite: NativeCallInviteInfo;
}

export interface NativeCallInviteNotificationTappedEvent {
  type: Constants.VoiceEventCallInviteNotificationTapped;
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

export interface NativeCancelledCallInviteInfo {
  callSid: string;
  from: string;
  to: string;
}
