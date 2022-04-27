import type { Constants } from '../constants';
import type { NativeAudioDevicesUpdatedEvent } from './AudioDevice';
import type {
  NativeCallInviteEvent,
  NativeCallInviteAcceptedEvent,
  NativeCallInviteRejectedEvent,
  NativeCancelledCallInviteEvent,
} from './CallInvite';
import type { NativeErrorEvent } from './Error';

export type NativeVoiceEvent =
  | NativeAudioDevicesUpdatedEvent
  | NativeCallInviteEvent
  | NativeCallInviteAcceptedEvent
  | NativeCallInviteRejectedEvent
  | NativeCancelledCallInviteEvent
  | NativeErrorEvent;

export type NativeVoiceEventType =
  | Constants.VoiceEventAudioDevicesUpdated
  | Constants.VoiceEventCallInvite
  | Constants.VoiceEventCallInviteAccepted
  | Constants.VoiceEventCallInviteCancelled
  | Constants.VoiceEventCallInviteRejected
  | Constants.VoiceEventError
  | Constants.VoiceEventRegistered
  | Constants.VoiceEventUnregistered;
