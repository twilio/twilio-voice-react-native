import { EventEmitter } from 'events';
import { NativeEventEmitter } from 'react-native';
import { TwilioVoiceReactNative } from './const';
import type { Uuid } from './type';

export interface CallOptions {
  nativeEventEmitter: NativeEventEmitter;
}

export class Call extends EventEmitter {
  nativeEventEmitter: NativeEventEmitter;
  uuid: string;

  constructor(uuid: Uuid, options: Partial<CallOptions> = {}) {
    super();

    this.nativeEventEmitter =
      options.nativeEventEmitter ||
      new NativeEventEmitter(TwilioVoiceReactNative);

    this.uuid = uuid;
  }
}
