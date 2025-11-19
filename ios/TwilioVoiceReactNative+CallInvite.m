//
//  TwilioVoiceReactNative+CallInvite.m
//  TwilioVoiceReactNative
//
//  Copyright © 2023 Twilio, Inc. All rights reserved.
//

@import TwilioVoice;

#import "TwilioVoiceReactNative.h"
#import "TwilioVoiceReactNativeConstants.h"
#import <MoegoLogger/MGOTwilioVoiceHelper.h>

@interface TwilioVoiceReactNative (CallInvite) <TVONotificationDelegate>

@end

@implementation TwilioVoiceReactNative (CallInvite)

- (void)callInviteReceived:(TVOCallInvite *)callInvite {
    mgoCallInfoLog(@"call invite received", @"twilio_voice_call_invite_received", nil, nil, callInvite.callSid);
    
    [MGOTwilioVoiceHelper sendAudioStatusEvent];
    
    self.callInviteMap[callInvite.uuid.UUIDString] = callInvite;
    
    [self reportNewIncomingCall:callInvite];

    [self sendEventWithName:kTwilioVoiceReactNativeScopeVoice
                       body:@{
                         kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeVoiceEventTypeValueIncomingCallInvite,
                         kTwilioVoiceReactNativeEventKeyCallInvite: [self callInviteInfo:callInvite]}];
}

- (void)cancelledCallInviteReceived:(TVOCancelledCallInvite *)cancelledCallInvite error:(NSError *)error {
    TwilioVoiceLogInvoke();
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
    
    mgoCallInfoLog(@"call cancelled", @"twilio_voice_call_cancelled", nil, nil, cancelledCallInvite.callSid);
    // 取消通话移除context
    [MGOTwilioVoiceHelper removeIncomingContext:cancelledCallInvite.callSid];

    [self sendEventWithName:kTwilioVoiceReactNativeScopeCallInvite
                       body:@{
                         kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeCallInviteEventTypeValueCancelled,
                         kTwilioVoiceReactNativeCallInviteEventKeyCallSid: cancelledCallInvite.callSid,
                         kTwilioVoiceReactNativeEventKeyCancelledCallInvite: [self cancelledCallInviteInfo:cancelledCallInvite],
                         kTwilioVoiceReactNativeVoiceErrorKeyError: @{
                           kTwilioVoiceReactNativeVoiceErrorKeyCode: @(error.code),
                           kTwilioVoiceReactNativeVoiceErrorKeyMessage: [error localizedDescription]}}];
    
    [self.callInviteMap removeObjectForKey:uuid];
    
    [self endCallWithUuid:[[NSUUID alloc] initWithUUIDString:uuid]];
}

@end
