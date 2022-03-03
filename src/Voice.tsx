import { EventEmitter } from 'eventemitter3';
import { NativeEventEmitter } from 'react-native';
import { AudioDevice } from './AudioDevice';
import { Call } from './Call';
import { CallInvite } from './CallInvite';
import { CancelledCallInvite } from './CancelledCallInvite';
import { TwilioError } from './error/TwilioError';
import { TwilioVoiceReactNative } from './const';
import {
  NativeAudioDeviceInfo,
  NativeCallInfo,
  NativeCallInviteInfo,
  NativeEventScope,
  NativeVoiceEvent,
  NativeVoiceEventType,
  Uuid,
} from './type';

/**
 * Declare strict typings for event-emissions and event-listeners.
 */
export declare interface Voice {
  /**
   * Emit typings.
   */
  emit(voiceEvent: Voice.Event, listener: (...args: any[]) => void): boolean;
  emit(
    voiceEvent: Voice.Event.AudioDevicesUpdated,
    audioDevices: AudioDevice[],
    selectedDevice: AudioDevice
  ): boolean;
  emit(voiceEvent: Voice.Event.CallInvite, callInvite: CallInvite): boolean;
  emit(
    voiceEvent: Voice.Event.CallInviteAccepted,
    callInvite: CallInvite,
    call: Call
  ): boolean;
  emit(
    voiceEvent: Voice.Event.CallInviteRejected,
    callInvite: CallInvite
  ): boolean;
  emit(
    voiceEvent: Voice.Event.CancelledCallInvite,
    cancelledCallInvite: CancelledCallInvite,
    error?: TwilioError
  ): boolean;
  emit(voiceEvent: Voice.Event.Error, error: TwilioError): boolean;
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
    voiceEvent: Voice.Event.AudioDevicesUpdated,
    listener: (
      audioDevices: AudioDevice[],
      selectedDevice: AudioDevice | null
    ) => void
  ): this;
  on(
    voiceEvent: Voice.Event.AudioDevicesUpdated,
    listener: (
      audioDevices: AudioDevice[],
      selectedDevice: AudioDevice | null
    ) => void
  ): this;

  addEventListener(
    voiceEvent: Voice.Event.CallInvite,
    listener: (callInvite: CallInvite) => void
  ): this;
  on(
    voiceEvent: Voice.Event.CallInvite,
    listener: (callInvite: CallInvite) => void
  ): this;

  addEventListener(
    voiceEvent: Voice.Event.CallInviteAccepted,
    listener: (callInvite: CallInvite, call: Call) => void
  ): this;
  on(
    voiceEvent: Voice.Event.CallInviteAccepted,
    listener: (callInvite: CallInvite, call: Call) => void
  ): this;

  addEventListener(
    voiceEvent: Voice.Event.CallInviteRejected,
    listener: (callInvite: CallInvite) => void
  ): this;
  on(
    voiceEvent: Voice.Event.CallInviteRejected,
    listener: (callInvite: CallInvite) => void
  ): this;

  addEventListener(
    voiceEvent: Voice.Event.CancelledCallInvite,
    listener: (
      cancelledCallInvite: CancelledCallInvite,
      error?: TwilioError
    ) => void
  ): this;
  on(
    voiceEvent: Voice.Event.CancelledCallInvite,
    listener: (
      cancelledCallInvite: CancelledCallInvite,
      error?: TwilioError
    ) => void
  ): this;

  addEventListener(
    voiceEvent: Voice.Event.Error,
    listener: (error: TwilioError) => void
  ): this;
  on(voiceEvent: Voice.Event.Error, listener: () => void): this;

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

/**
 * Voice namespace.
 * Exposes access to the entire feature-set of the Voice SDK.
 */
export class Voice extends EventEmitter {
  private _nativeEventEmitter: NativeEventEmitter;
  private _nativeModule: typeof TwilioVoiceReactNative;
  private _nativeEventHandler: Record<
    NativeVoiceEventType,
    (voiceEvent: NativeVoiceEvent) => void
  >;

  constructor(options: Partial<Voice.Options> = {}) {
    super();

    this._nativeModule = options.nativeModule || TwilioVoiceReactNative;

    this._nativeEventEmitter =
      options.nativeEventEmitter || new NativeEventEmitter(this._nativeModule);

    this._nativeEventHandler = {
      callInvite: this._handleCallInvite,
      callInviteAccepted: this._handleCallInviteAccepted,
      callInviteRejected: this._handleCallInviteRejected,
      cancelledCallInvite: this._handleCancelledCallInvite,
      error: this._handleError,
      registered: this._handleRegistered,
      unregistered: this._handleUnregistered,
      audioDevicesUpdated: this._handleAudioDevicesUpdated,
    };

    this._nativeEventEmitter.addListener(
      NativeEventScope.Voice,
      this._handleNativeEvent
    );
  }

  private _handleNativeEvent = (nativeVoiceEvent: NativeVoiceEvent) => {
    const { type } = nativeVoiceEvent;

    const handler = this._nativeEventHandler[type];
    if (typeof handler === 'undefined') {
      throw new Error(
        `Unknown voice event type received from the native layer: "${type}".`
      );
    }

    handler(nativeVoiceEvent);
  };

  private _handleCallInvite = (nativeVoiceEvent: NativeVoiceEvent) => {
    if (nativeVoiceEvent.type !== NativeVoiceEventType.CallInvite) {
      throw new Error(
        `Incorrect "voice#callInvite" handler called for type "${nativeVoiceEvent.type}".`
      );
    }

    const { callInvite: callInviteInfo } = nativeVoiceEvent;

    const callInvite = new CallInvite(callInviteInfo, {
      nativeEventEmitter: this._nativeEventEmitter,
      nativeModule: this._nativeModule,
    });

    this.emit(Voice.Event.CallInvite, callInvite);
  };

  private _handleCallInviteAccepted = (nativeVoiceEvent: NativeVoiceEvent) => {
    if (nativeVoiceEvent.type !== NativeVoiceEventType.CallInviteAccepted) {
      throw new Error(
        `Incorrect "voice#callInviteAccepted" handler called for type "${nativeVoiceEvent.type}".`
      );
    }

    const { callInvite: callInviteInfo } = nativeVoiceEvent;

    const callInvite = new CallInvite(callInviteInfo);

    const callInfo = {
      uuid: callInviteInfo.uuid,
      customParameters: callInviteInfo.customParameters,
      sid: callInviteInfo.callSid,
      from: callInviteInfo.from,
      to: callInviteInfo.to,
    };

    const call = new Call(callInfo, {
      nativeEventEmitter: this._nativeEventEmitter,
      nativeModule: this._nativeModule,
    });

    this.emit(Voice.Event.CallInviteAccepted, callInvite, call);
  };

  private _handleCallInviteRejected = (nativeVoiceEvent: NativeVoiceEvent) => {
    if (nativeVoiceEvent.type !== NativeVoiceEventType.CallInviteRejected) {
      throw new Error(
        `Incorrect "voice#callInviteRejected" handler called for type "${nativeVoiceEvent.type}".`
      );
    }

    const { callInvite: callInviteInfo } = nativeVoiceEvent;

    const callInvite = new CallInvite(callInviteInfo);

    this.emit(Voice.Event.CallInviteRejected, callInvite);
  };

  private _handleCancelledCallInvite = (nativeVoiceEvent: NativeVoiceEvent) => {
    if (nativeVoiceEvent.type !== NativeVoiceEventType.CancelledCallInvite) {
      throw new Error(
        `Incorrect "voice#cancelledCallInvite" handler called for type "${nativeVoiceEvent.type}".`
      );
    }

    const { cancelledCallInvite: cancelledCallInviteInfo, error: errorInfo } =
      nativeVoiceEvent;

    const error = new TwilioError(errorInfo.message, errorInfo.code);

    const cancelledCallInvite = new CancelledCallInvite(
      cancelledCallInviteInfo
    );

    this.emit(Voice.Event.CancelledCallInvite, cancelledCallInvite, error);
  };

  private _handleError = (nativeVoiceEvent: NativeVoiceEvent) => {
    if (nativeVoiceEvent.type !== NativeVoiceEventType.Error) {
      throw new Error(
        `Incorrect "voice#error" handler called for type "${nativeVoiceEvent.type}".`
      );
    }

    const {
      error: { code, message },
    } = nativeVoiceEvent;

    const error = new TwilioError(message, code);

    this.emit(Voice.Event.Error, error);
  };

  private _handleRegistered = () => {
    this.emit(Voice.Event.Registered);
  };

  private _handleUnregistered = () => {
    this.emit(Voice.Event.Unregistered);
  };

  private _handleAudioDevicesUpdated = (nativeVoiceEvent: NativeVoiceEvent) => {
    if (nativeVoiceEvent.type !== NativeVoiceEventType.AudioDevicesUpdated) {
      throw new Error(
        `Incorrect "voice#audioDevicesUpdated" handler called for type "${nativeVoiceEvent.type}".`
      );
    }

    const {
      audioDevices: audioDeviceInfos,
      selectedDevice: selectedDeviceInfo,
    } = nativeVoiceEvent;

    const audioDevices = audioDeviceInfos.map(
      (audioDeviceInfo: NativeAudioDeviceInfo) =>
        new AudioDevice(audioDeviceInfo)
    );

    const selectedDevice = new AudioDevice(selectedDeviceInfo);

    this.emit(Voice.Event.AudioDevicesUpdated, audioDevices, selectedDevice);
  };

  /**
   * Create an outgoing call.
   * @param token a Twilio Access Token, usually minted by an
   * authentication-gated endpoint using a Twilio helper library.
   * @param params Custom parameters to send to the TwiML Application.
   * @returns a Promise that resolves with a call when the call is created. Note
   * that the resolution of this Promise does not imply any call event
   * occurring, such as answered or rejected.
   */
  async connect(
    token: string,
    params: Record<string, any> = {}
  ): Promise<Call> {
    const callInfo = await this._nativeModule.voice_connect(token, params);

    const call = new Call(callInfo, {
      nativeEventEmitter: this._nativeEventEmitter,
      nativeModule: this._nativeModule,
    });

    return call;
  }

  /**
   * Get the version of the native SDK. Note that this is not the version of the
   * React Native SDK, this is the version of the mobile SDK that the RN SDK is
   * utilizing.
   * @returns a Promise that resolves with a string representing the version of
   * the native SDK.
   */
  getVersion(): Promise<string> {
    return this._nativeModule.voice_getVersion();
  }

  /**
   * Get the Device token from the native layer.
   * @returns a Promise that resolves with a string representing the Device
   * token.
   */
  getDeviceToken(): Promise<string> {
    return this._nativeModule.voice_getDeviceToken();
  }

  /**
   * Get a list of existing calls, ongoing and pending. This will not return any
   * call that has finished.
   * @returns a Promise that resolves with a mapping of [[Uuid]]s to [[Call]]s.
   */
  async getCalls(): Promise<ReadonlyMap<Uuid, Call>> {
    const callInfos = await this._nativeModule.voice_getCalls();
    const callsMap = new Map<Uuid, Call>(
      callInfos.map((callInfo: NativeCallInfo) => [
        callInfo.uuid,
        new Call(callInfo),
      ])
    );
    return callsMap;
  }

  /**
   * Get a list of pending call invites. This will not return any call invite
   * that has been answered or rejected.
   * @returns a Promise that resolves with a mapping of [[Uuid]]s to
   * [[CallInvite]]s.
   */
  async getCallInvites(): Promise<ReadonlyMap<Uuid, CallInvite>> {
    const callInviteInfos = await this._nativeModule.voice_getCallInvites();
    const callInvitesMap = new Map<Uuid, CallInvite>(
      callInviteInfos.map((callInviteInfo: NativeCallInviteInfo) => [
        callInviteInfo.uuid,
        new CallInvite(callInviteInfo),
      ])
    );
    return callInvitesMap;
  }

  /**
   * Register this device for incoming calls.
   * @param token a Twilio Access Token.
   * @returns a Promise that resolves when the device has been registered.
   */
  register(token: string): Promise<void> {
    return this._nativeModule.voice_register(token);
  }

  /**
   * Unregister this device for incoming calls.
   * @param token a Twilio Access Token.
   * @returns a Promise that resolves when the device has been unregistered.
   */
  unregister(token: string): Promise<void> {
    return this._nativeModule.voice_unregister(token);
  }

  /**
   * Get audio device information from the native layer.
   * @returns a Promise that resolves with a list of the native device's audio
   * devices and the currently selected device.
   */
  async getAudioDevices(): Promise<{
    audioDevices: AudioDevice[];
    selectedDevice: AudioDevice | null;
  }> {
    const {
      audioDevices: audioDeviceInfos,
      selectedDevice: selectedDeviceInfo,
    } = await this._nativeModule.voice_getAudioDevices();

    const audioDevices = audioDeviceInfos.map(
      (audioDeviceInfo: NativeAudioDeviceInfo) =>
        new AudioDevice(audioDeviceInfo)
    );

    const selectedDevice = new AudioDevice(selectedDeviceInfo);

    return { audioDevices, selectedDevice };
  }

  /**
   * TODO
   */
  showAvRoutePickerView(): Promise<void> {
    return this._nativeModule.voice_showNativeAvRoutePicker();
  }
}

/**
 * Voice SDK namespace. Provides an enum detailing the events that the SDK
 * emits, as well as options to pass to the Voice class.
 */
export namespace Voice {
  export enum Event {
    'AudioDevicesUpdated' = 'audioDevicesUpdated',
    'CallInvite' = 'callInvite',
    'CallInviteAccepted' = 'callInviteAccepted',
    'CallInviteRejected' = 'callInviteRejected',
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
