import { EventEmitter } from 'events';
import { NativeEventEmitter } from 'react-native';
import { TwilioVoiceReactNative } from './const';
import type { Uuid } from './type';

export interface CallInviteOptions {
  nativeEventEmitter: NativeEventEmitter;
}

export class CallInvite extends EventEmitter {
  nativeEventEmitter: NativeEventEmitter;
  uuid: string;

  constructor(uuid: Uuid, options: Partial<CallInviteOptions> = {}) {
    super();

    this.nativeEventEmitter =
      options.nativeEventEmitter ||
      new NativeEventEmitter(TwilioVoiceReactNative);

    this.uuid = uuid;
  }
}
