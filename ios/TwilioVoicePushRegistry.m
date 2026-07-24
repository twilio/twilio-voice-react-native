//
//  TwilioVoicePushRegistry.m
//  TwilioVoiceReactNative
//
//  Copyright © 2022 Twilio, Inc. All rights reserved.
//

@import PushKit;
@import Foundation;
@import CallKit;
@import TwilioVoice;

#import "TwilioVoicePushRegistry.h"
#import "TwilioVoiceReactNative.h"
#import "TwilioVoiceReactNativeConstants.h"

NSString * const kTwilioVoicePushRegistryNotification = @"TwilioVoicePushRegistryNotification";
NSString * const kTwilioVoicePushRegistryEventType = @"type";
NSString * const kTwilioVoicePushRegistryNotificationDeviceTokenUpdated = @"deviceTokenUpdated";
NSString * const kTwilioVoicePushRegistryNotificationDeviceToken = @"deviceToken";
NSString * const kTwilioVoicePushRegistryNotificationIncomingPushReceived = @"incomingPushReceived";
NSString * const kTwilioVoicePushRegistryNotificationIncomingPushPayload = @"incomingPushPayload";
NSString * const kTwilioVoicePushRegistryNotificationCallInvite = @"callInvite";
NSString * const kTwilioVoicePushRegistryNotificationCancelledCallInviteReceived = @"cancelledCallInviteReceived";
NSString * const kTwilioVoicePushRegistryNotificationCancelledCallInvite = @"cancelledCallInvite";
NSString * const kTwilioVoicePushRegistryNotificationCancelledCallInviteError = @"cancelledCallInviteError";

static CXProvider *sSharedCallKitProvider;
static TVODefaultAudioDevice *sPushRegistryAudioDevice;
static TVOCallInvite *sPendingCallInvite;
// Holds the PushKit completion block until reportNewIncomingCall is called.
// PushKit checks its "was a call reported" flag synchronously, on return from
// didReceiveIncomingPushWithPayload:forType:withCompletionHandler: — not on a
// grace-period timer (confirmed via Apple DTS: real-world crash logs show
// "Killing VoIP app because it failed to post an incoming call in time").
// Twilio's SDK resolves callInviteReceived: SYNCHRONOUSLY within
// handleNotification:, but cancelledCallInviteReceived: is documented to fire
// ASYNCHRONOUSLY. So a cancel-type (or invalid/duplicate) push must be
// satisfied with a placeholder report before we return from that delegate
// method — see the synchronous fallback in didReceiveIncomingPushWithPayload:
// below (PRO-5725). Do not defer this with a timer: PushKit does not wait.
static dispatch_block_t sPendingVoIPCompletion;

// Satisfies a pending PushKit completion by reporting a placeholder incoming call to CallKit
// (required by iOS 13+ — every VoIP push must produce reportNewIncomingCall before completion()).
// The placeholder is immediately ended so it never appears as an active call.
// Safe to call on the main queue only (PKPushRegistry uses main queue).
static void TVPRSatisfyPendingPushWithPlaceholder(NSString *handleValue, NSString *reasonLog) {
    dispatch_block_t pendingCompletion = sPendingVoIPCompletion;
    sPendingVoIPCompletion = nil;
    if (!pendingCompletion) return;

    NSString *handle = handleValue.length > 0 ? handleValue : @"Unknown Caller";
    CXCallUpdate *callUpdate = [[CXCallUpdate alloc] init];
    callUpdate.remoteHandle = [[CXHandle alloc] initWithType:CXHandleTypeGeneric value:handle];
    callUpdate.localizedCallerName = handle;
    callUpdate.supportsDTMF = NO;
    callUpdate.supportsHolding = NO;
    callUpdate.supportsGrouping = NO;
    callUpdate.supportsUngrouping = NO;
    callUpdate.hasVideo = NO;

    NSUUID *placeholderUuid = [NSUUID UUID];
    NSLog(@"[TwilioVoicePushRegistry] Satisfying VoIP push with placeholder call (%@)", reasonLog);
    [sSharedCallKitProvider reportNewIncomingCallWithUUID:placeholderUuid
                                                   update:callUpdate
                                               completion:^(NSError *error) {
        if (!error) {
            [sSharedCallKitProvider reportCallWithUUID:placeholderUuid
                                           endedAtDate:[NSDate date]
                                                reason:CXCallEndedReasonRemoteEnded];
        }
        // A failed report (DND/blocklist) still satisfies PushKit.
    }];
    pendingCompletion();
}

@interface TwilioVoicePushRegistry () <PKPushRegistryDelegate, TVONotificationDelegate>

@property (nonatomic, strong) PKPushRegistry *voipRegistry;
@property (nonatomic, copy) NSString *callInviteUuid;

@end

@implementation TwilioVoicePushRegistry

+ (void)initialize {
    if (self == [TwilioVoicePushRegistry class]) {
        CXProviderConfiguration *config = [CXProviderConfiguration new];
        config.maximumCallGroups = 1;
        config.maximumCallsPerCallGroup = 1;
        config.supportedHandleTypes = [NSSet setWithArray:@[@(CXHandleTypeGeneric), @(CXHandleTypePhoneNumber)]];
        config.includesCallsInRecents = NO;
        sSharedCallKitProvider = [[CXProvider alloc] initWithConfiguration:config];
        NSLog(@"[TwilioVoicePushRegistry] Shared CallKit provider initialized");
    }
}

+ (CXProvider *)sharedCallKitProvider {
    return sSharedCallKitProvider;
}

+ (void)setSharedCallKitProviderConfiguration:(CXProviderConfiguration *)configuration {
    if (configuration) {
        sSharedCallKitProvider.configuration = configuration;
        NSLog(@"[TwilioVoicePushRegistry] Shared CallKit provider configuration updated");
    }
}

#pragma mark - TwilioVoicePushRegistry methods

- (void)updatePushRegistry {
    self.voipRegistry = [[PKPushRegistry alloc] initWithQueue:dispatch_get_main_queue()];
    self.voipRegistry.delegate = self;
    self.voipRegistry.desiredPushTypes = [NSSet setWithObject:PKPushTypeVoIP];
}

#pragma mark - PKPushRegistryDelegate

- (void)pushRegistry:(PKPushRegistry *)registry
didUpdatePushCredentials:(PKPushCredentials *)credentials
             forType:(NSString *)type {
    if ([type isEqualToString:PKPushTypeVoIP]) {
        [[NSNotificationCenter defaultCenter] postNotificationName:kTwilioVoicePushRegistryNotification
                                                            object:nil
                                                          userInfo:@{kTwilioVoicePushRegistryEventType: kTwilioVoicePushRegistryNotificationDeviceTokenUpdated,
                                                                     kTwilioVoicePushRegistryNotificationDeviceToken: credentials.token}];
    }
}

- (void)pushRegistry:(PKPushRegistry *)registry
didReceiveIncomingPushWithPayload:(PKPushPayload *)payload
             forType:(PKPushType)type
withCompletionHandler:(void (^)(void))completion {
    if ([type isEqualToString:PKPushTypeVoIP]) {
        NSLog(@"[TwilioVoicePushRegistry] VoIP push received — handling notification directly in native code");

        // Apple requires reportNewIncomingCall to be called before THIS METHOD
        // RETURNS — PushKit checks its internal "was a call reported" flag as
        // soon as didReceiveIncomingPushWithPayload:forType:withCompletionHandler:
        // returns control to the run loop; there is no grace period (PRO-4038,
        // PRO-5725). callInviteReceived: resolves synchronously for a genuine
        // call invite, so the report happens in time. cancelledCallInviteReceived:
        // is documented to fire asynchronously, so a cancel-type push (or a
        // payload Twilio's SDK silently drops) would otherwise leave this method
        // returning with nothing reported. A deferred timer cannot fix that —
        // PushKit's check isn't on a delay — so any push not resolved
        // synchronously by handleNotification: below is satisfied with a
        // placeholder immediately after, before we return.

        // Overwrite protection: if a previous push completion was never satisfied,
        // satisfy it now before storing the new one (PRO-4264).
        if (sPendingVoIPCompletion) {
            TVPRSatisfyPendingPushWithPlaceholder(nil, @"previous push still pending");
        }

        sPendingVoIPCompletion = completion;

        // Ensure the Twilio audio device is configured.
        // The RN module normally does this, but it may not be initialized yet
        // after a long background suspension.
        if (![TwilioVoiceReactNative twilioAudioDevice]) {
            NSLog(@"[TwilioVoicePushRegistry] RN module audio device not ready — configuring fallback audio device");
            sPushRegistryAudioDevice = [TVODefaultAudioDevice audioDevice];
            TwilioVoiceSDK.audioDevice = sPushRegistryAudioDevice;
        }

        // Handle the notification DIRECTLY in native code.
        // For a call invite this SYNCHRONOUSLY invokes callInviteReceived:, which
        // reports the real call and clears sPendingVoIPCompletion before this call
        // returns. For a cancellation, cancelledCallInviteReceived: fires later
        // (async) and will not have run yet when handleNotification: returns.
        [TwilioVoiceSDK handleNotification:payload.dictionaryPayload
                                  delegate:self
                             delegateQueue:nil
                       callMessageDelegate:nil];

        // Nothing resolved synchronously above (cancel push, or an invalid/
        // duplicate payload) — we must still report before returning from this
        // method, right now, not on a delay (PRO-5725).
        if (sPendingVoIPCompletion) {
            TVPRSatisfyPendingPushWithPlaceholder(nil, @"no synchronous delegate callback for this push");
        }
        return;
    }

    completion();
}

- (void)pushRegistry:(PKPushRegistry *)registry
        didInvalidatePushTokenForType:(NSString *)type {
    // TODO: notify view-controller to emit event that the push-registry has been invalidated
}

#pragma mark - TVONotificationDelegate

- (void)callInviteReceived:(TVOCallInvite *)callInvite {
    NSLog(@"[TwilioVoicePushRegistry] callInviteReceived — reporting to CallKit immediately (uuid: %@)", callInvite.uuid.UUIDString);

    // Store the invite statically so the RN module can claim it even if it was not
    // yet registered as an NSNotificationCenter observer (cold-start race condition).
    sPendingCallInvite = callInvite;

    // Build caller display name from the invite, applying the same custom
    // handle template the RN module would use (stored in NSUserDefaults).
    NSString *handleName = callInvite.from ?: @"Unknown Caller";

    NSUserDefaults *preferences = [NSUserDefaults standardUserDefaults];
    NSString *preferenceKey = @"incomingCallContactHandleTemplate";
    NSString *preferenceVal = [preferences stringForKey:preferenceKey];
    if (preferenceVal.length > 0) {
        NSString *processedTemplate = [preferenceVal copy];
        for (NSString *paramKey in [callInvite customParameters]) {
            NSString *paramValue = [callInvite customParameters][paramKey];
            NSString *wrappedParamKey = [NSString stringWithFormat:@"${%@}", paramKey];
            processedTemplate = [processedTemplate stringByReplacingOccurrencesOfString:wrappedParamKey
                                                                            withString:paramValue];
        }
        handleName = processedTemplate;
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

    [sSharedCallKitProvider reportNewIncomingCallWithUUID:callInvite.uuid
                                                  update:callUpdate
                                              completion:^(NSError *error) {
        if (!error) {
            NSLog(@"[TwilioVoicePushRegistry] Incoming call successfully reported to CallKit.");
        } else {
            NSLog(@"[TwilioVoicePushRegistry] Failed to report incoming call to CallKit: %@.", error);
        }
    }];

    // reportNewIncomingCall has been called — now safe to call the deferred
    // PushKit completion block (PRO-4038).
    dispatch_block_t pendingCompletion = sPendingVoIPCompletion;
    sPendingVoIPCompletion = nil;
    if (pendingCompletion) {
        pendingCompletion();
    }

    // Notify the RN module so it can store the invite and emit a JS event
    // when it is ready.  We pass the TVOCallInvite object directly so the
    // RN module does NOT need to call handleNotification a second time.
    [[NSNotificationCenter defaultCenter] postNotificationName:kTwilioVoicePushRegistryNotification
                                                        object:nil
                                                      userInfo:@{kTwilioVoicePushRegistryEventType: kTwilioVoicePushRegistryNotificationIncomingPushReceived,
                                                                 kTwilioVoicePushRegistryNotificationCallInvite: callInvite}];
}

+ (TVOCallInvite *)claimPendingCallInvite {
    TVOCallInvite *invite = sPendingCallInvite;
    sPendingCallInvite = nil;
    return invite;
}

- (void)cancelledCallInviteReceived:(TVOCancelledCallInvite *)cancelledCallInvite error:(NSError *)error {
    NSLog(@"[TwilioVoicePushRegistry] cancelledCallInviteReceived (callSid: %@)", cancelledCallInvite.callSid);

    // The cancellation arrived via a VoIP push, so sPendingVoIPCompletion may still be set.
    // iOS requires reportNewIncomingCall before the completion block runs — satisfy it with
    // a placeholder that is immediately ended (PRO-4264).
    // Guard on sPendingVoIPCompletion to distinguish cancel-via-push (placeholder needed) from
    // cancel-via-signaling (no push pending — posting a placeholder would flash bogus call UI).
    if (sPendingVoIPCompletion) {
        TVPRSatisfyPendingPushWithPlaceholder(cancelledCallInvite.from, @"cancel push");
    }

    // Notify the RN module so it can match the cancelled invite, clean up, and
    // emit the JS event.
    NSMutableDictionary *userInfo = [@{
        kTwilioVoicePushRegistryEventType: kTwilioVoicePushRegistryNotificationCancelledCallInviteReceived,
        kTwilioVoicePushRegistryNotificationCancelledCallInvite: cancelledCallInvite
    } mutableCopy];
    if (error) {
        userInfo[kTwilioVoicePushRegistryNotificationCancelledCallInviteError] = error;
    }
    [[NSNotificationCenter defaultCenter] postNotificationName:kTwilioVoicePushRegistryNotification
                                                        object:nil
                                                      userInfo:userInfo];
}

@end
