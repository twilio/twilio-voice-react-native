package com.twiliovoicereactnative;

import static com.twiliovoicereactnative.CommonConstants.VoiceErrorKeyCode;
import static com.twiliovoicereactnative.CommonConstants.VoiceErrorKeyMessage;

import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.PowerManager;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.twilio.voice.CallException;
import com.twilio.voice.CallInvite;
import com.twilio.voice.CancelledCallInvite;
import com.twilio.voice.MessageListener;
import com.twilio.voice.Voice;

import java.util.UUID;

public class VoiceFirebaseMessagingService extends FirebaseMessagingService {

  public static String TAG = "VoiceFirebaseMessagingService";
  private Context context;

  public VoiceFirebaseMessagingService() {
    super();
    this.context = this;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    NotificationUtility.createNotificationChannels(context.getApplicationContext());
  }

  @Override
  public void onDestroy() {
    NotificationUtility.destroyNotificationChannels(context.getApplicationContext());
    super.onDestroy();
  }

  @Override
  public void onNewToken(String token) {
    log("Refreshed FCM token: " + token);
  }

  /**
   * Called when message is received.
   *
   * @param remoteMessage Object representing the message received from Firebase Cloud Messaging.
   */
  @Override
  public void onMessageReceived(RemoteMessage remoteMessage) {
    log("onMessageReceived remoteMessage: " + remoteMessage.toString());
    log("Bundle data: " + remoteMessage.getData());
    log("From: " + remoteMessage.getFrom());

    PowerManager pm = (PowerManager) this.context.getSystemService(this.context.POWER_SERVICE);
    boolean isScreenOn = Build.VERSION.SDK_INT >= 20 ? pm.isInteractive() : pm.isScreenOn(); // check if screen is on
    if (!isScreenOn) {
      PowerManager.WakeLock wl = pm.newWakeLock(PowerManager.SCREEN_DIM_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP, "VoiceFirebaseMessagingService:notificationLock");
      wl.acquire(30000); //set your time in milliseconds
    }

    // Check if message contains a data payload.
    if (remoteMessage.getData().size() > 0) {
      boolean valid = Voice.handleMessage(this.context, remoteMessage.getData(), new MessageListener() {
        @Override
        public void onCallInvite(@NonNull CallInvite callInvite) {
          handleInvite(callInvite);
        }

        @Override
        public void onCancelledCallInvite(@NonNull CancelledCallInvite cancelledCallInvite, @Nullable CallException callException) {
          handleCanceledCallInvite(cancelledCallInvite, callException);
        }
      });

      if (!valid) {
        Log.e(TAG, "The message was not a valid Twilio Voice SDK payload: " +
          remoteMessage.getData());
      }
    }
  }

  private void handleInvite(CallInvite callInvite) {
    String uuid = UUID.randomUUID().toString();

    Intent intent = new Intent(context, VoiceNotificationReceiver.class);
    intent.setAction(Constants.ACTION_INCOMING_CALL);
    intent.putExtra(Constants.INCOMING_CALL_INVITE, callInvite);
    intent.putExtra(Constants.UUID, uuid);

    Storage.callInviteMap.put(uuid, callInvite);
    Storage.callInviteCallSidUuidMap.put(callInvite.getCallSid(), uuid);

    context.sendBroadcast(intent);
  }

  private void handleCanceledCallInvite(CancelledCallInvite cancelledCallInvite, CallException callException) {
    String uuid = Storage.callInviteCallSidUuidMap.get(cancelledCallInvite.getCallSid());
    Storage.cancelledCallInviteMap.put(uuid, cancelledCallInvite);

    Intent intent = new Intent(context, VoiceNotificationReceiver.class);
    intent.setAction(Constants.ACTION_CANCEL_CALL);
    intent.putExtra(Constants.CANCELLED_CALL_INVITE, cancelledCallInvite);
    intent.putExtra(Constants.UUID, uuid);
    intent.putExtra(VoiceErrorKeyCode, callException.getErrorCode());
    intent.putExtra(VoiceErrorKeyMessage, callException.getMessage());
    context.sendBroadcast(intent);
  }

  private static void log(final String message) {
    Log.d(VoiceFirebaseMessagingService.class.getSimpleName(), message);
  }
}
