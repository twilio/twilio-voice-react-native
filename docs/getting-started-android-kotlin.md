# Getting Started on Android
Please check out the following if you are new to Twilio's Programmable Voice or React Native.

- [Programmable Voice](https://www.twilio.com/docs/voice/sdks)
- [React Native](https://reactnative.dev/docs/getting-started)

When following the React Native environment setup guide, please ensure that "React Native CLI" is selected.

## Android
To get started on Android, you will need a Firebase project and a `google-services.json` file generated for that project. Place this file in the `android/app/` folder of your React Native project.

For more information on Firebase and Push Credentials, please see the Twilio Programmable Voice Android Quickstart:
https://github.com/twilio/voice-quickstart-android#quickstart

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
    private val activityProxy = VoiceActivityProxy(
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
        activityProxy.onCreate(savedInstanceState)
    }
}
```

You will need to do this for the following Android lifecycle methods:
  - `onCreate`
  - `onDestroy`
  - `onNewIntent`
  - `onStart`
  - `onStop`

#### `MainApplication`
You will need to instantiate a `VoiceApplicationProxy` and replace the `ReactNativeHost` with a `VoiceApplicationProxy.VoiceReactNativeHost`. The `VoiceApplicationProxy` will need to be "hooked" into the Android application lifecycle methods as well.

Note that the React Native application boilerplate opts to inline extend the `com.facebook.react.ReactNativeHost` in the `MainApplication.java` file. We opt to extend the `VoiceApplicationProxy.VoiceReactNativeHost` in a separate class and file.

In `MainReactNativeHost.kt`:

```kotlin
class MainReactNativeHost(application: Application?) : VoiceReactNativeHost(application) {
    // Excluded for brevity
    ...
}
```

Then you can construct the `VoiceApplicationProxy` and the `MainReactNativeHost` in your `MainApplication.java`:

```kotlin
class MainApplication : Application(), ReactApplication {
    private val voiceApplicationProxy: VoiceApplicationProxy
    private val mReactNativeHost = MainReactNativeHost(this)

    init {
        voiceApplicationProxy = VoiceApplicationProxy(mReactNativeHost)
    }

    // Excluded for brevity
    ...
}
```

Finally, here is an example of how to hook the `VoiceApplicationProxy` lifecycle methods onto `MainApplication`:

```kotlin
class MainApplication : Application(), ReactApplication {
    // Excluded for brevity
    ...

    override fun onCreate() {
        super.onCreate()
        voiceApplicationProxy.onCreate()
        SoLoader.init(this,  /* native exopackage */false)
        // Remove the following line if you don't want Flipper enabled
        initializeFlipper(this, reactNativeHost.reactInstanceManager)
    }

    override fun onTerminate() {
        // Note: this method is not called when running on device, devies just kill the process.
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
