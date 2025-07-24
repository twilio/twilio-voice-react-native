package com.twiliovoicereactnative;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import expo.modules.core.interfaces.ReactActivityLifecycleListener;

public class ExpoActivityLifecycleListener implements ReactActivityLifecycleListener {
    private VoiceActivityProxy voiceActivityProxy;

    @Override
    public void onCreate(Activity activity, Bundle savedInstanceState) {
        this.voiceActivityProxy = new VoiceActivityProxy(activity);
        this.voiceActivityProxy.onCreate(savedInstanceState);
    }

    @Override
    public void onDestroy(Activity activity) {
        if (this.voiceActivityProxy != null) {
            this.voiceActivityProxy.onDestroy();
        }
    }

    @Override
    public boolean onNewIntent(Intent intent) {
        if (this.voiceActivityProxy != null) {
            this.voiceActivityProxy.onNewIntent(intent);
        }
        return false;
    }
}
