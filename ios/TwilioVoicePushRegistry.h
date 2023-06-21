//
//  TwilioVoicePushRegistry.h
//  TwilioVoiceReactNative
//
//  Copyright © 2022 Twilio, Inc. All rights reserved.
//

FOUNDATION_EXPORT NSString * const kTwilioVoicePushRegistryNotification;
FOUNDATION_EXPORT NSString * const kTwilioVoicePushRegistryEventType;
FOUNDATION_EXPORT NSString * const kTwilioVoicePushRegistryNotificationDeviceTokenUpdated;
FOUNDATION_EXPORT NSString * const kTwilioVoicePushRegistryNotificationDeviceToken;
FOUNDATION_EXPORT NSString * const kTwilioVoicePushRegistryNotificationIncomingPushReceived;
FOUNDATION_EXPORT NSString * const kTwilioVoicePushRegistryNotificationIncomingPushPayload;

@interface TwilioVoicePushRegistry : NSObject

- (void)updatePushRegistry;

@end
