import type { Constants } from '../constants';
import type { NativeErrorInfo } from './Error';
import type { CallMessage } from '../CallMessage';

export interface NativeCallMessageInfo {
  [Constants.CallMessageContent]: string;
  [Constants.CallMessageContentType]: CallMessage.ContentType;
  [Constants.CallMessageMessageType]: CallMessage.MessageType;
  [Constants.VoiceEventSid]?: string;
}

export interface NativeCallMessageFailureEvent {
  type: Constants.CallEventMessageFailure;
  error: NativeErrorInfo;
}

export interface NativeCallMessageSentEvent {
  type: Constants.CallEventMessageSent;
}

export type NativeCallMessageEvent =
  | NativeCallMessageFailureEvent
  | NativeCallMessageSentEvent;

export type NativeCallMessageEventType =
  | Constants.CallEventMessageFailure
  | Constants.CallEventMessageSent;
