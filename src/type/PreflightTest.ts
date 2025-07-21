import { Constants } from '../constants';
import { InvalidStateError } from '../error';
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

/**
 * This type and function typeguards the PreflightTest events. If it is not the
 * right event, it will throw an InvalidStateError.
 */
type PreflightTestTypeguardFunction<T> = (
  preflightEvent: NativePreflightTestEvent,
) => preflightEvent is Extract<
  NativePreflightTestEvent,
  { [Constants.PreflightTestEventKeyType]: T }
>;

function checkEventTypeFactory<
  T extends NativePreflightTestEvent[typeof Constants.PreflightTestEventKeyType]
>(type: T): PreflightTestTypeguardFunction<T> {
  return (
    preflightEvent: NativePreflightTestEvent,
  ): preflightEvent is Extract<
    NativePreflightTestEvent,
    { [Constants.PreflightTestEventKeyType]: T }
  > => {
    if (preflightEvent[Constants.PreflightTestEventKeyType] !== type) {
      throw new InvalidStateError(
        `Expected event type "${type}", actual type was ` +
          `"${preflightEvent[Constants.PreflightTestEventKeyType]}".`
      );
    }
    return true;
  }
}

export const checkEventType = {
  isConnected: checkEventTypeFactory(Constants.PreflightTestEventTypeValueConnected),
  isCompleted: checkEventTypeFactory(Constants.PreflightTestEventTypeValueCompleted),
  isFailed: checkEventTypeFactory(Constants.PreflightTestEventTypeValueFailed),
  isSample: checkEventTypeFactory(Constants.PreflightTestEventTypeValueSample),
  isQualityWarning: checkEventTypeFactory(Constants.PreflightTestEventTypeValueQualityWarning),
};
