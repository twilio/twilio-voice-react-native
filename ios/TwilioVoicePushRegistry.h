//
//  TwilioVoicePushRegistry.h
//  TwilioVoiceReactNative
//
//  Copyright © 2021 Twilio, Inc. All rights reserved.
//

FOUNDATION_EXPORT NSString * const kTwilioVoicePushRegistryNotification;
FOUNDATION_EXPORT NSString * const kTwilioVoicePushRegistryNotificationType;
FOUNDATION_EXPORT NSString * const kTwilioVoicePushRegistryNotificationDeviceTokenUpdated;
FOUNDATION_EXPORT NSString * const kTwilioVoicePushRegistryNotificationDeviceTokenKey;
FOUNDATION_EXPORT NSString * const kTwilioVoicePushRegistryNotificationCallInviteRecelved;
FOUNDATION_EXPORT NSString * const kTwilioVoicePushRegistryNotificationCallInviteCancelled;

@interface TwilioVoicePushRegistry : NSObject

- (void)updatePushRegistry;

@end
