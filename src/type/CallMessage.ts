import type { Constants } from '../constants';
import type { NativeErrorInfo } from './Error';

export interface NativeCallMessageInfo {
  [Constants.CallMessageContent]: any;
  [Constants.CallMessageContentType]: string;
  [Constants.CallMessageMessageType]: string;
  [Constants.VoiceEventSid]?: string;
}

export interface NativeCallMessageFailureEvent {
  type: Constants.CallEventMessageFailure;
  [Constants.VoiceEventSid]: string;
  error: NativeErrorInfo;
}

export interface NativeCallMessageSentEvent {
  type: Constants.CallEventMessageSent;
  [Constants.VoiceEventSid]: string;
}

export type NativeCallMessageEvent =
  | NativeCallMessageFailureEvent
  | NativeCallMessageSentEvent;

export type NativeCallMessageEventType =
  | Constants.CallEventMessageFailure
  | Constants.CallEventMessageSent;
