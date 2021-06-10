import { NativeModules } from 'react-native';

type TwilioVoiceReactNativeType = {
  multiply(a: number, b: number): Promise<number>;
};

const { TwilioVoiceReactNative } = NativeModules;

export default TwilioVoiceReactNative as TwilioVoiceReactNativeType;
