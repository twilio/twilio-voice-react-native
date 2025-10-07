/**
 * Copyright © 2025 Twilio, Inc. All rights reserved. Licensed under the Twilio
 * license.
 *
 * See LICENSE in the project root for license information.
 */

import { EventEmitter } from 'eventemitter3';
import type { Call } from './Call';
import * as common from './common';
import { Constants } from './constants';
import { InvalidStateError, TwilioError } from './error';
import { constructTwilioError } from './error/utility';
import type { AudioCodec } from './type/AudioCodec';
import type { IceServer, IceTransportPolicy } from './type/Ice';
import type * as PreflightTestType from './type/PreflightTest';

export interface PreflightTest {
  /**
   * ------------
   * Emit Typings
   * ------------
   */

  /** @internal */
  emit(connectedEvent: PreflightTest.Event.Connected): boolean;

  /** @internal */
  emit(
    completedEvent: PreflightTest.Event.Completed,
    report: PreflightTest.Report
  ): boolean;

  /** @internal */
  emit(failedEvent: PreflightTest.Event.Failed, error: TwilioError): boolean;

  /** @internal */
  emit(
    sampleEvent: PreflightTest.Event.Sample,
    sample: PreflightTest.RTCSample
  ): boolean;

  /** @internal */
  emit(
    qualityWarningEvent: PreflightTest.Event.QualityWarning,
    currentWarnings: Call.QualityWarning[],
    previousWarnings: Call.QualityWarning[]
  ): boolean;

  /**
   * ----------------
   * Listener Typings
   * ----------------
   */

  /**
   * Connected event. Raised when the PreflightTest has successfully connected.
   *
   * @example
   * ```typescript
   * preflightTest.addListener(PreflightTest.Event.Connected, () => {
   *   // preflightTest has been connected
   * });
   * ```
   *
   * @param connectedEvent - The raised event string.
   * @param listener - A listener function that will be invoked when the event
   * is raised.
   * @returns - The PreflightTest object.
   */
  addListener(
    connectedEvent: PreflightTest.Event.Connected,
    listener: PreflightTest.Listener.Connected
  ): this;
  /** {@inheritDoc (PreflightTest:interface).(addListener:1)} */
  on(
    connectedEvent: PreflightTest.Event.Connected,
    listener: PreflightTest.Listener.Connected
  ): this;

  /**
   * Completed event. Raised when the PreflightTest has successfully completed.
   *
   * @example
   * ```typescript
   * preflightTest.addListener(PreflightTest.Event.Completed, (report: PreflightTest.Report) => {
   *   // preflightTest has been completed
   *   // consider using the report and adjusting your UI to show any potential issues
   * });
   * ```
   *
   * @param completedEvent - The raised event string.
   * @param listener - A listener function that will be invoked when the event
   * is raised.
   * @returns - The PreflightTest object.
   */
  addListener(
    completedEvent: PreflightTest.Event.Completed,
    listener: PreflightTest.Listener.Completed
  ): this;
  /** {@inheritDoc (PreflightTest:interface).(addListener:2)} */
  on(
    completedEvent: PreflightTest.Event.Completed,
    listener: PreflightTest.Listener.Completed
  ): this;

  /**
   * Failed event. Raised when the PreflightTest was unable to be performed.
   *
   * @example
   * ```typescript
   * preflightTest.addListener(PreflightTest.Event.Failed, (error: TwilioError) => {
   *   // preflightTest has failed
   *   // consider adjusting your UI to show the error
   * });
   * ```
   *
   * @param failedEvent - The raised event string.
   * @param listener - A listener function that will be invoked when the event
   * is raised.
   * @returns - The PreflightTest object.
   */
  addListener(
    failedEvent: PreflightTest.Event.Failed,
    listener: PreflightTest.Listener.Failed
  ): this;
  /** {@inheritDoc (PreflightTest:interface).(addListener:3)} */
  on(
    failedEvent: PreflightTest.Event.Failed,
    listener: PreflightTest.Listener.Failed
  ): this;

  /**
   * Sample event. Raised when the PreflightTest has generated a stats sample
   * during the test.
   *
   * @example
   * ```typescript
   * preflightTest.addListener(PreflightTest.Event.Sample, (sample: PreflightTest.Sample) => {
   *   // preflightTest has generated a sample
   *   // consider updating your UI with information from the sample
   * });
   * ```
   *
   * @param sampleEvent - The raised event string.
   * @param listener - A listener function that will be invoked when the event
   * is raised.
   * @returns - The PreflightTest object.
   */
  addListener(
    sampleEvent: PreflightTest.Event.Sample,
    listener: PreflightTest.Listener.Sample
  ): this;
  /** {@inheritDoc (PreflightTest:interface).(addListener:4)} */
  on(
    sampleEvent: PreflightTest.Event.Sample,
    listener: PreflightTest.Listener.Sample
  ): this;

  /**
   * QualityWarning event. Raised when the PreflightTest has encountered a
   * QualityWarning during a test.
   *
   * @example
   * ```typescript
   * preflightTest.addListener(
   *   PreflightTest.Event.QualityWarning,
   *   (currentWarnings: Call.QualityWarning[], previousWarnings: Call.QualityWarning[]) => {
   *     // preflightTest has generated or cleared a quality warning
   *     // consider updating your UI with information about the warning
   *   },
   * );
   * ```
   *
   * @param qualityWarningEvent - The raised event string.
   * @param listener - A listener function that will be invoked when the event
   * is raised.
   * @returns - The PreflightTest object.
   */
  addListener(
    warningEvent: PreflightTest.Event.QualityWarning,
    listener: PreflightTest.Listener.QualityWarning
  ): this;
  /** {@inheritDoc (PreflightTest:interface).(addListener:5)} */
  on(
    warningEvent: PreflightTest.Event.QualityWarning,
    listener: PreflightTest.Listener.QualityWarning
  ): this;

  /**
   * Generic event listener typings.
   * @param preflightTestEvent - The raised event string.
   * @param listener - A listener function that will be invoked when the event
   * is raised.
   * @returns - The PreflightTest object.
   */
  addListener(
    event: PreflightTest.Event,
    listener: PreflightTest.Listener.Generic
  ): this;
  /** {@inheritDoc (PreflightTest:interface).(addListener:6)} */
  on(
    event: PreflightTest.Event,
    listener: PreflightTest.Listener.Generic
  ): this;
}

/**
 * The PreflightTest for Voice React Native SDK allows you to anticipate and
 * troubleshoot end users' connectivity and bandwidth issues before or during
 * Twilio Voice calls.
 *
 * You can run a PreflightTest before a Twilio Voice call. The PreflightTest
 * performs a test call to Twilio and provides a
 * {@link (PreflightTest:namespace).Report} object at the end. The report
 * includes information about the end user's network connection (including
 * jitter, packet loss, and round trip time) and connection settings.
 *
 * @example
 * ```typescript
 * const accessToken = ...;
 * const preflightTest = voice.runPreflightTest(accessToken);
 *
 * preflightTest.on(PreflightTest.Event.Connected, () => {
 *   // handle when preflightTest connects
 * });
 *
 * preflightTest.on(PreflightTest.Event.Completed, (report: PreflightTest.Report) => {
 *   // handle when preflightTest is complete
 * });
 *
 * preflightTest.on(PreflightTest.Event.Failed, (error: TwilioError) => {
 *   // handle preflightTest errors
 * });
 *
 * preflightTest.on(
 *   PreflightTest.Event.QualityWarning,
 *   (currentWarnings: Call.QualityWarning[], previousWarnings: Call.QualityWarning[]) => {
 *     // handle preflightTest quality warnings
 *   },
 * );
 *
 * preflightTest.on(PreflightTest.Event.Sample, (sample: PreflightTest.Sample) => {
 *   // handle preflightTest sample
 * });
 * ```
 */
export class PreflightTest extends EventEmitter {
  /**
   * UUID of the PreflightTest. This is generated by the native layer and used
   * to link events emitted by the native layer to the respective JS object.
   */
  private _uuid: string;

  /**
   * PreflightTest constructor.
   *
   * @internal
   */
  constructor(uuid: string) {
    super();

    this._uuid = uuid;

    common.NativeEventEmitter.addListener(
      Constants.ScopePreflightTest,
      this._handleNativeEvent
    );

    // by using a setTimeout here, we let the call stack empty before we flush
    // the preflight test events. this way, listeners on this object can bind
    // before flushing
    if (common.Platform.OS === 'ios') {
      common.setTimeout(() => {
        common.NativeModule.preflightTest_flushEvents();
      });
    }
  }

  /**
   * Handle all PreflightTest native events.
   */
  private _handleNativeEvent = (
    nativePreflightTestEvent: PreflightTestType.NativeEvent
  ): void => {
    const uuid = nativePreflightTestEvent[Constants.PreflightTestEventKeyUuid];
    if (typeof uuid !== 'string') {
      throw new InvalidStateError(
        `Unexpected PreflightTest UUID type: "${uuid}".`
      );
    }

    if (uuid !== this._uuid) {
      return;
    }

    // VBLOCKS-5083
    // Update this member access when we upgrade typescript for this project.
    switch (nativePreflightTestEvent.preflightTestEventKeyType) {
      case Constants.PreflightTestEventTypeValueCompleted: {
        return this._handleCompletedEvent(nativePreflightTestEvent);
      }
      case Constants.PreflightTestEventTypeValueConnected: {
        return this._handleConnectedEvent();
      }
      case Constants.PreflightTestEventTypeValueFailed: {
        return this._handleFailedEvent(nativePreflightTestEvent);
      }
      case Constants.PreflightTestEventTypeValueQualityWarning: {
        return this._handleQualityWarningEvent(nativePreflightTestEvent);
      }
      case Constants.PreflightTestEventTypeValueSample: {
        return this._handleSampleEvent(nativePreflightTestEvent);
      }
      default: {
        const _exhaustiveCheck: never = nativePreflightTestEvent;
        throw new InvalidStateError(
          `Unexpected native PreflightTest event key type: "${
            (_exhaustiveCheck as any)[Constants.PreflightTestEventKeyType]
          }".`
        );
      }
    }
  };

  /**
   * Handle completed event.
   */
  private _handleCompletedEvent = (
    nativeEvent: PreflightTestType.NativeEventCompleted
  ) => {
    const report = nativeEvent[Constants.PreflightTestCompletedEventKeyReport];
    if (typeof report !== 'string') {
      throw constructInvalidValueError(
        PreflightTest.Event.Completed,
        'report',
        'string',
        typeof report
      );
    }

    const parsedReport = parseReport(report);

    this.emit(PreflightTest.Event.Completed, parsedReport);
  };

  /**
   * Handle connected event.
   */
  private _handleConnectedEvent = () => {
    this.emit(PreflightTest.Event.Connected);
  };

  /**
   * Handle failed event.
   */
  private _handleFailedEvent = (
    nativeEvent: PreflightTestType.NativeEventFailed
  ) => {
    const { message, code } =
      nativeEvent[Constants.PreflightTestFailedEventKeyError];
    if (typeof message !== 'string') {
      throw constructInvalidValueError(
        PreflightTest.Event.Failed,
        'message',
        'string',
        typeof message
      );
    }
    if (typeof code !== 'number') {
      throw constructInvalidValueError(
        PreflightTest.Event.Failed,
        'code',
        'number',
        typeof code
      );
    }
    const error = constructTwilioError(message, code);

    this.emit(PreflightTest.Event.Failed, error);
  };

  /**
   * Handle quality warning event.
   */
  private _handleQualityWarningEvent = (
    nativeEvent: PreflightTestType.NativeEventQualityWarning
  ) => {
    const currentWarnings =
      nativeEvent[Constants.PreflightTestQualityWarningEventKeyCurrentWarnings];
    if (!Array.isArray(currentWarnings)) {
      throw constructInvalidValueError(
        PreflightTest.Event.QualityWarning,
        'currentWarnings',
        'array',
        typeof currentWarnings
      );
    }
    currentWarnings.forEach((w) => {
      if (typeof w !== 'string') {
        throw constructInvalidValueError(
          PreflightTest.Event.QualityWarning,
          'element-in-currentWarnings',
          'string',
          typeof w
        );
      }
    });

    const previousWarnings =
      nativeEvent[
        Constants.PreflightTestQualityWarningEventKeyPreviousWarnings
      ];
    if (!Array.isArray(previousWarnings)) {
      throw constructInvalidValueError(
        PreflightTest.Event.QualityWarning,
        'previousWarnings',
        'array',
        typeof previousWarnings
      );
    }
    previousWarnings.forEach((w) => {
      if (typeof w !== 'string') {
        throw constructInvalidValueError(
          PreflightTest.Event.QualityWarning,
          'element-in-previousWarnings',
          'string',
          typeof w
        );
      }
    });

    this.emit(
      PreflightTest.Event.QualityWarning,
      currentWarnings as Call.QualityWarning[],
      previousWarnings as Call.QualityWarning[]
    );
  };

  /**
   * Handle sample event.
   */
  private _handleSampleEvent = (
    nativeEvent: PreflightTestType.NativeEventSample
  ) => {
    const sampleStr = nativeEvent[Constants.PreflightTestSampleEventKeySample];
    if (typeof sampleStr !== 'string') {
      throw constructInvalidValueError(
        PreflightTest.Event.Sample,
        'sample',
        'string',
        typeof sampleStr
      );
    }

    const sampleObj = JSON.parse(sampleStr);

    this.emit(PreflightTest.Event.Sample, parseSample(sampleObj));
  };

  /**
   * Internal helper method to invoke a native method and handle the returned
   * promise from the native method.
   */
  private async _invokeAndCatchNativeMethod<T>(
    method: (uuid: string) => Promise<T>
  ) {
    return method(this._uuid).catch((error: any): never => {
      if (typeof error.code === 'number' && error.message)
        throw constructTwilioError(error.message, error.code);

      if (error.code === Constants.ErrorCodeInvalidStateError)
        throw new InvalidStateError(error.message);

      throw error;
    });
  }

  /**
   * Get the CallSid of the underlying Call in the PreflightTest.
   *
   * @returns
   * Promise that
   * - Resolves with a string representing the CallSid.
   * - Rejects if the native layer could not find the CallSid for this
   *   PreflightTest object.
   */
  public async getCallSid(): Promise<string> {
    return this._invokeAndCatchNativeMethod(
      common.NativeModule.preflightTest_getCallSid
    );
  }

  /**
   * Get the end time of the PreflightTest.
   *
   * @returns
   * A Promise that
   * - Resolves with `number` if the PreflightTest has ended.
   * - Resolves with `undefined` if PreflightTest has not ended.
   * - Rejects if the native layer encountered an error.
   */
  public async getEndTime(): Promise<number> {
    return this._invokeAndCatchNativeMethod(
      common.NativeModule.preflightTest_getEndTime
    ).then(Number);
  }

  /**
   * Get the latest stats sample generated by the PreflightTest.
   *
   * @returns
   * A Promise that
   * - Resolves with the last {@link (PreflightTest:namespace).RTCSample}
   *   generated by the PreflightTest.
   * - Resolves with `undefined` if there is no previously generated sample.
   * - Rejects if the native layer encountered an error.
   */
  public async getLatestSample(): Promise<PreflightTest.RTCSample> {
    return this._invokeAndCatchNativeMethod(
      common.NativeModule.preflightTest_getLatestSample
    ).then((sampleStr) => {
      const sampleObj = JSON.parse(sampleStr);
      return parseSample(sampleObj);
    });
  }

  /**
   * Get the final report generated by the PreflightTest.
   *
   * @returns
   * A Promise that
   * - Resolves with the final {@link (PreflightTest:namespace).Report}.
   * - Resolves with `undefined` if the report is unavailable.
   * - Rejects if the native layer encountered an error.
   */
  public async getReport(): Promise<PreflightTest.Report> {
    return this._invokeAndCatchNativeMethod(
      common.NativeModule.preflightTest_getReport
    ).then(parseReport);
  }

  /**
   * Get the start time of the PreflightTest.
   *
   * @returns
   * A Promise that
   * - Resolves with a `number` representing the start time of the
   *   PreflightTest.
   * - Rejects if the native layer encountered an error.
   */
  public async getStartTime(): Promise<number> {
    return this._invokeAndCatchNativeMethod(
      common.NativeModule.preflightTest_getStartTime
    ).then(Number);
  }

  /**
   * Get the state of the PreflightTest.
   *
   * @returns
   * A Promise that
   * - Resolves with the current state of the PreflightTest.
   * - Rejects if the native layer encountered an error.
   */
  public async getState(): Promise<PreflightTest.State> {
    return this._invokeAndCatchNativeMethod(
      common.NativeModule.preflightTest_getState
    ).then(parseState);
  }

  /**
   * Stop the ongoing PreflightTest.
   *
   * @returns
   * A Promise that
   * - Resolves if the PreflightTest was successfully stopped.
   * - Rejects if the native layer encountered an error.
   */
  public async stop(): Promise<void> {
    return this._invokeAndCatchNativeMethod(
      common.NativeModule.preflightTest_stop
    );
  }
}

/**
 * Preflight helper functions to parse JSON strings from the native layer into
 * proper JS objects to emit from this class.
 */

/**
 * Parse native time measurement.
 */
function parseTimeMeasurement(nativeTimeMeasurement: {
  duration: number;
  endTime: number;
  startTime: number;
}): PreflightTest.TimeMeasurement {
  return {
    duration: nativeTimeMeasurement.duration,
    end: nativeTimeMeasurement.endTime,
    start: nativeTimeMeasurement.startTime,
  };
}

/**
 * Parse native call quality enum.
 */
function parseCallQuality(
  nativeCallQuality: any
): PreflightTest.CallQuality | null {
  switch (common.Platform.OS) {
    case 'android': {
      return parseCallQualityAndroid(nativeCallQuality);
    }
    case 'ios': {
      return parseCallQualityIos(nativeCallQuality);
    }
    default: {
      throw new InvalidStateError('Invalid platform.');
    }
  }
}

/**
 * Parse call quality value for Android platform.
 */
function parseCallQualityAndroid(
  nativeCallQuality: string | undefined | null
): PreflightTest.CallQuality | null {
  if (typeof nativeCallQuality === 'undefined' || nativeCallQuality === null) {
    return null;
  }

  if (typeof nativeCallQuality !== 'string') {
    throw new InvalidStateError(
      `Call quality not of type "string". Found "${typeof nativeCallQuality}".`
    );
  }

  const parsedCallQuality = callQualityMap.android.get(nativeCallQuality);

  if (typeof parsedCallQuality !== 'string') {
    throw new InvalidStateError(
      `Call quality invalid. Expected a string, found "${nativeCallQuality}".`
    );
  }

  return parsedCallQuality;
}

/**
 * Parse call quality for iOS platform.
 */
function parseCallQualityIos(
  nativeCallQuality: number | undefined | null
): PreflightTest.CallQuality | null {
  if (typeof nativeCallQuality === 'undefined' || nativeCallQuality === null) {
    return null;
  }

  if (typeof nativeCallQuality !== 'number') {
    throw new InvalidStateError(
      `Call quality not of type "number". Found "${typeof nativeCallQuality}".`
    );
  }

  const parsedCallQuality = callQualityMap.ios.get(nativeCallQuality);

  if (typeof parsedCallQuality !== 'string') {
    throw new InvalidStateError(
      `Call quality invalid. Expected [0, 4], found "${nativeCallQuality}".`
    );
  }

  return parsedCallQuality;
}

/**
 * Parse native preflight test state value.
 */
function parseState(nativeState: string): PreflightTest.State {
  const parsedState = preflightTestStateMap.get(nativeState);

  if (typeof parsedState !== 'string') {
    const expectedKeys = Array(preflightTestStateMap.keys()).join(', ');
    throw new InvalidStateError(
      'PreflightTest state invalid. ' +
        `Expected one of "[${expectedKeys}]". Got "${nativeState}".`
    );
  }

  return parsedState;
}

/**
 * Parse a sample object and transform the keys to match the expected output.
 */
function parseSample(
  sampleObject: Omit<
    PreflightTest.RTCSample,
    typeof Constants.PreflightRTCSampleTimestamp
  > & { [Constants.PreflightRTCSampleTimestamp]: string }
): PreflightTest.RTCSample {
  const audioInputLevel = sampleObject.audioInputLevel;
  const audioOutputLevel = sampleObject.audioOutputLevel;
  const bytesReceived = sampleObject.bytesReceived;
  const bytesSent = sampleObject.bytesSent;
  const codec = sampleObject.codec;
  const jitter = sampleObject.jitter;
  const mos = sampleObject.mos;
  const packetsLost = sampleObject.packetsLost;
  const packetsLostFraction = sampleObject.packetsLostFraction;
  const packetsReceived = sampleObject.packetsReceived;
  const packetsSent = sampleObject.packetsSent;
  const rtt = sampleObject.rtt;
  const timestamp = Number(sampleObject.timestamp);

  const sample = {
    audioInputLevel,
    audioOutputLevel,
    bytesReceived,
    bytesSent,
    codec,
    jitter,
    mos,
    packetsLost,
    packetsLostFraction,
    packetsReceived,
    packetsSent,
    rtt,
    timestamp,
  };

  return sample;
}

/**
 * Parse native "isTurnRequired" value.
 */
function parseIsTurnRequired(isTurnRequired: any): boolean | null {
  switch (common.Platform.OS) {
    case 'android': {
      return parseIsTurnRequiredAndroid(isTurnRequired);
    }
    case 'ios': {
      return parseIsTurnRequiredIos(isTurnRequired);
    }
    default: {
      throw new InvalidStateError('Invalid platform.');
    }
  }
}

/**
 * Parse native "isTurnRequired" value on Android.
 */
function parseIsTurnRequiredAndroid(
  isTurnRequired: boolean | undefined | null
): boolean | null {
  if (typeof isTurnRequired === 'undefined' || isTurnRequired === null) {
    return null;
  }

  if (typeof isTurnRequired !== 'boolean') {
    throw new InvalidStateError(
      `PreflightTest "isTurnRequired" not valid. Found "${isTurnRequired}".`
    );
  }

  return isTurnRequired;
}

/**
 * Parse native "isTurnRequired" value on iOS.
 */
function parseIsTurnRequiredIos(
  isTurnRequired: string | undefined | null
): boolean | null {
  if (typeof isTurnRequired === 'undefined' || isTurnRequired === null) {
    return null;
  }

  if (typeof isTurnRequired !== 'string') {
    throw new InvalidStateError(
      'PreflightTest "isTurnRequired" not of type "string". ' +
        `Found "${isTurnRequired}".`
    );
  }

  const parsedValue = isTurnRequiredMap.ios.get(isTurnRequired);

  if (typeof parsedValue !== 'boolean') {
    throw new InvalidStateError(
      `PreflightTest "isTurnRequired" not valid. Found "${isTurnRequired}".`
    );
  }

  return parsedValue;
}

/**
 * Parse native warnings array.
 */
function parseWarnings(
  warnings: PreflightTest.Warning[] | undefined | null
): PreflightTest.Warning[] {
  if (typeof warnings === 'undefined' || warnings === null) {
    return [];
  }

  if (!Array.isArray(warnings)) {
    throw new InvalidStateError(
      `PreflightTest "warnings" invalid. Found "${warnings}".`
    );
  }

  return warnings;
}

/**
 * Parse native warningsCleared array.
 */
function parseWarningsCleared(
  warningsCleared: PreflightTest.WarningCleared[] | undefined | null
): PreflightTest.WarningCleared[] {
  if (typeof warningsCleared === 'undefined' || warningsCleared === null) {
    return [];
  }

  if (!Array.isArray(warningsCleared)) {
    throw new InvalidStateError(
      `PreflightTest "warningsCleared" invalid. Found "${warningsCleared}".`
    );
  }

  return warningsCleared;
}

/**
 * Parse native preflight report.
 */
function parseReport(rawReport: string): PreflightTest.Report {
  const unprocessedReport: any = JSON.parse(rawReport);

  const callSid: string = unprocessedReport.callSid;

  // Note: Android returns enum values where the first letter is capitalized.
  // The helper function normalizes this into all-lowercased values.
  const callQuality: PreflightTest.CallQuality | null = parseCallQuality(
    unprocessedReport.callQuality
  );

  const edge: string = unprocessedReport.edge;

  // Note: key change from `iceCandidates` to `iceCandidateStats`
  const iceCandidateStats: PreflightTest.RTCIceCandidateStats[] =
    unprocessedReport.iceCandidates;

  // Note: iOS returns a string, Android returns a boolean
  const isTurnRequired: boolean | null = parseIsTurnRequired(
    unprocessedReport.isTurnRequired
  );

  // Note: key change from `networkStats` to `stats`.
  const stats: PreflightTest.RTCStats = unprocessedReport.networkStats;

  // Note: removing preflightTest from networkTiming and putting it in a
  // separate testTiming member
  const unprocessedNetworkTiming: {
    signaling: any;
    peerConnection: any;
    iceConnection: any;
    preflightTest: any;
  } = unprocessedReport.networkTiming;

  // Note: nested key change from `startTime` to `start` and `endTime` to `end`.
  const networkTiming: PreflightTest.NetworkTiming = {
    signaling: parseTimeMeasurement(unprocessedNetworkTiming.signaling),
    peerConnection: parseTimeMeasurement(
      unprocessedNetworkTiming.peerConnection
    ),
    ice: parseTimeMeasurement(unprocessedNetworkTiming.iceConnection),
  };

  // Note: nested key change from `startTime` to `start` and `endTime` to `end`.
  const testTiming: PreflightTest.TimeMeasurement = parseTimeMeasurement(
    unprocessedNetworkTiming.preflightTest
  );

  // Note: key change from `statsSamples` to `stats`.
  const samples: PreflightTest.RTCSample[] =
    unprocessedReport.statsSamples.map(parseSample);

  const selectedEdge: string = unprocessedReport.selectedEdge;

  // Note: key change from `selectedIceCandidatePair` to `selectedIceCandidatePairStats`.
  const selectedIceCandidatePairStats: PreflightTest.RTCSelectedIceCandidatePairStats =
    unprocessedReport.selectedIceCandidatePair;

  // Note: iOS returns undefined where Android returns an empty array
  // when there were no warnings
  const warnings: PreflightTest.Warning[] = parseWarnings(
    unprocessedReport.warnings
  );

  // Note: iOS returns undefined where Android returns an empty array
  // when there were no warningsCleared
  const warningsCleared: PreflightTest.WarningCleared[] = parseWarningsCleared(
    unprocessedReport.warningsCleared
  );

  const report: PreflightTest.Report = {
    callSid,
    callQuality,
    edge,
    iceCandidateStats,
    isTurnRequired,
    stats,
    networkTiming,
    testTiming,
    samples,
    selectedEdge,
    selectedIceCandidatePairStats,
    warnings,
    warningsCleared,
  };

  return report;
}

/**
 * Helper function to construct errors when the native layer sends an
 * unexpected value to the JS layer.
 */
function constructInvalidValueError(
  eventName: PreflightTest.Event,
  valueName: string,
  expectedType: string,
  actualType: string
): InvalidStateError {
  return new InvalidStateError(
    `Invalid "preflightTest#${eventName}" value type for "${valueName}". ` +
      `Expected "${expectedType}"; actual "${actualType}".`
  );
}

/**
 * Helper types for the PrefligthTest class.
 */
export namespace PreflightTest {
  /**
   * Options to run a PreflightTest.
   */
  export interface Options {
    /**
     * Array of ICE servers to use for the PreflightTest.
     */
    [Constants.CallOptionsKeyIceServers]?: IceServer[];
    /**
     * The ICE transport policy to use for the PreflightTest.
     */
    [Constants.CallOptionsKeyIceTransportPolicy]?: IceTransportPolicy;
    /**
     * The preferred audio codec to use for the PreflightTest.
     */
    [Constants.CallOptionsKeyPreferredAudioCodecs]?: AudioCodec[];
  }

  /**
   * Events raised by the PreflightTest.
   */
  export enum Event {
    /** {@inheritdoc (PreflightTest:interface).(addListener:1)} */
    Connected = 'connected',

    /** {@inheritdoc (PreflightTest:interface).(addListener:2)} */
    Completed = 'completed',

    /** {@inheritdoc (PreflightTest:interface).(addListener:3)} */
    Failed = 'failed',

    /** {@inheritdoc (PreflightTest:interface).(addListener:4)} */
    Sample = 'sample',

    /** {@inheritdoc (PreflightTest:interface).(addListener:5)} */
    QualityWarning = 'qualityWarning',
  }

  /**
   * Types of the listener methods that are bound to the PreflightTest events.
   */
  export namespace Listener {
    /** {@inheritdoc (PreflightTest:interface).(addListener:1)} */
    export type Connected = () => void;

    /** {@inheritdoc (PreflightTest:interface).(addListener:2)} */
    export type Completed = (report: Report) => void;

    /** {@inheritdoc (PreflightTest:interface).(addListener:3)} */
    export type Failed = (error: TwilioError) => void;

    /** {@inheritdoc (PreflightTest:interface).(addListener:4)} */
    export type Sample = (sample: RTCSample) => void;

    /** {@inheritdoc (PreflightTest:interface).(addListener:5)} */
    export type QualityWarning = (
      currentWarnings: Call.QualityWarning[],
      previousWarnings: Call.QualityWarning[]
    ) => void;

    /** {@inheritdoc (PreflightTest:interface).(addListener:6)} */
    export type Generic = (...args: any[]) => void;
  }

  /**
   * States of the PreflightTest object.
   */
  export enum State {
    /**
     * The state of the PreflightTest after the connected event has been raised.
     *
     * See {@link (PreflightTest:interface).(addListener:1)}.
     */
    Connected = 'connected',

    /**
     * The state of the PreflightTest after the completed event has been raised.
     *
     * See {@link (PreflightTest:interface).(addListener:2)}.
     */
    Completed = 'completed',

    /**
     * The state of the PreflightTest after the PreflightTest has been started
     * but not yet connected.
     */
    Connecting = 'connecting',

    /**
     * The state of the PreflightTest after the failed event has been raised.
     *
     * See {@link (PreflightTest:interface).(addListener:3)}.
     */
    Failed = 'failed',
  }

  /**
   * Represents general stats for a specific metric.
   */
  export interface Stats {
    /**
     * The average value for this metric.
     */
    [Constants.PreflightStatsAverage]: number;

    /**
     * The maximum value for this metric.
     */
    [Constants.PreflightStatsMax]: number;

    /**
     * The minimum value for this metric.
     */
    [Constants.PreflightStatsMin]: number;
  }

  /**
   * Represents RTC related stats that are extracted from RTC samples.
   */
  export interface RTCStats {
    /**
     * Packets delay variation.
     */
    [Constants.PreflightRTCStatsJitter]: Stats;

    /**
     * Mean opinion score, 1.0 through roughly 4.5.
     */
    [Constants.PreflightRTCStatsMos]: Stats;

    /**
     * Round trip time, to the server back to the client.
     */
    [Constants.PreflightRTCStatsRtt]: Stats;
  }

  /**
   * Timing measurements that provide operational milestones.
   */
  export interface TimeMeasurement {
    /**
     * Number of milliseconds elapsed for this measurements.
     */
    [Constants.PreflightTimeMeasurementDuration]: number;

    /**
     * A millisecond timestamp that represents the end of a PreflightTest.
     */
    [Constants.PreflightTimeMeasurementEnd]: number;

    /**
     * A millisecond timestamp that represents the start of a PreflightTest.
     */
    [Constants.PreflightTimeMeasurementStart]: number;
  }

  /**
   * Represents network related time measurements.
   */
  export interface NetworkTiming {
    /**
     * Measurements for establishing ICE connection.
     */
    [Constants.PreflightNetworkTimingIce]: TimeMeasurement;

    /**
     * Measurements for establishing a PeerConnection.
     */
    [Constants.PreflightNetworkTimingPeerConnection]: TimeMeasurement;

    /**
     * Measurements for establishing a signaling connection.
     */
    [Constants.PreflightNetworkTimingSignaling]: TimeMeasurement;
  }

  /**
   * A warning that can be raised by the `PreflightTest` and returned in the
   * `PreflightTest.Report.warnings` field.
   */
  export interface Warning {
    /**
     * Name of the warning.
     */
    [Constants.PreflightWarningName]: string;

    /**
     * Threshold value that, when exceeded, will trigger this warning.
     */
    [Constants.PreflightWarningThreshold]: string;

    /**
     * Detected values that exceeded the threshold value and triggered this
     * warning.
     */
    [Constants.PreflightWarningValues]: string;

    /**
     * Timestamp of the warning.
     */
    [Constants.PreflightWarningTimestamp]: number;
  }

  /**
   * Signifies when a `PreflightTest.Warning` has been cleared. Emitted by the
   * `PreflightTest` when the warning was cleared and also included in the
   * `PreflightTest.Report.warningsCleared` field.
   */
  export interface WarningCleared {
    /**
     * The name of the cleared warning.
     */
    [Constants.PreflightWarningClearedName]: string;

    /**
     * The timestamp when the warning was cleared.
     */
    [Constants.PreflightWarningClearedTimestamp]: number;
  }

  /**
   * Provides information related to the ICE candidate.
   */
  export interface RTCIceCandidateStats {
    /**
     * The type of the ICE candidate.
     */
    [Constants.PreflightRTCIceCandidateStatsCandidateType]: string;

    /**
     * Whether or not the candidate was deleted.
     */
    [Constants.PreflightRTCIceCandidateStatsDeleted]: boolean;

    /**
     * The IP address of the ICE candidate.
     */
    [Constants.PreflightRTCIceCandidateStatsIp]: string;

    /**
     * Whether or not the ICE candidate is remote. True if remote, false if
     * local.
     */
    [Constants.PreflightRTCIceCandidateStatsIsRemote]: boolean;

    /**
     * Represents the network cost of the ICE candidate.
     */
    [Constants.PreflightRTCIceCandidateStatsNetworkCost]: number;

    /**
     * The network ID of the ICE candidate.
     */
    [Constants.PreflightRTCIceCandidateStatsNetworkId]: number;

    /**
     * The network type of the ICE candidate.
     */
    [Constants.PreflightRTCIceCandidateStatsNetworkType]: string;

    /**
     * The port of the ICE candidate.
     */
    [Constants.PreflightRTCIceCandidateStatsPort]: number;

    /**
     * The priority of the ICE candidate.
     */
    [Constants.PreflightRTCIceCandidateStatsPriority]: number;

    /**
     * The protocol that the ICE candidate is using to communicate.
     */
    [Constants.PreflightRTCIceCandidateStatsProtocol]: string;

    /**
     * The related address of the ICE candidate.
     */
    [Constants.PreflightRTCIceCandidateStatsRelatedAddress]: string;

    /**
     * The related port of the ICE candidate.
     */
    [Constants.PreflightRTCIceCandidateStatsRelatedPort]: number;

    /**
     * The TCP type of the ICE candidate.
     */
    [Constants.PreflightRTCIceCandidateStatsTcpType]: string;

    /**
     * The transport ID of the ICE candidate.
     */
    [Constants.PreflightRTCIceCandidateStatsTransportId]: string;

    /**
     * The URL of the ICE candidate.
     */
    [Constants.PreflightRTCIceCandidateStatsUrl]: string;
  }

  /**
   * The `PreflightTest.RTCIceCandidateStats` of the selected remote and local
   * ICE candidates.
   */
  export interface RTCSelectedIceCandidatePairStats {
    /**
     * The stats of the local candidate.
     */
    [Constants.PreflightRTCSelectedIceCandidatePairStatsLocalCandidate]: RTCIceCandidateStats;

    /**
     * The stats of the remote candidate.
     */
    [Constants.PreflightRTCSelectedIceCandidatePairStatsRemoteCandidate]: RTCIceCandidateStats;
  }

  /**
   * A sample generated during the progress of a `PreflightTest`.
   */
  export interface RTCSample {
    /**
     * The audio input level at the time when the sample was taken.
     */
    [Constants.PreflightRTCSampleAudioInputLevel]: number;

    /**
     * The audio output level at the time when the sample was taken.
     */
    [Constants.PreflightRTCSampleAudioOutputLevel]: number;

    /**
     * The bytes sent at the time when the sample was taken.
     */
    [Constants.PreflightRTCSampleBytesReceived]: number;

    /**
     * The bytes received at the time when the sample was taken.
     */
    [Constants.PreflightRTCSampleBytesSent]: number;

    /**
     * The codec used by the underlying media connection.
     */
    [Constants.PreflightRTCSampleCodec]: string;

    /**
     * The jitter present in the underlying media connection at the time when
     * the sample was taken.
     */
    [Constants.PreflightRTCSampleJitter]: number;

    /**
     * The evaluated MOS score of the underlying media connection at the time
     * when the sample was taken.
     */
    [Constants.PreflightRTCSampleMos]: number;

    /**
     * The number of packets lost during the `PreflightTest`.
     */
    [Constants.PreflightRTCSamplePacketsLost]: number;

    /**
     * The fraction of total packets lost during the `PreflightTest`.
     */
    [Constants.PreflightRTCSamplePacketsLostFraction]: number;

    /**
     * The number of packets received during the `PreflightTest`.
     */
    [Constants.PreflightRTCSamplePacketsReceived]: number;

    /**
     * The number of packets sent during the `PreflightTest`.
     */
    [Constants.PreflightRTCSamplePacketsSent]: number;

    /**
     * The round-trip time of a network packet at the time when the sample was
     * taken.
     */
    [Constants.PreflightRTCSampleRtt]: number;

    /**
     * The timestamp of when the RTC sample was taken during the
     * `PreflightTest`.
     */
    [Constants.PreflightRTCSampleTimestamp]: number;
  }

  /**
   * The call quality.
   */
  export enum CallQuality {
    /**
     * Indicates `4.2 < average MOS`.
     */
    Excellent = Constants.PreflightCallQualityExcellent,

    /**
     * Indicates `4.1 <= average MOS <= 4.2`.
     */
    Great = Constants.PreflightCallQualityGreat,

    /**
     * Indicates `3.7 <= average MOS < 4.1`.
     */
    Good = Constants.PreflightCallQualityGood,

    /**
     * Indicates `3.1 <= average MOS < 3.7`.
     */
    Fair = Constants.PreflightCallQualityFair,

    /**
     * Indicates `average MOS < 3.1`.
     */
    Degraded = Constants.PreflightCallQualityDegraded,
  }

  /**
   * The final report generated by the `PreflightTest` upon completion. Contains
   * info related to the call quality and RTC statistics generated during the
   * `PreflightTest`.
   */
  export interface Report {
    /**
     * The `CallSid` of the underlying Twilio call used by the `PreflightTest`.
     */
    [Constants.PreflightReportCallSid]: string;

    /**
     * The rated average MOS score of the `PreflightTest`. This value can help
     * indicate the expected quality of future calls.
     */
    [Constants.PreflightReportCallQuality]: CallQuality | null;

    /**
     * The Twilio Edge used by the `Call` in the `PreflightTest`.
     */
    [Constants.PreflightReportEdge]: string;

    /**
     * An array of ICE candidates gathered when connecting to media.
     */
    [Constants.PreflightReportIceCandidateStats]: RTCIceCandidateStats[];

    /**
     * Whether TURN is required to connect to media.
     *
     * This is dependent on the selected ICE candidates, and will be `true` if
     * either is of type "relay", `false` if both are of another type, or
     * `null` if there are no selected ICE candidates.
     *
     * See `PreflightTest.Options.iceServers` for more details.
     */
    [Constants.PreflightReportIsTurnRequired]: boolean | null;

    /**
     * The RTC related stats captured during the `PreflightTest`.
     */
    [Constants.PreflightReportStats]: RTCStats;

    /**
     * Network related time measurements.
     */
    [Constants.PreflightReportNetworkTiming]: NetworkTiming;

    /**
     * Time measurements of the `PreflightTest` in its entirety.
     */
    [Constants.PreflightReportTestTiming]: TimeMeasurement;

    /**
     * RTC samples collected during the `PreflightTest`.
     */
    [Constants.PreflightReportSamples]: RTCSample[];

    /**
     * The Twilio Edge value passed when constructing the `PreflightTest`.
     */
    [Constants.PreflightReportSelectedEdge]: string;

    /**
     * RTC stats for the ICE candidate pair used to connect to media, if ICE
     * candidates were selected.
     */
    [Constants.PreflightReportSelectedIceCandidatePairStats]: RTCSelectedIceCandidatePairStats;

    /**
     * Array of warnings detected during the `PreflightTest`.
     */
    [Constants.PreflightReportWarnings]: Warning[];

    /**
     * Array of warnings cleared during the `PreflightTest.`
     */
    [Constants.PreflightReportWarningsCleared]: WarningCleared[];
  }
}

/**
 * Map of call quality values from the native layer to the expected JS values.
 */
const callQualityMap = {
  ios: new Map<number, PreflightTest.CallQuality>([
    [0, PreflightTest.CallQuality.Excellent],
    [1, PreflightTest.CallQuality.Great],
    [2, PreflightTest.CallQuality.Good],
    [3, PreflightTest.CallQuality.Fair],
    [4, PreflightTest.CallQuality.Degraded],
  ]),
  android: new Map<string, PreflightTest.CallQuality>([
    ['Excellent', PreflightTest.CallQuality.Excellent],
    ['Great', PreflightTest.CallQuality.Great],
    ['Good', PreflightTest.CallQuality.Good],
    ['Fair', PreflightTest.CallQuality.Fair],
    ['Degraded', PreflightTest.CallQuality.Degraded],
  ]),
};

/**
 * Map of isTurnRequired values from the native layer to the expected JS values.
 */
const isTurnRequiredMap = {
  ios: new Map<string, boolean>([
    ['true', true],
    ['false', false],
  ]),
};

/**
 * Map of state values from the native layers/common constants to the expected
 * JS values.
 */
const preflightTestStateMap = new Map<string, PreflightTest.State>([
  [Constants.PreflightTestStateCompleted, PreflightTest.State.Completed],
  [Constants.PreflightTestStateConnected, PreflightTest.State.Connected],
  [Constants.PreflightTestStateConnecting, PreflightTest.State.Connecting],
  [Constants.PreflightTestStateFailed, PreflightTest.State.Failed],
]);
