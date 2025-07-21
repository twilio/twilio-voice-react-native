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
import { NativePreflightTestEvent, NativePreflightTestEventQualityWarning, NativePreflightTestEventFailed, NativePreflightTestEventSample, NativePreflightTestEventConnected, checkEventType } from './type/PreflightTest';

export interface PreflightTest {
  emit(connectedEvent: PreflightTest.Event.Connected): boolean;

  emit(completedEvent: PreflightTest.Event.Completed, report: string): boolean;

  emit(failedEvent: PreflightTest.Event.Failed, error: TwilioError): boolean;

  emit(sampleEvent: PreflightTest.Event.Sample, sample: string): boolean;

  emit(
    qualityWarningEvent: PreflightTest.Event.QualityWarning,
    currentWarnings: Call.QualityWarning[],
    previousWarnings: Call.QualityWarning[]
  ): boolean;

  addListener(
    connectedEvent: PreflightTest.Event.Connected,
    listener: PreflightTest.Listener.Connected
  ): this;
  /** {@inheritDoc (PreflightTest:interface).(addListener:1)} */
  on(
    connectedEvent: PreflightTest.Event.Connected,
    listener: PreflightTest.Listener.Connected
  ): this;

  addListener(
    completedEvent: PreflightTest.Event.Completed,
    listener: PreflightTest.Listener.Completed
  ): this;
  on(
    completedEvent: PreflightTest.Event.Completed,
    listener: PreflightTest.Listener.Completed
  ): this;

  addListener(
    failedEvent: PreflightTest.Event.Failed,
    listener: PreflightTest.Listener.Failed
  ): this;
  on(
    failedEvent: PreflightTest.Event.Failed,
    listener: PreflightTest.Listener.Failed
  ): this;

  addListener(
    sampleEvent: PreflightTest.Event.Sample,
    listener: PreflightTest.Listener.Sample
  ): this;
  on(
    sampleEvent: PreflightTest.Event.Sample,
    listener: PreflightTest.Listener.Sample
  ): this;

  addListener(
    warningEvent: PreflightTest.Event.QualityWarning,
    listener: PreflightTest.Listener.QualityWarning
  ): this;
  on(
    warningEvent: PreflightTest.Event.QualityWarning,
    listener: PreflightTest.Listener.QualityWarning
  ): this;

  addListener(
    event: PreflightTest.Event,
    listener: PreflightTest.Listener.Generic
  ): this;
  on(
    event: PreflightTest.Event,
    listener: PreflightTest.Listener.Generic
  ): this;
}

export class PreflightTest extends EventEmitter {
  private _uuid: string;

  private _nativeEventHandler: Record<
    NativePreflightTestEvent[Constants.PreflightTestEventKeyType],
    (ev: NativePreflightTestEvent) => void
  >;

  constructor(uuid: string) {
    super();

    this._uuid = uuid;

    this._nativeEventHandler = {
      [Constants.PreflightTestEventTypeValueConnected]:
        this._handleConnectedEvent,
      [Constants.PreflightTestEventTypeValueCompleted]:
        this._handleCompletedEvent,
      [Constants.PreflightTestEventTypeValueFailed]:
        this._handleFailedEvent,
      [Constants.PreflightTestEventTypeValueQualityWarning]:
        this._handleQualityWarningEvent,
      [Constants.PreflightTestEventTypeValueSample]:
        this._handleSampleEvent,
    };

    NativeEventEmitter.addListener(
      Constants.ScopePreflightTest,
      this._handleNativeEvent
    );
  }

  private _handleNativeEvent = (
    nativePreflightTestEvent: NativePreflightTestEvent,
  ): void => {
    // TODO
  };

  private _handleConnectedEvent = (nativeEvent: NativePreflightTestEvent) => {
    // TODO
  };

  private _handleCompletedEvent = (nativeEvent: NativePreflightTestEvent) => {
    // TODO
  };

  private _handleFailedEvent = (nativeEvent: NativePreflightTestEvent) => {
    // TODO
  }

  private _handleQualityWarningEvent = (nativeEvent: NativePreflightTestEvent) => {
    // TODO
  }

  private _handleSampleEvent = (nativeEvent: NativePreflightTestEvent) => {
    // TODO
  }

  public async getCallSid(): Promise<string> {
    // TODO
    return NativeModule.preflightTest_getCallSid(this._uuid);
  }

  public async getEndTime(): Promise<number> {
    // TODO
    return NativeModule.preflightTest_getEndTime(this._uuid);
  }

  public async getLatestSample(): Promise<string> {
    // TODO
    return NativeModule.preflightTest_getLatestSample(this._uuid);
  }

  public async getReport(): Promise<string> {
    // TODO
    return NativeModule.preflightTest_getReport(this._uuid);
  }

  public async getStartTime(): Promise<number> {
    // TODO
    return NativeModule.preflightTest_getStartTime(this._uuid);
  }

  public async getState(): Promise<string> {
    // TODO
    return NativeModule.preflightTest_getState(this._uuid);
  }
}

/**
 * TODO docstring
 */
export namespace PreflightTest {
  /**
   * TODO docstrings
   */
  export enum Event {
    Connected = 'connected',
    Completed = 'completed',
    Failed = 'failed',
    Sample = 'sample',
    QualityWarning = 'qualityWarning',
  }

  /**
   * TODO docstrings
   */
  export namespace Listener {
    export type Connected = () => void;
    export type Completed = () => void;
    export type Failed = () => void;
    export type Sample = () => void;
    export type QualityWarning = () => void;
    export type Generic = () => void;
  }

  /**
   * TODO docstrings
   */
  export enum State {
    Completed = 'completed',
    Connected = 'connected',
    Connecting = 'connecting',
    Failed = 'failed',
  }
}
