import type { Constants } from '../constants';
import type { NativeErrorInfo } from './Error';

export interface NativeCallMessageInfo {
  [Constants.CallMessageContent]: any;
  [Constants.CallMessageContentType]: string;
  [Constants.CallMessageMessageType]: string;
  [Constants.VoiceEventSid]?: string;
}

export interface NativeCallMessageEventBase {
  [Constants.VoiceEventSid]: string;
}

export interface NativeCallMessageFailureEvent
  extends NativeCallMessageEventBase {
  type: Constants.CallEventMessageFailure;
  error: NativeErrorInfo;
}

export interface NativeCallMessageSentEvent extends NativeCallMessageEventBase {
  type: Constants.CallEventMessageSent;
}

export type NativeCallMessageEvent =
  | NativeCallMessageFailureEvent
  | NativeCallMessageSentEvent;

export type NativeCallMessageEventType =
  | Constants.CallEventMessageFailure
  | Constants.CallEventMessageSent;
