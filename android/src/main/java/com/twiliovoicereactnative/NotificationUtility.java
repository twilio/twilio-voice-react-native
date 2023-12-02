package com.twiliovoicereactnative;

import java.net.URLDecoder;
import java.security.SecureRandom;
import java.util.Map;
import java.util.Objects;

import android.annotation.SuppressLint;
import android.app.Notification;
import android.app.PendingIntent;
import android.content.ContentResolver;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Bundle;
import android.widget.RemoteViews;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationChannelCompat;
import androidx.core.app.NotificationChannelGroupCompat;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import com.twilio.voice.CallInvite;

import static com.twiliovoicereactnative.Constants.VOICE_CHANNEL_DEFAULT_IMPORTANCE;
import static com.twiliovoicereactnative.Constants.VOICE_CHANNEL_HIGH_IMPORTANCE;
import static com.twiliovoicereactnative.Constants.VOICE_CHANNEL_LOW_IMPORTANCE;



class NotificationUtility {
  private static final SecureRandom secureRandom = new SecureRandom();

  public static int createNotificationIdentifier() {
    return (secureRandom.nextInt() & 0x7FFFFFFF) + 1; // prevent 0 as an id
  }

  public static Notification createIncomingCallNotification(CallInvite callInvite,
                                                            int notificationId,
                                                            String uuid,
                                                            final String channelImportance,
                                                            boolean fullScreenIntent,
                                                            Context context) {
    final int smallIconResId = getSmallIconResource(context);
    final String title = getDisplayName(callInvite);
    final Bitmap icon = constructBitmap(context, R.drawable.ic_call_end_white_24dp);

    Intent foregroundIntent = constructAction(
      Constants.ACTION_FOREGROUND_AND_DEPRIORITIZE_INCOMING_CALL_NOTIFICATION,
      Objects.requireNonNull(VoiceApplicationProxy.getMainActivityClass()),
      context,
      uuid,
      callInvite,
      notificationId);
    PendingIntent piForegroundIntent = constructPendingIntentForActivity(context, foregroundIntent);

    Intent rejectIntent = constructAction(
      Constants.ACTION_REJECT_CALL,
      VoiceNotificationReceiver.class,
      context,
      uuid,
      callInvite,
      notificationId);
    PendingIntent piRejectIntent = constructPendingIntentForReceiver(context, rejectIntent);

    Intent acceptIntent = constructAction(
      Constants.ACTION_ACCEPT_CALL,
      Objects.requireNonNull(VoiceApplicationProxy.getMainActivityClass()),
      context,
      uuid,
      callInvite,
      notificationId);
    PendingIntent piAcceptIntent = constructPendingIntentForActivity(context, acceptIntent);

    RemoteViews remoteViews = new RemoteViews(context.getPackageName(), R.layout.custom_notification_incoming);
    remoteViews.setTextViewText(R.id.notif_title, title);
    remoteViews.setTextViewText(R.id.notif_content, getContentBanner(context));
    remoteViews.setOnClickPendingIntent(R.id.button_answer, piAcceptIntent);
    remoteViews.setOnClickPendingIntent(R.id.button_decline, piRejectIntent);

    NotificationCompat.Builder builder = constructNotificationBuilder(context, channelImportance);
      builder.setSmallIcon(smallIconResId)
        .setLargeIcon(icon)
        .setContentTitle(title)
        .setContentText(getContentBanner(context))
        .setCategory(Notification.CATEGORY_CALL)
        .setAutoCancel(true)
        .setCustomContentView(remoteViews)
        .setCustomBigContentView(remoteViews)
        .setContentIntent(piForegroundIntent);
    if (fullScreenIntent) {
      builder.setFullScreenIntent(piForegroundIntent, true);
    }
    return builder.build();
  }

  public static Notification createCallAnsweredNotificationWithLowImportance(CallInvite callInvite,
                                                                             int notificationId,
                                                                             String uuid,
                                                                             Context context) {
    final int smallIconResId = getSmallIconResource(context);
    final String title = getDisplayName(callInvite);

    Intent foregroundIntent = constructAction(
      Constants.ACTION_PUSH_APP_TO_FOREGROUND,
      Objects.requireNonNull(VoiceApplicationProxy.getMainActivityClass()),
      context,
      uuid,
      callInvite,
      notificationId);
    PendingIntent pendingIntent = constructPendingIntentForActivity(context, foregroundIntent);

    Intent endCallIntent = constructAction(
      Constants.ACTION_CALL_DISCONNECT,
      VoiceNotificationReceiver.class,
      context,
      uuid,
      callInvite,
      notificationId);
    PendingIntent piEndCallIntent = constructPendingIntentForReceiver(context, endCallIntent);

    RemoteViews remoteViews = new RemoteViews(context.getPackageName(), R.layout.custom_call_in_progress);
    remoteViews.setTextViewText(R.id.make_call_text, getContentBanner(context));
    remoteViews.setOnClickPendingIntent(R.id.end_call, piEndCallIntent);

    return constructNotificationBuilder(context, Constants.VOICE_CHANNEL_LOW_IMPORTANCE)
      .setSmallIcon(smallIconResId)
      .setContentTitle(title)
      .setContentText(getContentBanner(context))
      .setCategory(Notification.CATEGORY_CALL)
      .setAutoCancel(false)
      .setCustomContentView(remoteViews)
      .setCustomBigContentView(remoteViews)
      .setContentIntent(pendingIntent)
      .setFullScreenIntent(pendingIntent, true)
      .build();
  }

  public static Notification createOutgoingCallNotificationWithLowImportance(String callSid,
                                                                             int notificationId,
                                                                             String uuid,
                                                                             Context context) {
    final int smallIconResId = getSmallIconResource(context);

    Intent foregroundIntent = constructAction(
      Constants.ACTION_PUSH_APP_TO_FOREGROUND,
      Objects.requireNonNull(VoiceApplicationProxy.getMainActivityClass()),
      context,
      uuid,
      notificationId);
    PendingIntent piForegroundIntent = constructPendingIntentForActivity(context, foregroundIntent);

    Intent endCallIntent = constructAction(
      Constants.ACTION_CALL_DISCONNECT,
      VoiceNotificationReceiver.class,
      context,
      uuid,
      notificationId);
    PendingIntent piEndCallIntent = constructPendingIntentForReceiver(context, endCallIntent);

    RemoteViews remoteViews = new RemoteViews(context.getPackageName(), R.layout.custom_call_in_progress);
    remoteViews.setTextViewText(R.id.make_call_text, getContentBanner(context));
    remoteViews.setOnClickPendingIntent(R.id.end_call, piEndCallIntent);

    return constructNotificationBuilder(context, Constants.VOICE_CHANNEL_LOW_IMPORTANCE)
      .setSmallIcon(smallIconResId)
      .setContentText(getContentBanner(context))
      .setCategory(Notification.CATEGORY_CALL)
      .setAutoCancel(false)
      .setCustomContentView(remoteViews)
      .setCustomBigContentView(remoteViews)
      .setContentIntent(piForegroundIntent)
      .setFullScreenIntent(piForegroundIntent, true)
      .build();
  }

  public static void createNotificationChannels(Context context) {
    NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);
    notificationManager.createNotificationChannelGroup(
      new NotificationChannelGroupCompat.Builder(Constants.VOICE_CHANNEL_GROUP)
        .setName("Twilio Voice").build());

    for (String channelId:
      new String[]{
        VOICE_CHANNEL_HIGH_IMPORTANCE,
        VOICE_CHANNEL_DEFAULT_IMPORTANCE,
        VOICE_CHANNEL_LOW_IMPORTANCE}) {
      notificationManager.createNotificationChannel(
        createNotificationChannel(context, channelId));
    }
  }

  public static void destroyNotificationChannels(Context context) {
    NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);
    notificationManager.deleteNotificationChannelGroup(Constants.VOICE_CHANNEL_GROUP);
  }

  private static NotificationChannelCompat createNotificationChannel(Context context,
                                                               final String voiceChannelId) {
    final int notificationImportance = getChannelImportance(voiceChannelId);
    NotificationChannelCompat.Builder voiceChannelBuilder =
      new NotificationChannelCompat.Builder(voiceChannelId, notificationImportance)
        .setName("Primary Voice Channel")
        .setLightColor(Color.GREEN)
        .setGroup(Constants.VOICE_CHANNEL_GROUP);
    // low-importance notifications don't have sound
    if (!Constants.VOICE_CHANNEL_LOW_IMPORTANCE.equals(voiceChannelId)) {
      // set audio attributes for channel
      Uri soundUri = provideResourceSilent_wav(context);
      AudioAttributes audioAttributes = new AudioAttributes.Builder()
        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
        .setUsage(AudioAttributes.USAGE_NOTIFICATION)
        .build();
      voiceChannelBuilder.setSound(soundUri, audioAttributes);
    }
    return voiceChannelBuilder.build();
  }

  private static int getChannelImportance(final String voiceChannel) {
    final Map<String, Integer> importanceMapping = Map.of(
      Constants.VOICE_CHANNEL_HIGH_IMPORTANCE, NotificationManagerCompat.IMPORTANCE_HIGH,
      Constants.VOICE_CHANNEL_DEFAULT_IMPORTANCE, NotificationManagerCompat.IMPORTANCE_DEFAULT,
      Constants.VOICE_CHANNEL_LOW_IMPORTANCE, NotificationManagerCompat.IMPORTANCE_LOW);
    return Objects.requireNonNull(importanceMapping.get(voiceChannel));
  }

  private static String getChannel(Context context, final String voiceChannelId) {
    // construct channel if it has not been created
    NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);

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

  private static Intent constructAction(@NonNull final String action,
                                        @NonNull final Class<?> target,
                                        @NonNull Context context,
                                        @NonNull final String uuid,
                                        @NonNull final CallInvite callInvite,
                                        final int notificationId) {
    Intent rejectIntent = new Intent(context.getApplicationContext(), target);
    rejectIntent.setAction(action);
    rejectIntent.putExtra(Constants.UUID, uuid);
    return rejectIntent;
  }

  private static Intent constructAction(@NonNull final String action,
                                        @NonNull final Class<?> target,
                                        @NonNull Context context,
                                        @NonNull final String uuid,
                                        final int notificationId) {
    Intent rejectIntent = new Intent(context.getApplicationContext(), target);
    rejectIntent.setAction(action);
    rejectIntent.putExtra(Constants.UUID, uuid);
    return rejectIntent;
  }

  private static PendingIntent constructPendingIntentForActivity(@NonNull Context context,
                                                                 @NonNull final Intent intent) {
    return PendingIntent.getActivity(
      context.getApplicationContext(),
      0,
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
  }

  private static PendingIntent constructPendingIntentForReceiver(@NonNull Context context,
                                                                 @NonNull final Intent intent) {
    return PendingIntent.getBroadcast(
      context.getApplicationContext(),
      0,
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
  }

  private static NotificationCompat.Builder constructNotificationBuilder(
    @NonNull Context context,
    @NonNull final String channelImportance) {
    return new NotificationCompat.Builder(context,
        getChannel(context.getApplicationContext(),
          channelImportance));
  }

  @SuppressLint("DiscouragedApi")
  private static int getSmallIconResource(@NonNull Context context) {
    return context.getResources().getIdentifier(
      "ic_notification",
      "drawable",
      context.getPackageName());
  }

  private static Bitmap constructBitmap(@NonNull Context context, final int resId) {
    return BitmapFactory.decodeResource(context.getResources(), resId);
  }

  static Uri provideResourceSilent_wav(@NonNull Context context) {
    return provideResource(context, R.raw.silent);
  }

  private static Uri provideResource(@NonNull Context context, int id) {
    return (new Uri.Builder()
      .scheme(ContentResolver.SCHEME_ANDROID_RESOURCE)
      .authority(context.getResources().getResourcePackageName(id))
      .appendPath(String.valueOf(id))
    ).build();
  }
}
