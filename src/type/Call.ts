import type { Constants } from '../constants';
import type { CustomParameters, Uuid } from './common';
import type { NativeErrorInfo } from './Error';
import type { Call } from '../Call';

export interface NativeCallInfo {
  uuid: Uuid;
  customParameters?: CustomParameters;
  from?: string;
  [Constants.CallInfoInitialConnectedTimestamp]?: string;
  isMuted?: boolean;
  isOnHold?: boolean;
  sid?: string;
  state?: Call.State;
  to?: string;
}

export interface NativeCallConnectedEvent {
  type: Constants.CallEventConnected;
  call: NativeCallInfo;
}

export interface NativeCallConnectFailureEvent {
  type: Constants.CallEventConnectFailure;
  call: NativeCallInfo;
  error: NativeErrorInfo;
}

export interface NativeCallReconnectingEvent {
  type: Constants.CallEventReconnecting;
  call: NativeCallInfo;
  error: NativeErrorInfo;
}

export interface NativeCallReconnectedEvent {
  type: Constants.CallEventReconnected;
  call: NativeCallInfo;
}

export interface NativeCallDisconnectedEvent {
  type: Constants.CallEventDisconnected;
  call: NativeCallInfo;
  error?: NativeErrorInfo;
}

export interface NativeCallRingingEvent {
  type: Constants.CallEventRinging;
  call: NativeCallInfo;
}

export type NativeCallQualityWarnings = string[];

export interface NativeCallQualityWarningsEvent {
  type: Constants.CallEventQualityWarningsChanged;
  call: NativeCallInfo;
  currentWarnings: NativeCallQualityWarnings;
  previousWarnings: NativeCallQualityWarnings;
}

export type NativeCallEvent =
  | NativeCallConnectedEvent
  | NativeCallConnectFailureEvent
  | NativeCallReconnectingEvent
  | NativeCallReconnectedEvent
  | NativeCallDisconnectedEvent
  | NativeCallRingingEvent
  | NativeCallQualityWarningsEvent;

export type NativeCallEventType =
  | Constants.CallEventConnectFailure
  | Constants.CallEventConnected
  | Constants.CallEventDisconnected
  | Constants.CallEventQualityWarningsChanged
  | Constants.CallEventReconnected
  | Constants.CallEventReconnecting
  | Constants.CallEventRinging;
