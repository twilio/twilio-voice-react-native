import { requireNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';
import { NativeModule } from './common';

interface TwilioVoiceExpoModule {
  voice_connect(accessToken: string): Promise<string>;
  voice_disconnect(callUuid: string): Promise<void>;
}

class ExpoVoiceModule {
  private androidExpoNativeModule: TwilioVoiceExpoModule = requireNativeModule('TwilioVoiceExpo');
  private nativeModule: typeof NativeModule = NativeModule;

  async connect(accessToken: string): Promise<string> {
    if (Platform.OS === 'android') {
      return this.androidExpoNativeModule.voice_connect(accessToken);
    } else {
      return this.nativeModule.connect(accessToken);
    }
  }

  async disconnect(callUuid: string): Promise<void> {
    if (Platform.OS === 'android') {
      return this.androidExpoNativeModule.voice_disconnect(callUuid);
    } else {
      return this.nativeModule.disconnect(callUuid);
    }
  }
}

export default new ExpoVoiceModule(); 