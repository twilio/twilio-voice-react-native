import { NativeEventEmitter } from 'react-native';
import { TwilioVoiceReactNative } from './const';
import type { NativeAudioDeviceInfo, Uuid } from './type';

export class AudioDevice {
  private _nativeEventEmitter: NativeEventEmitter;
  private _nativeModule: typeof TwilioVoiceReactNative;

  private _uuid: Uuid;
  private _type: AudioDevice.Type;
  private _name: String;

  constructor(
    { uuid, type, name }: NativeAudioDeviceInfo
  ) {
    this._nativeModule = TwilioVoiceReactNative;
    this._nativeEventEmitter = new NativeEventEmitter(this._nativeModule);

    this._uuid = uuid;
    this._type = type;
    this._name = name;
  }

  getUuid(): Uuid {
  	return this._uuid;
  }

  getType(): AudioDevice.Type {
  	return this._type;
  }

  getName(): String {
  	return this._name;
  }
}

export namespace AudioDevice {
  export enum Type {
    Earpiece = 'earpiece',
    Speaker = 'speaker',
    Bluetooth = 'bluetooth',
  }
}