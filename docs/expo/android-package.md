# Android Expo Package
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
