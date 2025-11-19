//
//  TwilioVoicePushRegistry.m
//  TwilioVoiceReactNative
//
//  Copyright © 2022 Twilio, Inc. All rights reserved.
//

@import PushKit;
@import Foundation;
@import TwilioVoice;

#import "TwilioVoicePushRegistry.h"
#import "TwilioVoiceReactNative.h"
#import "TwilioVoiceReactNativeConstants.h"
#import <MoegoLogger/MGOTwilioVoiceHelper.h>

NSString * const kTwilioVoicePushRegistryNotification = @"TwilioVoicePushRegistryNotification";
NSString * const kTwilioVoicePushRegistryEventType = @"type";
NSString * const kTwilioVoicePushRegistryNotificationDeviceTokenUpdated = @"deviceTokenUpdated";
NSString * const kTwilioVoicePushRegistryNotificationDeviceToken = @"deviceToken";
NSString * const kTwilioVoicePushRegistryNotificationIncomingPushReceived = @"incomingPushReceived";
NSString * const kTwilioVoicePushRegistryNotificationIncomingPushPayload = @"incomingPushPayload";

@interface TwilioVoicePushRegistry () <PKPushRegistryDelegate>

@property (nonatomic, strong) PKPushRegistry *voipRegistry;
@property (nonatomic, copy) NSString *callInviteUuid;

@end

@implementation TwilioVoicePushRegistry

#pragma mark - TwilioVoicePushRegistry methods

- (void)updatePushRegistry {
    TwilioVoiceLogInvoke();
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
                                                          userInfo:@{kTwilioVoicePushRegistryEventType: kTwilioVoicePushRegistryNotificationDeviceTokenUpdated,
                                                                     kTwilioVoicePushRegistryNotificationDeviceToken: credentials.token}];
    }
}

- (void)pushRegistry:(PKPushRegistry *)registry
didReceiveIncomingPushWithPayload:(PKPushPayload *)payload
             forType:(PKPushType)type
withCompletionHandler:(void (^)(void))completion {
    [MGOTwilioVoiceHelper setIncomingContext:payload.dictionaryPayload];
    mgoCallInfoLog(@"push received", @"twilio_voice_incoming_push_received", nil, nil, payload.dictionaryPayload[@"twi_call_sid"]);
    if ([type isEqualToString:PKPushTypeVoIP]) {
        [[NSNotificationCenter defaultCenter] postNotificationName:kTwilioVoicePushRegistryNotification
                                                            object:nil
                                                          userInfo:@{kTwilioVoicePushRegistryEventType: kTwilioVoicePushRegistryNotificationIncomingPushReceived,
                                                                     kTwilioVoicePushRegistryNotificationIncomingPushPayload: payload.dictionaryPayload}];
    }

    completion();
}

- (void)pushRegistry:(PKPushRegistry *)registry
        didInvalidatePushTokenForType:(NSString *)type {
    TwilioVoiceLogInvoke();
    // TODO: notify view-controller to emit event that the push-registry has been invalidated
}

@end
