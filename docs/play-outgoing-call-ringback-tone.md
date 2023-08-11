## Play outgoing call ringback tone while waiting for the callee to answer the call

When making calls using the React Native Voice SDK in your Android or iOS apps, the SDK starts streaming audio bi-directionally when the call is connected. The timing of the call transitions to the `connected` state depends on the value of the [answerOnBridge flag of the <Dial> TwiML verb](https://www.twilio.com/docs/voice/twiml/dial#answeronbridge). The call will immediately transition from `ringing` to `connected` once the mobile app has connected to the TwiML application and a ringback tone will start playing while waiting for the callee to answer the call. The default value of the `answerOnBridge` flag is true, which means the call will only transition to connected when the callee actually answers the call. In this case the caller won’t hear anything until the call is connected and the media connection established.

Follow these steps to include the sound file to the app project, and the SDK will automatically play the ringback if the file is presented under the path or in the app bundle.

### Android

Include a sound file named `ringtone.wav` and place the file under `android/app/src/main/res/raw`.

### iOS

Include a sound file named `ringtone.wav` into the Xcode project of the app. Note that the path of the file does not matter as long as the file is properly added to the app bundle.
