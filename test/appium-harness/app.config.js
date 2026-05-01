const secrets = require('./secrets.json');

module.exports = {
  expo: {
    name: 'twilio-voice-react-native-sdk-appium-harness',
    slug: 'twilio-voice-react-native-sdk-appium-harness',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'twiliovoicereactnativesdkappiumharness',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.twilio.TwilioVoiceReactNativeExample',
      appleTeamId: secrets.appleTeamId,
      infoPlist: {
        NSMicrophoneUsageDescription: 'foobar',
        UIBackgroundModes: ['audio', 'voip'],
      },
      entitlements: {
        'aps-environment': 'development',
      },
    },
    android: {
      package: 'com.example.twiliovoicereactnative',
      googleServicesFile: './google-services.json',
    },
    plugins: [
      'expo-router',
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    }
  }
}
