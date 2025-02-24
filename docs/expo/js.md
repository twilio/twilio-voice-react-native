# Expo Support JS and Configuration Files

## JS Entry Point

To support Expo, the SDK will need to declare a new JS entry point that consumes the new Android methods declared in `ExpoModule.kt`.

For example, if your `ExpoModule.kt` declares a `voice_connect` method like so:

```kotlin
...
Function("voice_connect") {
  accessToken: String ->
  ...
}
...
```

You will need to declare a JS file that consumes and exposes this new method, analogous to how classes such as `Voice` and `Call` in the SDK currently invoke `NativeModule`. Below is a rough example of how you would start this process. Note that this guide implies that the Expo Modules API is only used for the Android platform, hence why the iOS methods are using the React Native module and Android methods are using the Expo module.

```javascript
import { NativeModule, Platform } from './common'; // the existing native wrappers in the JS layer of the SDK
import { requireNativeModule } from 'expo-modules-core';

class NativeModule {
  private androidExpoNativeModule: ... = requireNativeModule(...); // create a type and use the proper string for your configuration
  async voice_connect(...) {
    if (Platform.OS === 'android') {
      return androidExpoNativeModule.voice_connect(...);
    } else if (Platform.OS === 'ios') {
      return NativeModule.voice_connect_ios(...);
    }
  }
}
```

If both iOS and Android use the Expo Modules API, then this "common entry point" file may not be necessary. Depending on your use case, it may suffice to just use `requireNativeModule` from `expo-modules-core` in `Voice.tsx` etc.

## Expo Configuration

To have the Expo CLI correctly instantiate the Android Expo Module, the Expo CLI will need to be pointed to the correct Android class where you declare your Expo module. As an example, if you have `ExpoModule.java` with the class:

```java
class ExpoModule {
  ...
}
```

Then you will need to point to this class in `expo-module.config.json` like so:

```json
{
  "platforms": ["android"],
  "android": {
    "modules": ["com.twiliovoicereactnative.ExpoModule"]
  }
}
```
