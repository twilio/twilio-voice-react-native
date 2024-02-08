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

- (void)call:(TVOCall *)call didSendMessage:(NSString *)voiceEventSid {
    [self sendEventWithName:kTwilioVoiceReactNativeScopeCallMessage
                       body:@{kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeCallEventMessageSent,
                              kTwilioVoiceReactNativeVoiceEventSid: voiceEventSid}];
}

- (void)call:(TVOCall *)call 
didFailToSendMessage:(NSString *)voiceEventSid
       error:(NSError *)error {
    [self sendEventWithName:kTwilioVoiceReactNativeScopeCallMessage
                       body:@{kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeCallEventMessageFailure,
                              kTwilioVoiceReactNativeVoiceEventSid: voiceEventSid,
                              kTwilioVoiceReactNativeVoiceErrorKeyError: @{kTwilioVoiceReactNativeVoiceErrorKeyCode: @(error.code),
                                                                           kTwilioVoiceReactNativeVoiceErrorKeyMessage: [error localizedDescription]}}];
}

- (void)call:(TVOCall *)call didReceiveMessage:(TVOCallMessage *)callMessage {
    [self sendEventWithName:kTwilioVoiceReactNativeScopeCall
                       body:@{kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeCallEventMessageReceived,
                              kTwilioVoiceReactNativeJSEventKeyCallMessageInfo: [self callMessageInfo:callMessage]}];
}

#pragma mark - TVOCallMessageDelegate (Call Invite)

- (void)callInvite:(TVOCallInvite *)callInvite didSendMessage:(NSString *)voiceEventSid {
    [self sendEventWithName:kTwilioVoiceReactNativeScopeCallMessage
                       body:@{kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeCallEventMessageSent,
                              kTwilioVoiceReactNativeVoiceEventSid: voiceEventSid}];
}

- (void)callInvite:(TVOCallInvite *)callInvite 
didFailToSendMessage:(NSString *)voiceEventSid
             error:(NSError *)error {
    [self sendEventWithName:kTwilioVoiceReactNativeScopeCallMessage
                       body:@{kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeCallEventMessageFailure,
                              kTwilioVoiceReactNativeVoiceEventSid: voiceEventSid,
                              kTwilioVoiceReactNativeVoiceErrorKeyError: @{kTwilioVoiceReactNativeVoiceErrorKeyCode: @(error.code),
                                                                           kTwilioVoiceReactNativeVoiceErrorKeyMessage: [error localizedDescription]}}];
}

- (void)callInvite:(TVOCallInvite *)callInvite
 didReceiveMessage:(TVOCallMessage *)callMessage {
    [self sendEventWithName:kTwilioVoiceReactNativeScopeCallInvite
                       body:@{kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeCallEventMessageReceived,
                              kTwilioVoiceReactNativeJSEventKeyCallMessageInfo: [self callMessageInfo:callMessage]}];
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

@end
