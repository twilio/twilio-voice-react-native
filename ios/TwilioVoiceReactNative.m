#import "TwilioVoiceReactNative.h"

@import TwilioVoice;

@implementation TwilioVoiceReactNative

RCT_EXPORT_MODULE();

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"callInvite", @"canceledCallInvite", @"registered", @"unregistered", @"connected"];
}

RCT_REMAP_METHOD(voice_getVersion,
                 getVersionWithResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    NSString *version = TwilioVoiceSDK.sdkVersion;

    resolve(version);
}

@end
