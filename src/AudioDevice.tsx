import { TwilioVoiceReactNative } from './const';
import type { NativeAudioDeviceInfo, Uuid } from './type';

export class AudioDevice {
  private _nativeModule: typeof TwilioVoiceReactNative;

  private _uuid: Uuid;
  private _type: AudioDevice.Type;
  private _name: string;

  constructor(
    { uuid, type, name }: NativeAudioDeviceInfo,
    options: Partial<AudioDevice.Options> = {}
  ) {
    this._nativeModule = options.nativeModule || TwilioVoiceReactNative;

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

  getName(): string {
    return this._name;
  }

  select(): void {
    this._nativeModule.voice_selectAudioDevice(this._uuid);
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
