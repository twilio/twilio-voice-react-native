import { NativeModules } from 'react-native';
import type { TwilioVoiceReactNative as TwilioVoiceReactNativeType } from './type/NativeModule';

export const TwilioVoiceReactNative: TwilioVoiceReactNativeType =
  NativeModules.TwilioVoiceReactNative;
