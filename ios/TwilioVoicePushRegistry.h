//
//  TwilioVoicePushRegistry.h
//  TwilioVoiceReactNative
//
//  Copyright © 2021 Twilio, Inc. All rights reserved.
//

FOUNDATION_EXPORT NSString * const kTwilioVoicePushRegistryNotification;
FOUNDATION_EXPORT NSString * const kTwilioVoicePushRegistryType;
FOUNDATION_EXPORT NSString * const kTwilioVoicePushRegistryDeviceTokenUpdated;

@interface TwilioVoicePushRegistry : NSObject

- (void)updatePushRegistry;

@end
