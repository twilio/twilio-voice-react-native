package com.twiliovoicereactnative;

import android.annotation.TargetApi;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationChannelGroup;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.widget.RemoteViews;

import androidx.core.app.NotificationCompat;

import com.twilio.voice.CallInvite;

import static android.content.Context.AUDIO_SERVICE;


import static com.twiliovoicereactnative.Constants.VOICE_CHANNEL_DEFAULT_IMPORTANCE;
import static com.twiliovoicereactnative.Constants.VOICE_CHANNEL_HIGH_IMPORTANCE;
import static com.twiliovoicereactnative.Constants.VOICE_CHANNEL_LOW_IMPORTANCE;

import java.net.URLDecoder;
import java.util.Map;
import java.util.Objects;

public class NotificationUtility {
  private static final String TAG = IncomingCallNotificationService.class.getSimpleName();

  public static Notification createIncomingCallNotification(CallInvite callInvite, int notificationId, String uuid, final String channelImportance, boolean fullScreenIntent, Context context) {

    Bundle extras = new Bundle();
    extras.putString(Constants.CALL_SID_KEY, callInvite.getCallSid());

    Resources res = context.getResources();
    String packageName = context.getPackageName();
    int smallIconResId = res.getIdentifier("ic_notification", "drawable", packageName);

    Intent foreground_intent = new Intent(context.getApplicationContext(), NotificationProxyActivity.class);
    foreground_intent.setAction(Constants.ACTION_PUSH_APP_TO_FOREGROUND_AND_MINIMIZE_NOTIFICATION);
    foreground_intent.putExtra(Constants.INCOMING_CALL_INVITE, callInvite);
    foreground_intent.putExtra(Constants.NOTIFICATION_ID, notificationId);
    foreground_intent.putExtra(Constants.UUID, uuid);
    PendingIntent piForegroundIntent = PendingIntent.getActivity(context.getApplicationContext(), 0, foreground_intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

    Intent rejectIntent = new Intent(context.getApplicationContext(), NotificationProxyActivity.class);
    rejectIntent.setAction(Constants.ACTION_REJECT);
    rejectIntent.putExtra(Constants.INCOMING_CALL_INVITE, callInvite);
    rejectIntent.putExtra(Constants.NOTIFICATION_ID, notificationId);
    rejectIntent.putExtra(Constants.UUID, uuid);
    PendingIntent piRejectIntent = PendingIntent.getActivity(context.getApplicationContext(), 0, rejectIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

    Intent acceptIntent = new Intent(context.getApplicationContext(), NotificationProxyActivity.class);
    acceptIntent.setAction(Constants.ACTION_ACCEPT);
    acceptIntent.putExtra(Constants.INCOMING_CALL_INVITE, callInvite);
    acceptIntent.putExtra(Constants.NOTIFICATION_ID, notificationId);
    acceptIntent.putExtra(Constants.UUID, uuid);
    PendingIntent piAcceptIntent = PendingIntent.getActivity(context.getApplicationContext(), 0, acceptIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

    Bitmap icon = BitmapFactory.decodeResource(context.getResources(), R.drawable.ic_call_end_white_24dp);
    String title = getDisplayName(callInvite);

    RemoteViews remoteViews = new RemoteViews(context.getPackageName(), R.layout.custom_notification_incoming);
    remoteViews.setTextViewText(R.id.notif_title, title);
    remoteViews.setTextViewText(R.id.notif_content, getContentBanner(context));

    remoteViews.setOnClickPendingIntent(R.id.notification_frame, piForegroundIntent);
    remoteViews.setOnClickPendingIntent(R.id.button_answer, piAcceptIntent);
    remoteViews.setOnClickPendingIntent(R.id.button_decline, piRejectIntent);

    Intent notification_intent = new Intent(context.getApplicationContext(), NotificationProxyActivity.class);
    PendingIntent pendingIntent = PendingIntent.getActivity(context.getApplicationContext(), 0, notification_intent, PendingIntent.FLAG_IMMUTABLE);

    remoteViews.setOnClickPendingIntent(R.id.notification, pendingIntent);

    NotificationCompat.Builder builder = (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
      ? new NotificationCompat.Builder(context, getChannel(context.getApplicationContext(), channelImportance))
      : new NotificationCompat.Builder(context);
      builder.setSmallIcon(smallIconResId)
        .setLargeIcon(icon)
        .setContentTitle(title)
        .setContentText(getContentBanner(context))
        .setCategory(Notification.CATEGORY_CALL)
        .setExtras(extras)
        .setAutoCancel(true)
        .setCustomContentView(remoteViews)
        .setCustomBigContentView(remoteViews)
        .setContentIntent(pendingIntent);
    if (fullScreenIntent) {
      builder.setFullScreenIntent(pendingIntent, true);
    }
    Notification notification = builder.build();
    notification.flags |= Notification.FLAG_INSISTENT;
    return notification;
  }

  public static Notification createCallAnsweredNotificationWithLowImportance(CallInvite callInvite, int notificationId, String uuid, Context context) {

    Bundle extras = new Bundle();
    extras.putString(Constants.CALL_SID_KEY, callInvite.getCallSid());

    Resources res = context.getResources();
    String packageName = context.getPackageName();
    int smallIconResId = 0;
    smallIconResId = res.getIdentifier("ic_notification", "drawable", packageName);

    RemoteViews remoteViews = new RemoteViews(context.getPackageName(), R.layout.custom_call_in_progress);
    remoteViews.setTextViewText(R.id.make_call_text, getContentBanner(context));
    String title = getDisplayName(callInvite);

    Log.i(TAG, "createCallAnsweredNotification " + uuid + " notificationId" + notificationId);

    Intent notification_intent = new Intent(context.getApplicationContext(), NotificationProxyActivity.class);
    notification_intent.setAction(Constants.ACTION_PUSH_APP_TO_FOREGROUND);
    notification_intent.putExtra(Constants.NOTIFICATION_ID, notificationId);
    notification_intent.putExtra(Constants.UUID, uuid);
    PendingIntent pendingIntent = PendingIntent.getActivity(context.getApplicationContext(), 0, notification_intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

    remoteViews.setOnClickPendingIntent(R.id.tap_to_app, pendingIntent);

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

      Intent endCallIntent = new Intent(context.getApplicationContext(), NotificationProxyActivity.class);
      endCallIntent.setAction(Constants.ACTION_CALL_DISCONNECT);
      endCallIntent.putExtra(Constants.NOTIFICATION_ID, notificationId);
      endCallIntent.putExtra(Constants.UUID, uuid);
      PendingIntent piEndCallIntent = PendingIntent.getActivity(context.getApplicationContext(), 0, endCallIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

      remoteViews.setOnClickPendingIntent(R.id.end_call, piEndCallIntent);

      Notification notification = new Notification.Builder(
        context.getApplicationContext(),
        getChannel(context.getApplicationContext(), Constants.VOICE_CHANNEL_LOW_IMPORTANCE))
        .setSmallIcon(smallIconResId)
        .setContentTitle(title)
        .setContentText(getContentBanner(context))
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
      Notification notification = new NotificationCompat.Builder(context)
        .setSmallIcon(smallIconResId)
        .setContentTitle(title)
        .setContentText(getContentBanner(context))
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

  public static Notification createOutgoingCallNotificationWithLowImportance(String callSid, int notificationId, String uuid, Context context, boolean playSound) {

    Bundle extras = new Bundle();
    extras.putString(Constants.CALL_SID_KEY, callSid);
    extras.putInt(Constants.NOTIFICATION_ID, notificationId);

    Log.i(TAG, "createOutgoingCallNotification " + uuid + " notificationId" + notificationId);

    Resources res = context.getResources();
    String packageName = context.getPackageName();
    int smallIconResId = 0;
    smallIconResId = res.getIdentifier("ic_notification", "drawable", packageName);

    RemoteViews remoteViews = new RemoteViews(context.getPackageName(), R.layout.custom_call_in_progress);
    remoteViews.setTextViewText(R.id.make_call_text, getContentBanner(context));

    Intent notification_intent = new Intent(context.getApplicationContext(), NotificationProxyActivity.class);
    notification_intent.setAction(Constants.ACTION_PUSH_APP_TO_FOREGROUND);
    notification_intent.putExtra(Constants.NOTIFICATION_ID, notificationId);
    notification_intent.putExtra(Constants.UUID, uuid);
    PendingIntent pendingIntent = PendingIntent.getActivity(context.getApplicationContext(), 0, notification_intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

    remoteViews.setOnClickPendingIntent(R.id.tap_to_app, pendingIntent);

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Intent endCallIntent = new Intent(context.getApplicationContext(), NotificationProxyActivity.class);
      endCallIntent.setAction(Constants.ACTION_CALL_DISCONNECT);
      endCallIntent.putExtra(Constants.NOTIFICATION_ID, notificationId);
      endCallIntent.putExtra(Constants.UUID, uuid);
      PendingIntent piEndCallIntent = PendingIntent.getActivity(context.getApplicationContext(), 0, endCallIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

      remoteViews.setOnClickPendingIntent(R.id.end_call, piEndCallIntent);

      Notification notification = new Notification.Builder(
        context.getApplicationContext(),
        getChannel(context.getApplicationContext(), Constants.VOICE_CHANNEL_LOW_IMPORTANCE))
        .setSmallIcon(smallIconResId)
        .setContentText(getContentBanner(context))
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
      Notification notification = new NotificationCompat.Builder(context)
        .setSmallIcon(smallIconResId)
        .setContentText(getContentBanner(context))
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

  public static Notification createWakeupAppNotification(String callSid, int notificationId, String uuid, int channelImportance, Context context) {

    Bundle extras = new Bundle();
    extras.putString(Constants.CALL_SID_KEY, callSid);
    extras.putInt(Constants.NOTIFICATION_ID, notificationId);

    Resources res = context.getResources();
    String packageName = context.getPackageName();
    int smallIconResId = 0;
    smallIconResId = res.getIdentifier("ic_notification", "drawable", packageName);

    Log.i(TAG, "createWakeupAppNotification " + uuid + " notificationId" + notificationId);

    RemoteViews remoteViews = new RemoteViews(context.getPackageName(), R.layout.custom_call_in_progress);
    remoteViews.setTextViewText(R.id.make_call_text, getContentBanner(context));

    Intent notification_intent = new Intent(context.getApplicationContext(), NotificationProxyActivity.class);
    notification_intent.setAction(Constants.ACTION_PUSH_APP_TO_FOREGROUND);
    notification_intent.putExtra(Constants.NOTIFICATION_ID, notificationId);
    notification_intent.putExtra(Constants.UUID, uuid);
    PendingIntent pendingIntent = PendingIntent.getActivity(context.getApplicationContext(), 0, notification_intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

    remoteViews.setOnClickPendingIntent(R.id.tap_to_app, pendingIntent);

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Intent endCallIntent = new Intent(context.getApplicationContext(), NotificationProxyActivity.class);
      endCallIntent.setAction(Constants.ACTION_CALL_DISCONNECT);
      endCallIntent.putExtra(Constants.NOTIFICATION_ID, notificationId);
      endCallIntent.putExtra(Constants.UUID, uuid);
      PendingIntent piEndCallIntent = PendingIntent.getService(context.getApplicationContext(), 0, endCallIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

      remoteViews.setOnClickPendingIntent(R.id.end_call, piEndCallIntent);

      Notification notification = new Notification.Builder(
        context.getApplicationContext(),
        getChannel(context.getApplicationContext(), Constants.VOICE_CHANNEL_LOW_IMPORTANCE))
        .setSmallIcon(smallIconResId)
        .setContentText(getContentBanner(context))
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
      Notification notification = new NotificationCompat.Builder(context)
        .setSmallIcon(smallIconResId)
        .setContentText(getContentBanner(context))
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
  public static void createNotificationChannels(Context context) {
    NotificationManager notificationManager =
      (NotificationManager)context.getSystemService(Context.NOTIFICATION_SERVICE);
    notificationManager.createNotificationChannelGroup(
      new NotificationChannelGroup(Constants.VOICE_CHANNEL_GROUP, "Twilio Voice"));
    for (String channelId:
      new String[]{
        VOICE_CHANNEL_HIGH_IMPORTANCE,
        VOICE_CHANNEL_DEFAULT_IMPORTANCE,
        VOICE_CHANNEL_LOW_IMPORTANCE}) {
      notificationManager.createNotificationChannel(
        createNotificationChannel(context, channelId));
    }
  }

  @TargetApi(Build.VERSION_CODES.O)
  public static void destroyNotificationChannels(Context context) {
    NotificationManager notificationManager =
      (NotificationManager)context.getSystemService(Context.NOTIFICATION_SERVICE);
    notificationManager.deleteNotificationChannelGroup(Constants.VOICE_CHANNEL_GROUP);
  }

  @TargetApi(Build.VERSION_CODES.O)
  private static NotificationChannel createNotificationChannel(Context context,
                                                               final String voiceChannelId) {
    final int notificaitonImportance = getChannelImportance(voiceChannelId);
    NotificationChannel voiceChannel = new NotificationChannel(
      voiceChannelId,
      "Primary Voice Channel",
      notificaitonImportance);
    voiceChannel.setImportance(notificaitonImportance);
    voiceChannel.setLightColor(Color.GREEN);
    voiceChannel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
    voiceChannel.setGroup(Constants.VOICE_CHANNEL_GROUP);
    // low-importance notifications don't have sound
    if (!Constants.VOICE_CHANNEL_LOW_IMPORTANCE.equals(voiceChannelId)) {
      // set audio attributes for channel
      Uri soundUri = Storage.provideResourceSilent_wav(context);
      AudioAttributes audioAttributes = new AudioAttributes.Builder()
        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
        .setUsage(AudioAttributes.USAGE_NOTIFICATION)
        .build();
      voiceChannel.setSound(soundUri, audioAttributes);
    }
    return voiceChannel;
  }

  @TargetApi(Build.VERSION_CODES.O)
  private static int getChannelImportance(final String voiceChannel) {
    final Map<String, Integer> importanceMapping = Map.of(
      Constants.VOICE_CHANNEL_HIGH_IMPORTANCE, NotificationManager.IMPORTANCE_HIGH,
      Constants.VOICE_CHANNEL_DEFAULT_IMPORTANCE, NotificationManager.IMPORTANCE_DEFAULT,
      Constants.VOICE_CHANNEL_LOW_IMPORTANCE, NotificationManager.IMPORTANCE_LOW);
    return importanceMapping.getOrDefault(voiceChannel, NotificationManager.IMPORTANCE_DEFAULT);
  }
  @TargetApi(Build.VERSION_CODES.O)
  private static String getChannel(Context context, final String voiceChannelId) {
    // construct channel if it has not been created
    NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
    if (null == notificationManager.getNotificationChannel(voiceChannelId)) {
      createNotificationChannels(context);
    }
    return voiceChannelId;
  }

  private static String getDisplayName(CallInvite callInvite) {
    String title = callInvite.getFrom();
    Map<String, String> customParameters = callInvite.getCustomParameters();
    // If "displayName" is passed as a custom parameter in the TwiML application,
    // it will be used as the caller name.
    if (customParameters.get(Constants.DISPLAY_NAME) != null) {
      title = URLDecoder.decode(customParameters.get(Constants.DISPLAY_NAME).replaceAll("\\+", "%20"));
    }
    return title;
  }

  private static String getContentBanner(Context context) {
    return context.getString(R.string.app_name) + Constants.NOTIFICATION_BANNER;
  }

}
