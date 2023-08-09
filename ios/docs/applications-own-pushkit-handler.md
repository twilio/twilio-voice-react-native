## Use your application's own iOS PushKit handler

The React Native Voice SDK uses Apple's VoIP Service for incoming call notification delivery on iOS. The application can choose between letting the SDK handle [iOS PushKit](https://developer.apple.com/documentation/pushkit?language=objc) updates automatically or using application's own existing PushKit delegate module.

To allow the SDK to handle PushKit updates internally, call the `Voice.initializePushRegistry()` method as soon as the `Voice` module is initialized. See `ios/TwilioVoicePushRegistry.m` for more information.

```
  const voice = new Voice();
  await voice.initializePushRegistry();
```

To use your existing iOS PushKit delegate module, a few steps need to be done by the application:

- Provide the PushKit device token (in `NSData`) to the React Native Voice SDK
- Provide the PushKit notification payload (in `NSDictionary`) to the React Native Voice SDK

### PushKit device token updated

Upon receiving the PushKit device token update, post a notification and include the device token (in the form of `NSData`) in the `userInfo`. The device token will later be used when calling the `Voice.register()` method.

```.objc
- (void)pushRegistry:(PKPushRegistry *)registry
didUpdatePushCredentials:(PKPushCredentials *)credentials
             forType:(NSString *)type {
    if ([type isEqualToString:PKPushTypeVoIP]) {
        [[NSNotificationCenter defaultCenter] postNotificationName:@"TwilioVoicePushRegistryNotification"
                                                            object:nil
                                                          userInfo:@{@"type": @"deviceTokenUpdated",
                                                                     @"deviceToken": credentials.token}];
    }
}
```

### Incoming call push notification received

Upon receiving the Twilio Voice incoming call notification, post a notification and include the notification payload in the `userInfo`.

```.objc
- (void)pushRegistry:(PKPushRegistry *)registry
didReceiveIncomingPushWithPayload:(PKPushPayload *)payload
             forType:(PKPushType)type
withCompletionHandler:(void (^)(void))completion {
    if ([type isEqualToString:PKPushTypeVoIP]) {
        [[NSNotificationCenter defaultCenter] postNotificationName:@"TwilioVoicePushRegistryNotification"
                                                            object:nil
                                                          userInfo:@{@"type": @"incomingPushReceived",
                                                                     @"incomingPushPayload": payload.dictionaryPayload}];
    }

    completion();
}];
```

A `CallInvite` event will be raised to the application so the user can accept or reject the call invite.

### Reporting a new incoming call to iOS CallKit

The React Native Voice SDK uses Apple's VoIP Service for delivering incoming call notifications. The React Native Voice SDK automatically reports a new incoming call to CallKit upon the `callInviteReceived:` callback to ensure it happens before completing PushKit callback handler. For more information, check out the [Responding to VoIP Notifications from PushKit](https://developer.apple.com/documentation/pushkit/responding_to_voip_notifications_from_pushkit?language=objc) article by Apple.

To report an incoming call to iOS CallKit, the SDK uses the `from` value of the call invite as the caller's name. The format of this value varies depending on the `callerId` used when making the call to the mobile client. To modify or use a different value when reporting to CallKit, modify the `reportNewIncomingCall:` method in `ios/TwilioVoiceReactNative+CallKit.m`:

```.objc
/* Example of removing "client:" prefix in the `from` value */

- (void)reportNewIncomingCall:(TVOCallInvite *)callInvite {
    // If "displayName" is passed as a custom parameter in the TwiML application,
    // it will be used as the caller name.
  
    NSString *handleName = callInvite.from;
    if ([[handleName substringToIndex:7] isEqualToString:@"client:"]) {
        [handleName = handleName stringByReplacingCharactersInRange:NSMakeRange(0, 7) withString:@""];
    }
    
    CXHandle *callHandle = [[CXHandle alloc] initWithType:CXHandleTypePhoneNumber value:handleName];

    CXCallUpdate *callUpdate = [[CXCallUpdate alloc] init];
    callUpdate.remoteHandle = callHandle;
    callUpdate.localizedCallerName = handleName;
    callUpdate.supportsDTMF = YES;
    callUpdate.supportsHolding = YES;
    callUpdate.supportsGrouping = NO;
    callUpdate.supportsUngrouping = NO;
    callUpdate.hasVideo = NO;

    [self.callKitProvider reportNewIncomingCallWithUUID:callInvite.uuid update:callUpdate completion:^(NSError *error) {
        if (!error) {
            NSLog(@"Incoming call successfully reported.");
        } else {
            NSLog(@"Failed to report incoming call: %@.", error);
        }
    }];
}
```
