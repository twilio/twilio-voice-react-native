# Expo Support on Android Platforms

To support Expo on Android platforms, you will need to hook into Android lifecycle events, declare an Expo module to expose native APIs to the JS layer, and create an Expo Config Plugin.

## Summary

After following the below guides, you will have four new native files:

- `ExpoModule.kt` (a file declaring Expo Module methods to be used by the JS layer)
- `ExpoActivityLifecycleListener.java` (a file declaring Activity lifecycle hooks)
- `ExpoApplicationLifecycleListener.java` (a file declaring Application lifecycle hooks)
- `ExpoPackage.java` (a file declaring the Expo Package)

And you will have modified one build file:

- `android/build.gradle`

### Lifecycle Events

To add support for Expo on Android, you will have to leverage the Expo Modules API to hook into the Android Lifecycle events. You can read more about Android lifecycle events [here](https://developer.android.com/reference/android/app/Activity#activity-lifecycle).

The Twilio Voice React Native SDK requires hooking into these lifecycle events in both Bare and Expo React Native applications. The Voice RN SDK makes it convenient to hook into these lifecycle hooks by providing the `VoiceApplicationProxy` and `VoiceActivityProxy` classes. You can see how these classes are used in the [Java getting started guides](/docs/getting-started-java.md).

Instead of overriding the activity and application lifecycle callbacks, Expo exposes an API to hook into these events. You can read more about that [here](https://docs.expo.dev/modules/android-lifecycle-listeners/).

To use the Expo Modules API, you will need to create two files, an Activity lifecycle listener and an Application lifecycle listener. The following is an example of how to integrate the `VoiceApplicationProxy` with the Expo Modules API.

```java
public class ExpoApplicationLifecycleListener implements ApplicationLifecycleListener {
  VoiceApplicationProxy voiceApplicationProxy;

  @Override
  public void onCreate(Application application) {
    this.voiceApplicationProxy = new VoiceApplicationProxy(application);
    this.voiceApplicationProxy.onCreate();
  }
}
```

Here is an example of how to integrate the `VoiceActivityProxy` with the Expo Modules API.

```java
public class ExpoActivityLifecycleListener implements ReactActivityLifecycleListener {
  VoiceActivityProxy voiceActivityProxy;

  @Override
  public void onCreate(Activity activity, Bundle savedInstanceState) {
    this.voiceActivityProxy = new VoiceActivityProxy(activity, ...);
    this.voiceActivityProxy.onCreate(savedInstanceState);
  }

  @Override
  public boolean onNewIntent(Intent intent) {
    this.voiceActivityProxy.onNewIntent(intent);
  }

  @Override
  public void onDestroy(Activity activity) {
    this.voiceActivityProxy.onDestroy();
  }
}
```

### Expo Module

The Twilio Voice React Native SDK utilizes the Twilio Voice Android SDK under the hood. The file `TwilioVoiceReactNativeModule.java` exposes the functionality of the Twilio Voice Android SDK to the JS runtime of the React Native application.

To support Expo, an analogous Expo Module will need to be written that exposes the functionality of the Twilio Voice Android SDK in the same way. Please see [this document](https://docs.expo.dev/modules/module-api/) for more information about declaring an Expo Module.

Below is a very basic example of how to expose a method that invokes the `Voice.connect` method to make an outgoing call.

```kotlin
class ExpoModule : Module() {
  Function("voice_connect") {
    accessToken: String ->

    val context = appContext.reactContext
    if (context == null) {
      return@Function
    }

    val connectOptions = ConnectOptions.Builder(accessToken).build()
    val uuid = UUID.randomUUID()
    val callListenerProxy = CallListenerProxy(uuid, context)

    val callRecord = CallRecordDatabase.CallRecord(
      uuid,
      VoiceApplicationProxy.getVoiceServiceApi().connect(
        connectOptions,
        callListenerProxy
      ),
      "Callee", // provide a mechanism for determining the name of the callee
      HashMap(), // provide a mechanism for passing custom TwiML parameters
      CallRecord.Direction.Outgoing,
      "Display Name" // provide a mechanism for determining the notification display name of the callee
    )
    VoiceApplicationProxy.getCallRecordDatabase.add(callRecord)
  }
}
```

### Expo Package

To support Expo on Android platforms, your Expo module must be declared to the Expo Modules API by creating an Expo package.

Below is an example of how to declare an Expo package and hook the lifecycle listeners into the Expo Modules API.

```java
public class ExpoPackage implements Package {
  @Override
  public List<? extends ReactActivityLifecycleListener> createReactActivityLifecycleListeners(Context activityContext) {
    return Collections.singletonList(new ExpoActivityLifecycleListener());
  }

  @Override
  public List<? extends ApplicationLifecycleListener> createApplicationLifecycleListeners(Context applicationContext) {
    return Collections.singletonList(new ExpoApplicationLifecycleListener());
  }
}
```

### Config Plugin

TODO

### Gradle Build File

To build and include the required `ExpoModule.kt`, you will have to modify the `android/build.gradle` file to include the Kotlin compiler.

In your versions array, declare a Kotlin compiler version suitable for your needs. In this example, we will be using `1.9.24`

```gradle
buildscript {
  ext.versions = [
    ...
    "kotlin": "1.9.24"
  ]

  if (project == rootProject) {
    ...
    dependencies {
      ...
      classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:${versions.kotlin}"
    }
  }
}

apply plugin: "kotlin-android"

...
```
