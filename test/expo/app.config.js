const secrets = require('./secrets.json');

// CI builds a legacy-architecture variant that hosts the Appium harness.
// Expo evaluates this file for prebuild and again for each bundle, so both
// switches must be set in the environment of both steps.
const newArchEnabled = process.env.TEST_EXPO_NEW_ARCH !== 'false';
const useHarness = process.env.TEST_EXPO_ENTRY === 'harness';

module.exports = {
  expo: {
    name: 'TwilioVoiceExpoExample',
    slug: 'TwilioVoiceExpoExample',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'myapp',
    userInterfaceStyle: 'automatic',
    newArchEnabled,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.twilio.TwilioVoiceReactNativeExample',
      appleTeamId: secrets.appleTeamId,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.example.twiliovoicereactnative',
      googleServicesFile: './google-services.json',
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      '@twilio/voice-react-native-sdk',
      './plugins/withFmtCxx17',
      useHarness ? ['expo-router', { root: 'harness' }] : 'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
  },
};
