#import "TwilioVoiceReactNative.h"

@import TwilioVoice;

@interface TwilioVoiceReactNative () <TVOCallDelegate>

// TODO: make this a map to support multiple calls
@property (nonatomic, strong) TVOCall *activeCall;

@end


@implementation TwilioVoiceReactNative

RCT_EXPORT_MODULE();

#pragma mark - React Native

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"Voice", @"Call"];
}

#pragma mark - Bingings

RCT_REMAP_METHOD(voice_getVersion,
                 getVersionWithResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    NSString *version = TwilioVoiceSDK.sdkVersion;

    resolve(version);
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
        builder.uuid = uuid;
    }];
    self.activeCall = [TwilioVoiceSDK connectWithOptions:connectOptions delegate:self];
}

#pragma mark - utility

RCT_REMAP_METHOD(util_generateId,
                 getUuidWithResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    NSString *uuid = [[NSUUID UUID] UUIDString];

    resolve(uuid);
}

#pragma mark - TVOCallDelegate

- (void)callDidStartRinging:(TVOCall *)call {
    NSLog(@"Call is ringing at called party %@", call.to);
    [self sendEventWithName:@"Call" body:@{@"type": @"ringing"}];
}

- (void)call:(TVOCall *)call didFailToConnectWithError:(NSError *)error {
    NSLog(@"Call failed to connect: %@.", error);
    [self sendEventWithName:@"Call" body:@{@"type": @"connectFailure", @"error": [error localizedDescription]}];

    // TODO: disconnect call with CallKit if needed
    // TODO: CallKit completion handler
}

- (void)call:(TVOCall *)call didDisconnectWithError:(NSError *)error {
    NSLog(@"Call disconnected with error: %@", error);
    NSDictionary *messageBody = [NSDictionary dictionary];
    if (error) {
        messageBody = @{@"type": @"disconnected", @"error": [error localizedDescription]};
    } else {
        messageBody = @{@"type": @"disconnected"};
    }
    
    [self sendEventWithName:@"Call" body:messageBody];

    // TODO: end call with CallKit (if not user initiated-disconnect)
    // TODO: CallKit completion handler
}

- (void)callDidConnect:(TVOCall *)call {
    NSLog(@"Call connected.");
    [self sendEventWithName:@"Call" body:@{@"type": @"connected"}];

    // TODO: CallKit completion handler
    // TODO: report connected to CallKit
}

- (void)call:(TVOCall *)call isReconnectingWithError:(NSError *)error {
    NSLog(@"Call reconnecting: %@", error);
    [self sendEventWithName:@"Call" body:@{@"type": @"connected", @"error": [error localizedDescription]}];
}

- (void)callDidReconnect:(TVOCall *)call {
    NSLog(@"Call reconnected");
    [self sendEventWithName:@"Call" body:@{@"type": @"reconnected"}];
}

- (void)call:(TVOCall *)call
didReceiveQualityWarnings:(NSSet<NSNumber *> *)currentWarnings
previousWarnings:(NSSet<NSNumber *> *)previousWarnings {
    // TODO: process and emit warnings event
}

@end
