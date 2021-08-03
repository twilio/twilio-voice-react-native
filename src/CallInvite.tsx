import { NativeEventEmitter } from 'react-native';
import { Call } from './Call';
import { TwilioVoiceReactNative } from './const';
import type { Uuid } from './type';
import { InvalidStateError } from './error/InvalidStateError';

export class CallInvite {
  private _nativeEventEmitter: NativeEventEmitter;
  private _nativeModule: typeof TwilioVoiceReactNative;
  private _state: CallInvite.State;
  private _uuid: Uuid;

  constructor(uuid: Uuid, options: Partial<CallInvite.Options> = {}) {
    this._nativeModule = options.nativeModule || TwilioVoiceReactNative;

    this._nativeEventEmitter =
      options.nativeEventEmitter || new NativeEventEmitter(this._nativeModule);

    this._uuid = uuid;
    this._state = CallInvite.State.Pending;
  }

  async accept(options: CallInvite.AcceptOptions = {}): Promise<Call> {
    if (this._state !== CallInvite.State.Pending) {
      throw new InvalidStateError(
        `Call in state "${this._state}", expected state "${CallInvite.State.Pending}"`
      );
    }

    const callUuid = await this._nativeModule.util_generateId();
    const call = new Call(callUuid, {
      nativeEventEmitter: this._nativeEventEmitter,
      nativeModule: this._nativeModule,
    });

    await this._nativeModule.callInvite_accept(this._uuid, callUuid, options);

    return call;
  }

  async reject(): Promise<void> {
    if (this._state !== CallInvite.State.Pending) {
      throw new InvalidStateError(
        `Call in state "${this._state}", expected state "${CallInvite.State.Pending}"`
      );
    }

    await this._nativeModule.callInvite_reject(this._uuid);
  }

  isValid(): Promise<boolean> {
    return this._nativeModule.callInvite_isValid(this._uuid);
  }

  getCallSid(): Promise<string> {
    return this._nativeModule.callInvite_getCallSid(this._uuid);
  }

  getFrom(): Promise<string> {
    return this._nativeModule.callInvite_getFrom(this._uuid);
  }

  getTo(): Promise<string> {
    return this._nativeModule.callInvite_getTo(this._uuid);
  }
}

export namespace CallInvite {
  export interface AcceptOptions {}

  export interface Options {
    nativeEventEmitter: NativeEventEmitter;
    nativeModule: typeof TwilioVoiceReactNative;
  }

  export enum State {
    Pending = 'PENDING',
    Accepted = 'ACCEPTED',
    Rejected = 'REJECTED',
  }
}
