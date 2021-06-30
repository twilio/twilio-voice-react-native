//
//  TwilioVoicePushRegistry+CallKit.m
//  TwilioVoiceReactNative
//
//  Copyright © 2021 Twilio, Inc. All rights reserved.
//

@import CallKit;
@import TwilioVoice;

#import "TwilioVoicePushRegistry.h"

@interface TwilioVoicePushRegistry (CallKit) <CXProviderDelegate, TVOCallDelegate>

@end

@implementation TwilioVoicePushRegistry (CallKit)

#pragma mark - CallKit helper methods

- (void)reportNewIncomingCall:(TVOCallInvite *)callInvite {
    self.callInvite = callInvite;

    CXHandle *callHandle = [[CXHandle alloc] initWithType:CXHandleTypeGeneric value:callInvite.from];

    CXCallUpdate *callUpdate = [[CXCallUpdate alloc] init];
    callUpdate.remoteHandle = callHandle;
    callUpdate.supportsDTMF = YES;
    callUpdate.supportsHolding = YES;
    callUpdate.supportsGrouping = NO;
    callUpdate.supportsUngrouping = NO;
    callUpdate.hasVideo = NO;

    [self.callKitProvider reportNewIncomingCallWithUUID:callInvite.uuid update:callUpdate completion:^(NSError *error) {
        if (!error) {
            NSLog(@"Incoming call successfully reported.");
        } else {
            NSLog(@"Failed to report incoming call: %@.", error);
        }
    }];
}

- (void)endCallWithUuid:(NSString *)uuid {
    CXEndCallAction *endCallAction = [[CXEndCallAction alloc] initWithCallUUID:[[NSUUID alloc] initWithUUIDString:uuid]];
    CXTransaction *transaction = [[CXTransaction alloc] initWithAction:endCallAction];
    
    [self.callKitCallController requestTransaction:transaction completion:^(NSError *error) {
        if (error) {
            NSLog(@"Failed to submit end-call transaction request: %@", error);
        } else {
            NSLog(@"End-call transaction successfully done");
        }
    }];
    
    self.callInvite = nil;
}

#pragma mark - CXProviderDelegate

- (void)providerDidReset:(CXProvider *)provider {
    self.audioDevice.enabled = NO;
}

- (void)providerDidBegin:(CXProvider *)provider {
    
}

- (void)provider:(CXProvider *)provider didActivateAudioSession:(AVAudioSession *)audioSession {
    self.audioDevice.enabled = YES;
}

- (void)provider:(CXProvider *)provider didDeactivateAudioSession:(AVAudioSession *)audioSession {
    self.audioDevice.enabled = NO;
}

- (void)provider:(CXProvider *)provider performEndCallAction:(CXEndCallAction *)action {
    if (self.callInvite) {
        [self.callInvite reject];
    } else if (self.call) {
        [self.call disconnect];
    }
    
    [action fulfill];
}

- (void)provider:(CXProvider *)provider performStartCallAction:(CXStartCallAction *)action {
    
}

- (void)provider:(CXProvider *)provider performAnswerCallAction:(CXAnswerCallAction *)action {
    TVOAcceptOptions *acceptOptions = [TVOAcceptOptions optionsWithCallInvite:self.callInvite
                                                                        block:^(TVOAcceptOptionsBuilder *builder) {
        builder.uuid = self.callInvite.uuid;
    }];
    
    self.call = [self.callInvite acceptWithOptions:acceptOptions delegate:self];
        
    [action fulfill];
}

- (void)provider:(CXProvider *)provider performSetHeldCallAction:(CXSetHeldCallAction *)action {
    
}

- (void)provider:(CXProvider *)provider performSetMutedCallAction:(CXSetMutedCallAction *)action {
    
}

- (void)provider:(CXProvider *)provider performPlayDTMFCallAction:(CXPlayDTMFCallAction *)action {
    
}

#pragma mark - TVOCallDelegate

- (void)callDidConnect:(TVOCall *)call {
    
}

- (void)call:(TVOCall *)call didDisconnectWithError:(NSError *)error {
    if (!self.userInitiatedDisconnect) {
        CXCallEndedReason reason = CXCallEndedReasonRemoteEnded;
        if (error) {
            reason = CXCallEndedReasonFailed;
        }
        
        [self.callKitProvider reportCallWithUUID:call.uuid endedAtDate:[NSDate date] reason:reason];
    }
    
    self.call = nil;
    self.userInitiatedDisconnect = NO;
}

- (void)call:(TVOCall *)call didFailToConnectWithError:(NSError *)error {
    
}

- (void)call:(TVOCall *)call isReconnectingWithError:(NSError *)error {
    
}

- (void)callDidReconnect:(TVOCall *)call {
    
}

@end
