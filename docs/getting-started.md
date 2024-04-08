# Getting started with the Twilio Voice React Native SDK

## Android
To get started on Android, you will need a Firebase project and a `google-services.json` file generated for that project. Place this file in the `android/app/` folder of your React Native project.

For more information on Firebase and Push Credentials, please see the Twilio Programmable Voice Android Quickstart:
https://github.com/twilio/voice-quickstart-android#quickstart

### Native Code
The native Android layer of the SDK exposes several helper classes that will need to be invoked in your existing native Android code.

Please reference this folder for our implementation:
https://github.com/twilio/twilio-voice-react-native/tree/main/test/app/android/app/src/main/java/com/example/twiliovoicereactnative

The following sections detail the changes that we made in our Test App that you will need to do in your application.

#### `MainActivity`
Within your `MainActivity.java` file, you will need to instantiate a `VoiceActivityProxy` and "hook" its methods into your application's `MainActivity`.

Here is an example of how to instantiate the `VoiceActivityProxy` class:
```java
public class MainActivity extends ReactActivity {
  private final VoiceActivityProxy activityProxy = new VoiceActivityProxy(
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
    activityProxy.onCreate(savedInstanceState);
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

In `MainReactNativeHost.java`:

```java
public class MainReactNativeHost extends VoiceApplicationProxy.VoiceReactNativeHost {
  // Excluded for brevity
  ...
}
```

Then you can construct the `VoiceApplicationProxy` and the `MainReactNativeHost` in your `MainApplication.java`:

```java
public class MainApplication extends Application implements ReactApplication {
  private final VoiceApplicationProxy voiceApplicationProxy;

  private final MainReactNativeHost mReactNativeHost;

  public MainApplication() {
    super();
    mReactNativeHost = new MainReactNativeHost(this);
    voiceApplicationProxy = new VoiceApplicationProxy(mReactNativeHost);
  }

  // Excluded for brevity
  ...
}
```

Finally, here is an example of how to hook the `VoiceApplicationProxy` lifecycle methods onto `MainApplication`:

```java
public class MainApplication extends Application implements ReactApplication {
  // Excluded for brevity
  ...

  @Override
  public void onCreate() {
    super.onCreate();
    voiceApplicationProxy.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    // Remove the following line if you don't want Flipper enabled
    initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
  }

  @Override
  public void onTerminate() {
    // Note: this method is not called when running on device, devies just kill the process.
    voiceApplicationProxy.onTerminate();
    super.onTerminate();
  }

  // Excluded for brevity
  ...
}
```

The following lifecycle methods need to be hooked:
  - `onCreate`
  - `onTerminate`

## iOS
Please note that the Twilio Voice React Native SDK is tightly integrated with the iOS CallKit framework. This provides the best call and audio experience, and requires the application to be run on a physical device. The SDK will not work on an iOS simulator.

Firstly, create a Bundle Identifier (Bundle ID) through the Apple Developer Portal. Then, create a Provisioning Profile for that Bundle ID and add physical devices to that profile. Those devices will also need to be registered to the developer account.

For incoming call push notifications, create a VoIP certificate through the Apple Developer Portal. Then, use the VoIP certificate to create a Push Credential in the Twilio Console. This Push Credential will be used as part of vending access tokens, and will enable a device to receive incoming calls.

For more information on Apple Push Notification Service, please see the Twilio Programmable Voice iOS Quickstart:
https://github.com/twilio/voice-quickstart-ios

### Capabilities
In Xcode, your application will need to define the following capabilities in order to make outgoing calls and receive incoming calls.

- Background Modes
  - Audio, AirPlay, and Picture in Picture
  - Voice over IP

- Push Notifications
