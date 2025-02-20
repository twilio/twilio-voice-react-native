# Expo Support on Android Platforms
To support Expo on Android platforms, you will need to hook into Android lifecycle events, declare an Expo module to expose native APIs to the JS layer, and create an Expo Config Plugin.

### Lifecycle Events
Please see [this document](/docs/expo/android-lifecycle-events.md) for more information.

### Expo Module
Please see [this document](/docs/expo/android-module.md) for more information.

### Expo Package
Please see [this document](/docs/expo/android-package.md) for more information.

### Config Plugin
Please see [this document](/docs/expo/android-config-plugin.md) for more information.

## Summary

After following the above guides, you will have four native files:
- `ExpoModule.kt` (a file declaring Expo Module methods to be used by the JS layer)
- `ExpoActivityLifecycleListener.java` (a file declaring Activity lifecycle hooks)
- `ExpoApplicationLifecycleListener.java` (a file declaring Application lifecycle hooks)
- `ExpoPackage.java` (a file declaring the Expo Package)
