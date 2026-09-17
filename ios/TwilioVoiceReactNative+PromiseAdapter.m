//
//  TwilioVoiceReactNative+PromiseAdapter.m
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

#pragma mark - Call promise ownership

- (void)storeCallPromiseResolver:(RCTPromiseResolveBlock)resolver forUuid:(NSString *)uuid {
    @synchronized (self.callPromiseResolvers) {
        self.callPromiseResolvers[uuid] = resolver;
    }
}

/**
 * Remove and return the resolver stored for `uuid`, or nil when it has already
 * been taken.
 *
 * Take-and-clear under the lock is what makes the promise settle exactly once:
 * the CallKit transaction's completion block and `performVoiceCallWithUUID` run
 * on different queues and either can be the one that settles a given call, so
 * whichever gets the resolver settles it and the other gets nil.
 */
- (RCTPromiseResolveBlock)takeCallPromiseResolverForUuid:(NSString *)uuid {
    @synchronized (self.callPromiseResolvers) {
        RCTPromiseResolveBlock resolver = self.callPromiseResolvers[uuid];
        [self.callPromiseResolvers removeObjectForKey:uuid];
        return resolver;
    }
}

@end
