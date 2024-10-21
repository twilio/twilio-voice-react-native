The functionality detailed in this document was added in `1.2.1` of the
`@twilio/voice-react-native-sdk`.

# Using an out-of-band Firebase Messaging service
The `@twilio/voice-react-native-sdk` includes a built-in Firebase Messaging
service to allow users to register and listen for incoming calls. However, it
is common that other libraries will have the same requirement of listening for
Firebase messages. Due to restrictions placed by Android, only one service per
application can listen for Firebase messages. If you use another library that
declares a Firebase message listener, it is likely to break Twilio's incoming
call functionality within your application.

This document provides details on how to disable the SDK's built-in Firebase
Messaging service, and how to retain the SDK's incoming call functionality.

## Disabling the built-in Firebase Messaging service
To disable the built-in Firebase Messaging service, you can add a
`config.xml` file in the `src/main/res/values/` folder within your
`android/app/` folder.
Including the following content within this file will disable the built-in
Firebase Messaging service:
```
<bool name="twiliovoicereactnative_firebasemessagingservice_enabled">false</bool>
```
See [this file](/android/src/main/res/values/config.xml) for more details.

With the built-in Firebase Messaging service disabled, any other Firebase
Messaging service will be able to listen for Firebase messages.

## voice.handleFirebaseMessage API
Firebase messages can now be passed into the Voice SDK from any other source.

The following API has been implemented to facilitate this:
```ts
import { Voice } from '@twilio/voice-react-native-sdk';
const voice = new Voice();

const remoteMessage = ...; // this remote message should be provided by a common firebase message service that is separate from the Twilio Voice RN SDK
const didHandleMessage = await voice.handleFirebaseMessage(remoteMessage);
if (didHandleMessage) {
  // the Twilio Voice RN SDK was able to parse and handle the message as an incoming call
}
```

The most common third-party library that our team has seen used as a common
Firebase messaging service is from the
[React Native Firebase](https://rnfirebase.io/) team. More specifically, their
Cloud Messaging library: `@react-native-firebase/messaging`. Their library will
be used in further examples in this document.
```ts
// preferably in your index.js/index.ts file
// or, as early as possible in your application
import messaging from '@react-native-firebase/messaging';
import { Voice } from '@twilio/voice-react-native-sdk';

const voice = new Voice();

messaging().onMessage(async (remoteMessage) => {
  voice.handleFirebaseMessage(remoteMessage.data); // important, note the `.data` here
});

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  voice.handleFirebaseMessage(remoteMessage.data); // likewise, note the `.data` here
});
```
