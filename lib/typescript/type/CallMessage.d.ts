import type { Constants } from '../constants';
import type { NativeErrorInfo } from './Error';
import type { CallMessage } from '../CallMessage';
export interface NativeCallMessageInfo {
    [Constants.CallMessageContent]: any;
    [Constants.CallMessageContentType]: CallMessage.ContentType;
    [Constants.CallMessageMessageType]: CallMessage.MessageType;
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
export declare type NativeCallMessageEvent = NativeCallMessageFailureEvent | NativeCallMessageSentEvent;
export declare type NativeCallMessageEventType = Constants.CallEventMessageFailure | Constants.CallEventMessageSent;
