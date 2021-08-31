//
//  TwilioVoiceReactNative.m
//  TwilioVoiceReactNative
//
//  Copyright © 2021 Twilio, Inc. All rights reserved.
//

#import "TwilioVoicePushRegistry.h"
#import "TwilioVoiceReactNative.h"
#import "TwilioVoiceReactNativeConstants.h"

NSString * const kTwilioVoiceReactNativeEventScopeVoice = @"Voice";
NSString * const kTwilioVoiceReactNativeEventScopeCall = @"Call";

NSString * const kTwilioVoiceReactNativeEventKeyType = @"type";
NSString * const kTwilioVoiceReactNativeEventKeyError = @"error";
NSString * const kTwilioVoiceReactNativeEventKeyCall = @"call";
NSString * const kTwilioVoiceReactNativeEventKeyCallInvite = @"callInvite";
NSString * const kTwilioVoiceReactNativeEventKeyCancelledCallInvite = @"cancelledCallInvite";
NSString * const kTwilioVoiceReactNativeEventKeyAudioDevicesUpdated = @"audioDevicesUpdated";
NSString * const kTwilioVoiceReactNativeEventKeyAudioDevices = @"audioDevices";
NSString * const kTwilioVoiceReactNativeEventKeySelectedDevice = @"selectedDevice";

NSString * const kTwilioVoiceReactNativeEventCallInviteReceived = @"callInvite";
NSString * const kTwilioVoiceReactNativeEventCallInviteCancelled = @"cancelledCallInvite";
NSString * const kTwilioVoiceReactNativeEventCallInviteAccepted = @"callInviteAccepted";
NSString * const kTwilioVoiceReactNativeEventCallInviteRejected = @"callInviteRejected";

NSString * const kTwilioVoiceCallInfoUuid = @"uuid";
NSString * const kTwilioVoiceCallInfoFrom = @"from";
NSString * const kTwilioVoiceCallInfoIsMuted = @"isMuted";
NSString * const kTwilioVoiceCallInfoInOnHold = @"isOnHold";
NSString * const kTwilioVoiceCallInfoSid = @"sid";
NSString * const kTwilioVoiceCallInfoTo = @"to";

NSString * const kTwilioVoiceCallInviteInfoUuid = @"uuid";
NSString * const kTwilioVoiceCallInviteInfoCallSid = @"callSid";
NSString * const kTwilioVoiceCallInviteInfoFrom = @"from";
NSString * const kTwilioVoiceCallInviteInfoTo = @"to";

NSString * const kTwilioVoiceAudioDeviceUuid = @"uuid";
NSString * const kTwilioVoiceAudioDeviceType = @"type";
NSString * const kTwilioVoiceAudioDeviceName = @"name";
NSString * const kTwilioVoiceAudioDeviceUid = @"uid";

static TVODefaultAudioDevice *sTwilioAudioDevice;

@import TwilioVoice;

@interface TwilioVoiceReactNative ()

@property(nonatomic, strong) NSData *deviceTokenData;
@property(nonatomic, strong) NSMutableDictionary *audioDevices;
@property(nonatomic, strong) NSDictionary *selectedAudioDevice;

@end

@implementation TwilioVoiceReactNative {
    BOOL _hasObserver;
}

- (instancetype)init {
    if (self = [super init]) {
        _callMap = [NSMutableDictionary dictionary];
        _callInviteMap = [NSMutableDictionary dictionary];
        _cancelledCallInviteMap = [NSMutableDictionary dictionary];
        _audioDevices = [NSMutableDictionary dictionary];
        
        sTwilioAudioDevice = [TVODefaultAudioDevice audioDevice];
        TwilioVoiceSDK.audioDevice = sTwilioAudioDevice;
        
        TwilioVoiceSDK.logLevel = TVOLogLevelTrace;
        
        [self subscribeToNotifications];
        [self initializeCallKit];
        [self initializeAudioDeviceList];
    }

    return self;
}

- (void)subscribeToNotifications {
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(handlePushRegistryNotification:)
                                                 name:kTwilioVoicePushRegistryNotification
                                               object:nil];
    
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(handleRouteChange:)
                                                 name:AVAudioSessionRouteChangeNotification
                                               object:nil];
}

- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)handlePushRegistryNotification:(NSNotification *)notification {
    NSMutableDictionary *eventBody = [notification.userInfo mutableCopy];
    if ([eventBody[kTwilioVoiceReactNativeEventKeyType] isEqualToString:kTwilioVoicePushRegistryNotificationDeviceTokenUpdated]) {
        NSAssert(eventBody[kTwilioVoicePushRegistryNotificationDeviceTokenKey] != nil, @"Missing device token. Please check the body of NSNotification.userInfo,");
        self.deviceTokenData = eventBody[kTwilioVoicePushRegistryNotificationDeviceTokenKey];
        
        // Skip the event emitting since 1, the listener has not registered and 2, the app does not need to know about this
        return;
    } else if ([eventBody[kTwilioVoiceReactNativeEventKeyType] isEqualToString:kTwilioVoiceReactNativeEventCallInviteReceived]) {
        TVOCallInvite *callInvite = eventBody[kTwilioVoicePushRegistryNotificationCallInviteKey];
        NSAssert(callInvite != nil, @"Invalid call invite");
        [self reportNewIncomingCall:callInvite];
        
        eventBody[kTwilioVoiceReactNativeEventKeyCallInvite] = [self callInviteInfo:callInvite];
    } else if ([eventBody[kTwilioVoiceReactNativeEventKeyType] isEqualToString:kTwilioVoiceReactNativeEventCallInviteCancelled]) {
        TVOCancelledCallInvite *cancelledCallInvite = eventBody[kTwilioVoicePushRegistryNotificationCancelledCallInviteKey];
        NSAssert(cancelledCallInvite != nil, @"Invalid cancelled call invite");
        
        NSString *uuid;
        for (NSString *uuidKey in [self.callInviteMap allKeys]) {
            TVOCallInvite *callInvite = self.callInviteMap[uuidKey];
            if ([callInvite.callSid isEqualToString:cancelledCallInvite.callSid]) {
                uuid = uuidKey;
                break;
            }
        }
        NSAssert(uuid, @"No matching call invite");
        self.cancelledCallInviteMap[uuid] = cancelledCallInvite;
        [self endCallWithUuid:[[NSUUID alloc] initWithUUIDString:uuid]];
        
        eventBody[kTwilioVoiceReactNativeEventKeyCancelledCallInvite] = [self cancelledCallInviteInfo:cancelledCallInvite];
    }
    
    [self sendEventWithName:kTwilioVoiceReactNativeEventScopeVoice body:eventBody];
}

+ (TVODefaultAudioDevice *)twilioAudioDevice {
    return sTwilioAudioDevice;
}

- (void)handleRouteChange:(NSNotification *)notification {
    NSLog(@"AVAudioSessionRouteChangeNotification");
    
    [self availableAudioDevices];
    
    NSMutableArray *nativeAudioDeviceInfos = [NSMutableArray array];
    for (NSString *key in [self.audioDevices allKeys]) {
        [nativeAudioDeviceInfos addObject:self.audioDevices[key]];
    }

    [self sendEventWithName:kTwilioVoiceReactNativeEventScopeVoice
                       body:@{kTwilioVoiceReactNativeEventKeyType: kTwilioVoiceReactNativeEventKeyAudioDevicesUpdated,
                              kTwilioVoiceReactNativeEventKeyAudioDevices: nativeAudioDeviceInfos,
                              kTwilioVoiceReactNativeEventKeySelectedDevice: self.selectedAudioDevice}];
}

- (void)initializeAudioDeviceList {
    NSUUID *receiverUuid = [NSUUID UUID];
    NSDictionary *builtInReceiver = @{ kTwilioVoiceAudioDeviceUuid: receiverUuid.UUIDString,
                                       kTwilioVoiceAudioDeviceType: @"Earpiece",
                                       kTwilioVoiceAudioDeviceName: @"iPhone",
                                       kTwilioVoiceAudioDeviceUid: AVAudioSessionPortBuiltInReceiver};
    self.audioDevices[receiverUuid.UUIDString] = builtInReceiver;
    
    NSUUID *speakerUuid = [NSUUID UUID];
    NSDictionary *builtInSpeaker = @{ kTwilioVoiceAudioDeviceUuid: speakerUuid.UUIDString,
                                      kTwilioVoiceAudioDeviceType: @"Speaker",
                                      kTwilioVoiceAudioDeviceName: @"Speaker",
                                      kTwilioVoiceAudioDeviceUid: AVAudioSessionPortBuiltInSpeaker};
    self.audioDevices[speakerUuid.UUIDString] = builtInSpeaker;
    
    [self availableAudioDevices];
}

- (NSDictionary *)availableAudioDevices {
    // Pop all except the built-in earpiece and speaker
    for (NSString *key in [self.audioDevices allKeys]) {
        if ([key isEqualToString:AVAudioSessionPortBuiltInMic] &&
            [key isEqualToString:AVAudioSessionPortBuiltInSpeaker]) {
            [self.audioDevices removeObjectForKey:key];
        }
    }
    
    NSLog(@"Available audio input devices");
    NSArray *availableInputs = [[AVAudioSession sharedInstance] availableInputs];
    for (AVAudioSessionPortDescription *port in availableInputs) {
        NSLog(@"\t%@, %@, %@", port.portType, port. portName, port.UID);
        
        if ([port.portType isEqualToString:AVAudioSessionPortBluetoothHFP]) {
            NSUUID *uuid = [NSUUID UUID];
            NSDictionary *bluetoothHfpDevice = @{ kTwilioVoiceAudioDeviceUuid: uuid.UUIDString,
                                                  kTwilioVoiceAudioDeviceType: @"Bluetooth",
                                                  kTwilioVoiceAudioDeviceName: port.portName };
            self.audioDevices[uuid.UUIDString] = bluetoothHfpDevice;
        }
    }
    
    NSLog(@"Current route, inputs");
    AVAudioSessionRouteDescription *currentRoute = [[AVAudioSession sharedInstance] currentRoute];
    NSArray *inputs = currentRoute.inputs;
    for (AVAudioSessionPortDescription *port in inputs) {
        NSLog(@"\t%@, %@, %@", port.portType, port.portName, port.UID);
    }
    
    NSLog(@"Current route, outputs");
    NSArray *outputs = currentRoute.outputs;
    for (AVAudioSessionPortDescription *port in outputs) {
        NSLog(@"\t%@, %@, %@", port.portType, port.portName, port.UID);
        
        BOOL found = NO;
        for (NSString *key in [self.audioDevices allKeys]) {
            NSDictionary *device = self.audioDevices[key];
            if ([device[kTwilioVoiceAudioDeviceUid] isEqualToString:port.UID]) {
                found = YES;
                self.selectedAudioDevice = self.audioDevices[key];
            }
        }
        
        if (!found) {
            NSLog(@"current output route not found in available inputs");
            NSUUID *uuid = [NSUUID UUID];
            NSDictionary *selectedDevice = @{ kTwilioVoiceAudioDeviceUuid: uuid.UUIDString,
                                              kTwilioVoiceAudioDeviceType: port.portType,
                                              kTwilioVoiceAudioDeviceName: port.portName };
            self.audioDevices[uuid] = selectedDevice;
            self.selectedAudioDevice = selectedDevice;
        }
    }

    return self.audioDevices;
}

- (void)selectAudioDevice:(NSString *)uuid {
    NSString *portUid;
    NSString *portType;

    for (NSString *key in [self.audioDevices allKeys]) {
        NSDictionary *device = self.audioDevices[key];
        if ([device[kTwilioVoiceAudioDeviceUuid] isEqualToString:uuid]) {
            portUid = device[kTwilioVoiceAudioDeviceUid];
            portType = device[kTwilioVoiceAudioDeviceType];
            break;
        }
    }
    
    if (portUid == nil || portType == nil) {
        NSLog(@"No matching audio device found for %@", uuid);
        return;
    }
    
    // Find port description with matching port type & UID in available input devices
    AVAudioSessionPortDescription *portDescription = nil;
    NSArray *availableInputs = [[AVAudioSession sharedInstance] availableInputs];
    for (AVAudioSessionPortDescription *port in availableInputs) {
        if ([port.portType isEqualToString:portType] && [port.UID isEqualToString:portUid]) {
            portDescription = port;
            break;
        }
    }

    if (!portDescription) {
        NSLog(@"No matching device with %@ found in the available devices", uuid);
        return;
    }

    // Update preferred input
    NSError *inputError;
    [[AVAudioSession sharedInstance] setPreferredInput:portDescription error:&inputError];
    if (inputError) {
        NSLog(@"Failed to set preferred input: %@", inputError);
    }
    
    // Override output to speaker if speaker is selected, otherwise choose "none"
    AVAudioSessionPortOverride outputOverride = ([portType isEqualToString:AVAudioSessionPortBuiltInSpeaker])?
                                                AVAudioSessionPortOverrideSpeaker : AVAudioSessionPortOverrideNone;
    
    NSError *outputError;
    [[AVAudioSession sharedInstance] overrideOutputAudioPort:outputOverride error:&outputError];
    if (outputError) {
        NSLog(@"Failed to override output port: %@", outputError);
    }
}

// TODO: Move to separate utility file someday
- (NSDictionary *)callInfo:(TVOCall *)call {
    return @{kTwilioVoiceCallInfoUuid: call.uuid? call.uuid.UUIDString : @"",
             kTwilioVoiceCallInfoFrom: call.from? call.from : @"",
             kTwilioVoiceCallInfoIsMuted: @(call.isMuted),
             kTwilioVoiceCallInfoInOnHold: @(call.isOnHold),
             kTwilioVoiceCallInfoSid: call.sid,
             kTwilioVoiceCallInfoTo: call.to? call.to : @""};
}

- (NSDictionary *)callInviteInfo:(TVOCallInvite *)callInvite {
    return @{kTwilioVoiceCallInviteInfoUuid: callInvite.uuid.UUIDString,
             kTwilioVoiceCallInviteInfoCallSid: callInvite.callSid,
             kTwilioVoiceCallInviteInfoFrom: callInvite.from,
             kTwilioVoiceCallInviteInfoTo: callInvite.to};
}

- (NSDictionary *)cancelledCallInviteInfo:(TVOCancelledCallInvite *)cancelledCallInvite {
    return @{kTwilioVoiceCallInviteInfoCallSid: cancelledCallInvite.callSid,
             kTwilioVoiceCallInviteInfoFrom: cancelledCallInvite.from,
             kTwilioVoiceCallInviteInfoTo: cancelledCallInvite.to};
}

RCT_EXPORT_MODULE();

#pragma mark - React Native

- (NSArray<NSString *> *)supportedEvents
{
  return @[kTwilioVoiceReactNativeEventScopeVoice, kTwilioVoiceReactNativeEventScopeCall];
}

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

- (void)startObserving {
    NSLog(@"Started observing");
    _hasObserver = YES;
}

- (void)stopObserving {
    NSLog(@"Stopped observing");
    _hasObserver = NO;
}

- (void)sendEventWithName:(NSString *)eventName body:(id)body {
    if (_hasObserver) {
        [super sendEventWithName:eventName body:body];
    } else {
        NSLog(@"No event observer registered yet. Omitting event: %@, event body: %@", eventName, body);
    }
}

#pragma mark - Bingings (Voice methods)

RCT_EXPORT_METHOD(voice_getVersion:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    resolve(TwilioVoiceSDK.sdkVersion);
}

RCT_EXPORT_METHOD(voice_getDeviceToken:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    if (self.deviceTokenData) {
        const char *tokenBytes = (const char *)[self.deviceTokenData bytes];
        NSMutableString *deviceTokenString = [NSMutableString string];
        for (NSUInteger i = 0; i < [self.deviceTokenData length]; ++i) {
            [deviceTokenString appendFormat:@"%02.2hhx", tokenBytes[i]];
        }
        resolve(deviceTokenString);
    } else {
        resolve(@"");
    }
}

RCT_EXPORT_METHOD(voice_register:(NSString *)accessToken
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

RCT_EXPORT_METHOD(voice_connect:(NSString *)accessToken
                  params:(NSDictionary *)params
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    [self makeCallWithAccessToken:accessToken params:params];
    self.callPromiseResolver = resolve;
}

RCT_EXPORT_METHOD(voice_getCalls:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSMutableArray *callInfoArray = [NSMutableArray array];
    for (NSString *uuid in [self.callMap allKeys]) {
        TVOCall *call = self.callMap[uuid];
        [callInfoArray addObject:[self callInfo:call]];
    }
    resolve(callInfoArray);
}

RCT_EXPORT_METHOD(voice_getCallInvites:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSMutableArray *callInviteInfoArray = [NSMutableArray array];
    for (NSString *uuid in [self.callInviteMap allKeys]) {
        TVOCallInvite *callInvite = self.callInviteMap[uuid];
        [callInviteInfoArray addObject:[self callInviteInfo:callInvite]];
    }
    resolve(callInviteInfoArray);
}

RCT_EXPORT_METHOD(voice_getAudioDevices:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSMutableArray *nativeAudioDeviceInfos = [NSMutableArray array];
    for (NSString *key in [self.audioDevices allKeys]) {
        [nativeAudioDeviceInfos addObject:self.audioDevices[key]];
    }
    resolve(@{kTwilioVoiceReactNativeEventKeyAudioDevices: nativeAudioDeviceInfos,
              kTwilioVoiceReactNativeEventKeySelectedDevice: self.selectedAudioDevice});
}

RCT_EXPORT_METHOD(voice_selectAudioDevice:(NSString *)uuid
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    resolve(nil);
}

#pragma mark - Bingings (Call)

RCT_EXPORT_METHOD(call_disconnect:(NSString *)uuid
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    if (self.callMap[uuid]) {
        [self endCallWithUuid:[[NSUUID alloc] initWithUUIDString:uuid]];
        resolve(nil);
    } else {
        reject(@"Voice error", [NSString stringWithFormat:@"Call with %@ not found", uuid], nil);
    }
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
        resolve(nil);
    } else {
        reject(@"Voice error", [NSString stringWithFormat:@"Call with %@ not found", uuid], nil);
    }
}

RCT_EXPORT_METHOD(call_isOnHold:(NSString *)uuid
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    TVOCall *call = self.callMap[uuid];
    if (call) {
        resolve(@(call.isOnHold));
    } else {
        resolve(@(NO));
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
        resolve(nil);
    } else {
        reject(@"Voice error", [NSString stringWithFormat:@"Call with %@ not found", uuid], nil);
    }
}

RCT_EXPORT_METHOD(call_isMuted:(NSString *)uuid
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    TVOCall *call = self.callMap[uuid];
    if (call) {
        resolve(@(call.isMuted));
    } else {
        resolve(@(NO));
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
        resolve(nil);
    } else {
        reject(@"Voice error", [NSString stringWithFormat:@"Call with %@ not found", uuid], nil);
    }
}

#pragma mark - Bingings (Call Invite)

RCT_EXPORT_METHOD(callInvite_accept:(NSString *)callInviteUuid
                  acceptOptions:(NSDictionary *)acceptOptions
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    [self answerCallInvite:[[NSUUID alloc] initWithUUIDString:callInviteUuid]
                completion:^(BOOL success) {
        if (success) {
            BOOL found = NO;
            for (NSString *uuidKey in [self.callMap allKeys]) {
                if ([uuidKey isEqualToString:callInviteUuid]) {
                    found = YES;
                    TVOCall *call = self.callMap[uuidKey];
                    resolve([self callInfo:call]);
                }
            }

            if (!found) {
                reject(@"Voice error", @"No matching call", nil);
            }
        } else {
            reject(@"Voice error", @"Failed to answer the call invite", nil);
        }
    }];
}

RCT_EXPORT_METHOD(callInvite_reject:(NSString *)callInviteUuiid
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    [self endCallWithUuid:[[NSUUID alloc] initWithUUIDString:callInviteUuiid]];
    resolve(nil);
}

RCT_EXPORT_METHOD(callInvite_isValid:(NSString *)callInviteUuiid
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    resolve(@(YES));
}

RCT_EXPORT_METHOD(callInvite_getCallSid:(NSString *)callInviteUuiid
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    if (self.callInviteMap[callInviteUuiid]) {
        TVOCallInvite *callInvite = self.callInviteMap[callInviteUuiid];
        resolve(callInvite.callSid);
    } else {
        reject(@"Voice error", @"No matching call invite", nil);
    }
}

RCT_EXPORT_METHOD(callInvite_getFrom:(NSString *)callInviteUuiid
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    if (self.callInviteMap[callInviteUuiid]) {
        TVOCallInvite *callInvite = self.callInviteMap[callInviteUuiid];
        resolve(callInvite.from);
    } else {
        reject(@"Voice error", @"No matching call invite", nil);
    }
}

RCT_EXPORT_METHOD(callInvite_getTo:(NSString *)callInviteUuiid
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    if (self.callInviteMap[callInviteUuiid]) {
        TVOCallInvite *callInvite = self.callInviteMap[callInviteUuiid];
        resolve(callInvite.to);
    } else {
        reject(@"Voice error", @"No matching call invite", nil);
    }
}

RCT_EXPORT_METHOD(cancelledCallInvite_getCallSid:(NSString *)cancelledCallInviteUuiid
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    if (self.cancelledCallInviteMap[cancelledCallInviteUuiid]) {
        TVOCancelledCallInvite *cancelledCallInvite = self.cancelledCallInviteMap[cancelledCallInviteUuiid];
        resolve(cancelledCallInvite.callSid);
    } else {
        reject(@"Voice error", @"No matching cancelled call invite", nil);
    }
}

RCT_EXPORT_METHOD(cancelledCallInvite_getFrom:(NSString *)cancelledCallInviteUuiid
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    if (self.cancelledCallInviteMap[cancelledCallInviteUuiid]) {
        TVOCancelledCallInvite *cancelledCallInvite = self.cancelledCallInviteMap[cancelledCallInviteUuiid];
        resolve(cancelledCallInvite.from);
    } else {
        reject(@"Voice error", @"No matching cancelled call invite", nil);
    }
}

RCT_EXPORT_METHOD(cancelledCallInvite_getTo:(NSString *)cancelledCallInviteUuiid
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    if (self.cancelledCallInviteMap[cancelledCallInviteUuiid]) {
        TVOCancelledCallInvite *cancelledCallInvite = self.cancelledCallInviteMap[cancelledCallInviteUuiid];
        resolve(cancelledCallInvite.to);
    } else {
        reject(@"Voice error", @"No matching cancelled call invite", nil);
    }
}

#pragma mark - utility

RCT_EXPORT_METHOD(util_generateId:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    resolve([NSUUID UUID].UUIDString);
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
