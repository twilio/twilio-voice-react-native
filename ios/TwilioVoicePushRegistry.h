//
//  TwilioVoicePushRegistry.h
//  TwilioVoiceReactNative
//
//  Copyright © 2021 Twilio, Inc. All rights reserved.
//

@class CXProvider;
@class CXCallController;
@class TVOCallInvite;
@class TVOCall;
@class TVODefaultAudioDevice;

@import CallKit;

FOUNDATION_EXPORT NSString * const kTwilioVoicePushRegistryNotification;
FOUNDATION_EXPORT NSString * const kTwilioVoicePushRegistryNotificationType;
FOUNDATION_EXPORT NSString * const kTwilioVoicePushRegistryNotificationDeviceTokenUpdated;
FOUNDATION_EXPORT NSString * const kTwilioVoicePushRegistryNotificationDeviceTokenKey;
FOUNDATION_EXPORT NSString * const kTwilioVoicePushRegistryNotificationCallInviteRecelved;
FOUNDATION_EXPORT NSString * const kTwilioVoicePushRegistryNotificationCallInviteCancelled;

@interface TwilioVoicePushRegistry : NSObject

@property (nonatomic, strong) TVOCallInvite *callInvite;
@property (nonatomic, strong) TVOCall *call;
@property (nonatomic, strong) TVODefaultAudioDevice *audioDevice;
@property (nonatomic, strong) CXProvider *callKitProvider;
@property (nonatomic, strong) CXCallController *callKitCallController;
// Indicates if the disconnect is triggered from app UI, instead of the system Call UI
@property (nonatomic, assign) BOOL userInitiatedDisconnect;

- (void)updatePushRegistry;

@end

@interface TwilioVoicePushRegistry (CallKit)

- (void)reportNewIncomingCall:(TVOCallInvite *)callInvite;
- (void)endCallWithUuid:(NSString *)uuid;

@end
