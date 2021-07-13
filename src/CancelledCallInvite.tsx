import { TwilioVoiceReactNative } from './const';
import type { Uuid } from './type';

export class CancelledCallInvite {
  private _nativeModule: typeof TwilioVoiceReactNative;
  private _uuid: Uuid;

  constructor(uuid: Uuid, options: Partial<CancelledCallInvite.Options> = {}) {
    this._nativeModule = options.nativeModule || TwilioVoiceReactNative;

    this._uuid = uuid;
  }

  getFrom(): Promise<string> {
    return this._nativeModule.cancelledCallInvite_getFrom(this._uuid);
  }

  getTo(): Promise<string> {
    return this._nativeModule.cancelledCallInvite_getTo(this._uuid);
  }

  getCallSid(): Promise<string> {
    return this._nativeModule.cancelledCallInvite_getCallSid(this._uuid);
  }
}

export namespace CancelledCallInvite {
  export interface AcceptOptions {}

  export interface Options {
    nativeModule: typeof TwilioVoiceReactNative;
  }
}
