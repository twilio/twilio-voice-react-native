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

RCT_EXPORT_METHOD(
  voice_runPreflight:(NSString *)accessToken
  options:(NSDictionary *)options
  resolver:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
) {
  NSString *uuid = [NSUUID UUID].UUIDString;
  NSError *preflightTestError = [self startPreflightTestWithAccessToken:accessToken uuid:uuid];
  
  if (preflightTestError != nil) {
    reject(
      [NSString stringWithFormat:@"%lu", preflightTestError.code],
      preflightTestError.localizedDescription,
      nil
    );
  }
  
  resolve(uuid);
}

- (NSError *)startPreflightTestWithAccessToken:(NSString *)accessToken uuid:(NSString *)uuid {
  NSLog(@"Starting preflight test");
  
  if (self.preflightTest != nil) {
    if (self.preflightTest.status == TVOPreflightTestStatusConnected || self.preflightTest.status == TVOPreflightTestStatusConnecting) {
      return [NSError errorWithDomain:@"PreflightTest" code:0 userInfo:@{NSLocalizedDescriptionKey: @"Preflight Test in-progress."}];
    }
  }
  
  self.preflightTestUuid = uuid;
  self.preflightTest = [TwilioVoiceSDK runPreflightTestWithAccessToken:accessToken delegate:self];
  
  return nil;
}

- (void)preflight:(nonnull TVOPreflightTest *)preflightTest didCompleteWitReport:(nonnull TVOPreflightReport *)report {
  NSError *jsonParseError;
  NSData *jsonData = [NSJSONSerialization dataWithJSONObject:[report dictionaryReport] options:NSJSONWritingFragmentsAllowed error:&jsonParseError];
  if (jsonParseError != nil) {
    // warn that we could not parse the report as json
    NSLog(@"Failed to parse report as json: %@", jsonParseError);
  }
  NSString *jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
  
  [self sendEventWithName:kTwilioVoiceReactNativeScopePreflightTest body:@{
    kTwilioVoiceReactNativePreflightTestEventKeyUuid: self.preflightTestUuid,
    kTwilioVoiceReactNativePreflightTestEventKeyType: kTwilioVoiceReactNativePreflightTestEventTypeValueCompleted,
    kTwilioVoiceReactNativePreflightTestCompletedEventKeyReport: jsonString,
  }];
}

- (void)preflight:(nonnull TVOPreflightTest *)preflightTest didFailWithError:(nonnull NSError *)error { 
  [self sendEventWithName:kTwilioVoiceReactNativeScopePreflightTest body:@{
    kTwilioVoiceReactNativePreflightTestEventKeyUuid: self.preflightTestUuid,
    kTwilioVoiceReactNativePreflightTestEventKeyType: kTwilioVoiceReactNativePreflightTestFailedEventKeyError,
    kTwilioVoiceReactNativePreflightTestFailedEventKeyError: @{
      kTwilioVoiceReactNativeVoiceErrorKeyCode: @(error.code),
      kTwilioVoiceReactNativeVoiceErrorKeyMessage: error.localizedDescription,
    },
  }];
}

- (void)preflightDidConnect:(nonnull TVOPreflightTest *)preflightTest {
  [self sendEventWithName:kTwilioVoiceReactNativeScopePreflightTest body:@{
    kTwilioVoiceReactNativePreflightTestEventKeyUuid: self.preflightTestUuid,
    kTwilioVoiceReactNativePreflightTestEventKeyType: kTwilioVoiceReactNativePreflightTestEventTypeValueConnected,
  }];
}

- (void)preflight:(TVOPreflightTest *)preflightTest didReceiveQualityWarnings:(NSSet<NSNumber *> *)currentWarnings previousWarnings:(NSSet<NSNumber *> *)previousWarnings {
  NSMutableArray *currentWarningsArr = [self callQualityWarningsArrayFromSet:currentWarnings];
  NSMutableArray *previousWarningsArr = [self callQualityWarningsArrayFromSet:previousWarnings];

  [self sendEventWithName:kTwilioVoiceReactNativeScopePreflightTest body:@{
    kTwilioVoiceReactNativePreflightTestEventKeyUuid: self.preflightTestUuid,
    kTwilioVoiceReactNativePreflightTestEventKeyType: kTwilioVoiceReactNativePreflightTestEventTypeValueQualityWarning,
    kTwilioVoiceReactNativePreflightTestQualityWarningEventKeyCurrentWarnings: currentWarningsArr,
    kTwilioVoiceReactNativePreflightTestQualityWarningEventKeyPreviousWarnings: previousWarningsArr,
  }];
}

- (void)preflight:(TVOPreflightTest *)preflightTest didReceiveStatsSample:(TVOPreflightStatsSample *)statsSample {
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
    // warn that we could not parse the report as json
    NSLog(@"Failed to parse report as json: %@", jsonParseError);
  }
  NSString *jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
  
  [self sendEventWithName:kTwilioVoiceReactNativeScopePreflightTest body:@{
    kTwilioVoiceReactNativePreflightTestEventKeyUuid: self.preflightTestUuid,
    kTwilioVoiceReactNativePreflightTestEventKeyType: kTwilioVoiceReactNativePreflightTestEventTypeValueSample,
    kTwilioVoiceReactNativePreflightTestSampleEventKeySample: jsonString,
  }];
}

@end
