import type { Constants } from '../constants';
import type { NativeAudioDevicesUpdatedEvent } from './AudioDevice';
import type {
  NativeCallInviteEvent,
  NativeCallInviteAcceptedEvent,
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
  | NativeCallInviteRejectedEvent
  | NativeCancelledCallInviteEvent
  | NativeErrorEvent
  | NativeRegisteredEvent
  | NativeUnregisteredEvent;

export type NativeVoiceEventType =
  | Constants.VoiceEventAudioDevicesUpdated
  | Constants.VoiceEventCallInvite
  | Constants.VoiceEventCallInviteAccepted
  | Constants.VoiceEventCallInviteCancelled
  | Constants.VoiceEventCallInviteRejected
  | Constants.VoiceEventError
  | Constants.VoiceEventRegistered
  | Constants.VoiceEventUnregistered
  | Constants.VoiceEventCallInviteNotificationTapped;
