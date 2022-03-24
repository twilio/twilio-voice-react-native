//
//  TwilioVoicePushRegistry.h
//  TwilioVoiceReactNative
//
//  Copyright © 2021 Twilio, Inc. All rights reserved.
//

FOUNDATION_EXPORT NSString * const kTwilioVoicePushRegistryNotification;
FOUNDATION_EXPORT NSString * const kTwilioVoicePushRegistryNotificationDeviceTokenUpdated;
FOUNDATION_EXPORT NSString * const kTwilioVoicePushRegistryNotificationDeviceTokenKey;
FOUNDATION_EXPORT NSString * const kTwilioVoicePushRegistryNotificationCallInviteKey;
FOUNDATION_EXPORT NSString * const kTwilioVoicePushRegistryNotificationCancelledCallInviteKey;

@interface TwilioVoicePushRegistry : NSObject

- (void)updatePushRegistry;

@end
