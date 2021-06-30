//
//  TwilioVoiceReactNative.m
//  TwilioVoiceReactNative
//
//  Copyright © 2021 Twilio, Inc. All rights reserved.
//

#import "TwilioVoicePushRegistry.h"
#import "TwilioVoiceReactNative.h"

NSString * const kTwilioVoiceReactNativeEventVoice = @"Voice";
NSString * const kTwilioVoiceReactNativeEventCall = @"Call";

@import TwilioVoice;

@interface TwilioVoiceReactNative () <TVOCallDelegate>

@property(nonatomic, strong) NSData *deviceTokenData;

@property (nonatomic, strong) NSMutableDictionary *callMap;
@property (nonatomic, strong) TVOCall *activeCall;
@property (nonatomic, strong) TVODefaultAudioDevice *audioDevice;

@end


@implementation TwilioVoiceReactNative

- (instancetype)init {
    if (self = [super init]) {
        _callMap = [NSMutableDictionary dictionary];
        _audioDevice = [TVODefaultAudioDevice audioDevice];
        TwilioVoiceSDK.audioDevice = _audioDevice;
        
        TwilioVoiceSDK.logLevel = TVOLogLevelTrace;
        
        [self subscribeToNotifications];
    }

    return self;
}

- (void)subscribeToNotifications {
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(handlePushRegistryNotification:)
                                                 name:kTwilioVoicePushRegistryNotification
                                               object:nil];
}

- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)handlePushRegistryNotification:(NSNotification *)notification {
    NSDictionary *eventBody = notification.userInfo;
    if ([eventBody[kTwilioVoicePushRegistryNotificationType] isEqualToString:kTwilioVoicePushRegistryNotificationDeviceTokenUpdated]) {
        NSAssert(eventBody[kTwilioVoicePushRegistryNotificationDeviceTokenKey] != nil, @"Missing device token. Please check the body of NSNotification.userInfo,");
        self.deviceTokenData = eventBody[kTwilioVoicePushRegistryNotificationDeviceTokenKey];
    } else {
        [self sendEventWithName:kTwilioVoiceReactNativeEventVoice body:eventBody];
    }
}

RCT_EXPORT_MODULE();

#pragma mark - React Native

- (NSArray<NSString *> *)supportedEvents
{
  return @[kTwilioVoiceReactNativeEventVoice, kTwilioVoiceReactNativeEventCall];
}

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

#pragma mark - Bingings (Voice methods)

RCT_EXPORT_METHOD(voice_getVersion:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    resolve(TwilioVoiceSDK.sdkVersion);
}

RCT_EXPORT_METHOD(voice_register:(NSString *)accessToken
                  deviceToken:(NSString *)deviceToken
                  channelType:(NSString *)channelType
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    [TwilioVoiceSDK registerWithAccessToken:accessToken
                                deviceToken:self.deviceTokenData
                                 completion:^(NSError *error) {
        if (error) {
            NSString *errorMessage = [NSString stringWithFormat:@"Failed to register: %@", error];
            NSLog(@"%@", errorMessage);
            reject(@"Voice error", errorMessage, nil);
        } else {
            resolve(nil);
        }
    }];
}

RCT_EXPORT_METHOD(voice_unregister:(NSString *)accessToken
                  deviceToken:(NSString *)deviceToken
                  channelType:(NSString *)channelType
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    [TwilioVoiceSDK unregisterWithAccessToken:accessToken
                                  deviceToken:self.deviceTokenData
                                   completion:^(NSError *error) {
        if (error) {
            NSString *errorMessage = [NSString stringWithFormat:@"Failed to unregister: %@", error];
            NSLog(@"%@", errorMessage);
            reject(@"Voice error", errorMessage, nil);
        } else {
            resolve(nil);
        }
    }];
}

RCT_EXPORT_METHOD(voice_connect:(NSString *)uuid
                  accessToken:(NSString *)accessToken
                  params:(NSDictionary *)params
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    TVOConnectOptions *connectOptions = [TVOConnectOptions optionsWithAccessToken:accessToken
                                                                            block:^(TVOConnectOptionsBuilder *builder) {
        builder.params = params;
        builder.uuid = [[NSUUID alloc] initWithUUIDString:uuid] ;
    }];
    self.activeCall = [TwilioVoiceSDK connectWithOptions:connectOptions delegate:self];
    self.callMap[uuid] = self.activeCall;

    resolve(nil);
}

#pragma mark - Bingings (Call)

RCT_EXPORT_METHOD(call_disconnect:(NSString *)uuid
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    TVOCall *call = self.callMap[uuid];
    if (call) {
        [call disconnect];
    }

    resolve(nil);
}

RCT_EXPORT_METHOD(call_getState:(NSString *)uuid
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    TVOCall *call = self.callMap[uuid];
    NSString *state = @"";
    if (call) {
        state = [self stringOfState:call.state];
    }
    
    resolve(state);
}

RCT_EXPORT_METHOD(call_getSid:(NSString *)uuid
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    TVOCall *call = self.callMap[uuid];
    NSString *callSid = (call && call.state != TVOCallStateConnecting)? call.sid : @"";
    
    resolve(callSid);
}

RCT_EXPORT_METHOD(call_getFrom:(NSString *)uuid
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    TVOCall *call = self.callMap[uuid];
    NSString *from = (call && [call.from length] > 0)? call.from : @"";
    
    resolve(from);
}

RCT_EXPORT_METHOD(call_getTo:(NSString *)uuid
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    TVOCall *call = self.callMap[uuid];
    NSString *to = (call && [call.to length] > 0)? call.to : @"";
    
    resolve(to);
}

RCT_EXPORT_METHOD(call_hold:(NSString *)uuid
                  onHold:(BOOL)onHold
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    TVOCall *call = self.callMap[uuid];
    if (call) {
        [call setOnHold:onHold];
    }
    
    resolve(nil);
}

RCT_EXPORT_METHOD(call_isOnHold:(NSString *)uuid
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    TVOCall *call = self.callMap[uuid];
    if (call) {
        resolve(@(call.isOnHold));
    } else {
        resolve(@(false));
    }
}

RCT_EXPORT_METHOD(call_mute:(NSString *)uuid
                  muted:(BOOL)muted
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    TVOCall *call = self.callMap[uuid];
    if (call) {
        [call setMuted:muted];
    }
    
    resolve(nil);
}

RCT_EXPORT_METHOD(call_isMuted:(NSString *)uuid
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    TVOCall *call = self.callMap[uuid];
    if (call) {
        resolve(@(call.isMuted));
    } else {
        resolve(@(false));
    }
}

RCT_EXPORT_METHOD(call_sendDigits:(NSString *)uuid
                  digits:(NSString *)digits
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    TVOCall *call = self.callMap[uuid];
    if (call) {
        [call sendDigits:digits];
    }
    
    resolve(nil);
}

#pragma mark - utility

RCT_EXPORT_METHOD(util_generateId:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    resolve([[NSUUID UUID] UUIDString]);
}

- (NSString *)stringOfState:(TVOCallState)state {
    switch (state) {
        case TVOCallStateConnecting:
            return @"connecting";
        case TVOCallStateRinging:
            return @"ringing";
        case TVOCallStateConnected:
            return @"conencted";
        case TVOCallStateReconnecting:
            return @"reconnecting";
        case TVOCallStateDisconnected:
            return @"disconnected";
        default:
            return @"connecting";
    }
}

#pragma mark - TVOCallDelegate

- (void)callDidStartRinging:(TVOCall *)call {
    NSLog(@"Call ringing.");
    self.audioDevice.enabled = YES;
    [self sendEventWithName:@"Call" body:@{@"type": @"ringing", @"uuid": [call.uuid UUIDString]}];
}

- (void)call:(TVOCall *)call didFailToConnectWithError:(NSError *)error {
    NSLog(@"Call failed to connect: %@.", error);
    [self sendEventWithName:@"Call" body:@{@"type": @"connectFailure", @"uuid": [call.uuid UUIDString], @"error": [error localizedDescription]}];

    // TODO: disconnect call with CallKit if needed
    // TODO: CallKit completion handler
}

- (void)call:(TVOCall *)call didDisconnectWithError:(NSError *)error {
    NSLog(@"Call disconnected with error: %@.", error);
    NSDictionary *messageBody = [NSDictionary dictionary];
    if (error) {
        messageBody = @{@"type": @"disconnected", @"uuid": [call.uuid UUIDString], @"error": [error localizedDescription]};
    } else {
        messageBody = @{@"type": @"disconnected", @"uuid": [call.uuid UUIDString]};
    }
    
    [self sendEventWithName:@"Call" body:messageBody];

    // TODO: end call with CallKit (if not user initiated-disconnect)
    // TODO: CallKit completion handler
}

- (void)callDidConnect:(TVOCall *)call {
    NSLog(@"Call connected.");
    [self sendEventWithName:@"Call" body:@{@"type": @"connected", @"uuid": [call.uuid UUIDString]}];

    // TODO: CallKit completion handler
    // TODO: report connected to CallKit
}

- (void)call:(TVOCall *)call isReconnectingWithError:(NSError *)error {
    NSLog(@"Call reconnecting: %@.", error);
    [self sendEventWithName:@"Call" body:@{@"type": @"connected", @"uuid": [call.uuid UUIDString], @"error": [error localizedDescription]}];
}

- (void)callDidReconnect:(TVOCall *)call {
    NSLog(@"Call reconnected.");
    [self sendEventWithName:@"Call" body:@{@"type": @"reconnected", @"uuid": [call.uuid UUIDString]}];
}

- (void)call:(TVOCall *)call
didReceiveQualityWarnings:(NSSet<NSNumber *> *)currentWarnings
previousWarnings:(NSSet<NSNumber *> *)previousWarnings {
    // TODO: process and emit warnings event
}

@end
