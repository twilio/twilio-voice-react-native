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

static TVODefaultAudioDevice *sAudioDevice;

@import TwilioVoice;

@interface TwilioVoiceReactNative ()

@property(nonatomic, strong) NSData *deviceTokenData;

@property (nonatomic, strong) NSMutableDictionary *callMap;

@end


@implementation TwilioVoiceReactNative

- (instancetype)init {
    if (self = [super init]) {
        _callMap = [NSMutableDictionary dictionary];
        sAudioDevice = [TVODefaultAudioDevice audioDevice];
        TwilioVoiceSDK.audioDevice = sAudioDevice;
        
        TwilioVoiceSDK.logLevel = TVOLogLevelTrace;
        
        [self subscribeToNotifications];
        [self initializeCallKit];
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
    } else if ([eventBody[kTwilioVoicePushRegistryNotificationType] isEqualToString:kTwilioVoicePushRegistryNotificationCallInviteRecelved]) {
        TVOCallInvite *callInvite = eventBody[kTwilioVoicePushRegistryNotificationCallInviteKey];
        NSAssert(callInvite != nil, @"Invalid call invite");
        [self reportNewIncomingCall:callInvite];
    } else if ([eventBody[kTwilioVoicePushRegistryNotificationType] isEqualToString:kTwilioVoicePushRegistryNotificationCallInviteCancelled]) {
        TVOCancelledCallInvite *cancelledCallInvite = eventBody[kTwilioVoicePushRegistryNotificationCancelledCallInviteKey];
        NSAssert(cancelledCallInvite != nil, @"Invalid cancelled call invite");
        [self endCallWithUuid:self.callInvite.uuid];
    } else {
        [self sendEventWithName:kTwilioVoiceReactNativeEventVoice body:eventBody];
    }
}

+ (TVODefaultAudioDevice *)audioDevice {
    return sAudioDevice;
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

@end
