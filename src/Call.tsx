import { EventEmitter } from 'eventemitter3';
import { NativeEventEmitter } from 'react-native';
import { TwilioVoiceReactNative } from './common';
import { Constants } from './constants';
import type {
  NativeCallQualityWarnings,
  NativeCallEvent,
  NativeCallEventType,
  NativeCallInfo,
} from './type/Call';
import type { CustomParameters, Uuid } from './type/common';
import type { StatsReport as StatsReportType } from './type/StatsReport';
import { TwilioError } from './error/TwilioError';

/**
 * Declare strict typings for event-emissions and event-listeners.
 */
export declare interface Call {
  /**
   * Emit typings.
   */
  emit(callEvent: Call.Event.Connected): boolean;
  emit(callEvent: Call.Event.ConnectFailure, error: TwilioError): boolean;
  emit(callEvent: Call.Event.Reconnecting, error: TwilioError): boolean;
  emit(callEvent: Call.Event.Reconnected): boolean;
  emit(callEvent: Call.Event.Disconnected, error?: TwilioError): boolean;
  emit(callEvent: Call.Event.Ringing): boolean;
  emit(
    callEvent: Call.Event.QualityWarningsChanged,
    currentQualityWarnings: Call.QualityWarning[],
    previousQualityWarnings: Call.QualityWarning[]
  ): boolean;

  /**
   * Listener typings.
   */
  addEventListener(
    callEvent: Call.Event,
    listener: (...args: any[]) => void
  ): this;
  on(callEvent: Call.Event, listener: (...args: any[]) => void): this;

  addEventListener(callEvent: Call.Event.Connected, listener: () => void): this;
  on(callEvent: Call.Event.Connected, listener: () => void): this;

  addEventListener(
    callEvent: Call.Event.ConnectFailure,
    listener: () => void
  ): this;
  on(callEvent: Call.Event.ConnectFailure, listener: () => void): this;

  addEventListener(
    callEvent: Call.Event.Reconnecting,
    listener: () => void
  ): this;
  on(callEvent: Call.Event.Reconnecting, listener: () => void): this;

  addEventListener(
    callEvent: Call.Event.Reconnected,
    listener: () => void
  ): this;
  on(callEvent: Call.Event.Reconnected, listener: () => void): this;

  addEventListener(
    callEvent: Call.Event.Disconnected,
    listener: () => void
  ): this;
  on(callEvent: Call.Event.Disconnected, listener: () => void): this;

  addEventListener(callEvent: Call.Event.Ringing, listener: () => void): this;
  on(callEvent: Call.Event.Ringing, listener: () => void): this;

  addEventListener(
    callEvent: Call.Event.QualityWarningsChanged,
    listener: (
      currentQualityWarnings: NativeCallQualityWarnings,
      previousQualityWarnings: NativeCallQualityWarnings
    ) => void
  ): this;
  on(
    callEvent: Call.Event.QualityWarningsChanged,
    listener: (
      currentQualityWarnings: NativeCallQualityWarnings,
      previousQualityWarnings: NativeCallQualityWarnings
    ) => void
  ): this;
}

export class Call extends EventEmitter {
  private _eventTypeStateMap: Partial<Record<NativeCallEventType, Call.State>> =
    {
      [Constants.CallEventConnected]: Call.State.Connected,
      [Constants.CallEventConnectFailure]: Call.State.Disconnected,
      [Constants.CallEventDisconnected]: Call.State.Disconnected,
      [Constants.CallEventReconnecting]: Call.State.Reconnecting,
      [Constants.CallEventReconnected]: Call.State.Connected,
      [Constants.CallEventRinging]: Call.State.Ringing,
    };
  private _nativeEventHandler: Record<
    NativeCallEventType,
    (callEvent: NativeCallEvent) => void
  >;
  private _nativeEventEmitter: NativeEventEmitter;
  private _nativeModule: typeof TwilioVoiceReactNative;

  private _uuid: Uuid;
  private _customParameters: CustomParameters;
  private _from?: string;
  private _isMuted?: boolean;
  private _isOnHold?: boolean;
  private _sid?: string;
  private _state: Call.State = Call.State.Connecting;
  private _to?: string;

  constructor(
    {
      uuid,
      customParameters,
      from,
      sid,
      to,
      isMuted,
      isOnHold,
    }: NativeCallInfo,
    options: Partial<Call.Options> = {}
  ) {
    super();

    this._nativeModule = options.nativeModule || TwilioVoiceReactNative;

    this._nativeEventEmitter =
      options.nativeEventEmitter || new NativeEventEmitter(this._nativeModule);

    this._uuid = uuid;
    this._customParameters = { ...customParameters };
    this._from = from;
    this._sid = sid;
    this._to = to;
    this._isMuted = isMuted;
    this._isOnHold = isOnHold;

    this._nativeEventHandler = {
      /**
       * Call State
       */
      [Constants.CallEventConnected]: this._handleConnectedEvent,
      [Constants.CallEventConnectFailure]: this._handleConnectFailure,
      [Constants.CallEventDisconnected]: this._handleDisconnected,
      [Constants.CallEventReconnecting]: this._handleReconnecting,
      [Constants.CallEventReconnected]: this._handleReconnected,
      [Constants.CallEventRinging]: this._handleRinging,

      /**
       * Call Quality
       */
      [Constants.CallEventQualityWarningsChanged]:
        this._handleQualityWarningsChanged,
    };

    this._nativeEventEmitter.addListener(
      Constants.ScopeCall,
      this._handleNativeEvent
    );
  }

  private _handleNativeEvent = (nativeCallEvent: NativeCallEvent) => {
    const { type, call: callInfo } = nativeCallEvent;

    const handler = this._nativeEventHandler[type];
    if (typeof handler === 'undefined') {
      throw new Error(
        `Unknown call event type received from the native layer: "${type}".`
      );
    }

    if (callInfo.uuid === this._uuid) {
      handler(nativeCallEvent);
    }
  };

  private _update({ type, call: { from, sid, to } }: NativeCallEvent) {
    const newState = this._eventTypeStateMap[type];
    if (typeof newState === 'string') {
      this._state = newState;
    }
    this._from = from;
    this._sid = sid;
    this._to = to;
  }

  private _handleConnectedEvent = (nativeCallEvent: NativeCallEvent) => {
    if (nativeCallEvent.type !== Constants.CallEventConnected) {
      throw new Error(
        `Incorrect "call#connected" handler called for type "${nativeCallEvent.type}".`
      );
    }

    this._update(nativeCallEvent);

    this.emit(Call.Event.Connected);
  };

  private _handleConnectFailure = (nativeCallEvent: NativeCallEvent) => {
    if (nativeCallEvent.type !== Constants.CallEventConnectFailure) {
      throw new Error(
        `Incorrect "call#connectFailure" handler called for type "${nativeCallEvent.type}".`
      );
    }

    this._update(nativeCallEvent);

    const error = new TwilioError(
      nativeCallEvent.error.message,
      nativeCallEvent.error.code
    );
    this.emit(Call.Event.ConnectFailure, error);
  };

  private _handleDisconnected = (nativeCallEvent: NativeCallEvent) => {
    if (nativeCallEvent.type !== Constants.CallEventDisconnected) {
      throw new Error(
        `Incorrect "call#disconnected" handler called for type "${nativeCallEvent.type}".`
      );
    }

    this._update(nativeCallEvent);

    if (nativeCallEvent.error) {
      const error = new TwilioError(
        nativeCallEvent.error.message,
        nativeCallEvent.error.code
      );
      this.emit(Call.Event.Disconnected, error);
    } else {
      this.emit(Call.Event.Disconnected);
    }
  };

  private _handleReconnecting = (nativeCallEvent: NativeCallEvent) => {
    if (nativeCallEvent.type !== Constants.CallEventReconnecting) {
      throw new Error(
        `Incorrect "call#reconnecting" handler called for type "${nativeCallEvent.type}".`
      );
    }

    this._update(nativeCallEvent);

    const error = new TwilioError(
      nativeCallEvent.error.message,
      nativeCallEvent.error.code
    );
    this.emit(Call.Event.Reconnecting, error);
  };

  private _handleReconnected = (nativeCallEvent: NativeCallEvent) => {
    if (nativeCallEvent.type !== Constants.CallEventReconnecting) {
      throw new Error(
        `Incorrect "call#reconnected" handler called for type "${nativeCallEvent.type}".`
      );
    }

    this._update(nativeCallEvent);

    this.emit(Call.Event.Reconnected);
  };

  private _handleRinging = (nativeCallEvent: NativeCallEvent) => {
    if (nativeCallEvent.type !== Constants.CallEventRinging) {
      throw new Error(
        `Incorrect "call#ringing" handler called for type "${nativeCallEvent.type}".`
      );
    }

    this._update(nativeCallEvent);

    this.emit(Call.Event.Ringing);
  };

  private _handleQualityWarningsChanged = (
    nativeCallEvent: NativeCallEvent
  ) => {
    if (nativeCallEvent.type !== Constants.CallEventQualityWarningsChanged) {
      throw new Error(
        `Incorrect "call#qualityWarnings" handler called for type "${nativeCallEvent.type}".`
      );
    }

    this._update(nativeCallEvent);

    const { currentWarnings, previousWarnings } = nativeCallEvent;

    this.emit(
      Call.Event.QualityWarningsChanged,
      currentWarnings as Call.QualityWarning[],
      previousWarnings as Call.QualityWarning[]
    );
  };

  /**
   * Native functionality.
   */
  disconnect(): Promise<void> {
    return this._nativeModule.call_disconnect(this._uuid);
  }

  isMuted(): boolean | undefined {
    return this._isMuted;
  }

  isOnHold(): boolean | undefined {
    return this._isOnHold;
  }

  getCustomParameters(): CustomParameters {
    return this._customParameters;
  }

  getFrom(): string | undefined {
    return this._from;
  }

  getSid(): string | undefined {
    return this._sid;
  }

  getState(): Call.State {
    return this._state;
  }

  getTo(): string | undefined {
    return this._to;
  }

  async hold(hold: boolean): Promise<boolean> {
    this._isOnHold = await this._nativeModule.call_hold(this._uuid, hold);
    return this._isOnHold;
  }

  async mute(mute: boolean): Promise<boolean> {
    this._isMuted = await this._nativeModule.call_mute(this._uuid, mute);
    return this._isMuted;
  }

  sendDigits(digits: string): Promise<void> {
    return this._nativeModule.call_sendDigits(this._uuid, digits);
  }

  postFeedback(score: Call.Score, issue: Call.Issue): Promise<void> {
    return this._nativeModule.call_postFeedback(this._uuid, score, issue);
  }
}

export namespace Call {
  export enum Event {
    'Connected' = 'connected',
    'ConnectFailure' = 'connectFailure',
    'Reconnecting' = 'reconnecting',
    'Reconnected' = 'reconnected',
    'Disconnected' = 'disconnected',
    'Ringing' = 'ringing',
    'QualityWarningsChanged' = 'qualityWarningsChanged',
  }

  export enum State {
    'Connected' = 'connected',
    'Connecting' = 'connecting',
    'Disconnected' = 'disconnected',
    'Reconnecting' = 'reconnected',
    'Ringing' = 'ringing',
  }

  export interface Options {
    nativeEventEmitter: NativeEventEmitter;
    nativeModule: typeof TwilioVoiceReactNative;
  }

  export enum QualityWarning {
    ConstantAudioInputLevel = 'constant-audio-input-level',
    HighJitter = 'high-jitter',
    HighPacketLoss = 'high-packet-loss',
    HighRtt = 'high-rtt',
    LowMos = 'low-mos',
  }

  export enum Score {
    NotReported = 0,
    One = 1,
    Two = 2,
    Three = 3,
    Four = 4,
    Five = 5,
  }

  export enum Issue {
    NotReported = 'not-reported',
    DroppedCall = 'dropped-call',
    AudioLatency = 'audio-latency',
    OneWayAudio = 'one-way-audio',
    ChoppyAudio = 'choppy-audio',
    NoisyCall = 'noisy-call',
    Echo = 'echo',
  }

  export type StatsReport = StatsReportType;
}
