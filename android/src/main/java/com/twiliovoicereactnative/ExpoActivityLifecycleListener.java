package com.twiliovoicereactnative;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.widget.Toast;

import expo.modules.core.interfaces.ReactActivityLifecycleListener;

public class ExpoActivityLifecycleListener implements ReactActivityLifecycleListener {
  VoiceActivityProxy voiceActivityProxy;

  @Override
  public void onCreate(Activity activity, Bundle savedInstanceState) {
    this.voiceActivityProxy = new VoiceActivityProxy(
      activity,
      permission -> {
        if (Manifest.permission.RECORD_AUDIO.equals(permission)) {
          Toast.makeText(
            activity,
            "Microphone permissions needed. Please allow in your application settings.",
            Toast.LENGTH_LONG).show();
          return;
        }

        if ((Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) &&
            Manifest.permission.BLUETOOTH_CONNECT.equals(permission)) {
          Toast.makeText(
            activity,
            "Bluetooth permissions needed. Please allow in your application settings.",
            Toast.LENGTH_LONG).show();
          return;
        }

        if ((Build.VERSION.SDK_INT > Build.VERSION_CODES.S_V2) &&
            Manifest.permission.POST_NOTIFICATIONS.equals(permission)) {
          Toast.makeText(
            activity,
            "Notification permissions needed. Please allow in your application settings.",
            Toast.LENGTH_LONG).show();
          return;
        }
      });

    this.voiceActivityProxy.onCreate(savedInstanceState);
  }

  @Override
  public boolean onNewIntent(Intent intent) {
    voiceActivityProxy.onNewIntent(intent);
    return false;
  }

  @Override
  public void onDestroy(Activity activity) {
    voiceActivityProxy.onDestroy();
  }
}
