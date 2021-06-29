package com.twiliovoicereactnative;

import android.util.Log;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;
import android.content.Intent;

import java.util.Map;
import java.util.Random;

public class VoiceFirebaseMessagingService extends FirebaseMessagingService {

  public static String TAG = "VoiceFirebaseMessagingService";

  @Override
  public void onCreate() {
    super.onCreate();
    Log.d(TAG, "onCreate");
  }

  @Override
  public void onNewToken(String token) {
    Log.d(TAG, "Refreshed FCM token: " + token);
    Intent intent = new Intent(Constants.ACTION_FCM_TOKEN);
    intent.putExtra(Constants.FCM_TOKEN, token);
    LocalBroadcastManager.getInstance(this).sendBroadcast(intent);
  }

  /**
   * Called when message is received.
   *
   * @param remoteMessage Object representing the message received from Firebase Cloud Messaging.
   */
  @Override
  public void onMessageReceived(RemoteMessage remoteMessage) {
    Log.d(TAG, "onMessageReceived remoteMessage: " + remoteMessage.toString());
  }
}
