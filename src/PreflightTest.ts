/**
 * Copyright © 2025 Twilio, Inc. All rights reserved. Licensed under the Twilio
 * license.
 *
 * See LICENSE in the project root for license information.
 */

import { EventEmitter } from 'eventemitter3';
import type { Call } from './Call';
import { NativeEventEmitter, NativeModule } from './common';
import { Constants } from './constants';
import { InvalidStateError, TwilioError } from './error';
import { constructTwilioError } from './error/utility';
import type {
  NativePreflightTestEvent,
  NativePreflightTestEventCompleted,
  NativePreflightTestEventFailed,
  NativePreflightTestEventQualityWarning,
  NativePreflightTestEventSample,
} from './type/PreflightTest';

export interface PreflightTest {
  /**
   * ------------
   * Emit Typings
   * ------------
   */

  /** @internal */
  emit(connectedEvent: PreflightTest.Event.Connected): boolean;

  /** @internal */
  emit(completedEvent: PreflightTest.Event.Completed, report: string): boolean;

  /** @internal */
  emit(failedEvent: PreflightTest.Event.Failed, error: TwilioError): boolean;

  /** @internal */
  emit(sampleEvent: PreflightTest.Event.Sample, sample: string): boolean;

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
   * preflightTest.addListener(PreflightTest.Event.Completed, (report: string) => {
   *   // preflightTest has been completed
   *   // consider parsing the report and adjusting your UI to show any potential issues
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
   *   // consider parsing the error and adjusting your UI to show the error
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
   * preflightTest.addListener(PreflightTest.Event.Sample, (sample: string) => {
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
   *     // preflightTest has generated a sample
   *     // consider updating your UI with information from the sample
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
 * performs a test call to Twilio and provides a JSON-serialized report at the
 * end. The report includes information about the end user's network
 * connection (including jitter, packet loss, and round trip time) and
 * connection settings.
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
 * preflightTest.on(PreflightTest.Event.Completed, (report: string) => {
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
 * preflightTest.on(PreflightTest.Event.Sample, (sample: string) => {
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

    NativeEventEmitter.addListener(
      Constants.ScopePreflightTest,
      this._handleNativeEvent
    );
  }

  /**
   * Handle all PreflightTest native events.
   */
  private _handleNativeEvent = (
    nativePreflightTestEvent: NativePreflightTestEvent
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
    nativeEvent: NativePreflightTestEventCompleted
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

    this.emit(PreflightTest.Event.Completed, report);
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
    nativeEvent: NativePreflightTestEventFailed
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
    nativeEvent: NativePreflightTestEventQualityWarning
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
    nativeEvent: NativePreflightTestEventSample
  ) => {
    const sample = nativeEvent[Constants.PreflightTestSampleEventKeySample];
    if (typeof sample !== 'string') {
      throw constructInvalidValueError(
        PreflightTest.Event.Sample,
        'sample',
        'string',
        typeof sample
      );
    }

    this.emit(PreflightTest.Event.Sample, sample);
  };

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
    return NativeModule.preflightTest_getCallSid(this._uuid);
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
    return NativeModule.preflightTest_getEndTime(this._uuid);
  }

  /**
   * Get the latest stats sample generated by the PreflightTest.
   *
   * @returns
   * A Promise that
   * - Resolves with a JSON-serialized `string` representing the last sample
   *   generated by the PreflightTest.
   * - Resolves with `undefined` if there is previously generated sample.
   * - Rejects if the native layer encountered an error.
   */
  public async getLatestSample(): Promise<string> {
    return NativeModule.preflightTest_getLatestSample(this._uuid);
  }

  /**
   * Get the final report generated by the PreflightTest.
   *
   * @returns
   * A Promise that
   * - Resolves with a JSON-serialized `string` representing the final report
   *   of the PreflightTest.
   * - Resolves with `undefined` if the report is unavailable.
   * - Rejects if the native layer encountered an error.
   */
  public async getReport(): Promise<string> {
    return NativeModule.preflightTest_getReport(this._uuid);
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
    return NativeModule.preflightTest_getStartTime(this._uuid);
  }

  /**
   * Get the state of the PreflightTest.
   *
   * @returns
   * A Promise that
   * - Resolves with the current state of the PreflightTest.
   * - Rejects if the native layer encountered an error.
   */
  public async getState(): Promise<string> {
    return NativeModule.preflightTest_getState(this._uuid);
  }
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
    `Invalid "preflightTest#${eventName}" value type for "${valueName}".` +
      `Expected "${expectedType}"; actual "${actualType}".`
  );
}

/**
 * Helper types for the PrefligthTest class.
 */
export namespace PreflightTest {
  /**
   * Events raised by the PreflightTest.
   */
  export enum Event {
    /** {@inerhitdoc (PreflightTest:interface).(addListener:1)} */
    Connected = 'connected',

    /** {@inerhitdoc (PreflightTest:interface).(addListener:2)} */
    Completed = 'completed',

    /** {@inerhitdoc (PreflightTest:interface).(addListener:3)} */
    Failed = 'failed',

    /** {@inerhitdoc (PreflightTest:interface).(addListener:4)} */
    Sample = 'sample',

    /** {@inerhitdoc (PreflightTest:interface).(addListener:5)} */
    QualityWarning = 'qualityWarning',
  }

  /**
   * Types of the listener methods that are bound to the PreflightTest events.
   */
  export namespace Listener {
    /** {@inerhitdoc (PreflightTest:interface).(addListener:1)} */
    export type Connected = () => void;

    /** {@inerhitdoc (PreflightTest:interface).(addListener:2)} */
    export type Completed = () => void;

    /** {@inerhitdoc (PreflightTest:interface).(addListener:3)} */
    export type Failed = () => void;

    /** {@inerhitdoc (PreflightTest:interface).(addListener:4)} */
    export type Sample = () => void;

    /** {@inerhitdoc (PreflightTest:interface).(addListener:5)} */
    export type QualityWarning = () => void;

    /** {@inerhitdoc (PreflightTest:interface).(addListener:6)} */
    export type Generic = () => void;
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
     * but not the PreflightTest has not yet connected.
     */
    Connecting = 'connecting',

    /**
     * The state of the PreflightTest after the failed event has been raised.
     *
     * See {@link (PreflightTest:interface).(addListener:3)}.
     */
    Failed = 'failed',
  }
}
