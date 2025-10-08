import { Constants } from '../constants';
import type { Uuid } from './common';
import type { NativeErrorInfo } from './Error';
import type { NativeCallQualityWarnings } from './Call';

export interface NativeEventBase {
  [Constants.PreflightTestEventKeyUuid]: Uuid;
}

export interface NativeEventConnected extends NativeEventBase {
  [Constants.PreflightTestEventKeyType]: Constants.PreflightTestEventTypeValueConnected;
}

export interface NativeEventCompleted extends NativeEventBase {
  [Constants.PreflightTestEventKeyType]: Constants.PreflightTestEventTypeValueCompleted;
  [Constants.PreflightTestCompletedEventKeyReport]: string;
}

export interface NativeEventFailed extends NativeEventBase {
  [Constants.PreflightTestEventKeyType]: Constants.PreflightTestEventTypeValueFailed;
  [Constants.PreflightTestFailedEventKeyError]: NativeErrorInfo;
}

export interface NativeEventSample extends NativeEventBase {
  [Constants.PreflightTestEventKeyType]: Constants.PreflightTestEventTypeValueSample;
  [Constants.PreflightTestSampleEventKeySample]: string;
}

export interface NativeEventQualityWarning extends NativeEventBase {
  [Constants.PreflightTestEventKeyType]: Constants.PreflightTestEventTypeValueQualityWarning;
  [Constants.PreflightTestQualityWarningEventKeyCurrentWarnings]: NativeCallQualityWarnings;
  [Constants.PreflightTestQualityWarningEventKeyPreviousWarnings]: NativeCallQualityWarnings;
}

export type NativeEvent =
  | NativeEventConnected
  | NativeEventCompleted
  | NativeEventFailed
  | NativeEventSample
  | NativeEventQualityWarning;
