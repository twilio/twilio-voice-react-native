# Android Lifecycle Events
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
