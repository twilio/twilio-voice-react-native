import { EventEmitter } from 'eventemitter3';
import { NativeEventEmitter } from 'react-native';
import { TwilioVoiceReactNative } from './const';
import type { NativeCallEvent, NativeCallEventType, Uuid } from './type';

/**
 * Declare strict typings for event-emissions and event-listeners.
 */
export declare interface Call {
  /**
   * Emit typings.
   */
  emit(callEvent: Call.Event.Connected): boolean;
  emit(callEvent: Call.Event.ConnectFailure): boolean;
  emit(callEvent: Call.Event.Reconnecting): boolean;
  emit(callEvent: Call.Event.Reconnected): boolean;
  emit(callEvent: Call.Event.Disconnected): boolean;
  emit(callEvent: Call.Event.Ringing): boolean;

  /**
   * Listener typings.
   */
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
  private _nativeEventHandler: Record<
    NativeCallEventType,
    (callEvent: NativeCallEvent) => void
  >;
  private _nativeEventEmitter: NativeEventEmitter;
  private _nativeModule: typeof TwilioVoiceReactNative;
  private _nativeScope: string;
  private _uuid: Uuid;

  constructor(uuid: Uuid, options: Partial<Call.Options> = {}) {
    super();

    this._nativeModule = options.nativeModule || TwilioVoiceReactNative;

    this._nativeEventEmitter =
      options.nativeEventEmitter || new NativeEventEmitter(this._nativeModule);

    this._uuid = uuid;

    this._nativeScope = Call.name;

    this._nativeEventHandler = {
      connected: this._handleConnectedEvent,
      connectFailure: this._handleConnectFailure,
      reconnecting: this._handleReconnecting,
      reconnected: this._handleReconnected,
      disconnected: this._handleDisconnected,
      ringing: this._handleRinging,
    };

    this._nativeEventEmitter.addListener(
      this._nativeScope,
      this._handleNativeEvent
    );
  }

  private _handleNativeEvent = (nativeCallEvent: NativeCallEvent) => {
    const { type, uuid } = nativeCallEvent;

    const handler = this._nativeEventHandler[type];
    if (typeof handler === 'undefined') {
      throw new Error(
        `Unknown call event type received from the native layer: "${type}".`
      );
    }

    if (uuid === this._uuid) {
      handler(nativeCallEvent);
    }
  };

  private _handleConnectedEvent = () => {
    this.emit(Call.Event.Connected);
  };

  private _handleConnectFailure = () => {
    this.emit(Call.Event.ConnectFailure);
  };

  private _handleDisconnected = () => {
    this.emit(Call.Event.Disconnected);
  };

  private _handleReconnecting = () => {
    this.emit(Call.Event.Reconnecting);
  };

  private _handleReconnected = () => {
    this.emit(Call.Event.Reconnected);
  };

  private _handleRinging = () => {
    this.emit(Call.Event.Ringing);
  };

  /**
   * Binding specific functions.
   */
  getUuid() {
    return this._uuid;
  }

  getNativeScope() {
    return this._nativeScope;
  }

  /**
   * Native functionality.
   */
  disconnect() {
    return this._nativeModule.call_disconnect(this._uuid);
  }

  getFrom() {
    return this._nativeModule.call_getFrom(this._uuid);
  }

  getTo() {
    return this._nativeModule.call_getTo(this._uuid);
  }

  getState() {
    return this._nativeModule.call_getState(this._uuid);
  }

  getSid() {
    return this._nativeModule.call_getSid(this._uuid);
  }

  hold() {
    this._nativeModule.call_hold(this._uuid);
  }

  mute() {
    this._nativeModule.call_mute(this._uuid);
  }

  sendDigits(digits: string) {
    this._nativeModule.call_sendDigits(this._uuid, digits);
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

  export interface Options {
    nativeEventEmitter: NativeEventEmitter;
    nativeModule: typeof TwilioVoiceReactNative;
  }
}
