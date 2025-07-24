import { Constants } from '../constants';
import type { Uuid } from './common';
import type { NativeErrorInfo } from './Error';
import type { NativeCallQualityWarnings } from './Call';

export interface NativePreflightTestEventBase {
  [Constants.PreflightTestEventKeyUuid]: Uuid;
}

export interface NativePreflightTestEventConnected
  extends NativePreflightTestEventBase {
  [Constants.PreflightTestEventKeyType]: Constants.PreflightTestEventTypeValueConnected;
}

export interface NativePreflightTestEventCompleted
  extends NativePreflightTestEventBase {
  [Constants.PreflightTestEventKeyType]: Constants.PreflightTestEventTypeValueCompleted;
  [Constants.PreflightTestCompletedEventKeyReport]: string;
}

export interface NativePreflightTestEventFailed
  extends NativePreflightTestEventBase {
  [Constants.PreflightTestEventKeyType]: Constants.PreflightTestEventTypeValueFailed;
  [Constants.PreflightTestFailedEventKeyError]: NativeErrorInfo;
}

export interface NativePreflightTestEventSample
  extends NativePreflightTestEventBase {
  [Constants.PreflightTestEventKeyType]: Constants.PreflightTestEventTypeValueSample;
  [Constants.PreflightTestSampleEventKeySample]: string;
}

export interface NativePreflightTestEventQualityWarning
  extends NativePreflightTestEventBase {
  [Constants.PreflightTestEventKeyType]: Constants.PreflightTestEventTypeValueQualityWarning;
  [Constants.PreflightTestQualityWarningEventKeyCurrentWarnings]: NativeCallQualityWarnings;
  [Constants.PreflightTestQualityWarningEventKeyPreviousWarnings]: NativeCallQualityWarnings;
}

export type NativePreflightTestEvent =
  | NativePreflightTestEventConnected
  | NativePreflightTestEventCompleted
  | NativePreflightTestEventFailed
  | NativePreflightTestEventSample
  | NativePreflightTestEventQualityWarning;

