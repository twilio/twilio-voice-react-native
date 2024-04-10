# Custom Notifications
The SDK allows developers to customize notifications to fit the theme and branding of their use case. Each platform differs in how the notification can be customized.

## Android
The SDK utilizes the built-in call notifications provided by the native Android system. In this way, the notifications layouts are pre-set and follow Android UX standards. Because the SDK leverages the built-in call notifications, they have cross-version compatibilty and work on most versions of Android, new or old.

There are three types of notifications that the SDK generates.

- Incoming call invites.
- Outgoing calls.
- In-progress calls.

Customizing the "incoming call" notification will customize the notification that appears for pending incoming calls. When the call is answered, the notification (and customization) for an "in-progress" call will replace the "incoming call invite" notification.

The same applies for an "outgoing call", when the call is connected, the "in-progress" notfication will replace the "outgoing call" notification.

### Title
To customize the title of a notification, you will need to define custom values in your `strings.xml` file. This file is located in the native Android code of your React Native application. The following table details which custom `string.xml` resources you'll need to define:

| Notification Type | Resource ID |
| - | - |
| Incoming Call Invite | `incoming_call_caller_name_text` |
| Outgoing Call | `outgoing_call_caller_name_text` |
| In-progress Call | `answered_call_caller_name_text` |

The following is an example:
```xml
<resources>
  // Removed for brevity...
  <string name="incoming_call_caller_name_text">${from}</string>
  <string name="outgoing_call_caller_name_text">${to}</string>
  <string name="answered_call_caller_name_text">${from}</string>
</resources>
```

The default location of this file in a bare React Native project is `android/app/src/main/res/values/`.

This [folder](https://github.com/twilio/twilio-voice-react-native/tree/latest/test/app/android/app/src/main/res/values) would be where we would add or edit the `strings.xml` file for this feature in the SDK's built-in Test App.

#### Templating Notifcation Titles
When displaying the title, the SDK will perform special string templating behavior for certain keywords. For incoming and in-progress calls, the value `${from}` will be replaced with the `Call`/`CallInvite`'s `.from` value. For example:

```xml
<resources>
  // Removed for brevity...
  <string name="incoming_call_caller_name_text">Foo: ${from}</string>
  <string name="answered_call_caller_name_text">Bar: ${from}</string>
</resources>
```

would result in your titles displaying as

```
Foo: alice
```

and

```
Bar: bob
```

### Icons
The icons for each notification can also be customized. Adding a drawable resource will display that resource as the icon for a notification. The following is a table mapping the notification to a resource ID.

| Notification Type | Resource ID |
| - | - |
| Incoming Call Invite | `incoming_call_small_icon` |
| Outgoing Call | `outgoing_call_small_icon` |
| In-progress Call | `answered_call_small_icon` |

For example, if you add a `incoming_call_small_icon.png` file to the folder `android/app/src/main/res/drawable/`, then that image will be used as the icon of the incoming call notification.

This [folder](https://github.com/twilio/twilio-voice-react-native/tree/latest/test/app/android/app/src/main/res/drawable) would be where we would place icons for customizing the SDK's Test App.

## iOS
Notifications on iOS are handled by the built-in CallKit framework. There are a few APIs that the SDK exposes to customize the notifications.

### Caller Handle
When receiving an incoming call invite, the `CallInvite` class exposes a method `.updateCallerHandle(handle: string)`. You can use the API like so:

```typescript
voice.on(Voice.Event.CallInvite, (callInvite) => {
  const from = callInvite.getFrom();
  callInvite.updateCallerHandle(`Foo: ${from}`);
});
```

When an incoming call arrives, it will set the CallKit handle to "Foo: alice" if the "from" value was "alice". This handle will apply for the duration of the call.

Please see the [API docs](https://github.com/twilio/twilio-voice-react-native/blob/latest/docs/api/voice-react-native-sdk.callinvite_class.updatecallerhandle_method.md) for more information.
