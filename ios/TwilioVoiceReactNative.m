//
//  TwilioVoiceReactNative.m
//  TwilioVoiceReactNative
//
//  Copyright © 2021 Twilio, Inc. All rights reserved.
//

@import AVKit;

#import "TwilioVoicePushRegistry.h"
#import "TwilioVoiceReactNative.h"
#import "TwilioVoiceReactNativeConstants.h"
#import "TwilioVoiceStatsReport.h"

// Call & call invite
NSString * const kTwilioVoiceReactNativeEventKeyCall = @"call";
NSString * const kTwilioVoiceReactNativeEventKeyCallInvite = @"callInvite";
NSString * const kTwilioVoiceReactNativeEventKeyCancelledCallInvite = @"cancelledCallInvite";

// Audio device
NSString * const kTwilioVoiceAudioDeviceUid = @"uid";
NSString * const kTwilioVoiceAudioDeviceEarpiece = @"Earpiece";
NSString * const kTwilioVoiceAudioDeviceSpeaker = @"Speaker";
NSString * const kTwilioVoiceAudioDeviceBluetooth = @"Bluetooth";

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

        NSString *reactNativeSDK = kTwilioVoiceReactNativeReactNativeVoiceSDK;
        setenv("global-env-sdk", [reactNativeSDK UTF8String], 1);

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
    if ([eventBody[kTwilioVoiceReactNativeVoiceEventType] isEqualToString:kTwilioVoicePushRegistryNotificationDeviceTokenUpdated]) {
        NSAssert(eventBody[kTwilioVoicePushRegistryNotificationDeviceTokenKey] != nil, @"Missing device token. Please check the body of NSNotification.userInfo,");
        self.deviceTokenData = eventBody[kTwilioVoicePushRegistryNotificationDeviceTokenKey];

        // Skip the event emitting since 1, the listener has not registered and 2, the app does not need to know about this
        return;
    } else if ([eventBody[kTwilioVoiceReactNativeVoiceEventType] isEqualToString:kTwilioVoiceReactNativeVoiceEventCallInvite]) {
        TVOCallInvite *callInvite = eventBody[kTwilioVoicePushRegistryNotificationCallInviteKey];
        NSAssert(callInvite != nil, @"Invalid call invite");
        [self reportNewIncomingCall:callInvite];

        eventBody[kTwilioVoiceReactNativeEventKeyCallInvite] = [self callInviteInfo:callInvite];
    } else if ([eventBody[kTwilioVoiceReactNativeVoiceEventType] isEqualToString:kTwilioVoiceReactNativeVoiceEventCallInviteCancelled]) {
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

    [self sendEventWithName:kTwilioVoiceReactNativeScopeVoice body:eventBody];
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

    [self sendEventWithName:kTwilioVoiceReactNativeScopeVoice
                       body:@{kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeVoiceEventAudioDevicesUpdated,
                              kTwilioVoiceReactNativeAudioDeviceKeyAudioDevices: nativeAudioDeviceInfos,
                              kTwilioVoiceReactNativeAudioDeviceKeySelectedDevice: self.selectedAudioDevice}];
}

- (void)initializeAudioDeviceList {
    NSUUID *receiverUuid = [NSUUID UUID];
    NSDictionary *builtInReceiver = @{ kTwilioVoiceReactNativeAudioDeviceKeyUuid: receiverUuid.UUIDString,
                                       kTwilioVoiceReactNativeAudioDeviceKeyType: kTwilioVoiceAudioDeviceEarpiece,
                                       kTwilioVoiceReactNativeAudioDeviceKeyName: @"iPhone",
                                       kTwilioVoiceAudioDeviceUid: AVAudioSessionPortBuiltInReceiver};
    self.audioDevices[receiverUuid.UUIDString] = builtInReceiver;

    NSUUID *speakerUuid = [NSUUID UUID];
    NSDictionary *builtInSpeaker = @{ kTwilioVoiceReactNativeAudioDeviceKeyUuid: speakerUuid.UUIDString,
                                      kTwilioVoiceReactNativeAudioDeviceKeyType: kTwilioVoiceAudioDeviceSpeaker,
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
                if ([device[kTwilioVoiceReactNativeAudioDeviceKeyType] isEqualToString:kTwilioVoiceAudioDeviceEarpiece]) {
                    self.selectedAudioDevice = device;
                    break;
                }
            }
        } else if ([port.portType isEqualToString:AVAudioSessionPortBuiltInSpeaker]) {
            for (NSString *key in [self.audioDevices allKeys]) {
                NSDictionary *device = self.audioDevices[key];
                if ([device[kTwilioVoiceReactNativeAudioDeviceKeyType] isEqualToString:kTwilioVoiceAudioDeviceSpeaker]) {
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
        return kTwilioVoiceAudioDeviceEarpiece;
    } else if ([portType isEqualToString:AVAudioSessionPortBuiltInSpeaker]) {
        return kTwilioVoiceAudioDeviceSpeaker;
    } else if ([portType isEqualToString:AVAudioSessionPortBluetoothHFP]) {
        return kTwilioVoiceAudioDeviceBluetooth;
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
    if ([portType isEqualToString:kTwilioVoiceAudioDeviceEarpiece]) {
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
    } else if ([portType isEqualToString:kTwilioVoiceAudioDeviceBluetooth]) {
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

    // Override output to speaker if speaker is selected, otherwise choose "none"
    AVAudioSessionPortOverride outputOverride = ([portType isEqualToString:kTwilioVoiceAudioDeviceSpeaker])?
                                                AVAudioSessionPortOverrideSpeaker : AVAudioSessionPortOverrideNone;
    NSError *outputError;
    [[AVAudioSession sharedInstance] overrideOutputAudioPort:outputOverride error:&outputError];
    if (outputError) {
        NSLog(@"Failed to override output port: %@", outputError);
        return NO;
    }

    return YES;
}

// TODO: Move to separate utility file someday
- (NSDictionary *)callInfo:(TVOCall *)call {
    NSMutableDictionary *callInfo = [@{kTwilioVoiceReactNativeCallInfoUuid: call.uuid? call.uuid.UUIDString : @"",
                                       kTwilioVoiceReactNativeCallInfoFrom: call.from? call.from : @"",
                                       kTwilioVoiceReactNativeCallInfoIsMuted: @(call.isMuted),
                                       kTwilioVoiceReactNativeCallInfoIsOnHold: @(call.isOnHold),
                                       kTwilioVoiceReactNativeCallInfoSid: call.sid,
                                       kTwilioVoiceReactNativeCallInfoTo: call.to? call.to : @""} mutableCopy];
    
    TVOCallInvite *callInvite = self.callInviteMap[call.uuid.UUIDString];
    if (callInvite && callInvite.customParameters) {
        callInfo[kTwilioVoiceReactNativeCallInviteInfoCustomParameters] = [callInvite.customParameters copy];
    }

    return callInfo;
}

- (NSDictionary *)callInviteInfo:(TVOCallInvite *)callInvite {
    NSMutableDictionary *callInviteInfo = [@{kTwilioVoiceReactNativeCallInviteInfoUuid: callInvite.uuid.UUIDString,
                                             kTwilioVoiceReactNativeCallInviteInfoCallSid: callInvite.callSid,
                                             kTwilioVoiceReactNativeCallInviteInfoFrom: callInvite.from,
                                             kTwilioVoiceReactNativeCallInviteInfoTo: callInvite.to} mutableCopy];
    if (callInvite.customParameters) {
        callInviteInfo[kTwilioVoiceReactNativeCallInviteInfoCustomParameters] = [callInvite.customParameters copy];
    }

    return callInviteInfo;
}

- (NSDictionary *)cancelledCallInviteInfo:(TVOCancelledCallInvite *)cancelledCallInvite {
    return @{kTwilioVoiceReactNativeCancelledCallInviteInfoCallSid: cancelledCallInvite.callSid,
             kTwilioVoiceReactNativeCancelledCallInviteInfoFrom: cancelledCallInvite.from,
             kTwilioVoiceReactNativeCancelledCallInviteInfoTo: cancelledCallInvite.to};
}

RCT_EXPORT_MODULE();

#pragma mark - React Native

- (NSArray<NSString *> *)supportedEvents
{
    return @[kTwilioVoiceReactNativeScopeVoice, kTwilioVoiceReactNativeScopeCall];
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
#if TARGET_IPHONE_SIMULATOR
#ifdef INTEGRATION_TEST_DEVICE_TOKEN
    if (!self.deviceTokenData) {
        NSString *testDeviceToken = [NSString stringWithFormat:@"%@", @OS_STRINGIFY(INTEGRATION_TEST_DEVICE_TOKEN)];
        self.deviceTokenData = [testDeviceToken dataUsingEncoding:NSUTF8StringEncoding];
    }
#endif
#endif

    [TwilioVoiceSDK registerWithAccessToken:accessToken
                                deviceToken:self.deviceTokenData
                                 completion:^(NSError *error) {
        if (error) {
            NSString *errorMessage = [NSString stringWithFormat:@"Failed to register: %@", error];
            NSLog(@"%@", errorMessage);
            [self sendEventWithName:kTwilioVoiceReactNativeScopeVoice
                               body:@{kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeVoiceEventError,
                                      kTwilioVoiceReactNativeVoiceErrorKeyError: @{kTwilioVoiceReactNativeVoiceErrorKeyCode: @(error.code),
                                                                                   kTwilioVoiceReactNativeVoiceErrorKeyMessage: [error localizedDescription]}}];
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
            [self sendEventWithName:kTwilioVoiceReactNativeScopeVoice
                               body:@{kTwilioVoiceReactNativeVoiceEventType: kTwilioVoiceReactNativeVoiceEventError,
                                      kTwilioVoiceReactNativeVoiceErrorKeyError: @{kTwilioVoiceReactNativeVoiceErrorKeyCode: @(error.code),
                                                                                   kTwilioVoiceReactNativeVoiceErrorKeyMessage: [error localizedDescription]}}];
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
        reject(@"Voice error", [NSString stringWithFormat:@"Failed to select audio device %@", uuid], nil);
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

RCT_EXPORT_METHOD(call_postFeedback:(NSString *)uuid
                  score:(NSUInteger)score
                  issue:(NSString *)issue
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    TVOCall *call = self.callMap[uuid];
    if (call) {
        [call postFeedback:(TVOCallFeedbackScore)score issue:[self issueFromString:issue]];
        resolve(nil);
    } else {
        reject(@"Voice error", [NSString stringWithFormat:@"Call with %@ not found", uuid], nil);
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

- (TVOCallFeedbackIssue)issueFromString:(NSString *)issue {
    if ([issue isEqualToString:@"not-reported"]) {
        return TVOCallFeedbackIssueNotReported;
    } else if ([issue isEqualToString:@"dropped-call"]) {
        return TVOCallFeedbackIssueDroppedCall;
    } else if ([issue isEqualToString:@"audio-latency"]) {
        return TVOCallFeedbackIssueAudioLatency;
    } else if ([issue isEqualToString:@"one-way-audio"]) {
        return TVOCallFeedbackIssueOneWayAudio;
    } else if ([issue isEqualToString:@"choppy-audio"]) {
        return TVOCallFeedbackIssueChoppyAudio;
    } else if ([issue isEqualToString:@"noisy-call"]) {
        return TVOCallFeedbackIssueNoisyCall;
    } else {
        return TVOCallFeedbackIssueNotReported;
    }
}

@end
