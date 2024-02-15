package com.twiliovoicereactnative;

import static com.twiliovoicereactnative.CommonConstants.CallInviteInfoCallSid;
import static com.twiliovoicereactnative.CommonConstants.ScopeCallInvite;
import static com.twiliovoicereactnative.Constants.JS_EVENT_KEY_CANCELLED_CALL_INVITE_INFO;
import static com.twiliovoicereactnative.Constants.VOICE_CHANNEL_HIGH_IMPORTANCE;
import static com.twiliovoicereactnative.JSEventEmitter.constructJSMap;
import static com.twiliovoicereactnative.CommonConstants.ScopeVoice;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventTypeValueIncomingCallInvite;
import static com.twiliovoicereactnative.CommonConstants.CallInviteEventKeyType;
import static com.twiliovoicereactnative.CommonConstants.CallInviteEventKeyCallSid;
import static com.twiliovoicereactnative.CommonConstants.CallInviteEventTypeValueAccepted;
import static com.twiliovoicereactnative.CommonConstants.CallInviteEventTypeValueRejected;
import static com.twiliovoicereactnative.CommonConstants.CallInviteEventTypeValueCancelled;
import static com.twiliovoicereactnative.CommonConstants.CallInviteEventTypeValueNotificationTapped;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventType;
import static com.twiliovoicereactnative.CommonConstants.VoiceErrorKeyError;
import static com.twiliovoicereactnative.Constants.ACTION_ACCEPT_CALL;
import static com.twiliovoicereactnative.Constants.ACTION_CALL_DISCONNECT;
import static com.twiliovoicereactnative.Constants.ACTION_CANCEL_CALL;
import static com.twiliovoicereactnative.Constants.ACTION_CANCEL_NOTIFICATION;
import static com.twiliovoicereactnative.Constants.ACTION_FOREGROUND_AND_DEPRIORITIZE_INCOMING_CALL_NOTIFICATION;
import static com.twiliovoicereactnative.Constants.ACTION_INCOMING_CALL;
import static com.twiliovoicereactnative.Constants.ACTION_PUSH_APP_TO_FOREGROUND;
import static com.twiliovoicereactnative.Constants.ACTION_RAISE_OUTGOING_CALL_NOTIFICATION;
import static com.twiliovoicereactnative.Constants.ACTION_REJECT_CALL;
import static com.twiliovoicereactnative.Constants.JS_EVENT_KEY_CALL_INVITE_INFO;
import static com.twiliovoicereactnative.Constants.VOICE_CHANNEL_DEFAULT_IMPORTANCE;
import static com.twiliovoicereactnative.ReactNativeArgumentsSerializer.serializeCall;
import static com.twiliovoicereactnative.ReactNativeArgumentsSerializer.serializeCallException;
import static com.twiliovoicereactnative.ReactNativeArgumentsSerializer.serializeCallInvite;
import static com.twiliovoicereactnative.ReactNativeArgumentsSerializer.serializeCancelledCallInvite;
import static com.twiliovoicereactnative.VoiceApplicationProxy.getCallRecordDatabase;
import static com.twiliovoicereactnative.VoiceApplicationProxy.getJSEventEmitter;

import com.twiliovoicereactnative.CallRecordDatabase.CallRecord;

import java.util.Objects;
import java.util.UUID;

import android.Manifest;
import android.app.Notification;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.util.Pair;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationManagerCompat;

import com.facebook.react.bridge.WritableMap;
import com.twilio.voice.AcceptOptions;


public class VoiceNotificationReceiver extends BroadcastReceiver {
  private static final SDKLog logger = new SDKLog(VoiceNotificationReceiver.class);
  @Override
  public void onReceive(@NonNull Context context, @NonNull Intent intent) {
    switch (Objects.requireNonNull(intent.getAction())) {
      case ACTION_INCOMING_CALL:
        handleIncomingCall(context, Objects.requireNonNull(getMessageUUID(intent)));
        break;
      case ACTION_ACCEPT_CALL:
        handleAccept(context, Objects.requireNonNull(getMessageUUID(intent)));
        break;
      case ACTION_REJECT_CALL:
        handleReject(context, Objects.requireNonNull(getMessageUUID(intent)));
        break;
      case ACTION_CANCEL_CALL:
        handleCancelCall(context, Objects.requireNonNull(getMessageUUID(intent)));
        break;
      case ACTION_CALL_DISCONNECT:
        handleDisconnect(Objects.requireNonNull(getMessageUUID(intent)));
        break;
      case ACTION_RAISE_OUTGOING_CALL_NOTIFICATION:
        handleRaiseOutgoingCallNotification(context, Objects.requireNonNull(getMessageUUID(intent)));
        break;
      case ACTION_CANCEL_NOTIFICATION:
        handleCancelNotification(context, Objects.requireNonNull(getMessageUUID(intent)));
        break;
      case ACTION_FOREGROUND_AND_DEPRIORITIZE_INCOMING_CALL_NOTIFICATION:
        handleForegroundAndDeprioritizeIncomingCallNotification(
          context,
          Objects.requireNonNull(getMessageUUID(intent)));
        break;
      case ACTION_PUSH_APP_TO_FOREGROUND:
        logger.warning("BroadcastReceiver received foreground request, ignoring");
        break;
      default:
        logger.log("Unknown notification, ignoring");
        break;
    }
  }

  public static Intent constructMessage(@NonNull Context context,
                                        @NonNull final String action,
                                        @NonNull final Class<?> target,
                                        @NonNull final UUID uuid) {
    Intent intent = new Intent(context.getApplicationContext(), target);
    intent.setAction(action);
    intent.putExtra(Constants.MSG_KEY_UUID, uuid);
    return intent;
  }

  public static void sendMessage(@NonNull Context context,
                                 @NonNull final String action,
                                 @NonNull final UUID uuid) {
    context.sendBroadcast(constructMessage(context, action, VoiceNotificationReceiver.class, uuid));
  }

  private static UUID getMessageUUID(@NonNull final Intent intent) {
    return (UUID)intent.getSerializableExtra(Constants.MSG_KEY_UUID);
  }

  private void handleIncomingCall(Context context, final UUID uuid) {
    logger.debug("Incoming_Call Message Received");
    // find call record
    CallRecord callRecord =
      Objects.requireNonNull(getCallRecordDatabase().get(new CallRecord(uuid)));

    // put up notification
    callRecord.setNotificationId(NotificationUtility.createNotificationIdentifier());
    Notification notification = NotificationUtility.createIncomingCallNotification(
      context.getApplicationContext(),
      callRecord,
      VOICE_CHANNEL_HIGH_IMPORTANCE,
      true);
    createOrReplaceNotification(context, callRecord.getNotificationId(), notification);

    // play ringer sound
    VoiceApplicationProxy.getAudioSwitchManager().getAudioSwitch().activate();
    VoiceApplicationProxy.getMediaPlayerManager().play(MediaPlayerManager.SoundTable.INCOMING);

    // trigger JS layer
    sendJSEvent(
      ScopeVoice,
      constructJSMap(
        new Pair<>(VoiceEventType, VoiceEventTypeValueIncomingCallInvite),
        new Pair<>(JS_EVENT_KEY_CALL_INVITE_INFO, serializeCallInvite(callRecord))));
  }

  private void handleAccept(Context context, final UUID uuid) {
    logger.debug("Accept_Call Message Received");
    // find call record
    final CallRecord callRecord =
      Objects.requireNonNull(getCallRecordDatabase().get(new CallRecord(uuid)));

    // cancel existing notification & put up in call
    Notification notification = NotificationUtility.createCallAnsweredNotificationWithLowImportance(
      context.getApplicationContext(),
      callRecord);
    createOrReplaceNotification(context, callRecord.getNotificationId(), notification);

    // stop ringer sound
    VoiceApplicationProxy.getMediaPlayerManager().stop();

    // accept call
    AcceptOptions acceptOptions = new AcceptOptions.Builder()
      .enableDscp(true)
      .build();
    callRecord.setCall(callRecord.getCallInvite().accept(
      context.getApplicationContext(),
      acceptOptions,
      new CallListenerProxy(uuid, context)));
    callRecord.setCallInviteUsedState();

    // handle if event spawned from JS
    if (null != callRecord.getCallAcceptedPromise()) {
      callRecord.getCallAcceptedPromise().resolve(serializeCall(callRecord));
    }

    // notify JS layer
    sendJSEvent(
      ScopeCallInvite,
      constructJSMap(
        new Pair<>(CallInviteEventKeyType, CallInviteEventTypeValueAccepted),
        new Pair<>(CallInviteEventKeyCallSid, callRecord.getCallSid()),
        new Pair<>(JS_EVENT_KEY_CALL_INVITE_INFO, serializeCallInvite(callRecord))));
  }

  private void handleReject(Context context, final UUID uuid) {
    logger.debug("Reject_Call Message Received");
    // find call record
    final CallRecord callRecord =
      Objects.requireNonNull(getCallRecordDatabase().remove(new CallRecord(uuid)));

    // take down notification
    cancelNotification(context, callRecord.getNotificationId());

    // stop ringer sound
    VoiceApplicationProxy.getMediaPlayerManager().stop();
    VoiceApplicationProxy.getAudioSwitchManager().getAudioSwitch().deactivate();

    // reject call
    callRecord.getCallInvite().reject(context.getApplicationContext());
    callRecord.setCallInviteUsedState();

    // handle if event spawned from JS
    if (null != callRecord.getCallRejectedPromise()) {
      callRecord.getCallRejectedPromise().resolve(callRecord.getUuid().toString());
    }

    // notify JS layer
    sendJSEvent(
      ScopeCallInvite,
      constructJSMap(
        new Pair<>(CallInviteEventKeyType, CallInviteEventTypeValueRejected),
        new Pair<>(CallInviteEventKeyCallSid, callRecord.getCallSid()),
        new Pair<>(JS_EVENT_KEY_CALL_INVITE_INFO, serializeCallInvite(callRecord))));
  }

  private void handleCancelCall(Context context, final UUID uuid) {
    logger.debug("Cancel_Call Message Received");
    // find call record
    final CallRecord callRecord =
      Objects.requireNonNull(getCallRecordDatabase().remove(new CallRecord(uuid)));

    // take down notification
    cancelNotification(context, callRecord.getNotificationId());

    // stop ringer sound
    VoiceApplicationProxy.getMediaPlayerManager().stop();
    VoiceApplicationProxy.getAudioSwitchManager().getAudioSwitch().deactivate();

    // notify JS layer
    sendJSEvent(
      ScopeCallInvite,
      constructJSMap(
        new Pair<>(CallInviteEventKeyType, CallInviteEventTypeValueCancelled),
        new Pair<>(CallInviteEventKeyCallSid, callRecord.getCallSid()),
        new Pair<>(JS_EVENT_KEY_CANCELLED_CALL_INVITE_INFO, serializeCancelledCallInvite(callRecord)),
        new Pair<>(VoiceErrorKeyError, serializeCallException(callRecord))));
  }

  private void handleDisconnect(final UUID uuid) {
    logger.debug("Disconnect Message Received");

    // find call record
    final CallRecord callRecord = getCallRecordDatabase().get(new CallRecord(uuid));

    // handle disconnect
    if (null != callRecord) {
      Objects.requireNonNull(callRecord.getVoiceCall()).disconnect();
    } else {
      logger.warning("No call found");
    }
  }

  private void handleRaiseOutgoingCallNotification(Context context,
                                                   final UUID uuid) {
    logger.debug("Raise Outgoing Call Notification Message Received");

    // find call record
    final CallRecord callRecord =
      Objects.requireNonNull(getCallRecordDatabase().get(new CallRecord(uuid)));

    // put up outgoing call notification
    Notification notification = NotificationUtility.createOutgoingCallNotificationWithLowImportance(
      context.getApplicationContext(),
      callRecord);
    createOrReplaceNotification(context, callRecord.getNotificationId(), notification);
  }

  private void handleCancelNotification(Context context, final UUID uuid) {
    logger.debug("Cancel Notification Message Received");
    // only take down notification & stop any active sounds if one is active
    final CallRecord callRecord = getCallRecordDatabase().remove(new CallRecord(uuid));
    if (null != callRecord) {
      VoiceApplicationProxy.getMediaPlayerManager().stop();
      cancelNotification(context, callRecord.getNotificationId());
    }
  }

  private void handleForegroundAndDeprioritizeIncomingCallNotification(Context context,
                                                                       final UUID uuid) {
    logger.debug("Foreground & Deprioritize Incoming Call Notification Message Received");

    // cancel existing notification & put up in call
    final CallRecord callRecord = Objects.requireNonNull(getCallRecordDatabase().get(new CallRecord(uuid)));
    Notification notification = NotificationUtility.createIncomingCallNotification(
      context.getApplicationContext(),
      callRecord,
      VOICE_CHANNEL_DEFAULT_IMPORTANCE,
      false);
    createOrReplaceNotification(context, callRecord.getNotificationId(), notification);

    // stop active sound (if any)
    VoiceApplicationProxy.getMediaPlayerManager().stop();

    // notify JS layer
    sendJSEvent(
      ScopeCallInvite,
      constructJSMap(
        new Pair<>(CallInviteEventKeyType, CallInviteEventTypeValueNotificationTapped),
        new Pair<>(CallInviteEventKeyCallSid, callRecord.getCallSid())));
  }

  private static void sendJSEvent(@NonNull String scope, @NonNull WritableMap event) {
    getJSEventEmitter().sendEvent(scope, event);
  }

  private static void createOrReplaceNotification(Context context,
                                                  final int notificationId,
                                                  final Notification notification) {
    NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);
    if (ActivityCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS)
      == PackageManager.PERMISSION_GRANTED) {
      notificationManager.notify(notificationId, notification);
    } else {
      logger.warning("WARNING: Notification not posted, permission not granted");
    }
  }

  private static void cancelNotification(Context context, final int notificationId) {
    NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);
    notificationManager.cancel(notificationId);
  }
}
