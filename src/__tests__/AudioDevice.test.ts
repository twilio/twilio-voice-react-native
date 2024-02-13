import { createNativeAudioDeviceInfo } from '../__mocks__/AudioDevice';
import { AudioDevice } from '../AudioDevice';
import { NativeModule } from '../common';

const MockNativeModule = jest.mocked(NativeModule);

jest.mock('../common');

let audioDevice: AudioDevice;

beforeEach(() => {
  jest.clearAllMocks();

  audioDevice = new AudioDevice(createNativeAudioDeviceInfo());
});

describe('AudioDevice class', () => {
  describe('data members', () => {
    describe('.type', () => {
      it('contains the type of the AudioDevice', () => {
        expect(audioDevice.type).toBe(createNativeAudioDeviceInfo().type);
      });
    });

    describe('.uuid', () => {
      it('contains the uuid of the AudioDevice', () => {
        expect(audioDevice.uuid).toBe(createNativeAudioDeviceInfo().uuid);
      });
    });

    describe('.name', () => {
      it('contains the name of the AudioDevice', () => {
        expect(audioDevice.name).toBe(createNativeAudioDeviceInfo().name);
      });
    });
  });

  describe('methods', () => {
    describe('.select', () => {
      it('invokes the native module', async () => {
        await audioDevice.select();
        expect(
          jest.mocked(MockNativeModule.voice_selectAudioDevice).mock.calls
        ).toEqual([[createNativeAudioDeviceInfo().uuid]]);
      });

      it('returns a Promise<void>', async () => {
        const selectPromise = audioDevice.select();
        await expect(selectPromise).resolves.toBeUndefined();
      });
    });
  });
});

describe('AudioDevice namespace', () => {
  describe('exports enumerations', () => {
    it('Type', () => {
      expect(AudioDevice.Type).toBeDefined();
      expect(typeof AudioDevice.Type).toBe('object');
    });
  });
});
