import type { AudioDevice } from '../AudioDevice';
import type {
  NativeAudioDeviceInfo,
  NativeAudioDevicesInfo,
} from '../type/AudioDevice';

export function createNativeAudioDeviceInfo(): NativeAudioDeviceInfo {
  return {
    uuid: 'mock-nativeaudiodeviceinfo-uuid',
    type: 'earpiece' as AudioDevice.Type,
    name: 'mock-nativeaudiodeviceinfo-name',
  };
}

export function createNativeAudioDevicesInfo(): NativeAudioDevicesInfo {
  return {
    audioDevices: [
      {
        uuid: 'mock-nativeaudiodeviceinfo-uuid-one',
        type: 'earpiece' as AudioDevice.Type,
        name: 'mock-nativeaudiodeviceinfo-name-one',
      },
      {
        uuid: 'mock-nativeaudiodeviceinfo-uuid-two',
        type: 'speaker' as AudioDevice.Type,
        name: 'mock-nativeaudiodeviceinfo-name-two',
      },
      {
        uuid: 'mock-nativeaudiodeviceinfo-uuid-three',
        type: 'bluetooth' as AudioDevice.Type,
        name: 'mock-nativeaudiodeviceinfo-name-three',
      },
    ],
    selectedDevice: {
      uuid: 'mock-nativeaudiodeviceinfo-uuid-two',
      type: 'speaker' as AudioDevice.Type,
      name: 'mock-nativeaudiodeviceinfo-name-two',
    },
  };
}
