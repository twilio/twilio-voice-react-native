import { NativeModules } from 'react-native';
import type { TwilioVoiceReactNative as TwilioVoiceReactNativeType } from './type';

export const TwilioVoiceReactNative: TwilioVoiceReactNativeType =
  NativeModules.TwilioVoiceReactNative;
