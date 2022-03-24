//
//  TwilioVoicePushRegistry.m
//  TwilioVoiceReactNative
//
//  Copyright © 2021 Twilio, Inc. All rights reserved.
//

@import PushKit;
@import Foundation;
@import TwilioVoice;

#import "TwilioVoicePushRegistry.h"
#import "TwilioVoiceReactNative.h"
#import "TwilioVoiceReactNativeConstants.h"

NSString * const kTwilioVoicePushRegistryNotification = @"TwilioVoicePushRegistryNotification";
NSString * const kTwilioVoicePushRegistryNotificationDeviceTokenUpdated = @"deviceTokenUpdated";
NSString * const kTwilioVoicePushRegistryNotificationDeviceTokenKey = @"deviceToken";
NSString * const kTwilioVoicePushRegistryNotificationCallInviteKey = @"userInfoCallInvite";
NSString * const kTwilioVoicePushRegistryNotificationCancelledCallInviteKey = @"userInfoCancelledCallInvite";

@interface TwilioVoicePushRegistry () <PKPushRegistryDelegate, TVONotificationDelegate>

@property (nonatomic, strong) PKPushRegistry *voipRegistry;
@property (nonatomic, copy) NSString *callInviteUuid;

@end

@implementation TwilioVoicePushRegistry

#pragma mark - TwilioVoicePushRegistry methods

- (void)updatePushRegistry {
    self.voipRegistry = [[PKPushRegistry alloc] initWithQueue:dispatch_get_main_queue()];
    self.voipRegistry.delegate = self;
    self.voipRegistry.desiredPushTypes = [NSSet setWithObject:PKPushTypeVoIP];
}

#pragma mark - PKPushRegistryDelegate

- (void)pushRegistry:(PKPushRegistry *)registry
didUpdatePushCredentials:(PKPushCredentials *)credentials
             forType:(NSString *)type {
    if ([type isEqualToString:PKPushTypeVoIP]) {
        [[NSNotificationCenter defaultCenter] postNotificationName:kTwilioVoicePushRegistryNotification
                                                            object:nil
                                                          userInfo:@{kTwilioVoiceReactNativeEventKeyType: kTwilioVoicePushRegistryNotificationDeviceTokenUpdated,
                                                                     kTwilioVoicePushRegistryNotificationDeviceTokenKey: credentials.token}];
    }
}

// iOS 10 and earlier
- (void)pushRegistry:(PKPushRegistry *)registry
didReceiveIncomingPushWithPayload:(PKPushPayload *)payload
             forType:(NSString *)type {
    if ([type isEqualToString:PKPushTypeVoIP]) {
        // TODO: notify view-controller to emit event that incoming push received
    }
}

// iOS 11 and later
- (void)pushRegistry:(PKPushRegistry *)registry
didReceiveIncomingPushWithPayload:(PKPushPayload *)payload
             forType:(PKPushType)type
withCompletionHandler:(void (^)(void))completion {
    if ([type isEqualToString:PKPushTypeVoIP]) {
        // TODO: notify view-controller to emit event that incoming push received
        [TwilioVoiceSDK handleNotification:payload.dictionaryPayload delegate:self delegateQueue:nil];
    }

    if ([[[UIDevice currentDevice] systemVersion] floatValue] < 13.0) {
        // TODO: save the completion handler for later fulfillment
    } else {
        completion();
    }
}

- (void)pushRegistry:(PKPushRegistry *)registry
        didInvalidatePushTokenForType:(NSString *)type {
    // TODO: notify view-controller to emit event that the push-registry has been invalidated
}

#pragma mark - TVONotificationDelegate

- (void)callInviteReceived:(TVOCallInvite *)callInvite {
    TVOCallInvite *invite = callInvite;
    [[NSNotificationCenter defaultCenter] postNotificationName:kTwilioVoicePushRegistryNotification
                                                        object:nil
                                                      userInfo:@{kTwilioVoiceReactNativeEventKeyType: VOICE_EVENT_CALL_INVITE,
                                                                 kTwilioVoicePushRegistryNotificationCallInviteKey: invite}];
}

- (void)cancelledCallInviteReceived:(TVOCancelledCallInvite *)cancelledCallInvite error:(NSError *)error {
    TVOCancelledCallInvite *cancelledInvite = cancelledCallInvite;
    [[NSNotificationCenter defaultCenter] postNotificationName:kTwilioVoicePushRegistryNotification
                                                        object:nil
                                                      userInfo:@{kTwilioVoiceReactNativeEventKeyType: VOICE_EVENT_CALL_INVITE_CANCELLED,
                                                                 kTwilioVoicePushRegistryNotificationCancelledCallInviteKey: cancelledInvite,
                                                                 VOICE_EVENT_ERROR: @{kTwilioVoiceReactNativeEventKeyErrorCode: @(error.code),
                                                                                      kTwilioVoiceReactNativeEventKeyErrorMessage: [error localizedDescription]}}];
}

@end
