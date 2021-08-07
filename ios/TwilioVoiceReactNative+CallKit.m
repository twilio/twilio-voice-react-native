//
//  TwilioVoiceReactNative+CallKit.m
//  TwilioVoiceReactNative
//
//  Copyright © 2021 Twilio, Inc. All rights reserved.
//

@import CallKit;
@import TwilioVoice;

#import "TwilioVoiceReactNative.h"
#import "TwilioVoiceReactNativeConstants.h"

@interface TwilioVoiceReactNative (CallKit) <CXProviderDelegate, TVOCallDelegate>

@end

@implementation TwilioVoiceReactNative (CallKit)

#pragma mark - CallKit helper methods

- (void)initializeCallKit {
    CXProviderConfiguration *configuration = [[CXProviderConfiguration alloc] initWithLocalizedName:@"Twilio Frontline"];
    configuration.maximumCallGroups = 1;
    configuration.maximumCallsPerCallGroup = 1;
    
    self.callKitProvider = [[CXProvider alloc] initWithConfiguration:configuration];
    [self.callKitProvider setDelegate:self queue:nil];
    self.callKitCallController = [CXCallController new];
}

- (void)reportNewIncomingCall:(TVOCallInvite *)callInvite {
    self.callInvite = callInvite;
    self.callInviteMap[callInvite.uuid.UUIDString] = callInvite;

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

- (void)answerCallInvite:(NSUUID *)uuid
              completion:(void(^)(BOOL success, NSError *error))completionHandler {
    CXAnswerCallAction *answerCallAction = [[CXAnswerCallAction alloc] initWithCallUUID:uuid];
    CXTransaction *transaction = [[CXTransaction alloc] initWithAction:answerCallAction];
    
    [self.callKitCallController requestTransaction:transaction completion:^(NSError *error) {
        if (error) {
            NSLog(@"Failed to submit answer-call transaction request: %@", error);
            completionHandler(NO, error);
        } else {
            NSLog(@"Answer-call transaction successfully done");
            completionHandler(YES, nil);
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
    
    [self.callInviteMap removeObjectForKey:uuid.UUIDString];
    self.callInvite = nil;
}

- (void)makeCallWithUuid:(NSString *)uuidString
             accessToken:(NSString *)accessToken
                  params:(NSDictionary *)params {
    self.accessToken = accessToken;
    self.twimlParams = params;
    
    /* Replace the handle value of your choice */
    NSString *handle = @"Twilio Frontline";
    
    CXHandle *callHandle = [[CXHandle alloc] initWithType:CXHandleTypeGeneric value:handle];
    NSUUID *uuid = [[NSUUID alloc] initWithUUIDString:uuidString];
    CXStartCallAction *startCallAction = [[CXStartCallAction alloc] initWithCallUUID:uuid handle:callHandle];
    CXTransaction *transaction = [[CXTransaction alloc] initWithAction:startCallAction];

    [self.callKitCallController requestTransaction:transaction completion:^(NSError *error) {
        if (error) {
            NSLog(@"StartCallAction transaction request failed: %@", [error localizedDescription]);
        } else {
            NSLog(@"StartCallAction transaction request successful");

            CXCallUpdate *callUpdate = [[CXCallUpdate alloc] init];
            callUpdate.remoteHandle = callHandle;
            callUpdate.supportsDTMF = YES;
            callUpdate.supportsHolding = YES;
            callUpdate.supportsGrouping = NO;
            callUpdate.supportsUngrouping = NO;
            callUpdate.hasVideo = NO;

            [self.callKitProvider reportCallWithUUID:uuid updated:callUpdate];
        }
    }];
}

- (void)performVoiceCallWithUUID:(NSUUID *)uuid
                          client:(NSString *)client
                      completion:(void(^)(BOOL success))completionHandler {
    TVOConnectOptions *connectOptions = [TVOConnectOptions optionsWithAccessToken:self.accessToken block:^(TVOConnectOptionsBuilder *builder) {
        builder.params = self.twimlParams;
        builder.uuid = uuid;
    }];
    TVOCall *call = [TwilioVoiceSDK connectWithOptions:connectOptions delegate:self];
    if (call) {
        self.activeCall = call;
        self.callMap[call.uuid.UUIDString] = call;
    }
    self.callKitCompletionCallback = completionHandler;
}

- (void)performAnswerVoiceCallWithUUID:(NSUUID *)uuid
                            completion:(void(^)(BOOL success))completionHandler {
    NSAssert(self.callInvite, @"No call invite");
    
    TVOAcceptOptions *acceptOptions = [TVOAcceptOptions optionsWithCallInvite:self.callInvite block:^(TVOAcceptOptionsBuilder *builder) {
        builder.uuid = uuid;
    }];

    TVOCall *call = [self.callInvite acceptWithOptions:acceptOptions delegate:self];

    if (!call) {
        completionHandler(NO);
    } else {
        self.callKitCompletionCallback = completionHandler;
        self.activeCall = call;
        self.callMap[call.uuid.UUIDString] = call;
    }

    [self sendEventWithName:kTwilioVoiceReactNativeEventScopeVoice
                       body:@{kTwilioVoiceReactNativeEventKeyType: kTwilioVoiceReactNativeEventCallInviteAccepted,
                              kTwilioVoiceReactNativeEventKeyUuid: uuid.UUIDString}];
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
        [self sendEventWithName:kTwilioVoiceReactNativeEventScopeVoice
                           body:@{kTwilioVoiceReactNativeEventKeyType: kTwilioVoiceReactNativeEventCallInviteRejected,
                                  kTwilioVoiceReactNativeEventKeyUuid: self.callInvite.uuid.UUIDString}];
    } else if (self.activeCall) {
        [self.activeCall disconnect];
    }
    
    [action fulfill];
}

- (void)provider:(CXProvider *)provider performStartCallAction:(CXStartCallAction *)action {
    [TwilioVoiceReactNative audioDevice].enabled = NO;
    [TwilioVoiceReactNative audioDevice].block();

    [self.callKitProvider reportOutgoingCallWithUUID:action.callUUID startedConnectingAtDate:[NSDate date]];
    
    __weak typeof(self) weakSelf = self;
    [self performVoiceCallWithUUID:action.callUUID client:nil completion:^(BOOL success) {
        __strong typeof(self) strongSelf = weakSelf;
        if (success) {
            NSLog(@"performVoiceCallWithUUID successful");
            [strongSelf.callKitProvider reportOutgoingCallWithUUID:action.callUUID connectedAtDate:[NSDate date]];
        } else {
            NSLog(@"performVoiceCallWithUUID failed");
        }
    }];
    
    [action fulfill];
}

- (void)provider:(CXProvider *)provider performAnswerCallAction:(CXAnswerCallAction *)action {
    [TwilioVoiceReactNative audioDevice].enabled = NO;
    [TwilioVoiceReactNative audioDevice].block();
    
    [self performAnswerVoiceCallWithUUID:action.callUUID completion:^(BOOL success) {
        if (success) {
            NSLog(@"performAnswerVoiceCallWithUUID successful");
        } else {
            NSLog(@"performAnswerVoiceCallWithUUID failed");
        }
    }];
        
    [action fulfill];
}

- (void)provider:(CXProvider *)provider performSetHeldCallAction:(CXSetHeldCallAction *)action {
    if (self.activeCall) {
        [self.activeCall setOnHold:action.isOnHold];
        [action fulfill];
    } else {
        [action fail];
    }
}

- (void)provider:(CXProvider *)provider performSetMutedCallAction:(CXSetMutedCallAction *)action {
    if (self.activeCall) {
        [self.activeCall setMuted:action.isMuted];
        [action fulfill];
    } else {
        [action fail];
    }
}

- (void)provider:(CXProvider *)provider performPlayDTMFCallAction:(CXPlayDTMFCallAction *)action {
    if (self.activeCall) {
        [self.activeCall sendDigits:action.digits];
        [action fulfill];
    } else {
        [action fail];
    }
}

#pragma mark - TVOCallDelegate

- (void)callDidStartRinging:(TVOCall *)call {
    [self sendEventWithName:kTwilioVoiceReactNativeEventScopeCall
                       body:@{kTwilioVoiceReactNativeEventKeyType: @"ringing",
                              kTwilioVoiceReactNativeEventKeyCall: [self callInfo:call]}];
}

- (void)callDidConnect:(TVOCall *)call {
    [self sendEventWithName:kTwilioVoiceReactNativeEventScopeCall
                       body:@{kTwilioVoiceReactNativeEventKeyType: @"connected",
                              kTwilioVoiceReactNativeEventKeyCall: [self callInfo:call]}];

    self.callKitCompletionCallback(YES);
}

- (void)call:(TVOCall *)call didDisconnectWithError:(NSError *)error {
    NSDictionary *messageBody = [NSDictionary dictionary];
    if (error) {
        messageBody = @{kTwilioVoiceReactNativeEventKeyType: @"disconnected",
                        kTwilioVoiceReactNativeEventKeyCall: [self callInfo:call],
                        kTwilioVoiceReactNativeEventKeyError: [error localizedDescription]};
    } else {
        messageBody = @{kTwilioVoiceReactNativeEventKeyType: @"disconnected",
                        kTwilioVoiceReactNativeEventKeyCall: [self callInfo:call]};
    }
    
    [self sendEventWithName:kTwilioVoiceReactNativeEventScopeCall body:messageBody];
    
    if (!self.userInitiatedDisconnect) {
        CXCallEndedReason reason = CXCallEndedReasonRemoteEnded;
        if (error) {
            reason = CXCallEndedReasonFailed;
        }
        
        [self.callKitProvider reportCallWithUUID:call.uuid endedAtDate:[NSDate date] reason:reason];
    }
}

- (void)call:(TVOCall *)call didFailToConnectWithError:(NSError *)error {
    [self sendEventWithName:kTwilioVoiceReactNativeEventScopeCall
                       body:@{kTwilioVoiceReactNativeEventKeyType: @"connectFailure",
                              kTwilioVoiceReactNativeEventKeyCall: [self callInfo:call],
                              kTwilioVoiceReactNativeEventKeyError: [error localizedDescription]}];

    self.callKitCompletionCallback(NO);
    [self.callKitProvider reportCallWithUUID:call.uuid endedAtDate:[NSDate date] reason:CXCallEndedReasonFailed];
    
    [self callDisconnected:call];
}

- (void)callDisconnected:(TVOCall *)call {
    if ([call isEqual:self.activeCall]) {
        self.activeCall = nil;
    }
    [self.callMap removeObjectForKey:call.uuid.UUIDString];
    
    self.userInitiatedDisconnect = NO;
}

- (void)call:(TVOCall *)call isReconnectingWithError:(NSError *)error {
    [self sendEventWithName:kTwilioVoiceReactNativeEventScopeCall
                       body:@{kTwilioVoiceReactNativeEventKeyType: @"connected",
                              kTwilioVoiceReactNativeEventKeyCall: [self callInfo:call],
                              kTwilioVoiceReactNativeEventKeyError: [error localizedDescription]}];
}

- (void)callDidReconnect:(TVOCall *)call {
    [self sendEventWithName:kTwilioVoiceReactNativeEventScopeCall
                       body:@{kTwilioVoiceReactNativeEventKeyType: @"reconnected",
                              kTwilioVoiceReactNativeEventKeyCall: [self callInfo:call]}];
}

- (void)call:(TVOCall *)call
didReceiveQualityWarnings:(NSSet<NSNumber *> *)currentWarnings
previousWarnings:(NSSet<NSNumber *> *)previousWarnings {
    // TODO: process and emit warnings event
}

@end

