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

// Fix receive notification when the app is in kill state
#pragma mark - Singleton Implementation
+ (instancetype)sharedInstance {
    static TwilioVoicePushRegistry *sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [[self alloc] init];
        [sharedInstance updatePushRegistry];
    });
    return sharedInstance;
}
+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

#pragma mark - TwilioVoicePushRegistry methods

- (void)updatePushRegistry {
     // Fix receive notification when the app is in kill state
    
    // self.voipRegistry = [[PKPushRegistry alloc] initWithQueue:dispatch_get_main_queue()];
    // self.voipRegistry.delegate = self;
    // self.voipRegistry.desiredPushTypes = [NSSet setWithObject:PKPushTypeVoIP];
    dispatch_queue_t mainQueue = dispatch_get_main_queue();
    dispatch_async(mainQueue, ^{
        // --- Create a push registry object
        self.voipRegistry = [[PKPushRegistry alloc] initWithQueue:mainQueue];
        // --- Set the registry's delegate to the singleton itself
        self.voipRegistry.delegate = self;
        // --- Set the push type to VoIP
        self.voipRegistry.desiredPushTypes = [NSSet setWithObject:PKPushTypeVoIP];
    });
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
    // TODO: notify view-controller to emit event that the push-registry has been invalidated
}

@end
