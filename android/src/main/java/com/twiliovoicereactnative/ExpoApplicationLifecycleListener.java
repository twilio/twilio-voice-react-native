package com.twiliovoicereactnative;

import android.app.Application;
import expo.modules.core.interfaces.ApplicationLifecycleListener;

// Expo Modules API用: アプリケーションのライフサイクルイベントをTwilio Voice SDKに伝えるリスナー
public class ExpoApplicationLifecycleListener implements ApplicationLifecycleListener {
    VoiceApplicationProxy voiceApplicationProxy;

    @Override
    public void onCreate(Application application) {
        this.voiceApplicationProxy = new VoiceApplicationProxy(application);
        this.voiceApplicationProxy.onCreate();
    }
}
