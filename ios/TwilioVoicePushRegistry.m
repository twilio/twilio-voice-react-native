//
//  TwilioVoicePushRegistry.m
//  TwilioVoiceReactNative
//
//  Copyright © 2021 Twilio, Inc. All rights reserved.
//

@import PushKit;
@import Foundation;
@import CallKit;
@import TwilioVoice;

#import "TwilioVoicePushRegistry.h"

NSString * const kTwilioVoicePushRegistryNotification = @"TwilioVoicePushRegistryNotification";
NSString * const kTwilioVoicePushRegistryNotificationType = @"type";
NSString * const kTwilioVoicePushRegistryNotificationDeviceTokenUpdated = @"deviceTokenUpdated";
NSString * const kTwilioVoicePushRegistryNotificationDeviceTokenKey = @"deviceToken";
NSString * const kTwilioVoicePushRegistryNotificationCallInviteRecelved = @"callInvite";
NSString * const kTwilioVoicePushRegistryNotificationCallInviteCancelled = @"canceledCallInvite";

@interface TwilioVoicePushRegistry () <PKPushRegistryDelegate, TVONotificationDelegate>

@property (nonatomic, strong) PKPushRegistry *voipRegistry;
@property (nonatomic, copy) NSString *callInviteUuid;

@end

@implementation TwilioVoicePushRegistry

#pragma mark - TwilioVoicePushRegistry methods

- (void)updatePushRegistry {
    [self initializeCallKit];
    [self createAudioDevice];
    
    self.voipRegistry = [[PKPushRegistry alloc] initWithQueue:dispatch_get_main_queue()];
    self.voipRegistry.delegate = self;
    self.voipRegistry.desiredPushTypes = [NSSet setWithObject:PKPushTypeVoIP];
}

- (void)createAudioDevice {
    self.audioDevice = [TVODefaultAudioDevice audioDevice];
    TwilioVoiceSDK.audioDevice = self.audioDevice;
}

- (void)initializeCallKit {
    CXProviderConfiguration *configuration = [[CXProviderConfiguration alloc] initWithLocalizedName:@"Twilio Voice"];
    configuration.maximumCallGroups = 1;
    configuration.maximumCallsPerCallGroup = 1;
    
    self.callKitProvider = [[CXProvider alloc] initWithConfiguration:configuration];
    [self.callKitProvider setDelegate:self queue:nil];
    self.callKitCallController = [CXCallController new];
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
    NSLog(@"Call invite received");
    
    // TODO: more incoming call info in the userInfo dictionary
    [[NSNotificationCenter defaultCenter] postNotificationName:kTwilioVoicePushRegistryNotification
                                                        object:nil
                                                      userInfo:@{kTwilioVoicePushRegistryNotificationType: kTwilioVoicePushRegistryNotificationCallInviteRecelved}];

    self.callInviteUuid = [callInvite.uuid UUIDString];
    [self reportNewIncomingCall:callInvite];
}

- (void)cancelledCallInviteReceived:(TVOCancelledCallInvite *)cancelledCallInvite error:(NSError *)error {
    NSLog(@"Call invite canceled");
    
    // TODO: more incoming call info in the userInfo dictionary
    [[NSNotificationCenter defaultCenter] postNotificationName:kTwilioVoicePushRegistryNotification
                                                        object:nil
                                                      userInfo:@{kTwilioVoicePushRegistryNotificationType: kTwilioVoicePushRegistryNotificationCallInviteCancelled}];
    
    [self endCallWithUuid:self.callInviteUuid];
}

@end
