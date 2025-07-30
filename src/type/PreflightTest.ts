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

export interface PreflightAggregateStats {
  [Constants.PreflightAggregateStatsAverage]: number;
  [Constants.PreflightAggregateStatsMax]: number;
  [Constants.PreflightAggregateStatsMin]: number;
}

export interface PreflightNetworkStats {
  [Constants.PreflightNetworkStatsJitter]: number;
  [Constants.PreflightNetworkStatsMos]: number;
  [Constants.PreflightNetworkStatsRtt]: number;
}

export interface PreflightTimeMeasurement {
  [Constants.PreflightTimeMeasurementStartTime]: number;
  [Constants.PreflightTimeMeasurementEndTime]: number;
  [Constants.PreflightTimeMeasurementDuration]: number;
}

export interface PreflightNetworkTiming {
  [Constants.PreflightNetworkTimingSignaling]: PreflightTimeMeasurement;
  [Constants.PreflightNetworkTimingPeerConnection]: PreflightTimeMeasurement;
  [Constants.PreflightNetworkTimingIceConnection]: PreflightTimeMeasurement;
  [Constants.PreflightNetworkTimingPreflightTest]: PreflightTimeMeasurement;
}

export interface PreflightWarning {
  [Constants.PreflightWarningName]: string;
  [Constants.PreflightWarningThreshold]: string;
  [Constants.PreflightWarningValues]: string;
  [Constants.PreflightWarningTimestamp]: number;
}

export interface PreflightWarningCleared {
  [Constants.PreflightWarningClearedName]: string;
  [Constants.PreflightWarningClearedTimestamp]: number;
}

export interface PreflightIceCandidate {
  [Constants.PreflightIceCandidateTransportId]: string;
  [Constants.PreflightIceCandidateIsRemote]: boolean;
  [Constants.PreflightIceCandidateIp]: string;
  [Constants.PreflightIceCandidatePort]: number;
  [Constants.PreflightIceCandidateProtocol]: string;
  [Constants.PreflightIceCandidateCandidateType]: string;
  [Constants.PreflightIceCandidateNetworkCost]: number;
  [Constants.PreflightIceCandidateNetworkId]: number;
  [Constants.PreflightIceCandidateNetworkType]: string;
  [Constants.PreflightIceCandidateRelatedAddress]: string;
  [Constants.PreflightIceCandidateRelatedPort]: number;
  [Constants.PreflightIceCandidateTcpType]: string;
}

export interface PreflightSelectedIceCandidatePair {
  [Constants.PreflightSelectedIceCandidatePairLocalCandidate]: PreflightIceCandidate;
  [Constants.PreflightSelectedIceCandidatePairRemoteCandidate]: PreflightIceCandidate;
}

export interface PreflightStatsSample {
  [Constants.PreflightStatsSampleCodec]: string;
  [Constants.PreflightStatsSampleAudioInputLevel]: number;
  [Constants.PreflightStatsSampleAudioOutputLevel]: number;
  [Constants.PreflightStatsSampleBytesReceived]: number;
  [Constants.PreflightStatsSampleBytesSent]: number;
  [Constants.PreflightStatsSamplePacketsReceived]: number;
  [Constants.PreflightStatsSamplePacketsSent]: number;
  [Constants.PreflightStatsSamplePacketsLost]: number;
  [Constants.PreflightStatsSamplePacketsLostFraction]: number;
  [Constants.PreflightStatsSampleJitter]: number;
  [Constants.PreflightStatsSampleMos]: number;
  [Constants.PreflightStatsSampleRtt]: number;
  [Constants.PreflightStatsSampleTimestamp]: string;
}

export enum PreflightCallQuality {
  Degraded = Constants.PreflightReportCallQualityDegraded,
  Excellent = Constants.PreflightReportCallQualityExcellent,
  Fair = Constants.PreflightReportCallQualityFair,
  Good = Constants.PreflightReportCallQualityGood,
  Great = Constants.PreflightReportCallQualityGreat,
}

export interface PreflightReport {
  [Constants.PreflightReportCallSid]: string;
  [Constants.PreflightReportEdge]: string;
  [Constants.PreflightReportSelectedEdge]: string;
  [Constants.PreflightReportIceCandidates]: PreflightIceCandidate[];
  [Constants.PreflightReportNetworkTiming]: PreflightNetworkTiming;
  [Constants.PreflightReportStatsSamples]: PreflightStatsSample[];
  [Constants.PreflightReportNetworkStats]: PreflightNetworkStats;
  [Constants.PreflightReportIsTurnRequired]: boolean | null;
  [Constants.PreflightReportCallQuality]: PreflightCallQuality;
  [Constants.PreflightReportWarnings]: PreflightWarning[];
  [Constants.PreflightReportWarningsCleared]: PreflightWarningCleared[];
  [Constants.PreflightReportSelectedIceCandidatePair]: PreflightSelectedIceCandidatePair;
}
