import { EventEmitter } from 'eventemitter3';
import { NativeEventEmitter } from 'react-native';
import { Call } from './Call';
import { CancelledCallInvite } from './CancelledCallInvite';
import { CallInvite } from './CallInvite';
import { TwilioVoiceReactNative } from './const';
import {
  CallException,
  NativeVoiceEvent,
  NativeEventScope,
  NativeVoiceEventType,
} from './type';

/**
 * Declare strict typings for event-emissions and event-listeners.
 */
export declare interface Voice {
  /**
   * Emit typings.
   */
  emit(voiceEvent: Voice.Event.CallInvite, callInvite: CallInvite): boolean;
  emit(
    voiceEvent: Voice.Event.CancelledCallInvite,
    cancelledCallInvite: CancelledCallInvite,
    exception?: CallException
  ): boolean;
  emit(voiceEvent: Voice.Event.Registered): boolean;
  emit(voiceEvent: Voice.Event.Unregistered): boolean;

  /**
   * Listener typings.
   */
  addEventListener(
    voiceEvent: Voice.Event,
    listener: (...args: any[]) => void
  ): this;
  on(voiceEvent: Voice.Event, listener: (...args: any[]) => void): this;

  addEventListener(
    voiceEvent: Voice.Event.CallInvite,
    listener: (callInvite: CallInvite) => void
  ): this;
  on(
    voiceEvent: Voice.Event.CallInvite,
    listener: (callInvite: CallInvite) => void
  ): this;

  addEventListener(
    voiceEvent: Voice.Event.CancelledCallInvite,
    listener: (
      cancelledCallInvite: CancelledCallInvite,
      exception?: CallException
    ) => void
  ): this;
  on(
    voiceEvent: Voice.Event.CancelledCallInvite,
    listener: (
      cancelledCallInvite: CancelledCallInvite,
      exception?: CallException
    ) => void
  ): this;

  addEventListener(
    voiceEvent: Voice.Event.Registered,
    listener: () => void
  ): this;
  on(voiceEvent: Voice.Event.Registered, listener: () => void): this;

  addEventListener(
    voiceEvent: Voice.Event.Unregistered,
    listener: () => void
  ): this;
  on(voiceEvent: Voice.Event.Unregistered, listener: () => void): this;
}

export class Voice extends EventEmitter {
  private _nativeEventEmitter: NativeEventEmitter;
  private _nativeModule: typeof TwilioVoiceReactNative;
  private _nativeEventHandler: Record<
    NativeVoiceEventType,
    (messageEvent: NativeVoiceEvent) => void
  >;

  constructor(options: Partial<Voice.Options> = {}) {
    super();

    this._nativeModule = options.nativeModule || TwilioVoiceReactNative;

    this._nativeEventEmitter =
      options.nativeEventEmitter || new NativeEventEmitter(this._nativeModule);

    this._nativeEventHandler = {
      callInvite: this._handleCallInvite,
      cancelledCallInvite: this._handleCancelledCallInvite,
      error: this._handleError,
      registered: this._handleRegistered,
      unregistered: this._handleUnregistered,
    };

    this._nativeEventEmitter.addListener(
      NativeEventScope.Voice,
      this._handleNativeEvent
    );
  }

  private _handleNativeEvent = (nativeMessageEvent: NativeVoiceEvent) => {
    const { type } = nativeMessageEvent;

    const handler = this._nativeEventHandler[type];
    if (typeof handler === 'undefined') {
      throw new Error(
        `Unknown voice event type received from the native layer: "${type}".`
      );
    }

    handler(nativeMessageEvent);
  };

  private _handleCallInvite = ({ uuid }: NativeVoiceEvent) => {
    const callInvite = new CallInvite(uuid);
    this.emit(Voice.Event.CallInvite, callInvite);
  };

  private _handleCancelledCallInvite = ({
    exception,
    uuid,
  }: NativeVoiceEvent) => {
    const cancelledCallInvite = new CancelledCallInvite(uuid);
    this.emit(Voice.Event.CancelledCallInvite, cancelledCallInvite, exception);
  };

  private _handleError = (error: any) => {
    console.log(error);
  };

  private _handleRegistered = () => {
    this.emit(Voice.Event.Registered);
  };

  private _handleUnregistered = () => {
    this.emit(Voice.Event.Unregistered);
  };

  async connect(
    token: string,
    params: Record<string, string> = {}
  ): Promise<Call> {
    const callUuid = await this._nativeModule.util_generateId();
    const call = new Call(callUuid, {
      nativeEventEmitter: this._nativeEventEmitter,
      nativeModule: this._nativeModule,
    });
    this._nativeModule.voice_connect(callUuid, token, params);
    return call;
  }

  getVersion(): Promise<string> {
    return this._nativeModule.voice_getVersion();
  }

  register(token: string): Promise<void> {
    return this._nativeModule.voice_register(token);
  }

  unregister(token: string): Promise<void> {
    return this._nativeModule.voice_unregister(token);
  }
}

export namespace Voice {
  export enum Event {
    'CallInvite' = 'callInvite',
    'CancelledCallInvite' = 'cancelledCallInvite',
    'Error' = 'error',
    'Registered' = 'registered',
    'Unregistered' = 'unregistered',
  }

  export interface Options {
    nativeEventEmitter: NativeEventEmitter;
    nativeModule: typeof TwilioVoiceReactNative;
  }
}
