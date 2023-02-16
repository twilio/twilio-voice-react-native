import type { AudioDevice } from '../AudioDevice';
import type { Constants } from '../constants';
import type { Uuid } from './common';

export interface NativeAudioDeviceInfo {
  uuid: Uuid;
  type: AudioDevice.Type;
  name: string;
}

export interface NativeAudioDevicesInfo {
  audioDevices: NativeAudioDeviceInfo[];
  selectedDevice?: NativeAudioDeviceInfo;
}

export interface NativeAudioDevicesUpdatedEvent extends NativeAudioDevicesInfo {
  type: Constants.VoiceEventAudioDevicesUpdated;
}
