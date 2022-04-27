import { NativeEventEmitter } from 'react-native';
import { Call } from './Call';
import { TwilioVoiceReactNative } from './common';
import type { NativeCallInviteInfo } from './type/CallInvite';
import type { CustomParameters, Uuid } from './type/common';
import { InvalidStateError } from './error/InvalidStateError';

export class CallInvite {
  private _nativeEventEmitter: NativeEventEmitter;
  private _nativeModule: typeof TwilioVoiceReactNative;
  private _state: CallInvite.State;

  private _uuid: Uuid;
  private _callSid: string;
  private _customParameters: CustomParameters;
  private _from: string;
  private _to: string;

  constructor(
    { uuid, callSid, customParameters, from, to }: NativeCallInviteInfo,
    options: Partial<CallInvite.Options> = {}
  ) {
    this._nativeModule = options.nativeModule || TwilioVoiceReactNative;
    this._nativeEventEmitter =
      options.nativeEventEmitter || new NativeEventEmitter(this._nativeModule);

    this._uuid = uuid;
    this._callSid = callSid;
    this._customParameters = { ...customParameters };
    this._from = from;
    this._to = to;

    this._state = CallInvite.State.Pending;
  }

  async accept(options: CallInvite.AcceptOptions = {}): Promise<Call> {
    if (this._state !== CallInvite.State.Pending) {
      throw new InvalidStateError(
        `Call in state "${this._state}", expected state "${CallInvite.State.Pending}".`
      );
    }

    const callInfo = await this._nativeModule.callInvite_accept(
      this._uuid,
      options
    );

    const call = new Call(callInfo, {
      nativeEventEmitter: this._nativeEventEmitter,
      nativeModule: this._nativeModule,
    });

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

  getCallSid(): string {
    return this._callSid;
  }

  getCustomParameters(): CustomParameters {
    return this._customParameters;
  }

  getFrom(): string {
    return this._from;
  }

  getTo(): string {
    return this._to;
  }
}

export namespace CallInvite {
  export interface AcceptOptions {}

  export interface Options {
    nativeEventEmitter: NativeEventEmitter;
    nativeModule: typeof TwilioVoiceReactNative;
  }

  export enum State {
    Pending = 'pending',
    Accepted = 'accepted',
    Rejected = 'rejected',
  }
}
