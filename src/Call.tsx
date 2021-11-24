import { EventEmitter } from 'eventemitter3';
import { NativeEventEmitter } from 'react-native';
import { TwilioVoiceReactNative } from './const';
import {
  CustomParameters,
  NativeCallEvent,
  NativeCallEventType,
  NativeCallInfo,
  NativeEventScope,
  Uuid,
} from './type';
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
}

export class Call extends EventEmitter {
  private _eventTypeStateMap: Record<NativeCallEventType, Call.State> = {
    [NativeCallEventType.Connected]: Call.State.Connected,
    [NativeCallEventType.ConnectFailure]: Call.State.Disconnected,
    [NativeCallEventType.Reconnecting]: Call.State.Reconnecting,
    [NativeCallEventType.Reconnected]: Call.State.Connected,
    [NativeCallEventType.Disconnected]: Call.State.Disconnected,
    [NativeCallEventType.Ringing]: Call.State.Ringing,
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
      connected: this._handleConnectedEvent,
      connectFailure: this._handleConnectFailure,
      reconnecting: this._handleReconnecting,
      reconnected: this._handleReconnected,
      disconnected: this._handleDisconnected,
      ringing: this._handleRinging,
    };

    this._nativeEventEmitter.addListener(
      NativeEventScope.Call,
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
    this._state = this._eventTypeStateMap[type];
    this._from = from;
    this._sid = sid;
    this._to = to;
  }

  private _handleConnectedEvent = (nativeCallEvent: NativeCallEvent) => {
    if (nativeCallEvent.type !== NativeCallEventType.Connected) {
      throw new Error(
        `Incorrect "call#connected" handler called for type "${nativeCallEvent.type}".`
      );
    }

    this._update(nativeCallEvent);

    this.emit(Call.Event.Connected);
  };

  private _handleConnectFailure = (nativeCallEvent: NativeCallEvent) => {
    if (nativeCallEvent.type !== NativeCallEventType.ConnectFailure) {
      throw new Error(
        `Incorrect "call#connectFailure" handler called for type "${nativeCallEvent.type}".`
      );
    }

    this._update(nativeCallEvent);

    const error = new TwilioError(
      nativeCallEvent.error.message,
      nativeCallEvent.error.code);
    this.emit(Call.Event.ConnectFailure, error);
  };

  private _handleDisconnected = (nativeCallEvent: NativeCallEvent) => {
    if (nativeCallEvent.type !== NativeCallEventType.Disconnected) {
      throw new Error(
        `Incorrect "call#disconnected" handler called for type "${nativeCallEvent.type}".`
      );
    }

    this._update(nativeCallEvent);

    if (nativeCallEvent.error) {
      const error = new TwilioError(
        nativeCallEvent.error.message, 
        nativeCallEvent.error.code);
      this.emit(Call.Event.Disconnected, error);
    } else {
      this.emit(Call.Event.Disconnected);
    }
  };

  private _handleReconnecting = (nativeCallEvent: NativeCallEvent) => {
    if (nativeCallEvent.type !== NativeCallEventType.Reconnecting) {
      throw new Error(
        `Incorrect "call#reconnecting" handler called for type "${nativeCallEvent.type}".`
      );
    }

    this._update(nativeCallEvent);

    const error = new TwilioError(
      nativeCallEvent.error.message, 
      nativeCallEvent.error.code);
    this.emit(Call.Event.Reconnecting, error);
  };

  private _handleReconnected = (nativeCallEvent: NativeCallEvent) => {
    if (nativeCallEvent.type !== NativeCallEventType.Reconnected) {
      throw new Error(
        `Incorrect "call#reconnected" handler called for type "${nativeCallEvent.type}".`
      );
    }

    this._update(nativeCallEvent);

    this.emit(Call.Event.Reconnected);
  };

  private _handleRinging = (nativeCallEvent: NativeCallEvent) => {
    if (nativeCallEvent.type !== NativeCallEventType.Ringing) {
      throw new Error(
        `Incorrect "call#ringing" handler called for type "${nativeCallEvent.type}".`
      );
    }

    this._update(nativeCallEvent);

    this.emit(Call.Event.Ringing);
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
}

export namespace Call {
  export enum Event {
    'Connected' = 'connected',
    'ConnectFailure' = 'connectFailure',
    'Reconnecting' = 'reconnecting',
    'Reconnected' = 'reconnected',
    'Disconnected' = 'disconnected',
    'Ringing' = 'ringing',
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
}
