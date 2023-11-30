package com.twiliovoicereactnative;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;

import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.twilio.voice.CallInvite;
import com.twilio.voice.CancelledCallInvite;

public class NotificationProxyActivity extends Activity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    handleIntent(getIntent());
    finish();
  }

  @Override
  protected void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    handleIntent(intent);
    finish();
  }

  private void handleIntent(Intent intent) {
    String action = intent.getAction();
    if (action != null) {
      switch (action) {
        case Constants.ACTION_PUSH_APP_TO_FOREGROUND:
          launchMainActivity();
          break;
        case Constants.ACTION_FOREGROUND_AND_DEPRIORITIZE_INCOMING_CALL_NOTIFICATION:
        case Constants.ACTION_ACCEPT_CALL:
          launchMainActivity();
          sendMessage(intent);
          break;
        default:
          sendMessage(intent);
          break;
      }
    }
  }

  private void launchMainActivity() {
    try{
      Intent launchIntent = getPackageManager().getLaunchIntentForPackage(getPackageName());
      launchIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);
      startActivity(launchIntent);
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
  private void sendMessage(Intent intent) {
    Intent copiedIntent = new Intent(intent);
    copiedIntent.setClass(getApplicationContext(), VoiceNotificationReceiver.class);
    copiedIntent.setFlags(0);
    getApplicationContext().sendBroadcast(copiedIntent);
  }
}
