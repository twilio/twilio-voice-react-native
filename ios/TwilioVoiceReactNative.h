//
//  TwilioVoiceReactNative.h
//  TwilioVoiceReactNative
//
//  Copyright © 2021 Twilio, Inc. All rights reserved.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@class CXCallController;
@class CXProvider;
@class TVOCall;
@class TVOCallInvite;
@class TVODefaultAudioDevice;

@interface TwilioVoiceReactNative : RCTEventEmitter <RCTBridgeModule>

@property (nonatomic, strong) TVOCall *activeCall;
@property (nonatomic, strong) TVOCallInvite *callInvite;
@property (nonatomic, strong) CXProvider *callKitProvider;
@property (nonatomic, strong) CXCallController *callKitCallController;

// Indicates if the disconnect is triggered from app UI, instead of the system Call UI
@property (nonatomic, assign) BOOL userInitiatedDisconnect;

+ (TVODefaultAudioDevice *)audioDevice;

@end

@interface TwilioVoiceReactNative (CallKit)

- (void)initializeCallKit;
- (void)reportNewIncomingCall:(TVOCallInvite *)callInvite;
- (void)endCallWithUuid:(NSUUID *)uuid;

@end
