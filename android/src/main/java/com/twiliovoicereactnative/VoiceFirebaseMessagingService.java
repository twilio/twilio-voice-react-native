package com.twiliovoicereactnative;

import android.util.Log;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import java.util.Map;
import java.util.Random;

public class VoiceFirebaseMessagingService extends FirebaseMessagingService {

  public static String TAG = "TwilioVoiceReactNative";

  @Override
  public void onCreate() {
    super.onCreate();
  }

  @Override
  public void onNewToken(String token) {
    Log.d(TAG, "Refreshed FCM token: " + token);
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
