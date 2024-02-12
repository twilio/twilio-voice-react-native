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
    NSString *eventScope = [self eventScopeWithCallSid:callSid];
    if ([eventScope length] == 0) {
        NSLog(@"TwilioVoiceReactNative error: no call or call-invite with matching Call SID");
        return;
    }
    
    [self sendEventWithName:eventScope
                       body:@{kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeCallEventMessageReceived,
                              kTwilioVoiceReactNativeJSEventKeyCallMessageInfo: [self callMessageInfo:callMessage]}];
}

- (void)messageSentForCallSid:(NSString *)callSid voiceEventSid:(NSString *)voiceEventSid {
    NSString *eventScope = [self eventScopeWithCallSid:callSid];
    if ([eventScope length] == 0) {
        NSLog(@"TwilioVoiceReactNative error: no call or call-invite with matching Call SID");
        return;
    }

    [self sendEventWithName:eventScope
                       body:@{kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeCallEventMessageSent,
                              kTwilioVoiceReactNativeVoiceEventSid: voiceEventSid}];
}

- (void)messageFailedForCallSid:(NSString *)callSid voiceEventSid:(NSString *)voiceEventSid error:(NSError *)error {
    NSString *eventScope = [self eventScopeWithCallSid:callSid];
    if ([eventScope length] == 0) {
        NSLog(@"TwilioVoiceReactNative error: no call or call-invite with matching Call SID");
        return;
    }

    [self sendEventWithName:eventScope
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
        kTwilioVoiceReactNativeCallMessageMessageType: [self callMessageTypeString:callMessage.messageType]
    };
    
    return callMessageInfoObject;
}

- (NSString *)callMessageTypeString:(TVOCallMessageType)callMessageType {
    switch (callMessageType) {
        case TVOCallMessageUserDefinedMessage:
            return kTwilioVoiceReactNativeUserDefinedMessage;
            
        default:
            return kTwilioVoiceReactNativeUserDefinedMessage;
    }
}

- (NSString *)eventScopeWithCallSid:(NSString *)callSid {
    NSString *eventScope = @"";

    NSArray *keys = self.callInviteMap.allKeys;
    for (NSString *uuid in keys) {
        TVOCallInvite *callInvite = self.callInviteMap[uuid];
        if ([callInvite.callSid isEqualToString:callSid]) {
            eventScope = kTwilioVoiceReactNativeScopeCallInvite;
            break;
        }
    }
    
    if ([eventScope length] > 0) {
        return eventScope;
    }
    
    keys = self.callMap.allKeys;
    for (NSString *uuid in keys) {
        TVOCall *call = self.callMap[uuid];
        if ([call.sid isEqualToString:callSid]) {
            eventScope = kTwilioVoiceReactNativeScopeCall;
            break;
        }
    }
    
    return eventScope;
}

@end
