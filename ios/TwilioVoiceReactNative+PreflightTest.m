//
//  TwilioVoiceReactNative+PreflightTest.m
//  TwilioVoiceReactNative
//
//  Copyright © 2024 Twilio, Inc. All rights reserved.
//

@import TwilioVoice;

#import "TwilioVoiceReactNative.h"
#import "TwilioVoiceReactNativeConstants.h"

@interface TwilioVoiceReactNative (PreflightTest) <TVOPreflightDelegate>

@end

@implementation TwilioVoiceReactNative (PreflightTest)

RCT_EXPORT_METHOD(voice_runPreflight:(NSString *)accessToken
                  options:(NSDictionary *)jsPreflightOptions
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    NSString *uuid = [NSUUID UUID].UUIDString;
    
    TVOPreflightOptions *preflightOptions = [self parseJsPreflightOptions:accessToken jsPreflightOptions:jsPreflightOptions];
    
    NSString *preflightTestErrorCode = nil;
    NSString *preflightTestErrorMessage = nil;
    [self startPreflightTestWithAccessToken:accessToken preflightOptions:preflightOptions uuid:uuid errorCode:&preflightTestErrorCode errorMessage:&preflightTestErrorMessage];
    
    if (preflightTestErrorCode != nil) {
        reject(preflightTestErrorCode,
               preflightTestErrorMessage,
               nil);
        return;
    }
    
    resolve(uuid);
}

RCT_EXPORT_METHOD(preflightTest_getCallSid:(NSString *)uuid
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    if (![self checkForPreflightTest:uuid rejecter:reject]) {
        return;
    }
    
    resolve(self.preflightTest.callSid);
}

RCT_EXPORT_METHOD(preflightTest_getEndTime:(NSString *)uuid
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    if (![self checkForPreflightTest:uuid rejecter:reject]) {
        return;
    }
    
    NSString *endTime = @(self.preflightTest.endTime).stringValue;
    resolve(endTime);
}

RCT_EXPORT_METHOD(preflightTest_getLatestSample:(NSString *)uuid
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    if (![self checkForPreflightTest:uuid rejecter:reject]) {
        return;
    }
    
    NSString *jsonSample = [self preflightStatsSampleToJsonString:self.preflightTest.latestSample];
    resolve(jsonSample);
}

RCT_EXPORT_METHOD(preflightTest_getReport:(NSString *)uuid
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    if (![self checkForPreflightTest:uuid rejecter:reject]) {
        return;
    }
    
    NSString *jsonReport = [self preflightReportToJsonString:self.preflightTest.preflightReport];
    resolve(jsonReport);
}

RCT_EXPORT_METHOD(preflightTest_getStartTime:(NSString *)uuid
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    if (![self checkForPreflightTest:uuid rejecter:reject]) {
        return;
    }
    
    NSString *startTime = @(self.preflightTest.startTime).stringValue;
    resolve(startTime);
}

RCT_EXPORT_METHOD(preflightTest_getState:(NSString *)uuid
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    if (![self checkForPreflightTest:uuid rejecter:reject]) {
        return;
    }
    
    NSString *state = [self preflightStatusToStateString:self.preflightTest.status];
    resolve(state);
}

RCT_EXPORT_METHOD(preflightTest_stop:(NSString *)uuid
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    if (![self checkForPreflightTest:uuid rejecter:reject]) {
        return;
    }
    
    [self.preflightTest stop];
    resolve(nil);
}

- (bool)checkForPreflightTest:(NSString *)uuid rejecter:(RCTPromiseRejectBlock)reject {
    if (self.preflightTest == nil ||
        self.preflightTestUuid == nil ||
        ![self.preflightTestUuid isEqualToString:uuid]) {
        
        NSString *errorMessage = [NSString stringWithFormat:@"No existing preflight test object with UUID \"%@\".", uuid];
        reject(kTwilioVoiceReactNativeErrorCodeInvalidStateError,
               errorMessage,
               nil);
        return false;
    }
    
    return true;
}

- (NSString *)preflightStatsSampleToJsonString:(TVOPreflightStatsSample *)statsSample {
    NSDictionary *sampleDict = @{
        kTwilioVoiceReactNativePreflightRTCSampleAudioInputLevel: @(statsSample.audioInputLevel),
        kTwilioVoiceReactNativePreflightRTCSampleAudioOutputLevel: @(statsSample.audioOutputLevel),
        kTwilioVoiceReactNativePreflightRTCSampleBytesReceived: @(statsSample.bytesReceived),
        kTwilioVoiceReactNativePreflightRTCSampleBytesSent: @(statsSample.bytesSent),
        kTwilioVoiceReactNativePreflightRTCSampleCodec: statsSample.codec,
        kTwilioVoiceReactNativePreflightRTCSampleJitter: @(statsSample.jitter),
        kTwilioVoiceReactNativePreflightRTCSampleMos: @(statsSample.mos),
        kTwilioVoiceReactNativePreflightRTCSamplePacketsLost: @(statsSample.packetsLost),
        kTwilioVoiceReactNativePreflightRTCSamplePacketsLostFraction: @(statsSample.packetsLostFraction),
        kTwilioVoiceReactNativePreflightRTCSamplePacketsReceived: @(statsSample.packetsReceived),
        kTwilioVoiceReactNativePreflightRTCSamplePacketsSent: @(statsSample.packetsSent),
        kTwilioVoiceReactNativePreflightRTCSampleRtt: @(statsSample.rtt),
        kTwilioVoiceReactNativePreflightRTCSampleTimestamp: statsSample.timestamp,
    };
    
    NSError *jsonParseError;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:sampleDict options:NSJSONWritingFragmentsAllowed error:&jsonParseError];
    if (jsonParseError != nil) {
        // warn that we could not parse the sample as json
        NSLog(@"Failed to parse sample as json: %@", jsonParseError);
    }
    NSString *jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
    
    return jsonString;
}

- (NSString *)preflightReportToJsonString:(TVOPreflightReport *)report {
    NSError *jsonParseError;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:[report dictionaryReport] options:NSJSONWritingFragmentsAllowed error:&jsonParseError];
    if (jsonParseError != nil) {
        // warn that we could not parse the report as json
        NSLog(@"Failed to parse report as json: %@", jsonParseError);
    }
    NSString *jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
    
    return jsonString;
}

- (NSString *)preflightStatusToStateString:(TVOPreflightTestStatus)status {
    switch (status) {
        case TVOPreflightTestStatusCompleted: {
            return kTwilioVoiceReactNativePreflightTestStateCompleted;
        }
        case TVOPreflightTestStatusConnected: {
            return kTwilioVoiceReactNativePreflightTestStateConnected;
        }
        case TVOPreflightTestStatusConnecting: {
            return kTwilioVoiceReactNativePreflightTestStateConnecting;
        }
        case TVOPreflightTestStatusFailed: {
            return kTwilioVoiceReactNativePreflightTestStateFailed;
        }
    }
}

- (TVOPreflightOptions *)parseJsPreflightOptions:(NSString *)accessToken jsPreflightOptions:(NSDictionary *)jsPreflightOptions {
    // ice options logic
    TVOIceOptions *iceOptions = [TVOIceOptions optionsWithBlock:^(TVOIceOptionsBuilder *iceOptionsBuilderBlock) {
        // ice servers logic
        NSArray<NSDictionary *> *jsIceServers = [jsPreflightOptions objectForKey:kTwilioVoiceReactNativeCallOptionsKeyIceServers];
        NSMutableArray *nativeIceServers = [NSMutableArray new];
        for (NSDictionary *jsIceServer in jsIceServers) {
            NSString *password = [jsIceServer objectForKey:kTwilioVoiceReactNativeIceServerKeyPassword];
            NSString *username = [jsIceServer objectForKey:kTwilioVoiceReactNativeIceServerKeyUsername];
            NSString *serverUrl = [jsIceServer objectForKey:kTwilioVoiceReactNativeIceServerKeyServerUrl];
            
            if (serverUrl != nil && username != nil && password != nil) {
                TVOIceServer *nativeIceServer = [[TVOIceServer alloc] initWithURLString:serverUrl username:username password:password];
                [nativeIceServers addObject:nativeIceServer];
            } else if (serverUrl != nil) {
                TVOIceServer *nativeIceServer = [[TVOIceServer alloc] initWithURLString:serverUrl];
                [nativeIceServers addObject:nativeIceServer];
            }
        }
        if (nativeIceServers.count > 0) {
            iceOptionsBuilderBlock.servers = nativeIceServers;
        }
        
        // transport policy logic
        NSString *jsIceTransportPolicy = [jsPreflightOptions objectForKey:kTwilioVoiceReactNativeCallOptionsKeyIceTransportPolicy];
        if ([jsIceTransportPolicy isEqualToString:kTwilioVoiceReactNativeIceTransportPolicyValueAll]) {
            iceOptionsBuilderBlock.transportPolicy = TVOIceTransportPolicyAll;
        }
        if ([jsIceTransportPolicy isEqualToString:kTwilioVoiceReactNativeIceTransportPolicyValueRelay]) {
            iceOptionsBuilderBlock.transportPolicy = TVOIceTransportPolicyRelay;
        }
    }];
    
    // preferred audio codecs option
    NSArray<NSDictionary *> *jsPreferredAudioCodecs = [jsPreflightOptions objectForKey:kTwilioVoiceReactNativeCallOptionsKeyPreferredAudioCodecs];
    NSMutableArray *nativePreferredAudioCodecs = [NSMutableArray new];
    for (NSDictionary *jsPreferredAudioCodec in jsPreferredAudioCodecs) {
        NSString *jsAudioCodecType = [jsPreferredAudioCodec objectForKey:kTwilioVoiceReactNativeAudioCodecKeyType];
        // opus codec
        if ([jsAudioCodecType isEqualToString:kTwilioVoiceReactNativeAudioCodecTypeValueOpus]) {
            NSNumber *opusMaxAvgBitrate = [jsPreferredAudioCodec objectForKey:kTwilioVoiceReactNativeAudioCodecOpusKeyMaxAverageBitrate];
            if (opusMaxAvgBitrate != nil && opusMaxAvgBitrate > 0) {
                [nativePreferredAudioCodecs addObject:[[TVOOpusCodec new] initWithMaxAverageBitrate:[opusMaxAvgBitrate intValue]]];
            } else {
                [nativePreferredAudioCodecs addObject:[TVOOpusCodec new]];
            }
        }
        // pcmu codec
        if ([jsAudioCodecType isEqualToString:kTwilioVoiceReactNativeAudioCodecTypeValuePCMU]) {
            [nativePreferredAudioCodecs addObject:[TVOPcmuCodec new]];
        }
    }
    
    TVOPreflightOptions *preflightOptions = [TVOPreflightOptions optionsWithAccessToken:accessToken block:^(TVOPreflightOptionsBuilder *preflightOptionsBuilderBlock) {
        preflightOptionsBuilderBlock.iceOptions = iceOptions;
        if ([nativePreferredAudioCodecs count] > 0) {
            preflightOptionsBuilderBlock.preferredAudioCodecs = nativePreferredAudioCodecs;
        }
    }];
    
    return preflightOptions;
}

- (void)startPreflightTestWithAccessToken:(NSString *)accessToken
                         preflightOptions:(TVOPreflightOptions *)preflightOptions
                                     uuid:(NSString *)uuid
                                errorCode:(NSString **)errorCode
                             errorMessage:(NSString **)errorMessage {
    
    if (self.preflightTest != nil) {
        NSLog(@"existing preflight test object with status %lu", self.preflightTest.status);
        if (self.preflightTest.status == TVOPreflightTestStatusConnected || self.preflightTest.status == TVOPreflightTestStatusConnecting) {
            *errorCode = kTwilioVoiceReactNativeErrorCodeInvalidStateError;
            *errorMessage = @"Existing preflight test in-progress.";
            return;
        }
    }
    
    self.preflightTestUuid = uuid;
    self.preflightTestEvents = [NSMutableArray array];
    self.preflightTest = [TwilioVoiceSDK runPreflightTestWithOptions:preflightOptions delegate:self];
}

- (void)sendPreflightEvent:(NSDictionary *)eventPayload {
    if (self.preflightTestEvents == nil) {
        // this indicates that the events for this uuid have already been flushed
        // just send the event instead
        [self sendEventWithName:kTwilioVoiceReactNativeScopePreflightTest body:eventPayload];
    } else {
        // otherwise, enqueue the event
        [self.preflightTestEvents addObject:eventPayload];
    }
}

RCT_EXPORT_METHOD(preflightTest_flushEvents:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    if (self.preflightTestEvents == nil) {
        // this indicates that the events have already been flushed
        resolve(nil);
        return;
    }
    
    for (NSMutableDictionary *event in self.preflightTestEvents) {
        [self sendEventWithName:kTwilioVoiceReactNativeScopePreflightTest body:event];
    }
    
    self.preflightTestEvents = nil;
    resolve(nil);
}

- (void)preflight:(nonnull TVOPreflightTest *)preflightTest didCompleteWitReport:(nonnull TVOPreflightReport *)report {
    [self sendPreflightEvent:@{
        kTwilioVoiceReactNativePreflightTestEventKeyUuid: self.preflightTestUuid,
        kTwilioVoiceReactNativePreflightTestEventKeyType: kTwilioVoiceReactNativePreflightTestEventTypeValueCompleted,
        kTwilioVoiceReactNativePreflightTestCompletedEventKeyReport: [self preflightReportToJsonString:report],
    }];
}

- (void)preflight:(nonnull TVOPreflightTest *)preflightTest didFailWithError:(nonnull NSError *)error {
    [self sendPreflightEvent:@{
        kTwilioVoiceReactNativePreflightTestEventKeyUuid: self.preflightTestUuid,
        kTwilioVoiceReactNativePreflightTestEventKeyType: kTwilioVoiceReactNativePreflightTestEventTypeValueFailed,
        kTwilioVoiceReactNativePreflightTestFailedEventKeyError: @{
            kTwilioVoiceReactNativeVoiceErrorKeyCode: [NSNumber numberWithLong:error.code],
            kTwilioVoiceReactNativeVoiceErrorKeyMessage: error.localizedDescription,
        },
    }];
}

- (void)preflightDidConnect:(nonnull TVOPreflightTest *)preflightTest {
    [self sendPreflightEvent:@{
        kTwilioVoiceReactNativePreflightTestEventKeyUuid: self.preflightTestUuid,
        kTwilioVoiceReactNativePreflightTestEventKeyType: kTwilioVoiceReactNativePreflightTestEventTypeValueConnected,
    }];
}

- (void)preflight:(TVOPreflightTest *)preflightTest didReceiveQualityWarnings:(NSSet<NSNumber *> *)currentWarnings previousWarnings:(NSSet<NSNumber *> *)previousWarnings {
    NSMutableArray *currentWarningsArr = [self callQualityWarningsArrayFromSet:currentWarnings];
    NSMutableArray *previousWarningsArr = [self callQualityWarningsArrayFromSet:previousWarnings];
    
    [self sendPreflightEvent:@{
        kTwilioVoiceReactNativePreflightTestEventKeyUuid: self.preflightTestUuid,
        kTwilioVoiceReactNativePreflightTestEventKeyType: kTwilioVoiceReactNativePreflightTestEventTypeValueQualityWarning,
        kTwilioVoiceReactNativePreflightTestQualityWarningEventKeyCurrentWarnings: currentWarningsArr,
        kTwilioVoiceReactNativePreflightTestQualityWarningEventKeyPreviousWarnings: previousWarningsArr,
    }];
}

- (void)preflight:(TVOPreflightTest *)preflightTest didReceiveStatsSample:(TVOPreflightStatsSample *)statsSample {
    [self sendPreflightEvent:@{
        kTwilioVoiceReactNativePreflightTestEventKeyUuid: self.preflightTestUuid,
        kTwilioVoiceReactNativePreflightTestEventKeyType: kTwilioVoiceReactNativePreflightTestEventTypeValueSample,
        kTwilioVoiceReactNativePreflightTestSampleEventKeySample: [self preflightStatsSampleToJsonString:statsSample],
    }];
}

@end
