import type { Constants } from '../constants';
import type { NativeErrorInfo } from './Error';

export interface NativeCallMessageInfo {
  callMessageContent: string;
  callMessageContentType: string;
  callMessageType: string;
  callMessageSID: string;
}

export interface NativeCallMessageFailureEvent {
  type: Constants.CallEventMessageFailure;
  error: NativeErrorInfo;
}

export interface NativeCallMessageReceivedEvent {
  type: Constants.CallEventMessageReceived;
  callMessageSID: string;
  callMessage: NativeCallMessageInfo;
}

export interface NativeCallMessageSentEvent {
  type: Constants.CallEventMessageSent;
  callMessageSID: string;
}

export type NativeCallMessageEvent =
  | NativeCallMessageFailureEvent
  | NativeCallMessageReceivedEvent
  | NativeCallMessageSentEvent;

export type NativeCallMessageEventType =
  | Constants.CallEventMessageFailure
  | Constants.CallEventMessageReceived
  | Constants.CallEventMessageSent;

export interface CallMessageOptions {
  content: string;
  contentType: string;
  messageType: string;
}
