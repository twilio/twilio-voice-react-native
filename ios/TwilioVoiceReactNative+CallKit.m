//
//  TwilioVoiceReactNative+CallKit.m
//  TwilioVoiceReactNative
//
//  Copyright © 2022 Twilio, Inc. All rights reserved.
//

@import CallKit;
@import TwilioVoice;

#import "TwilioVoiceReactNative.h"
#import "TwilioVoiceReactNativeConstants.h"

NSString * const kDefaultCallKitConfigurationName = @"Twilio Voice React Native";

@interface TwilioVoiceReactNative (CallKit) <CXProviderDelegate, TVOCallDelegate, AVAudioPlayerDelegate>

@end

@implementation TwilioVoiceReactNative (CallKit)

#pragma mark - CallKit helper methods

- (void)initializeCallKit {
    [self initializeCallKitWithConfiguration:nil];
}

- (void)initializeCallKitWithConfiguration:(NSDictionary *)configuration {
    CXProviderConfiguration *callKitConfiguration = [CXProviderConfiguration new];
    
    if (configuration[kTwilioVoiceReactNativeCallKitMaximumCallGroups]) {
        callKitConfiguration.maximumCallGroups = [configuration[kTwilioVoiceReactNativeCallKitMaximumCallGroups] intValue];
    } else {
        callKitConfiguration.maximumCallGroups = 1;
    }

    if (configuration[kTwilioVoiceReactNativeCallKitMaximumCallsPerCallGroup]) {
        callKitConfiguration.maximumCallsPerCallGroup = [configuration[kTwilioVoiceReactNativeCallKitMaximumCallsPerCallGroup] intValue];
    } else {
        callKitConfiguration.maximumCallsPerCallGroup = 1;
    }

    float version = [[UIDevice currentDevice].systemVersion floatValue];
    if (version > 11.0 && configuration[kTwilioVoiceReactNativeCallKitIncludesCallsInRecents]) {
        callKitConfiguration.includesCallsInRecents = [configuration[kTwilioVoiceReactNativeCallKitIncludesCallsInRecents] boolValue];
    }

    if (configuration[kTwilioVoiceReactNativeCallKitSupportedHandleTypes]) {
        NSSet *supportedHandleTypes = [NSSet setWithArray:configuration[kTwilioVoiceReactNativeCallKitSupportedHandleTypes]];
        callKitConfiguration.supportedHandleTypes = supportedHandleTypes;
    } else {
        callKitConfiguration.supportedHandleTypes = [NSSet setWithArray:@[@(CXHandleTypeGeneric), @(CXHandleTypePhoneNumber)]];
    }

    if (configuration[kTwilioVoiceReactNativeCallKitIconTemplateImageData] && [configuration[kTwilioVoiceReactNativeCallKitIconTemplateImageData] isKindOfClass:[NSString class]]) {
        UIImage *icon = [UIImage imageNamed:configuration[kTwilioVoiceReactNativeCallKitIconTemplateImageData]];
        callKitConfiguration.iconTemplateImageData = UIImagePNGRepresentation(icon);
    }

    if (configuration[kTwilioVoiceReactNativeCallKitRingtoneSound] && [configuration[kTwilioVoiceReactNativeCallKitRingtoneSound] isKindOfClass:[NSString class]]) {
        callKitConfiguration.ringtoneSound = configuration[kTwilioVoiceReactNativeCallKitRingtoneSound];
    }
    
    self.callKitProvider = [[CXProvider alloc] initWithConfiguration:callKitConfiguration];
    [self.callKitProvider setDelegate:self queue:nil];
    self.callKitCallController = [CXCallController new];
}

- (NSString *)getDisplayName:(NSString *)template
            customParameters:(NSDictionary<NSString *, NSString *> *)customParameters {
    NSString *processedTemplate = template;
    for (NSString *paramKey in customParameters) {
        NSString *paramValue = customParameters[paramKey];
        NSString *wrappedParamKey = [NSString stringWithFormat:@"${%@}", paramKey];
        processedTemplate = [processedTemplate stringByReplacingOccurrencesOfString:wrappedParamKey withString:paramValue];
    }
    return processedTemplate;
}

- (void)reportNewIncomingCall:(TVOCallInvite *)callInvite {
    NSString *handleName = callInvite.from;
    if (handleName == nil) {
        handleName = @"Unknown Caller";
    }
    if (self.incomingCallContactHandleTemplate != NULL && [self.incomingCallContactHandleTemplate length] > 0) {
        handleName = [self getDisplayName:self.incomingCallContactHandleTemplate customParameters:[callInvite customParameters]];
    }

    CXHandle *callHandle = [[CXHandle alloc] initWithType:CXHandleTypeGeneric value:handleName];

    CXCallUpdate *callUpdate = [[CXCallUpdate alloc] init];
    callUpdate.remoteHandle = callHandle;
    callUpdate.localizedCallerName = handleName;
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
              completion:(void(^)(BOOL success))completionHandler {
    self.callKitCompletionCallback = completionHandler;
    CXAnswerCallAction *answerCallAction = [[CXAnswerCallAction alloc] initWithCallUUID:uuid];
    CXTransaction *transaction = [[CXTransaction alloc] initWithAction:answerCallAction];

    [self.callKitCallController requestTransaction:transaction completion:^(NSError *error) {
        if (error) {
            NSLog(@"Failed to submit answer-call transaction request: %@", error);
        } else {
            NSLog(@"Answer-call transaction successfully done");
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
}

- (void)makeCallWithAccessToken:(NSString *)accessToken
                         params:(NSDictionary *)params
                  contactHandle:(NSString *)contactHandle {
    self.accessToken = accessToken;
    self.twimlParams = params;
    
    NSString *handle = @"Default Contact";
    if ([contactHandle length] > 0) {
        handle = contactHandle;
    }

    CXHandle *callHandle = [[CXHandle alloc] initWithType:CXHandleTypeGeneric value:handle];
    NSUUID *uuid = [NSUUID UUID];
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
        builder.callMessageDelegate = self;
    }];
    TVOCall *call = [TwilioVoiceSDK connectWithOptions:connectOptions delegate:self];
    if (call) {
        self.callMap[call.uuid.UUIDString] = call;
        self.callPromiseResolver([self callInfo:call]);
    }
    self.callKitCompletionCallback = completionHandler;
}

- (void)performAnswerVoiceCallWithUUID:(NSUUID *)uuid
                            completion:(void(^)(BOOL success))completionHandler {
    NSAssert(self.callInviteMap[uuid.UUIDString], @"No call invite");
    
    TVOCallInvite *callInvite = self.callInviteMap[uuid.UUIDString];
    TVOAcceptOptions *acceptOptions = [TVOAcceptOptions optionsWithCallInvite:callInvite block:^(TVOAcceptOptionsBuilder *builder) {
        builder.uuid = uuid;
        builder.callMessageDelegate = self;
    }];

    TVOCall *call = [callInvite acceptWithOptions:acceptOptions delegate:self];

    if (!call) {
        completionHandler(NO);
    } else {
        self.callMap[call.uuid.UUIDString] = call;
    }

    [self sendEventWithName:kTwilioVoiceReactNativeScopeCallInvite
                       body:@{
                         kTwilioVoiceReactNativeCallInviteEventKeyType: kTwilioVoiceReactNativeCallInviteEventTypeValueAccepted,
                         kTwilioVoiceReactNativeCallInviteEventKeyCallSid: callInvite.callSid,
                         kTwilioVoiceReactNativeEventKeyCallInvite: [self callInviteInfo:callInvite]}];
}

- (void)updateCall:(NSString *)uuid callerHandle:(NSString *)handle {
    CXHandle *callHandle = [[CXHandle alloc] initWithType:CXHandleTypeGeneric value:handle];
    CXCallUpdate *callUpdate = [[CXCallUpdate alloc] init];
    callUpdate.remoteHandle = callHandle;
    callUpdate.localizedCallerName = handle;
    callUpdate.supportsDTMF = YES;
    callUpdate.supportsHolding = YES;
    callUpdate.supportsGrouping = NO;
    callUpdate.supportsUngrouping = NO;
    callUpdate.hasVideo = NO;

    dispatch_async(dispatch_get_main_queue(), ^{
        [self.callKitProvider reportCallWithUUID:[[NSUUID alloc] initWithUUIDString:uuid] updated:callUpdate];
    });
}

#pragma mark - CXProviderDelegate

- (void)providerDidReset:(CXProvider *)provider {
    [TwilioVoiceReactNative twilioAudioDevice].enabled = NO;
}

- (void)providerDidBegin:(CXProvider *)provider {
    
}

- (void)provider:(CXProvider *)provider didActivateAudioSession:(AVAudioSession *)audioSession {
    [TwilioVoiceReactNative twilioAudioDevice].enabled = YES;
}

- (void)provider:(CXProvider *)provider didDeactivateAudioSession:(AVAudioSession *)audioSession {
    [TwilioVoiceReactNative twilioAudioDevice].enabled = NO;
}

- (void)provider:(CXProvider *)provider performEndCallAction:(CXEndCallAction *)action {
    if (self.callMap[action.callUUID.UUIDString]) {
        TVOCall *call = self.callMap[action.callUUID.UUIDString];
        [call disconnect];
    } else if (self.callInviteMap[action.callUUID.UUIDString]) {
        TVOCallInvite *callInvite = self.callInviteMap[action.callUUID.UUIDString];
        [callInvite reject];
        [self sendEventWithName:kTwilioVoiceReactNativeScopeCallInvite
                           body:@{
                             kTwilioVoiceReactNativeCallInviteEventKeyType: kTwilioVoiceReactNativeCallInviteEventTypeValueRejected,
                             kTwilioVoiceReactNativeCallInviteEventKeyCallSid: callInvite.callSid,
                             kTwilioVoiceReactNativeEventKeyCallInvite: [self callInviteInfo:callInvite]}];
        [self.callInviteMap removeObjectForKey:action.callUUID.UUIDString];
    }
    
    [action fulfill];
}

- (void)provider:(CXProvider *)provider performStartCallAction:(CXStartCallAction *)action {
    [TwilioVoiceReactNative twilioAudioDevice].enabled = NO;
    [TwilioVoiceReactNative twilioAudioDevice].block();

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
    [TwilioVoiceReactNative twilioAudioDevice].enabled = NO;
    [TwilioVoiceReactNative twilioAudioDevice].block();
    
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
    if (self.callMap[action.callUUID.UUIDString]) {
        TVOCall *call = self.callMap[action.callUUID.UUIDString];
        [call setOnHold:action.isOnHold];
        [action fulfill];
    } else {
        [action fail];
    }
}

- (void)provider:(CXProvider *)provider performSetMutedCallAction:(CXSetMutedCallAction *)action {
    if (self.callMap[action.callUUID.UUIDString]) {
        TVOCall *call = self.callMap[action.callUUID.UUIDString];
        [call setMuted:action.isMuted];
        [action fulfill];
    } else {
        [action fail];
    }
}

- (void)provider:(CXProvider *)provider performPlayDTMFCallAction:(CXPlayDTMFCallAction *)action {
    if (self.callMap[action.callUUID.UUIDString]) {
        TVOCall *call = self.callMap[action.callUUID.UUIDString];
        [call sendDigits:action.digits];
        [action fulfill];
    } else {
        [action fail];
    }
}

#pragma mark - TVOCallDelegate

- (void)callDidStartRinging:(TVOCall *)call {
    [self playRingback];

    [self sendEventWithName:kTwilioVoiceReactNativeScopeCall
                       body:@{kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeCallEventRinging,
                              kTwilioVoiceReactNativeEventKeyCall: [self callInfo:call]}];
}

- (void)callDidConnect:(TVOCall *)call {
    self.callConnectMap[call.uuid.UUIDString] = [self getSimplifiedISO8601FormattedTimestamp:[NSDate date]];

    [self stopRingback];

    [self sendEventWithName:kTwilioVoiceReactNativeScopeCall
                       body:@{kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeCallEventConnected,
                              kTwilioVoiceReactNativeEventKeyCall: [self callInfo:call]}];

    if (self.callKitCompletionCallback) {
        self.callKitCompletionCallback(YES);
        self.callKitCompletionCallback = nil;
    }
}

- (void)call:(TVOCall *)call didDisconnectWithError:(NSError *)error {
    NSDictionary *messageBody = [NSDictionary dictionary];
    if (error) {
        messageBody = @{kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeCallEventDisconnected,
                        kTwilioVoiceReactNativeEventKeyCall: [self callInfo:call],
                        kTwilioVoiceReactNativeVoiceErrorKeyError: @{kTwilioVoiceReactNativeVoiceErrorKeyCode: @(error.code),
                                                                     kTwilioVoiceReactNativeVoiceErrorKeyMessage: [error localizedDescription]}};
    } else {
        messageBody = @{kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeCallEventDisconnected,
                        kTwilioVoiceReactNativeEventKeyCall: [self callInfo:call]};
    }
    
    [self sendEventWithName:kTwilioVoiceReactNativeScopeCall body:messageBody];
    
    if (!self.userInitiatedDisconnect) {
        CXCallEndedReason reason = CXCallEndedReasonRemoteEnded;
        if (error) {
            reason = CXCallEndedReasonFailed;
        }
        
        [self.callKitProvider reportCallWithUUID:call.uuid endedAtDate:[NSDate date] reason:reason];
    }
    
    [self callDisconnected:call];
}

- (void)call:(TVOCall *)call didFailToConnectWithError:(NSError *)error {
    [self sendEventWithName:kTwilioVoiceReactNativeScopeCall
                       body:@{kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeCallEventConnectFailure,
                              kTwilioVoiceReactNativeEventKeyCall: [self callInfo:call],
                              kTwilioVoiceReactNativeVoiceErrorKeyError: @{kTwilioVoiceReactNativeVoiceErrorKeyCode: @(error.code),
                                                                           kTwilioVoiceReactNativeVoiceErrorKeyMessage: [error localizedDescription]}}];

    if (self.callKitCompletionCallback) {
        self.callKitCompletionCallback(NO);
        self.callKitCompletionCallback = nil;
    }
    [self.callKitProvider reportCallWithUUID:call.uuid endedAtDate:[NSDate date] reason:CXCallEndedReasonFailed];
    
    [self callDisconnected:call];
}

- (void)callDisconnected:(TVOCall *)call {
    for (NSString *uuidKey in [self.callMap allKeys]) {
        TVOCall *activeCall = self.callMap[uuidKey];
        if (activeCall == call) {
            [self.callMap removeObjectForKey:uuidKey];
            [self.callConnectMap removeObjectForKey:call.uuid.UUIDString];
            break;
        }
    }

    // Remove the corresponding call invite only when the incoming call is finished.
    [self.callInviteMap removeObjectForKey:call.uuid.UUIDString];
    
    [self stopRingback];
    self.userInitiatedDisconnect = NO;
}

- (void)call:(TVOCall *)call isReconnectingWithError:(NSError *)error {
    [self sendEventWithName:kTwilioVoiceReactNativeScopeCall
                       body:@{kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeCallEventReconnecting,
                              kTwilioVoiceReactNativeEventKeyCall: [self callInfo:call],
                              kTwilioVoiceReactNativeVoiceErrorKeyError: @{kTwilioVoiceReactNativeVoiceErrorKeyCode: @(error.code),
                                                                           kTwilioVoiceReactNativeVoiceErrorKeyMessage: [error localizedDescription]}}];
}

- (void)callDidReconnect:(TVOCall *)call {
    [self sendEventWithName:kTwilioVoiceReactNativeScopeCall
                       body:@{kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeCallEventReconnected,
                              kTwilioVoiceReactNativeEventKeyCall: [self callInfo:call]}];
}

- (void)call:(TVOCall *)call
didReceiveQualityWarnings:(NSSet<NSNumber *> *)currentWarnings
previousWarnings:(NSSet<NSNumber *> *)previousWarnings {
    NSMutableArray<NSString *> *currentWarningEvents = [NSMutableArray array];
    for (NSNumber *warning in currentWarnings) {
        NSString *event = [self warningNameWithNumber:warning];
        [currentWarningEvents addObject:event];
    }

    NSMutableArray<NSString *> *previousWarningEvents = [NSMutableArray array];
    for (NSNumber *warning in previousWarnings) {
        NSString *event = [self warningNameWithNumber:warning];
        [previousWarningEvents addObject:event];
    }

    [self sendEventWithName:kTwilioVoiceReactNativeScopeCall
                       body:@{kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeCallEventQualityWarningsChanged,
                              kTwilioVoiceReactNativeEventKeyCall: [self callInfo:call],
                              kTwilioVoiceReactNativeCallEventCurrentWarnings: currentWarningEvents,
                              kTwilioVoiceReactNativeCallEventPreviousWarnings: previousWarningEvents}];
}

#pragma mark - Ringback

- (void)playRingback {
    NSString *ringtonePath = [[NSBundle mainBundle] pathForResource:@"ringtone" ofType:@"wav"];
    if ([ringtonePath length] <= 0) {
        NSLog(@"Can't find sound file");
        return;
    }
    
    NSError *error;
    self.ringbackPlayer = [[AVAudioPlayer alloc] initWithContentsOfURL:[NSURL URLWithString:ringtonePath] error:&error];
    if (error != nil) {
        NSLog(@"Failed to initialize audio player: %@", error);
    } else {
        self.ringbackPlayer.delegate = self;
        self.ringbackPlayer.numberOfLoops = -1;
        
        self.ringbackPlayer.volume = 1.0f;
        [self.ringbackPlayer play];
    }
}

- (void)stopRingback {
    if (!self.ringbackPlayer.isPlaying) {
        return;
    }
    
    [self.ringbackPlayer stop];
}

- (void)audioPlayerDidFinishPlaying:(AVAudioPlayer *)player successfully:(BOOL)flag {
    if (flag) {
        NSLog(@"Audio player finished playing successfully");
    } else {
        NSLog(@"Audio player finished playing with some error");
    }
}

- (void)audioPlayerDecodeErrorDidOccur:(AVAudioPlayer *)player error:(NSError *)error {
    NSLog(@"Decode error occurred: %@", error);
}

#pragma mark - Warning event conversion

- (NSString *)warningNameWithNumber:(NSNumber *)warning {
    if ([warning intValue] < 0 || [warning intValue] > 4) {
        NSLog(@"Warning number out of TVOCallQualityWarning range");
        return @"undefined";
    }
    
    TVOCallQualityWarning warningValue = [warning intValue];
    switch (warningValue) {
        case TVOCallQualityWarningHighRtt:
            return @"high-rtt";
        case TVOCallQualityWarningHighJitter:
            return @"high-jitter";
        case TVOCallQualityWarningHighPacketsLostFraction:
            return @"high-packets-lost-fraction";
        case TVOCallQualityWarningLowMos:
            return @"low-mos";
        case TVOCallQualityWarningConstantAudioInputLevel:
            return @"constant-audio-input-level";
        default:
            return @"undefined";
    }
}

- (NSString *)getSimplifiedISO8601FormattedTimestamp:(NSDate *)date {
    NSDateFormatter *formatter = [[NSDateFormatter alloc] init];
    NSLocale *locale = [NSLocale currentLocale];
    [formatter setLocale:locale];
    [formatter setDateFormat:@"yyyy'-'MM'-'dd'T'HH':'mm':'ss'.'SSSZ"];

    return [formatter stringFromDate:date];
}

@end
