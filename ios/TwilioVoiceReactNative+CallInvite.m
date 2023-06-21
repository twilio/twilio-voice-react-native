//
//  TwilioVoiceReactNative+CallInvite.m
//  TwilioVoiceReactNative
//
//  Copyright © 2023 Twilio, Inc. All rights reserved.
//

@import TwilioVoice;

#import "TwilioVoiceReactNative.h"
#import "TwilioVoiceReactNativeConstants.h"

@interface TwilioVoiceReactNative (CallInvite) <TVONotificationDelegate>

@end

@implementation TwilioVoiceReactNative (CallInvite)

- (void)callInviteReceived:(TVOCallInvite *)callInvite {
    self.callInviteMap[callInvite.uuid.UUIDString] = callInvite;

    [self sendEventWithName:kTwilioVoiceReactNativeScopeVoice
                       body:@{kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeVoiceEventCallInvite,
                              kTwilioVoiceReactNativeEventKeyCallInvite: [self callInviteInfo:callInvite]}];
}

- (void)cancelledCallInviteReceived:(TVOCancelledCallInvite *)cancelledCallInvite error:(NSError *)error {
    NSString *uuid;
    for (NSString *uuidKey in [self.callInviteMap allKeys]) {
        TVOCallInvite *callInvite = self.callInviteMap[uuidKey];
        if ([callInvite.callSid isEqualToString:cancelledCallInvite.callSid]) {
            uuid = uuidKey;
            break;
        }
    }
    NSAssert(uuid, @"No matching call invite");
    self.cancelledCallInviteMap[uuid] = cancelledCallInvite;

    [self sendEventWithName:kTwilioVoiceReactNativeScopeVoice
                       body:@{kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeVoiceEventCallInviteCancelled,
                              kTwilioVoiceReactNativeEventKeyCancelledCallInvite: [self cancelledCallInviteInfo:cancelledCallInvite],
                              kTwilioVoiceReactNativeVoiceErrorKeyError: @{kTwilioVoiceReactNativeVoiceErrorKeyCode: @(error.code),
                                                                           kTwilioVoiceReactNativeVoiceErrorKeyMessage: [error localizedDescription]}}];
    
    [self endCallWithUuid:[[NSUUID alloc] initWithUUIDString:uuid]];
}

@end
