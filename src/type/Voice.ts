import type { Constants } from '../constants';
import type { NativeAudioDevicesUpdatedEvent } from './AudioDevice';
import type {
  NativeCallInviteEvent,
  NativeCallInviteAcceptedEvent,
  NativeCallInviteNotificationTappedEvent,
  NativeCallInviteRejectedEvent,
  NativeCancelledCallInviteEvent,
} from './CallInvite';
import type { NativeErrorEvent } from './Error';

export interface NativeRegisteredEvent {
  type: Constants.VoiceEventRegistered;
}

export interface NativeUnregisteredEvent {
  type: Constants.VoiceEventUnregistered;
}

export type NativeVoiceEvent =
  | NativeAudioDevicesUpdatedEvent
  | NativeCallInviteEvent
  | NativeCallInviteAcceptedEvent
  | NativeCallInviteNotificationTappedEvent
  | NativeCallInviteRejectedEvent
  | NativeCancelledCallInviteEvent
  | NativeErrorEvent
  | NativeRegisteredEvent
  | NativeUnregisteredEvent;

export type NativeVoiceEventType =
  | Constants.VoiceEventAudioDevicesUpdated
  | Constants.VoiceEventCallInvite
  | Constants.VoiceEventCallInviteAccepted
  | Constants.VoiceEventCallInviteNotificationTapped
  | Constants.VoiceEventCallInviteRejected
  | Constants.VoiceEventCallInviteCancelled
  | Constants.VoiceEventError
  | Constants.VoiceEventRegistered
  | Constants.VoiceEventUnregistered;
