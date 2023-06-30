package com.twiliovoicereactnative;

import android.annotation.TargetApi;
import android.app.Notification;
import android.app.NotificationChannel;
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


import java.net.URLDecoder;
import java.util.Map;

public class NotificationUtility {
  private static final String TAG = IncomingCallNotificationService.class.getSimpleName();

  private static String customContentBanner = null;

  /**
   * setContentBanner(..) sets the content banner string or null to use default
   */
  public static void setContentBanner(final String contentBanner) {
    customContentBanner = contentBanner;
  }

  public interface NotificationRemoteViewsProvider {
    RemoteViews provideRemoteViews(final String packageName,
                                   final String displayName,
                                   final String contentBanner,
                                   final PendingIntent acceptNotification,
                                   final PendingIntent rejectNotification,
                                   final PendingIntent wakeNotification);
  }

  public static final NotificationRemoteViewsProvider defaultRemoteViewsProvider =
    (packageName, displayName, contentBanner, acceptNotification, rejectNotification, wakeNotification) -> {
      RemoteViews remoteViews = new RemoteViews(packageName, R.layout.custom_notification_incoming);
      remoteViews.setTextViewText(R.id.notif_title, displayName);
      remoteViews.setTextViewText(R.id.notif_content, contentBanner);
      remoteViews.setOnClickPendingIntent(R.id.button_answer, acceptNotification);
      remoteViews.setOnClickPendingIntent(R.id.button_decline, rejectNotification);
      remoteViews.setOnClickPendingIntent(R.id.notification, wakeNotification);
      return remoteViews;
    };

  private static NotificationRemoteViewsProvider remoteViewsProvider = defaultRemoteViewsProvider;

  /**
   * setRemoteViewsProvider(...) - Developers wanting to override the default notification design
   * should call this method with their own implementation of NotificationRemoteViewsProvider.
   */
  public static void setRemoteViewsProvider(NotificationRemoteViewsProvider provider) {
    remoteViewsProvider = provider;
  }

  public static Notification createIncomingCallNotification(CallInvite callInvite, int notificationId, String uuid, int channelImportance, Context context) {

    Bundle extras = new Bundle();
    extras.putString(Constants.CALL_SID_KEY, callInvite.getCallSid());

    Resources res = context.getResources();
    String packageName = context.getPackageName();
    int smallIconResId = res.getIdentifier("ic_notification", "drawable", packageName);

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

    Intent notification_intent = new Intent(context.getApplicationContext(), NotificationProxyActivity.class);
    PendingIntent pendingIntent = PendingIntent.getActivity(context.getApplicationContext(), 0, notification_intent, PendingIntent.FLAG_IMMUTABLE);

    Bitmap icon = BitmapFactory.decodeResource(context.getResources(), R.drawable.ic_call_end_white_24dp);
    String title = getDisplayName(callInvite);

    RemoteViews remoteViews = remoteViewsProvider.provideRemoteViews(
      context.getPackageName(), title, getContentBanner(context), piAcceptIntent, piRejectIntent, pendingIntent);

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Notification notification = new Notification.Builder(context.getApplicationContext(), createChannel(context.getApplicationContext(), channelImportance))
        .setSmallIcon(smallIconResId)
        .setLargeIcon(icon)
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
        .setLargeIcon(icon)
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

      Notification notification = new Notification.Builder(context.getApplicationContext(), createChannelWithLowImportance(context.getApplicationContext()))
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

      Notification notification = new Notification.Builder(context.getApplicationContext(), createChannelWithLowImportance(context.getApplicationContext()))
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

      Notification notification = new Notification.Builder(context.getApplicationContext(), createChannelWithLowImportance(context.getApplicationContext()))
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
  private static String createChannel(Context context, int channelImportance) {
      // play inbound call ringer on the speaker
    AudioManager audioManager = (AudioManager) context.getSystemService(AUDIO_SERVICE);
    audioManager.setSpeakerphoneOn(true);

    NotificationChannel callInviteChannel = new NotificationChannel(Constants.VOICE_CHANNEL_HIGH_IMPORTANCE,
      "Primary Voice Channel", NotificationManager.IMPORTANCE_HIGH);
    String channelId = Constants.VOICE_CHANNEL_HIGH_IMPORTANCE;

    Uri soundUri = Uri.parse(
      "android.resource://" +
        context.getPackageName() +
        "/" +
        R.raw.incoming);

    AudioAttributes audioAttributes = new AudioAttributes.Builder()
      .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
      .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
      .build();
    callInviteChannel.setImportance(channelImportance);
    callInviteChannel.setLightColor(Color.GREEN);
    callInviteChannel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
    callInviteChannel.setSound(soundUri, audioAttributes);
    NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
    notificationManager.createNotificationChannel(callInviteChannel);

    return channelId;
  }

  @TargetApi(Build.VERSION_CODES.O)
  private static String createChannelWithLowImportance(Context context) {
    NotificationChannel voiceChannel = new NotificationChannel(Constants.VOICE_CHANNEL_LOW_IMPORTANCE,
      "Primary Voice Channel", NotificationManager.IMPORTANCE_LOW);
    String channelId = Constants.VOICE_CHANNEL_LOW_IMPORTANCE;
    voiceChannel.setImportance(NotificationManager.IMPORTANCE_LOW);
    voiceChannel.setLightColor(Color.GREEN);
    voiceChannel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
    NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
    notificationManager.createNotificationChannel(voiceChannel);

    return channelId;
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
    return (null != customContentBanner)
      ? customContentBanner
      : context.getString(R.string.app_name) + Constants.NOTIFICATION_BANNER;
  }

}
