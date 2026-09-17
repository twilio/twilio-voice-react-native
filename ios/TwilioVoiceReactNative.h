//
//  TwilioVoiceReactNative.h
//  TwilioVoiceReactNative
//
//  Copyright © 2022 Twilio, Inc. All rights reserved.
//

#import <AVFoundation/AVFoundation.h>

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@class CXCallController;
@class CXProvider;
@class TVOCall;
@class TVOCallInvite;
@class TVOCancelledCallInvite;
@class TVODefaultAudioDevice;
@class TVOPreflightTest;

FOUNDATION_EXPORT NSString * const kTwilioVoiceReactNativeEventKeyCall;
FOUNDATION_EXPORT NSString * const kTwilioVoiceReactNativeEventKeyCallInvite;
FOUNDATION_EXPORT NSString * const kTwilioVoiceReactNativeEventKeyCancelledCallInvite;

@interface TwilioVoiceReactNative : RCTEventEmitter <RCTBridgeModule>

@property (nonatomic, readonly, strong) NSMutableDictionary<NSString *, TVOCall *> *callMap;
@property (nonatomic, readonly, strong) NSMutableDictionary<NSString *, NSString *> *callConnectMap;
@property (nonatomic, readonly, strong) NSMutableDictionary<NSString *, TVOCallInvite *> *callInviteMap;
@property (nonatomic, readonly, strong) NSMutableDictionary<NSString *, TVOCancelledCallInvite *> *cancelledCallInviteMap;

@property (nonatomic, strong) CXProvider *callKitProvider;
@property (nonatomic, strong) CXCallController *callKitCallController;

@property (nonatomic, copy) NSString *accessToken;
@property (nonatomic, copy) NSDictionary *twimlParams;
@property (nonatomic, strong) NSMutableDictionary<NSString *, NSArray<NSDictionary *> *> *iceServersMap;
@property (nonatomic, strong) NSMutableDictionary<NSString *, NSString *> *iceTransportPolicyMap;
@property (nonatomic, strong) void(^callKitCompletionCallback)(BOOL, NSError *error);

/**
 * Promise resolvers for in-flight `Voice.connect()` calls, keyed by the UUID of
 * the call CallKit was asked to start.
 *
 * A single resolver property could not be settled safely. `voice_connect_ios`
 * assigned it only after `makeCallWithAccessToken:` had already started the
 * asynchronous CallKit transaction, so the transaction's completion block could
 * run first, observe nil and leave `Voice.connect()` pending for the lifetime
 * of the application -- the very defect that block exists to prevent. The
 * success path resolved without clearing the property, so a later failure could
 * invoke an already-settled block. And the property was read and written from
 * both the React Native bridge queue and the main queue without
 * synchronization.
 *
 * The resolver is now stored before the transaction starts, and both settle
 * paths take and clear it for one UUID under a lock, so exactly one of them can
 * settle it. Use `storeCallPromiseResolver:forUuid:` and
 * `takeCallPromiseResolverForUuid:` rather than touching this directly.
 */
@property (nonatomic, strong) NSMutableDictionary<NSString *, RCTPromiseResolveBlock> *callPromiseResolvers;

@property (nonatomic, strong) TVOPreflightTest *preflightTest;
@property (nonatomic, copy) NSString *preflightTestUuid;
@property (nonatomic, strong) NSMutableArray *preflightTestEvents;

// Indicates if the disconnect is triggered from app UI, instead of the system Call UI
@property (nonatomic, assign) BOOL userInitiatedDisconnect;

@property (nonatomic, strong) AVAudioPlayer *ringbackPlayer;

+ (TVODefaultAudioDevice *)twilioAudioDevice;

- (NSString *)warningNameWithNumber:(NSNumber *)warning;
- (NSMutableArray *)callQualityWarningsArrayFromSet:(NSSet<NSNumber *> *)qualityWarnings;

@end

@interface TwilioVoiceReactNative (EventEmitter)

// Override so we can check the event observer before emitting events
- (void)sendEventWithName:(NSString *)eventName body:(id)body;

@end

@interface TwilioVoiceReactNative (CallKit)

- (void)initializeCallKit;
- (void)initializeCallKitWithConfiguration:(NSDictionary *)configuration;
- (void)makeCallWithAccessToken:(NSString *)accessToken
                         params:(NSDictionary *)params
                  contactHandle:(NSString *)contactHandle
                     iceServers:(NSArray<NSDictionary *> * _Nullable)iceServers
             iceTransportPolicy:(NSString * _Nullable)iceTransportPolicy
                       resolver:(RCTPromiseResolveBlock)resolver;
- (void)reportNewIncomingCall:(TVOCallInvite *)callInvite;
- (void)endCallWithUuid:(NSUUID *)uuid;
/* Initiate the answering from the app UI */
- (void)answerCallInvite:(NSUUID *)uuid
              completion:(void(^)(BOOL success, NSError *error))completionHandler;
- (void)updateCall:(NSString *)uuid callerHandle:(NSString *)handle;

/* Utility */
- (NSDictionary *)callInfo:(TVOCall *)call;
- (NSDictionary *)callInviteInfo:(TVOCallInvite *)callInvite;
- (NSDictionary *)cancelledCallInviteInfo:(TVOCancelledCallInvite *)cancelledCallInvite;

@end

@interface TwilioVoiceReactNative (PromiseAdapter)

- (void)resolvePromise:(RCTPromiseResolveBlock)resolver value:(id)value;
- (void)rejectPromiseWithCode:(RCTPromiseResolveBlock)resolver code:(NSNumber *)code message:(NSString *)message;
- (void)rejectPromiseWithName:(RCTPromiseResolveBlock)resolver name:(NSString *)name message:(NSString *)message;

/* Settle-once ownership of the `Voice.connect()` resolver. See callPromiseResolvers. */
- (void)storeCallPromiseResolver:(RCTPromiseResolveBlock)resolver forUuid:(NSString *)uuid;
- (RCTPromiseResolveBlock _Nullable)takeCallPromiseResolverForUuid:(NSString *)uuid;

@end
