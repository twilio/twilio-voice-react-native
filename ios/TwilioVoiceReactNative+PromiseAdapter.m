//
//  TwilioVoiceReactNative+JsSerialization.m
//  TwilioVoiceReactNative
//
//  Copyright © 2025 Twilio, Inc. All rights reserved.
//

#import "TwilioVoiceReactNative.h"
#import "TwilioVoiceReactNativeConstants.h"

@implementation TwilioVoiceReactNative (PromiseAdapter)

- (void)resolvePromise:(RCTPromiseResolveBlock)resolver value:(id)value {
    NSDictionary *payload = @{
        kTwilioVoiceReactNativePromiseKeyStatus: kTwilioVoiceReactNativePromiseStatusValueResolved,
        kTwilioVoiceReactNativePromiseKeyValue: value
    };
    resolver(payload);
}

- (void)rejectPromiseWithCode:(RCTPromiseResolveBlock)resolver code:(NSNumber *)code message:(NSString *)message {
    NSDictionary *payload = @{
        kTwilioVoiceReactNativePromiseKeyStatus: kTwilioVoiceReactNativePromiseStatusValueRejectedWithCode,
        kTwilioVoiceReactNativePromiseKeyErrorCode: code,
        kTwilioVoiceReactNativePromiseKeyErrorMessage: message
    };
    resolver(payload);
}

- (void)rejectPromiseWithName:(RCTPromiseResolveBlock)resolver name:(NSString *)name message:(NSString *)message {
    NSDictionary *payload = @{
        kTwilioVoiceReactNativePromiseKeyStatus: kTwilioVoiceReactNativePromiseStatusValueRejectedWithName,
        kTwilioVoiceReactNativePromiseKeyErrorName: name,
        kTwilioVoiceReactNativePromiseKeyErrorMessage: message
    };
    resolver(payload);
}

@end
