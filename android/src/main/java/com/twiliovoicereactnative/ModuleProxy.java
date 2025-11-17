package com.twiliovoicereactnative;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.twilio.voice.LogLevel;
import com.twilio.voice.Voice;

class ModuleProxy {
  public interface UniversalPromise {
    void resolve(Object value);
    void rejectWithCode(int code, String message);
    void rejectWithName(String name, String message);
  }

  private static final SDKLog logger = new SDKLog(ModuleProxy.class);

  public final VoiceModuleProxy voice;

  public final CallModuleProxy call;

  public final CallInviteModuleProxy callInvite;

  public final PreflightTestModuleProxy preflightTest;

  public ModuleProxy(ReactApplicationContext reactApplicationContext) {
    logger.debug("construction");

    System.setProperty(Constants.GLOBAL_ENV, CommonConstants.ReactNativeVoiceSDK);
    System.setProperty(Constants.SDK_VERSION, CommonConstants.ReactNativeVoiceSDKVer);
    Voice.setLogLevel(BuildConfig.DEBUG ? LogLevel.DEBUG : LogLevel.ERROR);

    VoiceApplicationProxy.getJSEventEmitter().setContext(reactApplicationContext);

    final AudioSwitchManager audioSwitchManager = VoiceApplicationProxy
      .getAudioSwitchManager()
      .setListener((audioDevices, selectedDeviceUuid, selectedDevice) -> {
        WritableMap audioDeviceInfo = ReactNativeArgumentsSerializer.serializeAudioDeviceInfo(
          audioDevices,
          selectedDeviceUuid,
          selectedDevice
        );
        audioDeviceInfo.putString(
          CommonConstants.VoiceEventType,
          CommonConstants.VoiceEventAudioDevicesUpdated
        );
        VoiceApplicationProxy.getJSEventEmitter().sendEvent(
          CommonConstants.ScopeVoice,
          audioDeviceInfo
        );
      });

    this.voice = new VoiceModuleProxy(reactApplicationContext, audioSwitchManager);
    this.call = new CallModuleProxy(reactApplicationContext);
    this.callInvite = new CallInviteModuleProxy(reactApplicationContext);
    this.preflightTest = new PreflightTestModuleProxy();
  }
}
