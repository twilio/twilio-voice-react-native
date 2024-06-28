//
//  TwilioVoiceReactNative+CallMessage.m
//  TwilioVoiceReactNative
//
//  Copyright © 2024 Twilio, Inc. All rights reserved.
//

@import TwilioVoice;

#import "TwilioVoiceReactNative.h"
#import "TwilioVoiceReactNativeConstants.h"

@interface TwilioVoiceReactNative (CallMessage) <TVOCallMessageDelegate>

@end

@implementation TwilioVoiceReactNative (CallMessage)

#pragma mark - TVOCallMessageDelegate (Call)

- (void)messageReceivedForCallSid:(NSString *)callSid message:(TVOCallMessage *)callMessage {
    NSArray *keys = self.callMap.allKeys;
    for (NSString *uuid in keys) {
        TVOCall *call = self.callMap[uuid];
        if ([call.sid isEqualToString:callSid]) {
            [self sendEventWithName:kTwilioVoiceReactNativeScopeCall
                               body:@{kTwilioVoiceReactNativeEventKeyCall: [self callInfo:call],
                                      kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeCallEventMessageReceived,
                                      kTwilioVoiceReactNativeJSEventKeyCallMessageInfo: [self callMessageInfo:callMessage]}];
            return;
        }
    }
    
    keys = self.callInviteMap.allKeys;
    for (NSString *uuid in keys) {
        TVOCallInvite *callInvite = self.callInviteMap[uuid];
        if ([callInvite.callSid isEqualToString:callSid]) {
            [self sendEventWithName:kTwilioVoiceReactNativeScopeCallInvite
                               body:@{kTwilioVoiceReactNativeCallInviteEventKeyCallSid: callSid,
                                      kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeCallEventMessageReceived,
                                      kTwilioVoiceReactNativeJSEventKeyCallMessageInfo: [self callMessageInfo:callMessage]}];
            return;
        }
    }
    
    NSLog(@"No match call or call invite for %@", callSid);
}

- (void)messageSentForCallSid:(NSString *)callSid voiceEventSid:(NSString *)voiceEventSid {
    [self sendEventWithName:kTwilioVoiceReactNativeScopeCallMessage
                       body:@{kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeCallEventMessageSent,
                              kTwilioVoiceReactNativeVoiceEventSid: voiceEventSid}];
}

- (void)messageFailedForCallSid:(NSString *)callSid voiceEventSid:(NSString *)voiceEventSid error:(NSError *)error {
    [self sendEventWithName:kTwilioVoiceReactNativeScopeCallMessage
                       body:@{kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeCallEventMessageFailure,
                              kTwilioVoiceReactNativeVoiceEventSid: voiceEventSid,
                              kTwilioVoiceReactNativeVoiceErrorKeyError: @{kTwilioVoiceReactNativeVoiceErrorKeyCode: @(error.code),
                                                                           kTwilioVoiceReactNativeVoiceErrorKeyMessage: [error localizedDescription]}}];
}

#pragma mark - Utility

- (NSDictionary *)callMessageInfo:(TVOCallMessage *)callMessage {
    NSDictionary *callMessageInfoObject = @{
        kTwilioVoiceReactNativeVoiceEventSid: callMessage.voiceEventSid,
        kTwilioVoiceReactNativeCallMessageContent: callMessage.content,
        kTwilioVoiceReactNativeCallMessageContentType: callMessage.contentType,
        kTwilioVoiceReactNativeCallMessageMessageType: callMessage.messageType
    };
    
    return callMessageInfoObject;
}

@end
