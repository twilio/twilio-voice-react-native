//
//  TwilioVoiceReactNative+CallKit.m
//  TwilioVoiceReactNative
//
//  Copyright © 2021 Twilio, Inc. All rights reserved.
//

@import CallKit;
@import TwilioVoice;

#import "TwilioVoiceReactNative.h"

@interface TwilioVoiceReactNative (CallKit) <CXProviderDelegate, TVOCallDelegate>

@end

@implementation TwilioVoiceReactNative (CallKit)

#pragma mark - CallKit helper methods

- (void)initializeCallKit {
    CXProviderConfiguration *configuration = [[CXProviderConfiguration alloc] initWithLocalizedName:@"Twilio Voice"];
    configuration.maximumCallGroups = 1;
    configuration.maximumCallsPerCallGroup = 1;
    
    self.callKitProvider = [[CXProvider alloc] initWithConfiguration:configuration];
    [self.callKitProvider setDelegate:self queue:nil];
    self.callKitCallController = [CXCallController new];
}

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

- (void)endCallWithUuid:(NSUUID *)uuid {
    CXEndCallAction *endCallAction = [[CXEndCallAction alloc] initWithCallUUID:uuid];
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
    [TwilioVoiceReactNative audioDevice].enabled = NO;
}

- (void)providerDidBegin:(CXProvider *)provider {
    
}

- (void)provider:(CXProvider *)provider didActivateAudioSession:(AVAudioSession *)audioSession {
    [TwilioVoiceReactNative audioDevice].enabled = YES;
}

- (void)provider:(CXProvider *)provider didDeactivateAudioSession:(AVAudioSession *)audioSession {
    [TwilioVoiceReactNative audioDevice].enabled = NO;
}

- (void)provider:(CXProvider *)provider performEndCallAction:(CXEndCallAction *)action {
    if (self.callInvite) {
        [self.callInvite reject];
    } else if (self.activeCall) {
        [self.activeCall disconnect];
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
    
    self.activeCall = [self.callInvite acceptWithOptions:acceptOptions delegate:self];
        
    [action fulfill];
}

- (void)provider:(CXProvider *)provider performSetHeldCallAction:(CXSetHeldCallAction *)action {
    
}

- (void)provider:(CXProvider *)provider performSetMutedCallAction:(CXSetMutedCallAction *)action {
    
}

- (void)provider:(CXProvider *)provider performPlayDTMFCallAction:(CXPlayDTMFCallAction *)action {
    
}

#pragma mark - TVOCallDelegate

- (void)callDidStartRinging:(TVOCall *)call {
    [self sendEventWithName:@"Call" body:@{@"type": @"ringing", @"uuid": [call.uuid UUIDString]}];
}

- (void)callDidConnect:(TVOCall *)call {
    [self sendEventWithName:@"Call" body:@{@"type": @"connected", @"uuid": [call.uuid UUIDString]}];

    // TODO: CallKit completion handler
    // TODO: report connected to CallKit
}

- (void)call:(TVOCall *)call didDisconnectWithError:(NSError *)error {
    NSDictionary *messageBody = [NSDictionary dictionary];
    if (error) {
        messageBody = @{@"type": @"disconnected", @"uuid": [call.uuid UUIDString], @"error": [error localizedDescription]};
    } else {
        messageBody = @{@"type": @"disconnected", @"uuid": [call.uuid UUIDString]};
    }
    
    [self sendEventWithName:@"Call" body:messageBody];

    // TODO: end call with CallKit (if not user initiated-disconnect)
    // TODO: CallKit completion handler
    
    if (!self.userInitiatedDisconnect) {
        CXCallEndedReason reason = CXCallEndedReasonRemoteEnded;
        if (error) {
            reason = CXCallEndedReasonFailed;
        }
        
        [self.callKitProvider reportCallWithUUID:call.uuid endedAtDate:[NSDate date] reason:reason];
    }
    
    self.activeCall = nil;
    self.userInitiatedDisconnect = NO;
}

- (void)call:(TVOCall *)call didFailToConnectWithError:(NSError *)error {
    [self sendEventWithName:@"Call" body:@{@"type": @"connectFailure", @"uuid": [call.uuid UUIDString], @"error": [error localizedDescription]}];

    // TODO: disconnect call with CallKit if needed
    // TODO: CallKit completion handler
}

- (void)call:(TVOCall *)call isReconnectingWithError:(NSError *)error {
    [self sendEventWithName:@"Call" body:@{@"type": @"connected", @"uuid": [call.uuid UUIDString], @"error": [error localizedDescription]}];
}

- (void)callDidReconnect:(TVOCall *)call {
    [self sendEventWithName:@"Call" body:@{@"type": @"reconnected", @"uuid": [call.uuid UUIDString]}];
}

- (void)call:(TVOCall *)call
didReceiveQualityWarnings:(NSSet<NSNumber *> *)currentWarnings
previousWarnings:(NSSet<NSNumber *> *)previousWarnings {
    // TODO: process and emit warnings event
}

@end

