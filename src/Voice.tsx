import { EventEmitter } from 'eventemitter3';
import { NativeEventEmitter } from 'react-native';
import { Call } from './Call';
import { CancelledCallInvite } from './CancelledCallInvite';
import { CallInvite } from './CallInvite';
import { TwilioVoiceReactNative } from './const';
import {
  CallException,
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
  private _bootstrapCallsPromise: Promise<void>;
  private _bootstrapCallInvitesPromise: Promise<void>;
  private _bootstrapCancelledCallInvitesPromise: Promise<void>;
  private _calls: Map<Uuid, Call> = new Map();
  private _callInvites: Map<Uuid, CallInvite> = new Map();
  private _cancelledCallInvites: Map<Uuid, CancelledCallInvite> = new Map();
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
      // call: this._handleCall,
      callInvite: this._handleCallInvite,
      callInviteAccepted: this._handleCallInviteAccepted,
      callInviteRejected: this._handleCallInviteRejected,
      cancelledCallInvite: this._handleCancelledCallInvite,
      error: this._handleError,
      registered: this._handleRegistered,
      unregistered: this._handleUnregistered,
    };

    this._nativeEventEmitter.addListener(
      NativeEventScope.Voice,
      this._handleNativeEvent
    );

    this._bootstrapCallsPromise = this._nativeModule
      .voice_getCalls()
      .then((uuids: Uuid[]) => {
        uuids.forEach((uuid: Uuid) => {
          const call = new Call(uuid, {
            nativeEventEmitter: this._nativeEventEmitter,
            nativeModule: this._nativeModule,
          });
          this._calls.set(uuid, call);
        });
      });

    this._bootstrapCallInvitesPromise = this._nativeModule
      .voice_getCallInvites()
      .then((uuids: Uuid[]) => {
        uuids.forEach((uuid: Uuid) => {
          const callInvite = new CallInvite(uuid, {
            nativeEventEmitter: this._nativeEventEmitter,
            nativeModule: this._nativeModule,
          });
          this._callInvites.set(uuid, callInvite);
        });
      });

    this._bootstrapCancelledCallInvitesPromise = this._nativeModule
      .voice_getCancelledCallInvites()
      .then((uuids: Uuid[]) => {
        uuids.forEach((uuid: Uuid) => {
          const cancelledCallInvite = new CancelledCallInvite(uuid, {
            nativeModule: this._nativeModule,
          });
          this._cancelledCallInvites.set(uuid, cancelledCallInvite);
        });
      });
  }

  private _handleNativeEvent = (nativeMessageEvent: NativeVoiceEvent) => {
    console.log(nativeMessageEvent);

    const { type } = nativeMessageEvent;

    const handler = this._nativeEventHandler[type];
    if (typeof handler === 'undefined') {
      throw new Error(
        `Unknown voice event type received from the native layer: "${type}".`
      );
    }

    handler(nativeMessageEvent);
  };

  // private _handleCall = ({ uuid }: NativeVoiceEvent) => {
  //   const call = new Call(uuid, {
  //     nativeEventEmitter: this._nativeEventEmitter,
  //     nativeModule: this._nativeModule,
  //   });

  //   this._calls.set(uuid, call);

  //   this.emit(Voice.Event.Call, call);
  // };

  private _handleCallInvite = ({ uuid }: NativeVoiceEvent) => {
    const callInvite = new CallInvite(uuid, {
      nativeEventEmitter: this._nativeEventEmitter,
      nativeModule: this._nativeModule,
    });

    this._callInvites.set(uuid, callInvite);

    this.emit(Voice.Event.CallInvite, callInvite);
  };

  private _handleCallInviteAccepted = ({ uuid }: NativeVoiceEvent) => {
    const callInvite = this._callInvites.get(uuid);
    if (typeof callInvite === 'undefined') {
      return;
    }

    const call = new Call(uuid, {
      nativeEventEmitter: this._nativeEventEmitter,
      nativeModule: this._nativeModule,
    });
    this._calls.set(uuid, call);

    this.emit(Voice.Event.CallInviteAccepted, callInvite, call);
  };

  private _handleCallInviteRejected = ({ uuid }: NativeVoiceEvent) => {
    const callInvite = this._callInvites.get(uuid);
    if (typeof callInvite === 'undefined') {
      return;
    }

    this.emit(Voice.Event.CallInviteRejected, callInvite);
  };

  private _handleCancelledCallInvite = ({
    exception,
    uuid,
  }: NativeVoiceEvent) => {
    const cancelledCallInvite = new CancelledCallInvite(uuid, {
      nativeModule: this._nativeModule,
    });

    this._cancelledCallInvites.set(uuid, cancelledCallInvite);

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

    const bind = () =>
      new Promise<void>((resolve) => {
        setImmediate(async () => {
          await this._nativeModule.voice_connect(callUuid, token, params);
          resolve();
        });
      });

    // const bind = () =>
    //   this._nativeModule.voice_connect(callUuid, token, params);

    const call = new Call(callUuid, {
      bind,
      nativeEventEmitter: this._nativeEventEmitter,
      nativeModule: this._nativeModule,
    });

    this._calls.set(callUuid, call);

    return call;
  }

  getVersion(): Promise<string> {
    return this._nativeModule.voice_getVersion();
  }

  async getCalls(): Promise<ReadonlyMap<Uuid, Call>> {
    await this._bootstrapCallsPromise;
    return this._calls;
  }

  async getCallInvites(): Promise<ReadonlyMap<Uuid, CallInvite>> {
    await this._bootstrapCallInvitesPromise;
    return this._callInvites;
  }

  async getCancelledCallInvites(): Promise<
    ReadonlyMap<Uuid, CancelledCallInvite>
  > {
    await this._bootstrapCancelledCallInvitesPromise;
    return this._cancelledCallInvites;
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
