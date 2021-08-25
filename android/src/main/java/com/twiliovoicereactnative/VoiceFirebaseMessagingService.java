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
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.twilio.voice.CallException;
import com.twilio.voice.CallInvite;
import com.twilio.voice.CancelledCallInvite;
import com.twilio.voice.MessageListener;
import com.twilio.voice.Voice;

import com.twiliovoicereactnative.IncomingCallNotificationService;
import com.twiliovoicereactnative.Storage;

import java.util.Map;
import java.util.Random;
import java.util.UUID;

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
    Log.d(TAG, "Bundle data: " + remoteMessage.getData());
    Log.d(TAG, "From: " + remoteMessage.getFrom());

    Map<String, String> remoteData = remoteMessage.getData();

    // Check if message contains a data payload.
    if (remoteMessage.getData().size() > 0) {
      boolean valid = Voice.handleMessage(this, remoteData, new MessageListener() {
        @Override
        public void onCallInvite(@NonNull CallInvite callInvite) {
          final int notificationId = (int) System.currentTimeMillis();
          handleInvite(callInvite, notificationId);
        }

        @Override
        public void onCancelledCallInvite(@NonNull CancelledCallInvite cancelledCallInvite, @Nullable CallException callException) {
          handleCanceledCallInvite(cancelledCallInvite);
        }
      });

      if (!valid) {
        Log.e(TAG, "The message was not a valid Twilio Voice SDK payload: " +
          remoteMessage.getData());
      }
    }
  }

  private void handleInvite(CallInvite callInvite, int notificationId) {
    String uuid = UUID.randomUUID().toString();

    Intent intent = new Intent(this, IncomingCallNotificationService.class);
    intent.setAction(Constants.ACTION_INCOMING_CALL);
    intent.putExtra(Constants.INCOMING_CALL_NOTIFICATION_ID, notificationId);
    intent.putExtra(Constants.INCOMING_CALL_INVITE, callInvite);
    intent.putExtra(Constants.UUID, uuid);

    Storage.callInviteMap.put(uuid, callInvite);
    Storage.callInviteCallSidUuidMap.put(callInvite.getCallSid(), uuid);
    Log.d(TAG, "CallInvite UUID handleInvite " + uuid);

    startService(intent);
  }

  private void handleCanceledCallInvite(CancelledCallInvite cancelledCallInvite) {
    String uuid = Storage.callInviteCallSidUuidMap.get(cancelledCallInvite.getCallSid());

    Intent intent = new Intent(this, IncomingCallNotificationService.class);
    intent.setAction(Constants.ACTION_CANCEL_CALL);
    intent.putExtra(Constants.CANCELLED_CALL_INVITE, cancelledCallInvite);
    intent.putExtra(Constants.UUID, uuid);

    Storage.cancelledCallInviteMap.put(uuid, cancelledCallInvite);

    startService(intent);
  }
}
