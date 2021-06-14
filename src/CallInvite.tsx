import { NativeEventEmitter } from 'react-native';
import { Call } from './Call';
import { TwilioVoiceReactNative } from './const';
import type { Uuid } from './type';

export declare namespace CallInvite {
  export interface AcceptOptions {}

  export interface Options {
    nativeEventEmitter: NativeEventEmitter;
    nativeModule: typeof TwilioVoiceReactNative;
  }
}

export class CallInvite {
  private _nativeEventEmitter: NativeEventEmitter;
  private _nativeModule: typeof TwilioVoiceReactNative;
  private _nativeScope: string;
  private _uuid: Uuid;

  constructor(uuid: Uuid, options: Partial<CallInvite.Options> = {}) {
    this._nativeModule = options.nativeModule || TwilioVoiceReactNative;

    this._nativeEventEmitter =
      options.nativeEventEmitter || new NativeEventEmitter(this._nativeModule);

    this._uuid = uuid;

    this._nativeScope = `${CallInvite.name}-${this._uuid}`;
  }

  async accept(options: CallInvite.AcceptOptions = {}) {
    const callUuid = await this._nativeModule.util_generateId();
    const call = new Call(callUuid, {
      nativeEventEmitter: this._nativeEventEmitter,
      nativeModule: this._nativeModule,
    });
    this._nativeModule.callInvite_accept(this._nativeScope, options);
    return call;
  }

  reject() {
    this._nativeModule.callInvite_reject(this._nativeScope);
  }

  isValid() {
    return this._nativeModule.callInvite_isValid(this._nativeScope);
  }

  getCallSid() {
    return this._nativeModule.callInvite_getCallSid(this._nativeScope);
  }

  getFrom() {
    return this._nativeModule.callInvite_getFrom(this._nativeScope);
  }

  getTo() {
    return this._nativeModule.callInvite_getTo(this._nativeScope);
  }
}
