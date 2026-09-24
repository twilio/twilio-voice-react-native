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

### Native Code (Java)
The native Android layer of the SDK exposes several helper classes that will need to be invoked in your existing native Android code.

> React Native 0.73 made Kotlin the default for `MainActivity`/`MainApplication`,
> and the SDK's own test application in
> `test/app/android/app/src/main/java/com/example/twiliovoicereactnative` is
> Kotlin only. This guide is preserved for applications that still ship Java
> `MainActivity.java`/`MainApplication.java`. If you are starting from a recent
> template, use the [Kotlin guide](./getting-started-android-kotlin.md)
> instead.

The following sections detail the Java changes you will need to make in your application.

#### `MainActivity`
Within your `MainActivity.java` file, you will need to instantiate a `VoiceActivityProxy` and "hook" its methods into your application's `MainActivity`.

Here is an example of how to instantiate the `VoiceActivityProxy` class:
```java
public class MainActivity extends ReactActivity {
  private final VoiceActivityProxy voiceActivityProxy = new VoiceActivityProxy(
    this,
    permission -> {
      if (Manifest.permission.RECORD_AUDIO.equals(permission)) {
        Toast.makeText(
          MainActivity.this,
          "Microphone permissions needed. Please allow in your application settings.",
          Toast.LENGTH_LONG).show();
      } else if ((Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) &&
        Manifest.permission.BLUETOOTH_CONNECT.equals(permission)) {
        Toast.makeText(
          MainActivity.this,
          "Bluetooth permissions needed. Please allow in your application settings.",
          Toast.LENGTH_LONG).show();
      } else if ((Build.VERSION.SDK_INT > Build.VERSION_CODES.S_V2) &&
        Manifest.permission.POST_NOTIFICATIONS.equals(permission)) {
        Toast.makeText(
          MainActivity.this,
          "Notification permissions needed. Please allow in your application settings.",
          Toast.LENGTH_LONG).show();
      }
    });

  // Excluded for brevity
  ...
}
```

Note that you can customize the permissions toasts at this point for internationalization purposes.

Here is an example of how to "hook" the `onCreate` method:
```java
public class MainActivity extends ReactActivity {
  // Excluded for brevity
  ...

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    voiceActivityProxy.onCreate(savedInstanceState);
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

```java
public class MainApplication extends Application implements ReactApplication {
  private final VoiceApplicationProxy voiceApplicationProxy = new VoiceApplicationProxy(this);

  // Excluded for brevity
  ...
}
```

Finally, here is an example of how to hook the `VoiceApplicationProxy` lifecycle methods onto `MainApplication`. The example keeps the rest of `MainApplication` intact and only shows the additions:

```java
public class MainApplication extends Application implements ReactApplication {
  // Excluded for brevity
  ...

  @Override
  public void onCreate() {
    super.onCreate();
    voiceApplicationProxy.onCreate();
    // your existing onCreate work follows
  }

  @Override
  public void onTerminate() {
    // Note: this method is not invoked on real devices; the OS kills the process instead.
    voiceApplicationProxy.onTerminate();
    super.onTerminate();
  }
}
```

The following lifecycle methods need to be hooked:
  - `onCreate`
  - `onTerminate`

React Native templates from 0.71+ generate `MainApplication` around
`DefaultReactNativeHost` and no longer initialize Flipper. Whichever shape
your generated `MainApplication` uses, the two calls above are what the SDK
requires; leave the rest of `MainApplication` as your template generated it.

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
