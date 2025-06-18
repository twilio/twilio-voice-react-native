The functionality detailed in this document was added in `1.6.0` of the
`@twilio/voice-react-native-sdk`.

# Using Full Screen Notifications on Android
The `@twilio/voice-react-native-sdk` Starting with Android 14 (API 34),
full screen intents are only available for alarm and phone calling
applications and require user approval to enable. This is a departure
from previous versions of Android.

This document provides details on how to disable the use of full screen
notifications if desired.

## Disabling Full Screen Notifications on Android
To disable full screen notifications, you can add a `config.xml` file
in the `src/main/res/values/` folder within your `android/app/`
folder. Including the following content within this file will disable
the use of full screen notifications.
```
<bool name="twiliovoicereactnative_fullscreennotification_enabled">false</bool>
```
See [this file](/android/src/main/res/values/config.xml) for more details.

With full screen notifications disabled, the SDK will not ask for user
permissions for enabling it and it will not use full screen
notifications for incoming phone calls.
