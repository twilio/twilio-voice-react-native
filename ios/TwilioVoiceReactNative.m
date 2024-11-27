//
//  TwilioVoiceReactNative.m
//  TwilioVoiceReactNative
//
//  Copyright © 2022 Twilio, Inc. All rights reserved.
//

@import AVKit;

#import "TwilioVoicePushRegistry.h"
#import "TwilioVoiceReactNative.h"
#import "TwilioVoiceReactNativeConstants.h"
#import "TwilioVoiceStatsReport.h"

NSString * const kTwilioVoiceReactNativeVoiceError = @"Voice error";
dispatch_time_t const kPushRegistryDeviceTokenRetryTimeout = 3;
dispatch_time_t const kExponentialBackoff = 2;

// Call & call invite
NSString * const kTwilioVoiceReactNativeEventKeyCall = @"call";
NSString * const kTwilioVoiceReactNativeEventKeyCallInvite = @"callInvite";
NSString * const kTwilioVoiceReactNativeEventKeyCancelledCallInvite = @"cancelledCallInvite";

// Audio device
NSString * const kTwilioVoiceAudioDeviceUid = @"uid";

static TVODefaultAudioDevice *sTwilioAudioDevice;

@import TwilioVoice;

#pragma mark - Custom AVRoutePickerView Implementation

@interface TVRNAVRoutePickerView : AVRoutePickerView

- (void)present;

@end

@implementation TVRNAVRoutePickerView

- (instancetype)initWithFrame:(CGRect)frame {
    if (self = [super initWithFrame:frame]) {
        self.hidden = YES;
    }

    return self;
}

- (void)present {
    UIButton *routePickerButton;
    for (id view in self.subviews) {
        if ([view isKindOfClass:[UIButton class]]) {
            routePickerButton = (UIButton *)view;
            [routePickerButton sendActionsForControlEvents:UIControlEventTouchUpInside];
            break;
        }
    }
}

@end

#pragma mark - TwilioVoiceReactNative

@interface TwilioVoiceReactNative ()

@property (nonatomic, strong) TwilioVoicePushRegistry *twilioVoicePushRegistry;

@property(nonatomic, strong) NSData *deviceTokenData;
@property(nonatomic, strong) NSMutableDictionary *audioDevices;
@property(nonatomic, strong) NSDictionary *selectedAudioDevice;
@property(nonatomic, assign) BOOL registrationInProgress;

@end

@implementation TwilioVoiceReactNative {
    BOOL _hasObserver;
}

- (instancetype)init {
    if (self = [super init]) {
        _callMap = [NSMutableDictionary dictionary];
        _callConnectMap = [NSMutableDictionary dictionary];
        _callInviteMap = [NSMutableDictionary dictionary];
        _cancelledCallInviteMap = [NSMutableDictionary dictionary];
        _audioDevices = [NSMutableDictionary dictionary];

        NSString *reactNativeSDK = kTwilioVoiceReactNativeReactNativeVoiceSDK;
        setenv("global-env-sdk", [reactNativeSDK UTF8String], 1);

        NSString *reactNativeSdkVersion = kTwilioVoiceReactNativeReactNativeVoiceSDKVer;
        setenv("com.twilio.voice.env.sdk.version", [reactNativeSdkVersion UTF8String], 1);

        sTwilioAudioDevice = [TVODefaultAudioDevice audioDevice];
        TwilioVoiceSDK.audioDevice = sTwilioAudioDevice;

        TwilioVoiceSDK.logLevel = TVOLogLevelTrace;

        [self subscribeToNotifications];
        [self initializeCallKit];
        [self initializeAudioDeviceList];
    }

    return self;
}

- (void)initializePushRegistry {
    self.twilioVoicePushRegistry = [TwilioVoicePushRegistry new];
    [self.twilioVoicePushRegistry updatePushRegistry];
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
    NSString *type = eventBody[kTwilioVoiceReactNativeVoiceEventType];
    if ([type isEqualToString:kTwilioVoicePushRegistryNotificationDeviceTokenUpdated]) {
        self.deviceTokenData = eventBody[kTwilioVoicePushRegistryNotificationDeviceToken];

        // Skip the event emitting since 1, the listener has not registered and 2, the app does not need to know about this
        return;
    } else if ([type isEqualToString:kTwilioVoicePushRegistryNotificationIncomingPushReceived]) {
        NSDictionary *payload = eventBody[kTwilioVoicePushRegistryNotificationIncomingPushPayload];
        [TwilioVoiceSDK handleNotification:payload delegate:self delegateQueue:nil callMessageDelegate:self];
    }
}

+ (TVODefaultAudioDevice *)twilioAudioDevice {
    return sTwilioAudioDevice;
}

- (void)handleRouteChange:(NSNotification *)notification {
    [self availableAudioDevices];

    NSMutableArray *nativeAudioDeviceInfos = [NSMutableArray array];
    for (NSString *key in [self.audioDevices allKeys]) {
        [nativeAudioDeviceInfos addObject:self.audioDevices[key]];
    }

    NSMutableDictionary *eventBody = [@{
        kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeVoiceEventAudioDevicesUpdated,
        kTwilioVoiceReactNativeAudioDeviceKeyAudioDevices: nativeAudioDeviceInfos
    } mutableCopy];

    if (self.selectedAudioDevice != nil) {
        eventBody[kTwilioVoiceReactNativeAudioDeviceKeySelectedDevice] = self.selectedAudioDevice;
    }

    [self sendEventWithName:kTwilioVoiceReactNativeScopeVoice body:eventBody];
}

- (void)initializeAudioDeviceList {
    NSUUID *receiverUuid = [NSUUID UUID];
    NSDictionary *builtInReceiver = @{ kTwilioVoiceReactNativeAudioDeviceKeyUuid: receiverUuid.UUIDString,
                                       kTwilioVoiceReactNativeAudioDeviceKeyType: kTwilioVoiceReactNativeAudioDeviceKeyEarpiece,
                                       kTwilioVoiceReactNativeAudioDeviceKeyName: @"iPhone",
                                       kTwilioVoiceAudioDeviceUid: AVAudioSessionPortBuiltInReceiver};
    self.audioDevices[receiverUuid.UUIDString] = builtInReceiver;

    NSUUID *speakerUuid = [NSUUID UUID];
    NSDictionary *builtInSpeaker = @{ kTwilioVoiceReactNativeAudioDeviceKeyUuid: speakerUuid.UUIDString,
                                      kTwilioVoiceReactNativeAudioDeviceKeyType: kTwilioVoiceReactNativeAudioDeviceKeySpeaker,
                                      kTwilioVoiceReactNativeAudioDeviceKeyName: @"Speaker",
                                      kTwilioVoiceAudioDeviceUid: AVAudioSessionPortBuiltInSpeaker};
    self.audioDevices[speakerUuid.UUIDString] = builtInSpeaker;

    [self availableAudioDevices];
}

- (NSDictionary *)availableAudioDevices {
    // Pop all except the built-in earpiece and speaker
    for (NSString *key in [self.audioDevices allKeys]) {
        NSDictionary *audioDevice = self.audioDevices[key];
        if (![audioDevice[kTwilioVoiceAudioDeviceUid] isEqualToString:AVAudioSessionPortBuiltInReceiver] &&
            ![audioDevice[kTwilioVoiceAudioDeviceUid] isEqualToString:AVAudioSessionPortBuiltInSpeaker]) {
            [self.audioDevices removeObjectForKey:key];
        }
    }

    NSLog(@"Available audio input devices");
    NSArray *availableInputs = [[AVAudioSession sharedInstance] availableInputs];
    for (AVAudioSessionPortDescription *port in availableInputs) {
        NSLog(@"\t%@, %@, %@", port.portType, port. portName, port.UID);

        if ([port.portType isEqualToString:AVAudioSessionPortBluetoothHFP]) {
            NSUUID *uuid = [NSUUID UUID];
            NSDictionary *bluetoothHfpDevice = @{ kTwilioVoiceReactNativeAudioDeviceKeyUuid: uuid.UUIDString,
                                                  kTwilioVoiceReactNativeAudioDeviceKeyType: [self audioPortTypeMapping:port.portType],
                                                  kTwilioVoiceReactNativeAudioDeviceKeyName: port.portName,
                                                  kTwilioVoiceAudioDeviceUid: port.UID };
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

        if ([port.portType isEqualToString:AVAudioSessionPortBuiltInReceiver]) {
            for (NSString *key in [self.audioDevices allKeys]) {
                NSDictionary *device = self.audioDevices[key];
                if ([device[kTwilioVoiceReactNativeAudioDeviceKeyType] isEqualToString:kTwilioVoiceReactNativeAudioDeviceKeyEarpiece]) {
                    self.selectedAudioDevice = device;
                    break;
                }
            }
        } else if ([port.portType isEqualToString:AVAudioSessionPortBuiltInSpeaker]) {
            for (NSString *key in [self.audioDevices allKeys]) {
                NSDictionary *device = self.audioDevices[key];
                if ([device[kTwilioVoiceReactNativeAudioDeviceKeyType] isEqualToString:kTwilioVoiceReactNativeAudioDeviceKeySpeaker]) {
                    self.selectedAudioDevice = device;
                }
            }
        } else {
            BOOL found = NO;
            for (NSString *key in [self.audioDevices allKeys]) {
                NSDictionary *device = self.audioDevices[key];
                if ([device[kTwilioVoiceAudioDeviceUid] isEqualToString:port.UID]) {
                    found = YES;
                    self.selectedAudioDevice = device;
                    break;
                }
            }

            if (!found) {
                NSLog(@"Unidentified output device selected: %@, %@, %@", port.portType, port.portName, port.UID);
                NSUUID *uuid = [NSUUID UUID];
                NSDictionary *unidentifiedDevice = @{ kTwilioVoiceReactNativeAudioDeviceKeyUuid: uuid.UUIDString,
                                                      kTwilioVoiceReactNativeAudioDeviceKeyType: [self audioPortTypeMapping:port.portType],
                                                      kTwilioVoiceReactNativeAudioDeviceKeyName: port.portName,
                                                      kTwilioVoiceAudioDeviceUid: port.UID };
                self.audioDevices[uuid.UUIDString] = unidentifiedDevice;
                self.selectedAudioDevice = unidentifiedDevice;
            }
        }
    }

    return self.audioDevices;
}

- (NSString *)audioPortTypeMapping:(NSString *)portType {
    if ([portType isEqualToString:AVAudioSessionPortBuiltInReceiver]) {
        return kTwilioVoiceReactNativeAudioDeviceKeyEarpiece;
    } else if ([portType isEqualToString:AVAudioSessionPortBuiltInSpeaker]) {
        return kTwilioVoiceReactNativeAudioDeviceKeySpeaker;
    } else if ([portType isEqualToString:AVAudioSessionPortBluetoothHFP]) {
        return kTwilioVoiceReactNativeAudioDeviceKeyBluetooth;
    }

    return portType;
}

- (BOOL)selectAudioDevice:(NSString *)uuid {
    if (!self.audioDevices[uuid]) {
        NSLog(@"No matching audio device found for %@", uuid);
        return NO;
    }

    NSDictionary *device = self.audioDevices[uuid];
    NSString *portUid = device[kTwilioVoiceAudioDeviceUid];
    NSString *portType = device[kTwilioVoiceReactNativeAudioDeviceKeyType];

    NSLog(@"Selecting %@(%@), %@", device[kTwilioVoiceReactNativeAudioDeviceKeyName], device[kTwilioVoiceReactNativeAudioDeviceKeyType], device[kTwilioVoiceAudioDeviceUid]);

    AVAudioSessionPortDescription *portDescription = nil;
    if ([portType isEqualToString:kTwilioVoiceReactNativeAudioDeviceKeyEarpiece]) {
        NSArray *availableInputs = [[AVAudioSession sharedInstance] availableInputs];
        for (AVAudioSessionPortDescription *port in availableInputs) {
            if ([port.portType isEqualToString:AVAudioSessionPortBuiltInMic]) {
                portDescription = port;
                break;
            }
        }

        if (!portDescription) {
            NSLog(@"Built-in mic not found");
            return NO;
        }
    } else if ([portType isEqualToString:kTwilioVoiceReactNativeAudioDeviceKeyBluetooth]) {
        NSArray *availableInputs = [[AVAudioSession sharedInstance] availableInputs];
        for (AVAudioSessionPortDescription *port in availableInputs) {
            if ([port.UID isEqualToString:portUid]) {
                portDescription = port;
                break;
            }
        }

        if (!portDescription) {
            NSLog(@"Bluetooth device %@ not found", device[kTwilioVoiceReactNativeAudioDeviceKeyName]);
            return NO;
        }
    }

    // Update preferred input
    NSError *inputError;
    [[AVAudioSession sharedInstance] setPreferredInput:portDescription error:&inputError];
    if (inputError) {
        NSLog(@"Failed to set preferred input: %@", inputError);
        return NO;
    }

    // Override output to speaker if speaker is selected
    if ([portType isEqualToString:kTwilioVoiceReactNativeAudioDeviceKeySpeaker]) {
        AVAudioSessionPortOverride outputOverride = AVAudioSessionPortOverrideSpeaker;
        NSError *outputError;
        [[AVAudioSession sharedInstance] overrideOutputAudioPort:outputOverride error:&outputError];
        if (outputError) {
            NSLog(@"Failed to override output port: %@", outputError);
            return NO;
        }
    }

    return YES;
}

// TODO: Move to separate utility file someday
- (NSDictionary *)callInfo:(TVOCall *)call {
    NSMutableDictionary *callInfo = [@{kTwilioVoiceReactNativeCallInfoIsMuted: @(call.isMuted),
                                       kTwilioVoiceReactNativeCallInfoIsOnHold: @(call.isOnHold),
                                       kTwilioVoiceReactNativeCallInfoSid: call.sid,
                                       kTwilioVoiceReactNativeCallInfoState: [self stringOfState:call.state]} mutableCopy];

    if (call.uuid != nil) {
        callInfo[kTwilioVoiceReactNativeCallInfoUuid] = call.uuid.UUIDString;
    }

    if (call.from != nil) {
        callInfo[kTwilioVoiceReactNativeCallInfoFrom] = call.from;
    }

    if (call.to != nil) {
        callInfo[kTwilioVoiceReactNativeCallInfoTo] = call.to;
    }

    NSString *initialConnectedTimestamp = self.callConnectMap[call.uuid.UUIDString];
    if (initialConnectedTimestamp != nil) {
        callInfo[kTwilioVoiceReactNativeCallInfoInitialConnectedTimestamp] = initialConnectedTimestamp;
    }

    TVOCallInvite *callInvite = self.callInviteMap[call.uuid.UUIDString];
    if (callInvite && callInvite.customParameters) {
        callInfo[kTwilioVoiceReactNativeCallInviteInfoCustomParameters] = [callInvite.customParameters copy];
    }

    return callInfo;
}

- (NSDictionary *)callInviteInfo:(TVOCallInvite *)callInvite {
    NSMutableDictionary *callInviteInfo = [@{kTwilioVoiceReactNativeCallInviteInfoUuid: callInvite.uuid.UUIDString,
                                             kTwilioVoiceReactNativeCallInviteInfoCallSid: callInvite.callSid,
                                             kTwilioVoiceReactNativeCallInviteInfoTo: callInvite.to} mutableCopy];

    if (callInvite.from != nil) {
        callInviteInfo[kTwilioVoiceReactNativeCallInviteInfoFrom] = callInvite.from;
    }

    if (callInvite.customParameters != nil) {
        callInviteInfo[kTwilioVoiceReactNativeCallInviteInfoCustomParameters] = [callInvite.customParameters copy];
    }

    return callInviteInfo;
}

- (NSDictionary *)cancelledCallInviteInfo:(TVOCancelledCallInvite *)cancelledCallInvite {
    NSMutableDictionary *cancelledCallInviteInfo = [@{
        kTwilioVoiceReactNativeCancelledCallInviteInfoCallSid: cancelledCallInvite.callSid,
        kTwilioVoiceReactNativeCancelledCallInviteInfoTo: cancelledCallInvite.to
    } mutableCopy];

    if (cancelledCallInvite.from != nil) {
        cancelledCallInviteInfo[kTwilioVoiceReactNativeCancelledCallInviteInfoFrom] = cancelledCallInvite.from;
    }

    if (cancelledCallInvite.customParameters != nil) {
        cancelledCallInviteInfo[kTwilioVoiceReactNativeCancelledCallInviteInfoCustomParameters] = [cancelledCallInvite.customParameters copy];
    }

    return cancelledCallInviteInfo;
}

RCT_EXPORT_MODULE();

#pragma mark - React Native

- (NSArray<NSString *> *)supportedEvents
{
    return @[kTwilioVoiceReactNativeScopeVoice, kTwilioVoiceReactNativeScopeCall, kTwilioVoiceReactNativeScopeCallInvite, kTwilioVoiceReactNativeScopeCallMessage];
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

RCT_EXPORT_METHOD(voice_initializePushRegistry:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    [self initializePushRegistry];
    resolve(nil);
}

RCT_EXPORT_METHOD(voice_setCallKitConfiguration:(NSDictionary *)configuration
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    [self initializeCallKitWithConfiguration:configuration];
    resolve(nil);
}

RCT_EXPORT_METHOD(voice_register:(NSString *)accessToken
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
#if TARGET_IPHONE_SIMULATOR
    if (!self.deviceTokenData) {
        NSLog(@"Please note that PushKit and incoming call are not supported on simulators");
        NSString *testDeviceToken = @"deadbeefdeadbeefdeadbeefdeadbeef";
        self.deviceTokenData = [testDeviceToken dataUsingEncoding:NSUTF8StringEncoding];
    }
#endif

    if (self.registrationInProgress) {
        reject(kTwilioVoiceReactNativeVoiceError, @"Registration in progress. Please try again later", nil);
        return;
    }

    self.registrationInProgress = YES;

    [self asyncPushRegistryInitialization:kPushRegistryDeviceTokenRetryTimeout
                               completion:^(NSData *deviceTokenData) {
        if (deviceTokenData) {
            [TwilioVoiceSDK registerWithAccessToken:accessToken
                                        deviceToken:deviceTokenData
                                         completion:^(NSError *error) {
                self.registrationInProgress = NO;
                if (error) {
                    NSString *errorMessage = [NSString stringWithFormat:@"Failed to register: %@", error];
                    NSLog(@"%@", errorMessage);
                    [self sendEventWithName:kTwilioVoiceReactNativeScopeVoice
                                       body:@{kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeVoiceEventError,
                                              kTwilioVoiceReactNativeVoiceErrorKeyError: @{kTwilioVoiceReactNativeVoiceErrorKeyCode: @(error.code),
                                                                                           kTwilioVoiceReactNativeVoiceErrorKeyMessage: [error localizedDescription]}}];
                    reject(kTwilioVoiceReactNativeVoiceError, errorMessage, nil);
                } else {
                    [self sendEventWithName:kTwilioVoiceReactNativeScopeVoice
                                       body:@{kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeVoiceEventRegistered}];
                    resolve(nil);
                }
            }];
        } else {
            self.registrationInProgress = NO;
            reject(kTwilioVoiceReactNativeVoiceError, @"Failed to initialize PushKit device token", nil);
        }
    }];
}

- (void)asyncPushRegistryInitialization:(dispatch_time_t)timeout
                             completion:(void(^)(NSData *deviceTokenData))completion {
    if (self.deviceTokenData) {
        completion(self.deviceTokenData);
        return;
    }

    if (timeout > 0) {
        __block dispatch_time_t delay = dispatch_time(DISPATCH_TIME_NOW, (int64_t)(timeout * NSEC_PER_SEC));
        __weak typeof(self) weakSelf = self;
        dispatch_after(delay, dispatch_get_main_queue(), ^{
            dispatch_time_t backoffTimeout = (timeout > kExponentialBackoff)? timeout - kExponentialBackoff : 0;
            [weakSelf asyncPushRegistryInitialization:backoffTimeout completion:completion];
        });
    } else {
        // Device token could be nil. The voice_register() method will handle the promise.
        completion(self.deviceTokenData);
    }
}

RCT_EXPORT_METHOD(voice_unregister:(NSString *)accessToken
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
#if TARGET_IPHONE_SIMULATOR
    if (!self.deviceTokenData) {
        NSLog(@"Please note that PushKit and incoming call are not supported on simulators");
        NSString *testDeviceToken = @"deadbeefdeadbeefdeadbeefdeadbeef";
        self.deviceTokenData = [testDeviceToken dataUsingEncoding:NSUTF8StringEncoding];
    }
#endif

    if (self.registrationInProgress) {
        reject(kTwilioVoiceReactNativeVoiceError, @"Registration in progress. Please try again later", nil);
        return;
    }

    self.registrationInProgress = YES;

    [self asyncPushRegistryInitialization:kPushRegistryDeviceTokenRetryTimeout
                               completion:^(NSData *deviceTokenData) {
        if (deviceTokenData) {
            [TwilioVoiceSDK unregisterWithAccessToken:accessToken
                                          deviceToken:deviceTokenData
                                           completion:^(NSError *error) {
                self.registrationInProgress = NO;
                if (error) {
                    NSString *errorMessage = [NSString stringWithFormat:@"Failed to unregister: %@", error];
                    NSLog(@"%@", errorMessage);
                    [self sendEventWithName:kTwilioVoiceReactNativeScopeVoice
                                       body:@{kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeVoiceEventError,
                                              kTwilioVoiceReactNativeVoiceErrorKeyError: @{kTwilioVoiceReactNativeVoiceErrorKeyCode: @(error.code),
                                                                                           kTwilioVoiceReactNativeVoiceErrorKeyMessage: [error localizedDescription]}}];
                    reject(kTwilioVoiceReactNativeVoiceError, errorMessage, nil);
                } else {
                    [self sendEventWithName:kTwilioVoiceReactNativeScopeVoice
                                       body:@{kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeVoiceEventUnregistered}];
                    resolve(nil);
                }
            }];
        } else {
            self.registrationInProgress = NO;
            reject(kTwilioVoiceReactNativeVoiceError, @"Failed to initialize PushKit device token", nil);
        }
    }];
}

RCT_EXPORT_METHOD(voice_connect_ios:(NSString *)accessToken
                  params:(NSDictionary *)params
                  contactHandle:(NSString *)contactHandle
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    [self makeCallWithAccessToken:accessToken params:params contactHandle:contactHandle];
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
    resolve(@{kTwilioVoiceReactNativeAudioDeviceKeyAudioDevices: nativeAudioDeviceInfos,
              kTwilioVoiceReactNativeAudioDeviceKeySelectedDevice: self.selectedAudioDevice});
}

RCT_EXPORT_METHOD(voice_selectAudioDevice:(NSString *)uuid
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    if ([self selectAudioDevice:uuid]) {
        resolve(nil);
    } else {
        reject(kTwilioVoiceReactNativeVoiceError, [NSString stringWithFormat:@"Failed to select audio device %@", uuid], nil);
    }
}

RCT_EXPORT_METHOD(voice_showNativeAvRoutePicker:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    TVRNAVRoutePickerView *routePicker = [[TVRNAVRoutePickerView alloc] initWithFrame:CGRectZero];

    UIWindow *window = [UIApplication sharedApplication].windows[0];
    UIViewController *rootViewController = window.rootViewController;
    if (rootViewController) {
        UIViewController *topViewController = rootViewController;
        while (topViewController.presentedViewController) {
            topViewController = topViewController.presentedViewController;
        }

        dispatch_async(dispatch_get_main_queue(), ^{
            [topViewController.view addSubview:routePicker];
            [routePicker present];
        });
    }

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
        reject(kTwilioVoiceReactNativeVoiceError, [NSString stringWithFormat:@"Call with %@ not found", uuid], nil);
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
        resolve(@(call.isOnHold));
    } else {
        reject(kTwilioVoiceReactNativeVoiceError, [NSString stringWithFormat:@"Call with %@ not found", uuid], nil);
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
        resolve(@(call.isMuted));
    } else {
        reject(kTwilioVoiceReactNativeVoiceError, [NSString stringWithFormat:@"Call with %@ not found", uuid], nil);
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
        reject(kTwilioVoiceReactNativeVoiceError, [NSString stringWithFormat:@"Call with %@ not found", uuid], nil);
    }
}

RCT_EXPORT_METHOD(call_postFeedback:(NSString *)uuid
                  score:(NSString *)score
                  issue:(NSString *)issue
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    TVOCall *call = self.callMap[uuid];
    if (call) {
        [call postFeedback:[self scoreFromString:score] issue:[self issueFromString:issue]];
        resolve(nil);
    } else {
        reject(kTwilioVoiceReactNativeVoiceError, [NSString stringWithFormat:@"Call with %@ not found", uuid], nil);
    }
}

RCT_EXPORT_METHOD(call_getStats:(NSString *)uuid
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    TVOCall *call = self.callMap[uuid];
    if (call) {
        [call getStatsWithBlock:^(NSArray<TVOStatsReport *> *statsReports) {
            NSAssert([statsReports count] >= 1, @"Invalid stats reports array size");
            NSArray *statsReportJson = [TwilioVoiceStatsReport jsonWithStatsReportsArray:statsReports];
            resolve(statsReportJson);
        }];
    } else {
        reject(kTwilioVoiceReactNativeVoiceError, [NSString stringWithFormat:@"Call with %@ not found", uuid], nil);
    }
}

RCT_EXPORT_METHOD(call_sendMessage:(NSString *)uuid
                  content:(NSString *)content
                  contentType:(NSString *)contentType
                  messageType:(NSString *)messageType
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    TVOCallInvite *callInvite = self.callInviteMap[uuid];
    TVOCall *call = self.callMap[uuid];
    if (call) {
        TVOCallMessage *callMessage = [TVOCallMessage messageWithContent:content
                                                             messageType:messageType
                                                                   block:^(TVOCallMessageBuilder *builder) {
            builder.contentType = contentType;
        }];
        NSString *voiceEventSid = [call sendMessage:callMessage];
        resolve(voiceEventSid);
    } else if (callInvite) {
        TVOCallMessage *callMessage = [TVOCallMessage messageWithContent:content
                                                             messageType:messageType
                                                                   block:^(TVOCallMessageBuilder *builder) {
            builder.contentType = contentType;
        }];
        NSString *voiceEventSid = [callInvite sendMessage:callMessage];
        resolve(voiceEventSid);
    } else {
        reject(kTwilioVoiceReactNativeVoiceError, [NSString stringWithFormat:@"Call with %@ not found", uuid], nil);
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
                reject(kTwilioVoiceReactNativeVoiceError, @"No matching call", nil);
            }
        } else {
            reject(kTwilioVoiceReactNativeVoiceError, @"Failed to answer the call invite", nil);
        }
    }];
}

RCT_EXPORT_METHOD(callInvite_reject:(NSString *)callInviteUuid
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    [self endCallWithUuid:[[NSUUID alloc] initWithUUIDString:callInviteUuid]];
    resolve(nil);
}

RCT_EXPORT_METHOD(callInvite_isValid:(NSString *)callInviteUuid
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    resolve(@(YES));
}

RCT_EXPORT_METHOD(callInvite_getCallSid:(NSString *)callInviteUuid
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    if (self.callInviteMap[callInviteUuid]) {
        TVOCallInvite *callInvite = self.callInviteMap[callInviteUuid];
        resolve(callInvite.callSid);
    } else {
        reject(kTwilioVoiceReactNativeVoiceError, @"No matching call invite", nil);
    }
}

RCT_EXPORT_METHOD(callInvite_getFrom:(NSString *)callInviteUuid
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    if (self.callInviteMap[callInviteUuid]) {
        TVOCallInvite *callInvite = self.callInviteMap[callInviteUuid];
        resolve(callInvite.from);
    } else {
        reject(kTwilioVoiceReactNativeVoiceError, @"No matching call invite", nil);
    }
}

RCT_EXPORT_METHOD(callInvite_getTo:(NSString *)callInviteUuid
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    if (self.callInviteMap[callInviteUuid]) {
        TVOCallInvite *callInvite = self.callInviteMap[callInviteUuid];
        resolve(callInvite.to);
    } else {
        reject(kTwilioVoiceReactNativeVoiceError, @"No matching call invite", nil);
    }
}

RCT_EXPORT_METHOD(callInvite_updateCallerHandle:(NSString *)callInviteUuid
                  handle:(NSString *)handle
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    if (self.callInviteMap[callInviteUuid]) {
        [self updateCall:callInviteUuid callerHandle:handle];
        resolve(nil);
    } else {
        reject(kTwilioVoiceReactNativeVoiceError, @"No matching call invite", nil);
    }
}

RCT_EXPORT_METHOD(cancelledCallInvite_getCallSid:(NSString *)cancelledCallInviteUuid
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    if (self.cancelledCallInviteMap[cancelledCallInviteUuid]) {
        TVOCancelledCallInvite *cancelledCallInvite = self.cancelledCallInviteMap[cancelledCallInviteUuid];
        resolve(cancelledCallInvite.callSid);
    } else {
        reject(kTwilioVoiceReactNativeVoiceError, @"No matching cancelled call invite", nil);
    }
}

RCT_EXPORT_METHOD(cancelledCallInvite_getFrom:(NSString *)cancelledCallInviteUuid
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    if (self.cancelledCallInviteMap[cancelledCallInviteUuid]) {
        TVOCancelledCallInvite *cancelledCallInvite = self.cancelledCallInviteMap[cancelledCallInviteUuid];
        resolve(cancelledCallInvite.from);
    } else {
        reject(kTwilioVoiceReactNativeVoiceError, @"No matching cancelled call invite", nil);
    }
}

RCT_EXPORT_METHOD(cancelledCallInvite_getTo:(NSString *)cancelledCallInviteUuid
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    if (self.cancelledCallInviteMap[cancelledCallInviteUuid]) {
        TVOCancelledCallInvite *cancelledCallInvite = self.cancelledCallInviteMap[cancelledCallInviteUuid];
        resolve(cancelledCallInvite.to);
    } else {
        reject(kTwilioVoiceReactNativeVoiceError, @"No matching cancelled call invite", nil);
    }
}

#pragma mark - utility

RCT_EXPORT_METHOD(util_generateId:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    resolve([NSUUID UUID].UUIDString);
}

RCT_EXPORT_METHOD(voice_setIncomingCallContactHandleTemplate:(NSString *)template
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    self.incomingCallContactHandleTemplate = template;
    resolve(NULL);
}

- (NSString *)stringOfState:(TVOCallState)state {
    switch (state) {
        case TVOCallStateConnecting:
            return kTwilioVoiceReactNativeCallStateConnecting;
        case TVOCallStateRinging:
            return kTwilioVoiceReactNativeCallStateRinging;
        case TVOCallStateConnected:
            return kTwilioVoiceReactNativeCallStateConnected;
        case TVOCallStateReconnecting:
            return kTwilioVoiceReactNativeCallStateReconnecting;
        case TVOCallStateDisconnected:
            return kTwilioVoiceReactNativeCallStateDisconnected;
        default:
            return kTwilioVoiceReactNativeCallStateConnecting;
    }
}

- (TVOCallFeedbackScore)scoreFromString:(NSString *)score {
    if ([score isEqualToString:kTwilioVoiceReactNativeCallFeedbackScoreNotReported]) {
        return TVOCallFeedbackScoreNotReported;
    } else if ([score isEqualToString:kTwilioVoiceReactNativeCallFeedbackScoreOne]) {
        return TVOCallFeedbackScoreOnePoint;
    } else if ([score isEqualToString:kTwilioVoiceReactNativeCallFeedbackScoreTwo]) {
        return TVOCallFeedbackScoreTwoPoints;
    } else if ([score isEqualToString:kTwilioVoiceReactNativeCallFeedbackScoreThree]) {
        return TVOCallFeedbackScoreThreePoints;
    } else if ([score isEqualToString:kTwilioVoiceReactNativeCallFeedbackScoreFour]) {
        return TVOCallFeedbackScoreFourPoints;
    } else if ([score isEqualToString:kTwilioVoiceReactNativeCallFeedbackScoreFive]) {
        return TVOCallFeedbackScoreFivePoints;
    }
    return TVOCallFeedbackScoreNotReported;
}

- (TVOCallFeedbackIssue)issueFromString:(NSString *)issue {
    if ([issue isEqualToString:kTwilioVoiceReactNativeCallFeedbackIssueNotReported]) {
        return TVOCallFeedbackIssueNotReported;
    } else if ([issue isEqualToString:kTwilioVoiceReactNativeCallFeedbackIssueDroppedCall]) {
        return TVOCallFeedbackIssueDroppedCall;
    } else if ([issue isEqualToString:kTwilioVoiceReactNativeCallFeedbackIssueAudioLatency]) {
        return TVOCallFeedbackIssueAudioLatency;
    } else if ([issue isEqualToString:kTwilioVoiceReactNativeCallFeedbackIssueOneWayAudio]) {
        return TVOCallFeedbackIssueOneWayAudio;
    } else if ([issue isEqualToString:kTwilioVoiceReactNativeCallFeedbackIssueChoppyAudio]) {
        return TVOCallFeedbackIssueChoppyAudio;
    } else if ([issue isEqualToString:kTwilioVoiceReactNativeCallFeedbackIssueNoisyCall]) {
        return TVOCallFeedbackIssueNoisyCall;
    } else if ([issue isEqualToString:kTwilioVoiceReactNativeCallFeedbackIssueEcho]) {
        return TVOCallFeedbackIssueEcho;
    }
    return TVOCallFeedbackIssueNotReported;
}

@end
