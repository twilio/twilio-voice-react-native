# Android Expo Module
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
