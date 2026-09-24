# Getting Started on Android
Please check out the following if you are new to Twilio's Programmable Voice or React Native.

- [Programmable Voice](https://www.twilio.com/docs/voice/sdks)
- [React Native](https://reactnative.dev/docs/getting-started)

When following the React Native environment setup guide, please ensure that "React Native CLI" is selected.

## Android
To get started on Android, you will need a Firebase project and a `google-services.json` file generated for that project. Place this file in the `android/app/` folder of your React Native project.

For more information on Firebase and Push Credentials, please see the Twilio Programmable Voice Android Quickstart:
https://github.com/twilio/voice-quickstart-android#quickstart

### Gradle Dependencies
You will also need to add the Google Services Gradle Plugin as a dependency in your Gradle build files.

In your `android/build.gradle`:
```
buildscript {
    // excluded for brevity
    ...

    dependencies {
        // excluded for brevity
        ...
        classpath("com.google.gms:google-services:4.4.1")
    }
}
```

And in your `android/app/build.gradle`:
```
apply plugin: "com.google.gms.google-services"
```

### Native Code (Kotlin)
The native Android layer of the SDK exposes several helper classes that will need to be invoked in your existing native Android code.

Please reference this folder for our implementation:
https://github.com/twilio/twilio-voice-react-native/tree/main/test/app/android/app/src/main/java/com/example/twiliovoicereactnative

The following sections detail the changes that we made in our Test App that you will need to do in your application.

#### `MainActivity`
Within your `MainActivity.kt` file, you will need to instantiate a `VoiceActivityProxy` and "hook" its methods into your application's `MainActivity`.

Here is an example of how to instantiate the `VoiceActivityProxy` class:
```kotlin
class MainActivity : ReactActivity() {
    private val voiceActivityProxy = VoiceActivityProxy(
        this
    ) { permission: String ->
        if (Manifest.permission.RECORD_AUDIO == permission) {
            Toast.makeText(
                this@MainActivity,
                "Microphone permissions needed. Please allow in your application settings.",
                Toast.LENGTH_LONG
            ).show()
        } else if ((Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) && (Manifest.permission.BLUETOOTH_CONNECT == permission)) {
            Toast.makeText(
                this@MainActivity,
                "Bluetooth permissions needed. Please allow in your application settings.",
                Toast.LENGTH_LONG
            ).show()
        } else if ((Build.VERSION.SDK_INT > Build.VERSION_CODES.S_V2) && (Manifest.permission.POST_NOTIFICATIONS == permission)) {
            Toast.makeText(
                this@MainActivity,
                "Notification permissions needed. Please allow in your application settings.",
                Toast.LENGTH_LONG
            ).show()
        }
    }

    // Excluded for brevity
    ...
}
```

Note that you can customize the permissions toasts at this point for internationalization purposes.

Here is an example of how to "hook" the `onCreate` method:
```kotlin
class MainActivity : ReactActivity() {
    // Excluded for brevity
    ...

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        voiceActivityProxy.onCreate(savedInstanceState)
    }
}
```

You will need to hook the following Android lifecycle methods:
  - `onCreate`
  - `onDestroy`
  - `onNewIntent`

`VoiceActivityProxy` exposes these three methods and no others; the older
guidance to also hook `onStart` and `onStop` is stale and no such methods exist
on the proxy.

#### `MainApplication`
You will need to instantiate a `VoiceApplicationProxy` which will need to be "hooked" into the Android application lifecycle methods:

```kotlin
class MainApplication : Application(), ReactApplication {
    private val voiceApplicationProxy: VoiceApplicationProxy = VoiceApplicationProxy(this)

    // Excluded for brevity
    ...
}
```

Finally, here is an example of how to hook the `VoiceApplicationProxy` lifecycle methods onto `MainApplication`. The example keeps the rest of `MainApplication` intact and only shows the additions:

```kotlin
class MainApplication : Application(), ReactApplication {
    // Excluded for brevity
    ...

    override fun onCreate() {
        super.onCreate()
        voiceApplicationProxy.onCreate()
        // your existing onCreate work follows
    }

    override fun onTerminate() {
        // Note: this method is not invoked on real devices; the OS kills the process instead.
        voiceApplicationProxy.onTerminate()
        super.onTerminate()
    }

    // Excluded for brevity
    ...
}
```

The following lifecycle methods need to be hooked:
  - `onCreate`
  - `onTerminate`

React Native templates from 0.71+ generate `MainApplication` around
`DefaultReactNativeHost` and no longer initialize Flipper. Whichever shape
your generated `MainApplication` uses, the two calls above (`onCreate` and
`onTerminate` on the `VoiceApplicationProxy` member) are what the SDK
requires; leave the rest of `MainApplication` as your template generated it.
For a complete reference, see `test/app/android/app/src/main/java/com/example/twiliovoicereactnative/MainApplication.kt`
in this repository.

## Wrapping Up
Once the above native code has been implemented in your application, the Twilio Voice React Native SDK is ready for usage on Android platforms.

### Access Tokens
An Access Token is required to make outgoing calls or receive incoming calls. Please check out this [page](https://www.twilio.com/docs/iam/access-tokens#create-an-access-token-for-voice) for more details on creating Access Tokens.

For more details on access tokens, please see the [iOS](https://github.com/twilio/voice-quickstart-ios) and [Android](https://github.com/twilio/voice-quickstart-android) quickstart for examples.

### Usage
The following example demonstrates how to make and receive calls. You will need to implement your own `getAccessToken()` method.

For more information on the Voice React Native SDK API, refer to the [API Docs](https://github.com/twilio/twilio-voice-react-native/blob/latest/docs/api/voice-react-native-sdk.md) or see our [Reference App](https://github.com/twilio/twilio-voice-react-native-app).

```ts
import { Voice } from '@twilio/voice-react-native-sdk';

const token = getAccessToken(); // you will need to implement this method for your use case

const voice = new Voice();

// Allow incoming calls
await voice.register(token);

// Handle incoming calls
voice.on(Voice.Event.CallInvite, (callInvite) => {
  callInvite.accept();
});

// Make an outgoing call
const call = await voice.connect(token, params);
```
