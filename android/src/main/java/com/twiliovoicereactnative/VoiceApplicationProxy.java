package com.twiliovoicereactnative;

import static com.twiliovoicereactnative.CallRecordDatabase.CallRecord;

import java.util.List;
import java.util.Objects;

import android.app.Application;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.IBinder;

import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;

public class VoiceApplicationProxy {
  private static final SDKLog logger = new SDKLog(VoiceApplicationProxy.class);
  private static VoiceApplicationProxy instance = null;
  private Application context = null;
  private final CallRecordDatabase callRecordDatabase = new CallRecordDatabase();
  private AudioSwitchManager audioSwitchManager;
  private MediaPlayerManager mediaPlayerManager;
  private JSEventEmitter jsEventEmitter;
  private VoiceService.VoiceServiceAPI voiceServiceApi = null;
  private final ServiceConnection voiceServiceObserver = new ServiceConnection() {
    @Override
    public void onServiceConnected(ComponentName name, IBinder service) {
      if (name.getClassName().equals(VoiceService.class.getName()))
        voiceServiceApi = (VoiceService.VoiceServiceAPI)service;
    }
    @Override
    public void onServiceDisconnected(ComponentName name) {
      voiceServiceApi = null;
    }
  };
  public abstract static class VoiceReactNativeHost extends ReactNativeHost {
    public VoiceReactNativeHost(Application application) {
      super(application);
    }
    @Override
    protected List<ReactPackage> getPackages() {
      return List.of(new TwilioVoiceReactNativePackage());
    }
    public Application getAssociatedApplication() {
      return super.getApplication();
    }
  }

  public VoiceApplicationProxy(VoiceReactNativeHost reactNativeHost) {
    if (null != instance) {
      logger.error("Voice application proxy already created!");
    }
    instance = this;
    context = reactNativeHost.getAssociatedApplication();
  }
  public void onCreate() {
    logger.debug("onCreate(..) invoked");
    // construct JS event engine
    jsEventEmitter = new JSEventEmitter();
    // construct notification channels
    NotificationUtility.createNotificationChannels(context);
    // launch and bind to voice call service
    context.bindService(
      new Intent(context, VoiceService.class),
      voiceServiceObserver,
      Context.BIND_AUTO_CREATE);
    // Activate audio engine
    audioSwitchManager = new AudioSwitchManager(context);
    mediaPlayerManager = new MediaPlayerManager(context);
    audioSwitchManager.start();
  }
  public void onTerminate() {
    logger.debug("onTerminate(..) invoked");
    // shutdown notificaiton channels
    NotificationUtility.destroyNotificationChannels(context);
    // shutdown audioswitch & media manager
    audioSwitchManager.stop();
    // verify that no call records are leaked
    for (CallRecord callRecord: callRecordDatabase.getCollection()) {
      logger.warning(
        String.format(
          "Call Record leaked: { uuid: %s callSid: %s }",
          (null != callRecord.getUuid()) ? callRecord.getUuid() : "null",
          (null != callRecord.getCallSid()) ? callRecord.getCallSid() : "null"));
    }
    callRecordDatabase.clear();
  }
  static CallRecordDatabase getCallRecordDatabase() {
    return VoiceApplicationProxy.instance.callRecordDatabase;
  }
  static AudioSwitchManager getAudioSwitchManager() {
    return VoiceApplicationProxy.instance.audioSwitchManager;
  }
  static MediaPlayerManager getMediaPlayerManager() {
    return VoiceApplicationProxy.instance.mediaPlayerManager;
  }
  static JSEventEmitter getJSEventEmitter() {
    return VoiceApplicationProxy.instance.jsEventEmitter;
  }

  static Context getApplicationContext() {
    return VoiceApplicationProxy.instance.context;
  }

  static Class<?> getMainActivityClass() {
    Context context = VoiceApplicationProxy.instance.context;
    String packageName = context.getPackageName();
    Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage(packageName);
    ComponentName componentName = Objects.requireNonNull(launchIntent).getComponent();
    try {
      return Class.forName(Objects.requireNonNull(componentName).getClassName());
    } catch (ClassNotFoundException e) {
      e.printStackTrace();
      return null;
    }
  }

  static VoiceService.VoiceServiceAPI getVoiceServiceApi() {
    if (null == VoiceApplicationProxy.instance.voiceServiceApi) {
      logger.error("Voice Service not bound!");
    }
    return VoiceApplicationProxy.instance.voiceServiceApi;
  }
}
