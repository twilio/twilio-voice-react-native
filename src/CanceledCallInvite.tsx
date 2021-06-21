import { TwilioVoiceReactNative } from './const';
import type { Uuid } from './type';

export class CanceledCallInvite {
  private _nativeModule: typeof TwilioVoiceReactNative;
  private _uuid: Uuid;

  constructor(uuid: Uuid, options: Partial<CanceledCallInvite.Options> = {}) {
    this._nativeModule = options.nativeModule || TwilioVoiceReactNative;

    this._uuid = uuid;
  }

  getFrom(): string {
    return this._nativeModule.canceledCallInvite_getFrom(this._uuid);
  }

  getTo(): string {
    return this._nativeModule.canceledCallInvite_getTo(this._uuid);
  }

  getCallSid(): string {
    return this._nativeModule.canceledCallInvite_getCallSid(this._uuid);
  }
}

export namespace CanceledCallInvite {
  export interface AcceptOptions {}

  export interface Options {
    nativeModule: typeof TwilioVoiceReactNative;
  }
}
