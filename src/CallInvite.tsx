import { NativeEventEmitter } from 'react-native';
import { Call } from './Call';
import { TwilioVoiceReactNative } from './const';
import type { Uuid } from './type';

export class CallInvite {
  private _nativeEventEmitter: NativeEventEmitter;
  private _nativeModule: typeof TwilioVoiceReactNative;
  private _uuid: Uuid;

  constructor(uuid: Uuid, options: Partial<CallInvite.Options> = {}) {
    this._nativeModule = options.nativeModule || TwilioVoiceReactNative;

    this._nativeEventEmitter =
      options.nativeEventEmitter || new NativeEventEmitter(this._nativeModule);

    this._uuid = uuid;
  }

  accept(options: CallInvite.AcceptOptions = {}): Call {
    const callUuid = this._nativeModule.util_generateId();
    const call = new Call(callUuid, {
      nativeEventEmitter: this._nativeEventEmitter,
      nativeModule: this._nativeModule,
    });
    this._nativeModule.callInvite_accept(this._uuid, callUuid, options);
    return call;
  }

  reject(): void {
    this._nativeModule.callInvite_reject(this._uuid);
  }

  isValid(): boolean {
    return this._nativeModule.callInvite_isValid(this._uuid);
  }

  getCallSid(): string {
    return this._nativeModule.callInvite_getCallSid(this._uuid);
  }

  getFrom(): string {
    return this._nativeModule.callInvite_getFrom(this._uuid);
  }

  getTo(): string {
    return this._nativeModule.callInvite_getTo(this._uuid);
  }
}

export namespace CallInvite {
  export interface AcceptOptions {}

  export interface Options {
    nativeEventEmitter: NativeEventEmitter;
    nativeModule: typeof TwilioVoiceReactNative;
  }
}
