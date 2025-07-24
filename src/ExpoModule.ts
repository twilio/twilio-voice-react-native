// ExpoModule.ts: JSラッパー（Androidはexpo-modules-core経由、iOSは従来通り）
import { Platform } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';

let androidExpoNativeModule: any;
if (Platform.OS === 'android') {
  androidExpoNativeModule = requireNativeModule('TwilioVoiceExpoModule');
}

export class ExpoVoiceModule {
  static async voiceConnect(accessToken: string) {
    if (Platform.OS === 'android') {
      return androidExpoNativeModule.voice_connect(accessToken);
    } else {
      // iOSは従来のNativeModuleを利用
      throw new Error('iOSはExpoModule未対応です');
    }
  }
}
