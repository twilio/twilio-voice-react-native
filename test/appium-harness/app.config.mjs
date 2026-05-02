// @ts-check

'use strict';

import secrets from './secrets.json' with { type: 'json' };

const config = {
  expo: {
    name: 'twilio-voice-react-native-sdk-appium-harness',
    slug: 'twilio-voice-react-native-sdk-appium-harness',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'twiliovoicereactnativesdkappiumharness',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: secrets.ios.bundleIdentifier,
      appleTeamId: secrets.ios.appleTeamId,
      infoPlist: {
        NSMicrophoneUsageDescription: 'foobar',
        UIBackgroundModes: ['audio', 'voip'],
      },
      entitlements: {
        'aps-environment': 'development',
      },
    },
    android: {
      package: secrets.android.package,
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
};

export default config;
