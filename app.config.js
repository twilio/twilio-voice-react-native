import './expo-config-plugin/ios';
import './expo-config-plugin/android';

export default {
  name: 'TwilioVoiceReactNative',
  plugins: [
    ['./expo-config-plugin/ios'],
    ['./expo-config-plugin/android']
  ]
}; 