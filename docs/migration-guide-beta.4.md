## Migration Guide for Twilio Voice React Native Beta.4
On Android, there have been significant improvements to the integration of the SDK at the (Java) 
native layer. These improvements simplify and encapsulate much of the integration complexity of 
the SDK and its interaction with the Android system.

The biggest changes relate to three areas...
* AndroidManifest.xml Simplifications
* Android Permission Handling
* Application & Main Activity Lifecycle/Event Handling 

For an example on how this is done, please look at the [reference application implementation](https://github.com/twilio/twilio-voice-react-native-app/tree/main)
or refer to the [pull request](https://github.com/twilio/twilio-voice-react-native-app/pull/129) 
demonstrating these changes.

#### AndroidManifest.xml Changes
In previous releases, users of the SDK had to manually update their application's AndroidManifest.xml 
to reflect changes in the SDK. These changes included, additional permissions or when 
Services, BroadcastReceivers, or additional Activities were added to the SDK. This is no longer the 
case. Now users of the SDK just need to define their main application activity and any additional
permissions their application may use (outside the scope of the SDK). For an example of this, please
refer to the reference app's [AndroidManifest.xml](https://github.com/twilio/twilio-voice-react-native-app/blob/main/app/android/app/src/main/AndroidManifest.xml).

#### Permission Management Changes
Applications using the SDK no longer need to explicitly request for permissions used by the SDK. The
SDK now encapsulates that logic and will request for the necessary permissions automatically. 
Furthermore, the application using the SDK can customize the reaction to a needed permission not 
being granted by the user.

When constructing an `VoiceActivityProxy`, one of the constructors arguments is a 
`PermissionsRationaleNotifier`interface. This interface has a single method named 
`displayRationale(final String permission)` which will be invoked when a needed permission has not
been granted by the user. For an example of how this works please refer to 
[MainActivity.java](https://github.com/twilio/twilio-voice-react-native-app/blob/8f0da0b95728d5bb198b26e889bf3dddbbd11776/app/android/app/src/main/java/com/twiliovoicereactnativereferenceapp/MainActivity.java#L36)
in the reference application.

#### Encapsulation of Application & Activity Lifecycle Management
Now applications using the SDK just need to construct two objects, `VoiceActivityProxy` for the 
application's main activity and `VoiceApplicationProxy` for the application's 
`android.app.Application` events.

###### How to wire up VoiceActivityProxy to your Main Activity
Add the `VoiceActivityProxy` as private member to your main activity class and construct it in
either the constructor (not in the `onCreate(...)` method). Then, the following activity methods
need to be overridden, `onCreate(...)`, `onDestroy(...)` and `onNewIntent(...)`. In the 
implementation of these methods, please call the corresponding matching methods in the 
`VoiceActivityProxy` member object. For a complete example, please refer to the reference 
application [here](https://github.com/twilio/twilio-voice-react-native-app/blob/main/app/android/app/src/main/java/com/twiliovoicereactnativereferenceapp/MainActivity.java).

###### How to wire up VoiceApplicationProxy to android.app.Application
Similar to steps for wiring up the `VoiceActivityProxy`, add the `VoiceApplicationProxy` as a 
private member to your Application class and construct it in the constructor. Then, the following
`android.app.Application` methods need to be overridden, `onCreate(...)` & `onTerminate(...)`. In
the implementation of these methods, please call the corresponding matching methods in the 
`VoiceApplicationProxy` member object. For a complete example, please refer to the reference 
application [here](https://github.com/twilio/twilio-voice-react-native-app/blob/main/app/android/app/src/main/java/com/twiliovoicereactnativereferenceapp/MainApplication.java)