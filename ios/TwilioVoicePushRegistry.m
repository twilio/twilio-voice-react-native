//
//  TwilioVoicePushRegistry.m
//  TwilioVoiceReactNative
//
//  Copyright © 2021 Twilio, Inc. All rights reserved.
//

@import PushKit;
@import Foundation;
@import CallKit;

#import "TwilioVoicePushRegistry.h"

NSString * const kTwilioVoicePushRegistryNotification = @"TwilioVoicePushRegistryNotification";
NSString * const kTwilioVoicePushRegistryNotificationType = @"type";
NSString * const kTwilioVoicePushRegistryNotificationDeviceTokenUpdated = @"deviceTokenUpdated";
NSString * const kTwilioVoicePushRegistryNotificationDeviceTokenKey = @"deviceToken";

@interface TwilioVoicePushRegistry () <PKPushRegistryDelegate, CXProviderDelegate>

@property (nonatomic, strong) PKPushRegistry *voipRegistry;
@property (nonatomic, strong) CXProvider *callKitProvider;

@end

@implementation TwilioVoicePushRegistry

#pragma mark - TwilioVoicePushRegistry methods

- (void)updatePushRegistry {
    CXProviderConfiguration *configuration = [[CXProviderConfiguration alloc] initWithLocalizedName:@"Twilio Voice"];
    configuration.maximumCallGroups = 1;
    configuration.maximumCallsPerCallGroup = 1;
    
    self.callKitProvider = [[CXProvider alloc] initWithConfiguration:configuration];
    [self.callKitProvider setDelegate:self queue:nil];
    
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
                                                          userInfo:@{kTwilioVoicePushRegistryNotificationType: kTwilioVoicePushRegistryNotificationDeviceTokenUpdated,
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

#pragma mark - CXProviderDelegate

- (void)providerDidReset:(CXProvider *)provider {
    
}

@end
