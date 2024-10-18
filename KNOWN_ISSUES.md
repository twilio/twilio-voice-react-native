# Known Issues

## Using an out-of-band Firebase Messaging service
If another service in your application declares itself as a Firebase Messaging
service, its functionality is likely to break, or the Twilio Voice RN SDK will
break. Please see this
[document](/docs/out-of-band-firebase-messaging-service.md) for details on how
to resolve this.
