import { NativeEventEmitter, EventEmitter } from 'react-native';
import { Call } from './Call';
import { CanceledCallInvite } from './CanceledCallInvite';
import { CallInvite } from './CallInvite';
import { TwilioVoiceReactNative } from './const';
import type {
  CallException,
  NativeMessageEvent,
  RegistrationChannel,
} from './type';

export declare namespace Voice {
  export enum Event {
    'CallInvite' = 'callInvite',
    'CanceledCallInvite' = 'canceledCallInvite',
    'Registered' = 'registered',
    'Unregistered' = 'unregistered',
  }

  export interface Options {
    nativeEventEmitter: NativeEventEmitter;
    nativeModule: typeof TwilioVoiceReactNative;
  }
}

/**
 * Declare strict typings for event-emissions and event-listeners.
 */
export declare interface Voice {
  /**
   * Emit typings.
   */
  emit(voiceEvent: Voice.Event.CallInvite, callInvite: CallInvite): boolean;
  emit(
    voiceEvent: Voice.Event.CanceledCallInvite,
    canceledCallInvite: CanceledCallInvite,
    exception?: CallException
  ): boolean;
  emit(voiceEvent: Voice.Event.Registered): boolean;
  emit(voiceEvent: Voice.Event.Unregistered): boolean;

  /**
   * Listener typings.
   */
  addEventListener(
    voiceEvent: Voice.Event.CallInvite,
    listener: (callInvite: CallInvite) => void
  ): this;
  on(
    voiceEvent: Voice.Event.CallInvite,
    listener: (callInvite: CallInvite) => void
  ): this;

  addEventListener(
    voiceEvent: Voice.Event.CanceledCallInvite,
    listener: (
      canceledCallInvite: CanceledCallInvite,
      exception?: CallException
    ) => void
  ): this;
  on(
    voiceEvent: Voice.Event.CanceledCallInvite,
    listener: (
      canceledCallInvite: CanceledCallInvite,
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
    Voice.Event,
    (messageEvent: NativeMessageEvent) => void
  >;
  private _token: string;

  constructor(token: string, options: Partial<Voice.Options> = {}) {
    super();

    this._token = token;

    console.log(options);
    console.log(TwilioVoiceReactNative);
    console.log(new NativeEventEmitter(TwilioVoiceReactNative));
    console.log(new NativeEventEmitter(TwilioVoiceReactNative).addListener);

    this._nativeModule = options.nativeModule || TwilioVoiceReactNative;

    this._nativeEventEmitter =
      options.nativeEventEmitter || new NativeEventEmitter(this._nativeModule);

    this._nativeEventHandler = {
      callInvite: this._handleCallInvite,
      canceledCallInvite: this._handleCanceledCallInvite,
      registered: this._handleRegistered,
      unregistered: this._handleUnregistered,
    };

    this._nativeEventEmitter.addListener(Voice.name, this._handleNativeEvent);
  }

  private _handleNativeEvent = (nativeMessageEvent: NativeMessageEvent) => {
    const { type } = nativeMessageEvent;
    const handler = this._nativeEventHandler[type];
    if (typeof handler === 'undefined') {
      throw new Error(
        `Unknown voice event type received from the native layer: "${type}".`
      );
    }
    handler(nativeMessageEvent);
  };

  private _handleCallInvite = ({ uuid }: NativeMessageEvent) => {
    const callInvite = new CallInvite(uuid);
    this.emit(Voice.Event.CallInvite, callInvite);
  };

  private _handleCanceledCallInvite = ({
    exception,
    uuid,
  }: NativeMessageEvent) => {
    const canceledCallInvite = new CanceledCallInvite(uuid);
    this.emit(Voice.Event.CanceledCallInvite, canceledCallInvite, exception);
  };

  private _handleRegistered = () => {
    this.emit(Voice.Event.Registered);
  };

  private _handleUnregistered = () => {
    this.emit(Voice.Event.Unregistered);
  };

  async connect(params: Record<string, string> = {}): Promise<Call> {
    const callUuid = await this._nativeModule.util_generateId();
    const call = new Call(callUuid, {
      nativeEventEmitter: this._nativeEventEmitter,
      nativeModule: this._nativeModule,
    });
    await this._nativeModule.voice_connect(
      call.getNativeScope(),
      this._token,
      params
    );
    return call;
  }

  getVersion(): Promise<string> {
    return this._nativeModule.voice_getVersion();
  }

  register(
    accessToken: string,
    registrationChannel: RegistrationChannel,
    registrationToken: string
  ) {
    return this._nativeModule.voice_register(
      accessToken,
      registrationChannel,
      registrationToken
    );
  }

  unregister(
    accessToken: string,
    registrationChannel: RegistrationChannel,
    registrationToken: string
  ) {
    return this._nativeModule.voice_unregister(
      accessToken,
      registrationChannel,
      registrationToken
    );
  }
}

export default Voice;
