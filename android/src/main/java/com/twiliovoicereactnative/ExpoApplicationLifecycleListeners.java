package com.twiliovoicereactnative;

import android.app.Application;
import expo.modules.core.interfaces.ApplicationLifecycleListener;

public class ExpoApplicationLifecycleListeners implements ApplicationLifecycleListener {
  private VoiceApplicationProxy voiceApplicationProxy;

  @Override
  public void onCreate(Application application) {
    this.voiceApplicationProxy = new VoiceApplicationProxy(application);
    this.voiceApplicationProxy.onCreate();
  }
}
