import { AudioDevice } from '../AudioDevice';
import type {
  NativeAudioDeviceInfo,
  NativeAudioDevicesInfo,
} from '../type/AudioDevice';

export function createDefaultMockNativeAudioDeviceInfo(): NativeAudioDeviceInfo {
  return {
    uuid: 'mock-nativeaudiodeviceinfo-uuid',
    type: AudioDevice.Type.Speaker,
    name: 'mock-nativeaudiodeviceinfo-name',
  };
}

export function createDefaultMockNativeAudioDevicesInfo(): NativeAudioDevicesInfo {
  return {
    audioDevices: [createDefaultMockNativeAudioDeviceInfo()],
    selectedDevice: createDefaultMockNativeAudioDeviceInfo(),
  };
}
