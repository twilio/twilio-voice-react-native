package com.example.twiliovoicereactnative;

import android.Manifest;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.widget.Toast;

import com.facebook.react.ReactActivity;
import com.twiliovoicereactnative.VoiceActivityProxy;

public class MainActivity extends ReactActivity {
  private final VoiceActivityProxy activityProxy = new VoiceActivityProxy(
    this,
    permission -> {
      if (Manifest.permission.RECORD_AUDIO.equals(permission)) {
        Toast.makeText(
          MainActivity.this,
          "Microphone permissions needed. Please allow in your application settings.",
          Toast.LENGTH_LONG).show();
      } else if ((Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) &&
        Manifest.permission.BLUETOOTH_CONNECT.equals(permission)) {
          Toast.makeText(
            MainActivity.this,
            "Bluetooth permissions needed. Please allow in your application settings.",
            Toast.LENGTH_LONG).show();
      } else if ((Build.VERSION.SDK_INT > Build.VERSION_CODES.S_V2) &&
        Manifest.permission.POST_NOTIFICATIONS.equals(permission)) {
          Toast.makeText(
            MainActivity.this,
            "Notification permissions needed. Please allow in your application settings.",
            Toast.LENGTH_LONG).show();
      }
    });

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    activityProxy.onCreate(savedInstanceState);
  }

  @Override
  public void onDestroy() {
    activityProxy.onDestroy();
    super.onDestroy();
  }

  @Override
  public void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    activityProxy.onNewIntent(intent);
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "TwilioVoiceReactNativeExample";
  }
}
