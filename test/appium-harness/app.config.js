const secrets = require('./secrets.json');

module.exports = {
  expo: {
    name: 'twilio-voice-react-native-sdk-appium-harness',
    slug: 'twilio-voice-react-native-sdk-appium-harness',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'twiliovoicereactnativesdkappiumharness',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      icon: './assets/expo.icon',
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
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png'
      },
      predictiveBackGestureEnabled: false,
      package: 'com.example.twiliovoicereactnative',
      googleServicesFile: './google-services.json',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          backgroundColor: '#208AEF',
          android: {
            image: './assets/images/splash-icon.png',
            imageWidth: 76
          }
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    }
  }
}
