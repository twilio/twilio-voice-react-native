# Configuring your Expo app to use this library

## `app.json`

Make the following changes to your `app.json` file to enable usage of the Twilio
Voice React Native SDK in your Expo application.

### iOS

This library requires three permissions that need to be set in your `app.json`
file.

```json
{
  "expo": {
    ...,
    "ios": {
      ...,
      "infoPlist": {
        "NSMicrophoneUsageDescription": "Voice calling",
        "UIBackgroundModes": ["audio", "voip"]
      },
      "entitlements": {
        "aps-environment": "development"
      }
    }
  }
}
```

Consider modifying the `"NSMicrophoneUsageDescription"` string value for your
use case and setting the `"aps-environment"` value to `"production"` for
production builds.

### Android

This library requires a Google Services JSON file to enable your Expo app to
receive incoming calls. Make the following changes to your `app.json` file to
support this.

```json
{
  "expo": {
    ...,
    "android": {
      ...,
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

Consider modifying the `"googleServicesFile"` string value to match your
development environment.
