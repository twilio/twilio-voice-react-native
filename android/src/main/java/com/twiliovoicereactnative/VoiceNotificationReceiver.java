package com.twiliovoicereactnative;

import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_CALL_INVITE_INFO;
import static com.twiliovoicereactnative.CommonConstants.ScopeVoice;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventCallInvite;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventCallInviteAccepted;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventCallInviteNotificationTapped;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventCallInviteRejected;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventType;
import static com.twiliovoicereactnative.Constants.ACTION_ACCEPT_CALL;
import static com.twiliovoicereactnative.Constants.ACTION_CALL_DISCONNECT;
import static com.twiliovoicereactnative.Constants.ACTION_CANCEL_CALL;
import static com.twiliovoicereactnative.Constants.ACTION_CANCEL_NOTIFICATION;
import static com.twiliovoicereactnative.Constants.ACTION_FOREGROUND_AND_DEPRIORITIZE_INCOMING_CALL_NOTIFICATION;
import static com.twiliovoicereactnative.Constants.ACTION_INCOMING_CALL;
import static com.twiliovoicereactnative.Constants.ACTION_PUSH_APP_TO_FOREGROUND;
import static com.twiliovoicereactnative.Constants.ACTION_RAISE_OUTGOING_CALL_NOTIFICATION;
import static com.twiliovoicereactnative.Constants.ACTION_REJECT_CALL;
import static com.twiliovoicereactnative.Constants.VOICE_CHANNEL_DEFAULT_IMPORTANCE;
import static com.twiliovoicereactnative.ReactNativeArgumentsSerializer.serializeCall;
import static com.twiliovoicereactnative.ReactNativeArgumentsSerializer.serializeCallInvite;
import static com.twiliovoicereactnative.ReactNativeArgumentsSerializer.serializeCancelledCallInvite;

import java.util.Objects;

import android.Manifest;
import android.app.Notification;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationManagerCompat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;
import com.twilio.voice.AcceptOptions;
import com.twilio.voice.Call;
import com.twilio.voice.CallInvite;
import com.twilio.voice.CancelledCallInvite;


public class VoiceNotificationReceiver extends BroadcastReceiver {
  @Override
  public void onReceive(@NonNull Context context, @NonNull Intent intent) {
    switch (Objects.requireNonNull(intent.getAction())) {
      case ACTION_INCOMING_CALL:
        handleIncomingCall(
          context,
          Objects.requireNonNull(intent.getParcelableExtra(Constants.INCOMING_CALL_INVITE)),
          Objects.requireNonNull(intent.getStringExtra(Constants.UUID)));
        break;
      case ACTION_ACCEPT_CALL:
        handleAccept(
          context,
          Objects.requireNonNull(intent.getParcelableExtra(Constants.INCOMING_CALL_INVITE)),
          Objects.requireNonNull(intent.getStringExtra(Constants.UUID)));
        break;
      case ACTION_REJECT_CALL:
        handleReject(
          context,
          Objects.requireNonNull(intent.getParcelableExtra(Constants.INCOMING_CALL_INVITE)),
          Objects.requireNonNull(intent.getStringExtra(Constants.UUID)));
        break;
      case ACTION_CANCEL_CALL:
        handleCancelCall(
          context,
          Objects.requireNonNull(intent.getParcelableExtra(Constants.CANCELLED_CALL_INVITE),
          Objects.requireNonNull(intent.getStringExtra(Constants.UUID));
        break;
      case ACTION_CALL_DISCONNECT:
        handleDisconnect(intent.getStringExtra(Constants.UUID));
        break;
      case ACTION_RAISE_OUTGOING_CALL_NOTIFICATION:
        handleRaiseOutgoingCallNotification(
          context,
          Objects.requireNonNull(intent.getStringExtra(Constants.CALL_SID_KEY)),
          Objects.requireNonNull(intent.getStringExtra(Constants.UUID)));
        break;
      case ACTION_CANCEL_NOTIFICATION:
        handleCancelNotification(
          context,
          Objects.requireNonNull(intent.getStringExtra(Constants.UUID)));
        break;
      case ACTION_FOREGROUND_AND_DEPRIORITIZE_INCOMING_CALL_NOTIFICATION:
        handleForegroundAndDeprioritizeIncomingCallNotification(
          context,
          Objects.requireNonNull(intent.getParcelableExtra(Constants.INCOMING_CALL_INVITE)),
          Objects.requireNonNull(intent.getStringExtra(Constants.UUID)));
        break;
      case ACTION_PUSH_APP_TO_FOREGROUND:
        warning("BroadcastReceiver received foreground request, ignoring");
        break;
      default:
        log("Unknown notification, ignoring");
        break;
    }
  }

  private void handleIncomingCall(Context context, final CallInvite callInvite, final String uuid) {
    log("Incoming_Call Message Received");
    // put up notification
    final int notificationId = NotificationUtility.createNotificationIdentifier();
    Notification notification =
      NotificationUtility.createIncomingCallNotification(
        callInvite,
        notificationId,
        uuid,
        VOICE_CHANNEL_DEFAULT_IMPORTANCE,
        true,
        context.getApplicationContext());
    createOrReplaceNotification(context, notificationId, notification);

    // play ringer sound
    playSound(context);

    // handle call invite
    Storage.uuidNotificationIdMap.put(uuid, notificationId);
    Storage.callInviteMap.put(uuid, callInvite);

    // trigger JS layer
    WritableMap params = Arguments.createMap();
    params.putString(VoiceEventType, VoiceEventCallInvite);
    params.putMap(EVENT_KEY_CALL_INVITE_INFO, serializeCallInvite(uuid, callInvite));
    AndroidEventEmitter.getInstance().sendEvent(ScopeVoice, params);
  }

  private void handleAccept(Context context, final CallInvite callInvite, final String uuid) {
    log("Accept_Call Message Received");
    // cancel existing notification & put up in call
    final int notificationId = Objects.requireNonNull(Storage.uuidNotificationIdMap.get(uuid));
    Notification notification =
      NotificationUtility.createCallAnsweredNotificationWithLowImportance(
        callInvite,
        notificationId,
        uuid,
        context.getApplicationContext());
    createOrReplaceNotification(context, notificationId, notification);

    // stop ringer sound
    stopSound(context);

    // accept call
    AcceptOptions acceptOptions = new AcceptOptions.Builder()
      .enableDscp(true)
      .build();
    Call call = callInvite.accept(
      context.getApplicationContext(),
      acceptOptions,
      new CallListenerProxy(uuid, context));
    Storage.callMap.put(uuid, call);
    Storage.callInviteMap.remove(uuid);

    // handle if event spawned from JS
    if (Storage.callAcceptedPromiseMap.containsKey(uuid)) {
      Promise promise = Objects.requireNonNull(Storage.callAcceptedPromiseMap.remove(uuid));
      promise.resolve(serializeCall(uuid, call));
    }

    // notify JS layer
    WritableMap params = Arguments.createMap();
    params.putString(VoiceEventType, VoiceEventCallInviteAccepted);
    params.putMap(EVENT_KEY_CALL_INVITE_INFO, serializeCallInvite(uuid, callInvite));
    AndroidEventEmitter.getInstance().sendEvent(ScopeVoice, params);
  }

  private void handleReject(Context context, final CallInvite callInvite, final String uuid) {
    log("Reject_Call Message Received");
    // take down notification
    cancelNotification(context, Objects.requireNonNull(Storage.uuidNotificationIdMap.get(uuid)));

    // stop ringer sound
    stopSound(context);

    // reject call
    callInvite.reject(context.getApplicationContext());
    Storage.uuidNotificationIdMap.remove(uuid);
    Storage.callInviteMap.remove(uuid);

    // handle if event spawned from JS
    if (Storage.callRejectPromiseMap.containsKey(uuid)) {
      Promise promise = Objects.requireNonNull(Storage.callRejectPromiseMap.remove(uuid));
      promise.resolve(uuid);
    }

    // notify JS layer
    WritableMap params = Arguments.createMap();
    params.putString(VoiceEventType, VoiceEventCallInviteRejected);
    params.putMap(EVENT_KEY_CALL_INVITE_INFO, serializeCallInvite(uuid, callInvite));
    AndroidEventEmitter.getInstance().sendEvent(ScopeVoice, params);
  }

  private void handleCancelCall(Context context, final CancelledCallInvite callInvite, final String uuid) {
    log("Cancel_Call Message Received");
    // take down notification
    cancelNotification(context, Objects.requireNonNull(Storage.uuidNotificationIdMap.get(uuid)));

    // stop ringer sound
    stopSound(context);

    // handle cancel call
    Storage.uuidNotificationIdMap.remove(uuid);
    Storage.callInviteMap.remove(uuid);

    // notify JS layer
    WritableMap params = Arguments.createMap();
    params.putString(VoiceEventType, VoiceEventCallInvite);
    params.putMap(EVENT_KEY_CALL_INVITE_INFO, serializeCancelledCallInvite(callInvite));
    AndroidEventEmitter.getInstance().sendEvent(ScopeVoice, params);
  }

  private void handleDisconnect(final String uuid) {
    log("Disconnect Message Received");

    // handle disconnect
    if (Storage.callMap.containsKey(uuid)) {
      Objects.requireNonNull(Storage.callMap.get(uuid)).disconnect();
    } else {
      log("No call found");
    }
  }

  private void handleRaiseOutgoingCallNotification(Context context,
                                                   final String callSid,
                                                   final String uuid) {
    log("Raise Outgoing Call Notification Message Received");

    // put up outgoing call notification
    final int notificationId = Objects.requireNonNull(Storage.uuidNotificationIdMap.get(uuid));
    Notification notification = NotificationUtility.createOutgoingCallNotificationWithLowImportance(
      callSid,
      notificationId,
      uuid,
      context.getApplicationContext());
    createOrReplaceNotification(context, notificationId, notification);
  }

  private void handleCancelNotification(Context context, final String uuid) {
    log("Cancel Notification Message Received");
    // only take down notification & stop any active sounds if one is active
    if (Storage.uuidNotificationIdMap.containsKey(uuid)) {
      cancelNotification(
        context,
        Objects.requireNonNull(Storage.uuidNotificationIdMap.remove(uuid)));
      stopSound(context);
    }
  }

  private void handleForegroundAndDeprioritizeIncomingCallNotification(Context context,
                                                                       final CallInvite callInvite,
                                                                       String uuid) {
    log("Foreground & Deprioritize Incoming Call Notification Message Received");

    // cancel existing notification & put up in call
    final int notificationId = Objects.requireNonNull(Storage.uuidNotificationIdMap.get(uuid));
    Notification notification = NotificationUtility.createIncomingCallNotification(
      callInvite,
      notificationId,
      uuid,
      VOICE_CHANNEL_DEFAULT_IMPORTANCE,
      false,
      context.getApplicationContext());
    createOrReplaceNotification(context, notificationId, notification);

    // stop active sound (if any)
    stopSound(context);

    // notify JS layer
    WritableMap params = Arguments.createMap();
    params.putString(VoiceEventType, VoiceEventCallInviteNotificationTapped);
    AndroidEventEmitter.getInstance().sendEvent(ScopeVoice, params);
  }

  private static void createOrReplaceNotification(Context context,
                                                  final int notificationId,
                                                  final Notification notification) {
    NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);
    if (ActivityCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS)
      == PackageManager.PERMISSION_GRANTED) {
      notificationManager.notify(notificationId, notification);
    } else {
      warning("WARNING: Notification not posted, permission not granted");
    }
  }

  private static void cancelNotification(Context context, final int notificationId) {
    NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);
    notificationManager.cancel(notificationId);
  }

  private static Class<?> getMainActivityClass(Context context) {
    String packageName = context.getPackageName();
    Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage(packageName);
    ComponentName componentName = Objects.requireNonNull(launchIntent).getComponent();
    try {
      return Class.forName(Objects.requireNonNull(componentName).getClassName());
    } catch (ClassNotFoundException e) {
      e.printStackTrace();
      return null;
    }
  }

  private static void playSound(Context context) {
    MediaPlayerManager mediaPlayerManager =
      MediaPlayerManager.getInstance(context.getApplicationContext());
    mediaPlayerManager.play(
      context.getApplicationContext(),
      MediaPlayerManager.SoundTable.INCOMING);
  }

  private static void stopSound(Context context) {
    MediaPlayerManager mediaPlayerManager =
      MediaPlayerManager.getInstance(context.getApplicationContext());
    mediaPlayerManager.stop();
  }

  private static void log(final String message) {
    Log.d(VoiceNotificationReceiver.class.getSimpleName(), message);
  }

  private static void warning(final String message) {
    Log.w(VoiceNotificationReceiver.class.getSimpleName(), message);
  }
}
