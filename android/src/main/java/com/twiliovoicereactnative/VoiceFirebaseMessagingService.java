package com.twiliovoicereactnative;

import static com.twiliovoicereactnative.VoiceApplicationProxy.getCallRecordDatabase;
import static com.twiliovoicereactnative.VoiceNotificationReceiver.sendMessage;

import com.twiliovoicereactnative.CallRecordDatabase.CallRecord;

import android.os.PowerManager;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.twilio.voice.CallException;
import com.twilio.voice.CallInvite;
import com.twilio.voice.CancelledCallInvite;
import com.twilio.voice.MessageListener;
import com.twilio.voice.Voice;

import java.util.Objects;
import java.util.UUID;

public class VoiceFirebaseMessagingService extends FirebaseMessagingService implements MessageListener {
  private static final SDKLog logger = new SDKLog(VoiceFirebaseMessagingService.class);

  @Override
  public void onNewToken(@NonNull String token) {
    logger.log("Refreshed FCM token: " + token);
  }

  /**
   * Called when message is received.
   *
   * @param remoteMessage Object representing the message received from Firebase Cloud Messaging.
   */
  @Override
  public void onMessageReceived(RemoteMessage remoteMessage) {
    logger.debug("onMessageReceived remoteMessage: " + remoteMessage.toString());
    logger.debug("Bundle data: " + remoteMessage.getData());
    logger.debug("From: " + remoteMessage.getFrom());

    PowerManager pm = (PowerManager)getSystemService(POWER_SERVICE);
    boolean isScreenOn = pm.isInteractive(); // check if screen is on
    if (!isScreenOn) {
      PowerManager.WakeLock wl = pm.newWakeLock(
        PowerManager.SCREEN_DIM_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP,
        "VoiceFirebaseMessagingService:notificationLock");
      wl.acquire(30000); //set your time in milliseconds
    }

    // Check if message contains a data payload.
    if (remoteMessage.getData().size() > 0) {
      if (!Voice.handleMessage(this, remoteMessage.getData(), this)) {
        logger.error("The message was not a valid Twilio Voice SDK payload: " +
          remoteMessage.getData());
      }
    }
  }

  @Override
  public void onCallInvite(@NonNull CallInvite callInvite) {
    final CallRecord callRecord = new CallRecord(UUID.randomUUID(), callInvite);

    getCallRecordDatabase().add(callRecord);
    sendMessage(this, Constants.ACTION_INCOMING_CALL, callRecord.getUuid());
  }

  @Override
  public void onCancelledCallInvite(@NonNull CancelledCallInvite cancelledCallInvite,
                                    @Nullable CallException callException) {
    CallRecord callRecord = Objects.requireNonNull(
      getCallRecordDatabase().get(new CallRecord(cancelledCallInvite.getCallSid())));

    callRecord.setCancelledCallInvite(cancelledCallInvite);
    callRecord.setCallException(callException);
    sendMessage(this, Constants.ACTION_CANCEL_CALL, callRecord.getUuid());
  }
}
