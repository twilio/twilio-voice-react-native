package com.twiliovoicereactnative;

import android.app.Activity;
import android.os.Bundle;
import expo.modules.core.interfaces.ReactActivityLifecycleListener;

// Expo Modules API用: ActivityのライフサイクルイベントをTwilio Voice SDKに伝えるリスナー
public class ExpoActivityLifecycleListener implements ReactActivityLifecycleListener {
    VoiceActivityProxy voiceActivityProxy;

    @Override
    public void onCreate(Activity activity, Bundle savedInstanceState) {
        this.voiceActivityProxy = new VoiceActivityProxy(activity, ...);
        this.voiceActivityProxy.onCreate(savedInstanceState);
    }

    @Override
    public boolean onNewIntent(android.content.Intent intent) {
        this.voiceActivityProxy.onNewIntent(intent);
        return false;
    }

    @Override
    public void onDestroy(Activity activity) {
        this.voiceActivityProxy.onDestroy();
    }
}
