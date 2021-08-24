package com.twiliovoicereactnative;

import android.annotation.TargetApi;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.os.IBinder;
import android.util.Log;
import android.media.RingtoneManager;
import android.content.res.Resources;

import androidx.core.app.NotificationCompat;
import androidx.lifecycle.Lifecycle;
import androidx.lifecycle.ProcessLifecycleOwner;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.twilio.voice.Call;
import com.twilio.voice.CallInvite;
import com.twilio.voice.CancelledCallInvite;
import com.twilio.voice.AcceptOptions;

import android.widget.RemoteViews;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;

import java.util.UUID;

import android.media.AudioAttributes;
import android.net.Uri;

public class IncomingCallNotificationService extends Service {

  private static final String TAG = IncomingCallNotificationService.class.getSimpleName();
  private AndroidEventEmitter androidEventEmitter;

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    String action = intent.getAction();
    NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);

    Log.d(TAG, "Received command " + action);
    if (action != null) {
      CallInvite callInvite = intent.getParcelableExtra(Constants.INCOMING_CALL_INVITE);
      CancelledCallInvite cancelledCallInvite = intent.getParcelableExtra(Constants.CANCELLED_CALL_INVITE);
      int notificationId = intent.getIntExtra(Constants.NOTIFICATION_ID, 0);
      String uuid = intent.getStringExtra(Constants.UUID);
      String callSid = intent.getStringExtra(Constants.CALL_SID_KEY);
      Log.d(TAG, "UUID " + uuid + " action " + action + " intent " + intent.toString() + " notificationId " + notificationId);
      switch (action) {
        case Constants.ACTION_INCOMING_CALL:
          handleIncomingCall(callInvite, notificationId, uuid);
          break;
        case Constants.ACTION_ACCEPT:
          accept(callInvite, notificationId, uuid);
          sendCallInviteToActivity(callInvite, notificationId);
          break;
        case Constants.ACTION_REJECT:
          reject(callInvite, notificationId, uuid);
          break;
        case Constants.ACTION_CANCEL_CALL:
          handleCancelledCall(intent, cancelledCallInvite.getCallSid(), notificationId, uuid);
          break;
        case Constants.ACTION_CANCEL_NOTIFICATION:
          endForeground();
          Log.d(TAG, "Cancelling notifiation uuid:" + uuid + " notificationId: " + notificationId);
          notificationManager.cancel(notificationId);
          Storage.uuidNotificaionIdMap.remove(uuid);
          break;
        case Constants.ACTION_CALL_DISCONNECT:
          Storage.uuidNotificaionIdMap.remove(uuid);
          disconnectCall(notificationId, uuid);
          break;
        case Constants.ACTION_OUTGOING_CALL:
          Log.d(TAG, "Raising call in progress notifiation uuid:" + uuid + " notificationId: " + notificationId);
          handleOutgoingCall(callSid, notificationId, uuid);
          break;
        default:
          break;
      }
    }
    return START_NOT_STICKY;
  }

  @Override
  public IBinder onBind(Intent intent) {
    return null;
  }

  private Notification createIncomingCallNotification(CallInvite callInvite, int notificationId, String uuid, int channelImportance) {

    Bundle extras = new Bundle();
    extras.putString(Constants.CALL_SID_KEY, callInvite.getCallSid());

    Resources res = this.getResources();
    String packageName = this.getPackageName();
    int smallIconResId = 0;
    smallIconResId = res.getIdentifier("ic_notification", "drawable", packageName);

    Intent rejectIntent = new Intent(getApplicationContext(), IncomingCallNotificationService.class);
    rejectIntent.setAction(Constants.ACTION_REJECT);
    rejectIntent.putExtra(Constants.INCOMING_CALL_INVITE, callInvite);
    rejectIntent.putExtra(Constants.NOTIFICATION_ID, notificationId);
    rejectIntent.putExtra(Constants.UUID, uuid);
    PendingIntent piRejectIntent = PendingIntent.getService(getApplicationContext(), 0, rejectIntent, PendingIntent.FLAG_UPDATE_CURRENT);

    Intent acceptIntent = new Intent(getApplicationContext(), IncomingCallNotificationService.class);
    acceptIntent.setAction(Constants.ACTION_ACCEPT);
    acceptIntent.putExtra(Constants.INCOMING_CALL_INVITE, callInvite);
    acceptIntent.putExtra(Constants.NOTIFICATION_ID, notificationId);
    acceptIntent.putExtra(Constants.UUID, uuid);
    PendingIntent piAcceptIntent = PendingIntent.getService(getApplicationContext(), 0, acceptIntent, PendingIntent.FLAG_UPDATE_CURRENT);

    Bitmap icon = BitmapFactory.decodeResource(getResources(), R.drawable.ic_call_end_white_24dp);

    RemoteViews remoteViews = new RemoteViews(getPackageName(), R.layout.custom_notification_incoming);
    remoteViews.setTextViewText(R.id.notif_title, callInvite.getFrom());
    remoteViews.setTextViewText(R.id.notif_content, Constants.NOTIFICATION_CONTENT + getString(R.string.app_name));

    remoteViews.setOnClickPendingIntent(R.id.button_answer, piAcceptIntent);
    remoteViews.setOnClickPendingIntent(R.id.button_decline, piRejectIntent);

    Intent notification_intent = new Intent(getApplicationContext(), IncomingCallNotificationService.class);
    PendingIntent pendingIntent = PendingIntent.getActivity(getApplicationContext(), 0, notification_intent, 0);

    remoteViews.setOnClickPendingIntent(R.id.notification, pendingIntent);

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Notification notification = new Notification.Builder(getApplicationContext(), createChannel(channelImportance))
        .setSmallIcon(smallIconResId)
        .setLargeIcon(icon)
        .setContentTitle(callInvite.getFrom())
        .setContentText(Constants.NOTIFICATION_CONTENT + getString(R.string.app_name))
        .setCategory(Notification.CATEGORY_CALL)
        .setExtras(extras)
        .setAutoCancel(true)
        .setCustomContentView(remoteViews)
        .setCustomBigContentView(remoteViews)
        .setContentIntent(pendingIntent)
        .setFullScreenIntent(pendingIntent, true).build();
      notification.flags |= Notification.FLAG_INSISTENT;
      return notification;
    } else {
      Notification notification = new NotificationCompat.Builder(this)
        .setSmallIcon(smallIconResId)
        .setLargeIcon(icon)
        .setContentTitle(callInvite.getFrom())
        .setContentText(Constants.NOTIFICATION_CONTENT + getString(R.string.app_name))
        .setCategory(Notification.CATEGORY_CALL)
        .setExtras(extras)
        .setAutoCancel(true)
        .setCustomContentView(remoteViews)
        .setCustomBigContentView(remoteViews)
        .setContentIntent(pendingIntent)
        .setFullScreenIntent(pendingIntent, true).build();
      notification.flags |= Notification.FLAG_INSISTENT;
      return notification;
    }
  }

  private Notification createCallAnsweredNotification(CallInvite callInvite, int notificationId, String uuid, int channelImportance) {

    Bundle extras = new Bundle();
    extras.putString(Constants.CALL_SID_KEY, callInvite.getCallSid());

    Resources res = this.getResources();
    String packageName = this.getPackageName();
    int smallIconResId = 0;
    smallIconResId = res.getIdentifier("ic_notification", "drawable", packageName);

    RemoteViews remoteViews = new RemoteViews(getPackageName(), R.layout.custom_call_answer);
    remoteViews.setTextViewText(R.id.notif_title, callInvite.getFrom());
    remoteViews.setTextViewText(R.id.notif_content, Constants.NOTIFICATION_CONTENT + getString(R.string.app_name));

    Intent notification_intent = new Intent(getApplicationContext(), IncomingCallNotificationService.class);
    PendingIntent pendingIntent = PendingIntent.getActivity(getApplicationContext(), 0, notification_intent, 0);

    remoteViews.setOnClickPendingIntent(R.id.button_decline, pendingIntent);

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Notification notification = new Notification.Builder(getApplicationContext(), createChannel(channelImportance))
        .setSmallIcon(smallIconResId)
        .setContentTitle(callInvite.getFrom())
        .setContentText(Constants.NOTIFICATION_CONTENT + getString(R.string.app_name))
        .setCategory(Notification.CATEGORY_CALL)
        .setExtras(extras)
        .setAutoCancel(true)
        .setCustomContentView(remoteViews)
        .setCustomBigContentView(remoteViews)
        .setContentIntent(pendingIntent)
        .setFullScreenIntent(pendingIntent, true).build();
      notification.flags |= Notification.FLAG_INSISTENT;
      return notification;
    } else {
      Notification notification = new NotificationCompat.Builder(this)
        .setSmallIcon(smallIconResId)
        .setContentTitle(callInvite.getFrom())
        .setContentText(Constants.NOTIFICATION_CONTENT + getString(R.string.app_name))
        .setCategory(Notification.CATEGORY_CALL)
        .setExtras(extras)
        .setAutoCancel(true)
        .setCustomContentView(remoteViews)
        .setCustomBigContentView(remoteViews)
        .setContentIntent(pendingIntent)
        .setFullScreenIntent(pendingIntent, true).build();
      notification.flags |= Notification.FLAG_INSISTENT;
      return notification;
    }
  }

  private Notification createOutgoingCallNotification(String callSid, int notificationId, String uuid, int channelImportance) {

    Bundle extras = new Bundle();
    extras.putString(Constants.CALL_SID_KEY, callSid);
    extras.putInt(Constants.NOTIFICATION_ID, notificationId);

    Resources res = this.getResources();
    String packageName = this.getPackageName();
    int smallIconResId = 0;
    smallIconResId = res.getIdentifier("ic_notification", "drawable", packageName);

    RemoteViews remoteViews = new RemoteViews(getPackageName(), R.layout.custom_outgoing_call);
    remoteViews.setTextViewText(R.id.notif_content, Constants.NOTIFICATION_CONTENT + getString(R.string.app_name));

    Intent notification_intent = new Intent(getApplicationContext(), IncomingCallNotificationService.class);
    PendingIntent pendingIntent = PendingIntent.getActivity(getApplicationContext(), 0, notification_intent, 0);

    remoteViews.setOnClickPendingIntent(R.id.button_decline, pendingIntent);

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Intent endCallIntent = new Intent(getApplicationContext(), IncomingCallNotificationService.class);
      endCallIntent.setAction(Constants.ACTION_CALL_DISCONNECT);
      endCallIntent.putExtra(Constants.NOTIFICATION_ID, notificationId);
      endCallIntent.putExtra(Constants.UUID, uuid);
      PendingIntent piEndCallIntent = PendingIntent.getService(getApplicationContext(), 0, endCallIntent, PendingIntent.FLAG_UPDATE_CURRENT);

      remoteViews.setOnClickPendingIntent(R.id.end_call, piEndCallIntent);

      Notification notification = new Notification.Builder(getApplicationContext(), createChannel(channelImportance))
        .setSmallIcon(smallIconResId)
        .setContentText(Constants.NOTIFICATION_CONTENT + getString(R.string.app_name))
        .setCategory(Notification.CATEGORY_CALL)
        .setExtras(extras)
        .setAutoCancel(true)
        .setCustomContentView(remoteViews)
        .setCustomBigContentView(remoteViews)
        .setContentIntent(pendingIntent)
        .setFullScreenIntent(pendingIntent, true).build();
      notification.flags |= Notification.FLAG_INSISTENT;
      return notification;
    } else {
      Notification notification = new NotificationCompat.Builder(this)
        .setSmallIcon(smallIconResId)
        .setContentText(Constants.NOTIFICATION_CONTENT + getString(R.string.app_name))
        .setCategory(Notification.CATEGORY_CALL)
        .setExtras(extras)
        .setAutoCancel(true)
        .setCustomContentView(remoteViews)
        .setCustomBigContentView(remoteViews)
        .setContentIntent(pendingIntent)
        .setFullScreenIntent(pendingIntent, true).build();
      notification.flags |= Notification.FLAG_INSISTENT;
      return notification;
    }
  }

  @TargetApi(Build.VERSION_CODES.O)
  private String createChannel(int channelImportance) {
    NotificationChannel callInviteChannel = new NotificationChannel(Constants.VOICE_CHANNEL_HIGH_IMPORTANCE,
      "Primary Voice Channel", NotificationManager.IMPORTANCE_HIGH);
    String channelId = Constants.VOICE_CHANNEL_HIGH_IMPORTANCE;

    Uri soundUri = Uri.parse(
      "android.resource://" +
        getApplicationContext().getPackageName() +
        "/" +
        R.raw.incoming);

    AudioAttributes audioAttributes = new AudioAttributes.Builder()
      .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
      .setUsage(AudioAttributes.USAGE_VOICE_COMMUNICATION)
      .build();

    if (channelImportance == NotificationManager.IMPORTANCE_LOW) {
      callInviteChannel = new NotificationChannel(Constants.VOICE_CHANNEL_LOW_IMPORTANCE,
        "Primary Voice Channel", NotificationManager.IMPORTANCE_LOW);
      channelId = Constants.VOICE_CHANNEL_LOW_IMPORTANCE;
    }
    callInviteChannel.setLightColor(Color.GREEN);
    callInviteChannel.setLockscreenVisibility(Notification.VISIBILITY_PRIVATE);
    callInviteChannel.setSound(soundUri, audioAttributes);
    NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
    notificationManager.createNotificationChannel(callInviteChannel);

    return channelId;
  }

  private void accept(CallInvite callInvite, int notificationId, String uuid) {
    Log.e(TAG, "CallInvite UUID accept " + uuid);
    endForeground();
    Intent activeCallIntent = new Intent(Constants.ACTION_ACCEPT);
    activeCallIntent.putExtra(Constants.INCOMING_CALL_INVITE, callInvite);
    activeCallIntent.putExtra(Constants.UUID, uuid);
    // Need to answer the call here in case TwilioVoiceReactNative is not loaded
    AcceptOptions acceptOptions = new AcceptOptions.Builder()
      .enableDscp(true)
      .build();

    Call call = callInvite.accept(this, acceptOptions, new CallListenerProxy(uuid, this));
    Storage.callMap.put(uuid, call);
    Storage.callMap.forEach((key, value) -> Log.e(TAG, "CallInvite UUID accept callMap value " + key + ":" + value));
    Storage.releaseCallInviteStorage(uuid, callInvite.getCallSid(), notificationId, "accept");

    NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
    notificationManager.cancel(notificationId);

    Storage.uuidNotificaionIdMap.put(uuid, notificationId);
    startForeground(notificationId, createCallAnsweredNotification(callInvite, notificationId, uuid, NotificationManager.IMPORTANCE_LOW));
    // Send the broadcast in case TwilioVoiceReactNative is loaded, it can emit the event
    LocalBroadcastManager.getInstance(this).sendBroadcast(activeCallIntent);
  }

  private void reject(CallInvite callInvite, int notificationId, String uuid) {
    endForeground();
    callInvite.reject(getApplicationContext());
    Storage.releaseCallInviteStorage(uuid, callInvite.getCallSid(), notificationId, "reject");

    Intent rejectCallInviteIntent = new Intent(Constants.ACTION_REJECT);
    rejectCallInviteIntent.putExtra(Constants.INCOMING_CALL_INVITE, callInvite);
    rejectCallInviteIntent.putExtra(Constants.UUID, uuid);
    LocalBroadcastManager.getInstance(this).sendBroadcast(rejectCallInviteIntent);
  }

  private void disconnectCall(int notificationId, String uuid) {
    endForeground();
    Call call = Storage.callMap.get(uuid);
    call.disconnect();
  }

  private void handleOutgoingCall(String callSid, int notificationId, String uuid) {
    Log.e(TAG, "Outgoing Call UUID " + uuid + " notificationId " + notificationId + " callSid " + callSid);

    NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
    startForeground(notificationId, createOutgoingCallNotification(callSid, notificationId, uuid, NotificationManager.IMPORTANCE_LOW));
  }

  private void handleCancelledCall(Intent intent, String callSid, int notificationId, String uuid) {
    endForeground();
    Storage.releaseCallInviteStorage(uuid, callSid, notificationId, "cancel");
    LocalBroadcastManager.getInstance(this).sendBroadcast(intent);
  }

  private void handleIncomingCall(CallInvite callInvite, int notificationId, String uuid) {
    Log.d(TAG, "Calling handleIncomingCall for " + callInvite + " with CallInvite UUID " + uuid);
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      setIncomingCallNotification(callInvite, notificationId, uuid);
    }
    Intent intent = new Intent(Constants.ACTION_INCOMING_CALL);
    intent.putExtra(Constants.INCOMING_CALL_INVITE, callInvite);
    intent.putExtra(Constants.UUID, uuid);
    LocalBroadcastManager.getInstance(this).sendBroadcast(intent);
  }

  private void endForeground() {
    stopForeground(true);
  }

  @TargetApi(Build.VERSION_CODES.O)
  private void setIncomingCallNotification(CallInvite callInvite, int notificationId, String uuid) {
    if (isAppVisible()) {
      Log.i(TAG, "setCallInProgressNotification - app is visible with CallInvite UUID " + uuid + " notificationId" + notificationId);
    } else {
      Log.i(TAG, "setCallInProgressNotification - app is NOT visible with CallInvite UUID " + " notificationId" + notificationId);
    }
    startForeground(notificationId, createIncomingCallNotification(callInvite, notificationId, uuid, NotificationManager.IMPORTANCE_HIGH));
    Log.d(TAG, "Adding items in callInviteUuidNotificaionIdMap uuid:" + uuid + " notificationId: " + notificationId);
    Storage.uuidNotificaionIdMap.put(uuid, notificationId);
  }

  /*
   * Send the CallInvite to the main activity. Start the activity if it is not running already.
   */
  private void sendCallInviteToActivity(CallInvite callInvite, int notificationId) {
    Intent intent = new Intent(this, getMainActivityClass(getApplicationContext()));
    intent.setAction(Constants.ACTION_INCOMING_CALL);
    intent.putExtra(Constants.NOTIFICATION_ID, notificationId);
    intent.putExtra(Constants.INCOMING_CALL_INVITE, callInvite);
    intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    this.startActivity(intent);
  }

  private boolean isAppVisible() {
    return ProcessLifecycleOwner
      .get()
      .getLifecycle()
      .getCurrentState()
      .isAtLeast(Lifecycle.State.STARTED);
  }

  private static Class getMainActivityClass(Context context) {
    String packageName = context.getPackageName();
    Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage(packageName);
    String className = launchIntent.getComponent().getClassName();
    try {
      return Class.forName(className);
    } catch (ClassNotFoundException e) {
      e.printStackTrace();
      return null;
    }
  }
}
