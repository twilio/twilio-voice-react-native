import { TwilioVoiceReactNative } from './const';
import type { NativeAudioDeviceInfo, Uuid } from './type';

export class AudioDevice {
  private _nativeModule: typeof TwilioVoiceReactNative;

  uuid: Uuid;
  type: AudioDevice.Type;
  name: string;

  constructor(
    { uuid, type, name }: NativeAudioDeviceInfo,
    options: Partial<AudioDevice.Options> = {}
  ) {
    this._nativeModule = options.nativeModule || TwilioVoiceReactNative;

    this.uuid = uuid;
    this.type = type;
    this.name = name;
  }

  select(): Promise<void> {
    return this._nativeModule.voice_selectAudioDevice(this.uuid);
  }
}

export namespace AudioDevice {
  export enum Type {
    Earpiece = 'earpiece',
    Speaker = 'speaker',
    Bluetooth = 'bluetooth',
  }

  export interface Options {
    nativeModule: typeof TwilioVoiceReactNative;
  }
}
