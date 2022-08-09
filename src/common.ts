import * as ReactNative from 'react-native';
import type { TwilioVoiceReactNative as TwilioVoiceReactNativeType } from './type/NativeModule';

export const NativeModule = ReactNative.NativeModules
  .TwilioVoiceReactNative as TwilioVoiceReactNativeType;
export const NativeEventEmitter = new ReactNative.NativeEventEmitter(
  NativeModule
);
