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
        NSMicrophoneUsageDescription: 'Voice calling capabilities.',
        UIBackgroundModes: ['audio', 'voip'],
      },
      entitlements: {
        'aps-environment': 'development',
      },
    },
    android: {
      package: secrets.android.package,
      // TODO: restore once we have a google-services.json available to CI.
      //
      // Commented out so the Android build needs no Firebase config at all: Expo
      // then neither copies a google-services.json into android/app/ nor applies
      // the com.google.gms.google-services Gradle plugin. The SDK's
      // firebase-messaging dependency and VoiceFirebaseMessagingService still
      // compile normally - only the generated google_app_id/google_api_key string
      // resources are absent. The consequence is at runtime: the app cannot obtain
      // an FCM token, so incoming calls are not delivered. Outgoing calls and the
      // harness UI are unaffected.
      // googleServicesFile: './google-services.json',
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
