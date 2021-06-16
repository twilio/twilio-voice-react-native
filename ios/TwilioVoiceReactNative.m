#import "TwilioVoiceReactNative.h"

@import TwilioVoice;

@implementation TwilioVoiceReactNative

RCT_EXPORT_MODULE();

RCT_REMAP_METHOD(voice_getVersion,
                 getVersionWithResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    NSString *version = TwilioVoiceSDK.sdkVersion;

    resolve(version);
}

@end
