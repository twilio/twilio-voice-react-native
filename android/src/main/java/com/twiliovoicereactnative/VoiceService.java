package com.twiliovoicereactnative;


import static com.twiliovoicereactnative.CommonConstants.CallInviteEventKeyCallSid;
import static com.twiliovoicereactnative.CommonConstants.CallInviteEventKeyType;
import static com.twiliovoicereactnative.CommonConstants.CallInviteEventTypeValueAccepted;
import static com.twiliovoicereactnative.CommonConstants.CallInviteEventTypeValueCancelled;
import static com.twiliovoicereactnative.CommonConstants.CallInviteEventTypeValueNotificationTapped;
import static com.twiliovoicereactnative.CommonConstants.CallInviteEventTypeValueRejected;
import static com.twiliovoicereactnative.CommonConstants.ScopeCallInvite;
import static com.twiliovoicereactnative.CommonConstants.ScopeVoice;
import static com.twiliovoicereactnative.CommonConstants.VoiceErrorKeyError;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventError;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventType;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventTypeValueIncomingCallInvite;
import static com.twiliovoicereactnative.Constants.ACTION_ACCEPT_CALL;
import static com.twiliovoicereactnative.Constants.ACTION_CALL_DISCONNECT;
import static com.twiliovoicereactnative.Constants.ACTION_CANCEL_CALL;
import static com.twiliovoicereactnative.Constants.ACTION_CANCEL_ACTIVE_CALL_NOTIFICATION;
import static com.twiliovoicereactnative.Constants.ACTION_FOREGROUND_AND_DEPRIORITIZE_INCOMING_CALL_NOTIFICATION;
import static com.twiliovoicereactnative.Constants.ACTION_INCOMING_CALL;
import static com.twiliovoicereactnative.Constants.ACTION_PUSH_APP_TO_FOREGROUND;
import static com.twiliovoicereactnative.Constants.ACTION_RAISE_OUTGOING_CALL_NOTIFICATION;
import static com.twiliovoicereactnative.Constants.ACTION_REJECT_CALL;
import static com.twiliovoicereactnative.Constants.JS_EVENT_KEY_CALL_INVITE_INFO;
import static com.twiliovoicereactnative.Constants.JS_EVENT_KEY_CANCELLED_CALL_INVITE_INFO;
import static com.twiliovoicereactnative.Constants.VOICE_CHANNEL_DEFAULT_IMPORTANCE;
import static com.twiliovoicereactnative.Constants.VOICE_CHANNEL_HIGH_IMPORTANCE;
import static com.twiliovoicereactnative.JSEventEmitter.constructJSMap;
import static com.twiliovoicereactnative.ReactNativeArgumentsSerializer.serializeCall;
import static com.twiliovoicereactnative.ReactNativeArgumentsSerializer.serializeCallException;
import static com.twiliovoicereactnative.ReactNativeArgumentsSerializer.serializeCallInvite;
import static com.twiliovoicereactnative.ReactNativeArgumentsSerializer.serializeCancelledCallInvite;
import static com.twiliovoicereactnative.ReactNativeArgumentsSerializer.serializeError;
import static com.twiliovoicereactnative.VoiceApplicationProxy.getCallRecordDatabase;
import static com.twiliovoicereactnative.VoiceApplicationProxy.getJSEventEmitter;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ServiceInfo;
import android.os.Binder;
import android.os.Build;
import android.os.IBinder;
import android.util.Pair;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.app.ServiceCompat;

import com.facebook.react.bridge.WritableMap;
import com.twilio.voice.AcceptOptions;
import com.twilio.voice.Call;
import com.twilio.voice.ConnectOptions;
import com.twilio.voice.Voice;

import java.util.Objects;
import java.util.UUID;

public class VoiceService extends Service {
  private static final SDKLog logger = new SDKLog(VoiceService.class);
  public class VoiceServiceAPI extends Binder {
    public Call connect(@NonNull ConnectOptions cxnOptions,
                        @NonNull Call.Listener listener) {
      logger.debug("connect");
      return Voice.connect(VoiceService.this, cxnOptions, listener);
    }
    public void disconnect(final CallRecordDatabase.CallRecord callRecord) {
      VoiceService.this.disconnect(callRecord);
    }
    public void incomingCall(final CallRecordDatabase.CallRecord callRecord) {
      VoiceService.this.incomingCall(callRecord);
    }
    public void acceptCall(final CallRecordDatabase.CallRecord callRecord) {
      VoiceService.this.acceptCall(callRecord);
    }
    public void rejectCall(final CallRecordDatabase.CallRecord callRecord) {
      VoiceService.this.rejectCall(callRecord);
    }
    public void cancelCall(final CallRecordDatabase.CallRecord callRecord) {
      VoiceService.this.cancelCall(callRecord);
    }
    public void raiseOutgoingCallNotification(final CallRecordDatabase.CallRecord callRecord) {
      VoiceService.this.raiseOutgoingCallNotification(callRecord);
    }
    public void cancelActiveCallNotification(final CallRecordDatabase.CallRecord callRecord) {
      VoiceService.this.cancelActiveCallNotification(callRecord);
    }
    public void foregroundAndDeprioritizeIncomingCallNotification(final CallRecordDatabase.CallRecord callRecord) {
      VoiceService.this.foregroundAndDeprioritizeIncomingCallNotification(callRecord);
    }
    public Context getServiceContext() {
      return VoiceService.this;
    }
  }

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    // apparently the system can recreate the service without sending it an intent so protect
    // against that case (GH-430).
    if (null != intent) {
      switch (Objects.requireNonNull(intent.getAction())) {
        case ACTION_INCOMING_CALL:
          incomingCall(getCallRecord(Objects.requireNonNull(getMessageUUID(intent))));
          break;
        case ACTION_ACCEPT_CALL:
          try {
            acceptCall(getCallRecord(Objects.requireNonNull(getMessageUUID(intent))));
          } catch (SecurityException e) {
            sendPermissionsError();
            logger.warning(e, "Cannot accept call, lacking necessary permissions");
          }
          break;
        case ACTION_REJECT_CALL:
          rejectCall(getCallRecord(Objects.requireNonNull(getMessageUUID(intent))));
          break;
        case ACTION_CANCEL_CALL:
          cancelCall(getCallRecord(Objects.requireNonNull(getMessageUUID(intent))));
          break;
        case ACTION_CALL_DISCONNECT:
          disconnect(getCallRecord(Objects.requireNonNull(getMessageUUID(intent))));
          break;
        case ACTION_RAISE_OUTGOING_CALL_NOTIFICATION:
          raiseOutgoingCallNotification(getCallRecord(Objects.requireNonNull(getMessageUUID(intent))));
          break;
        case ACTION_CANCEL_ACTIVE_CALL_NOTIFICATION:
          cancelActiveCallNotification(getCallRecord(Objects.requireNonNull(getMessageUUID(intent))));
          break;
        case ACTION_FOREGROUND_AND_DEPRIORITIZE_INCOMING_CALL_NOTIFICATION:
          foregroundAndDeprioritizeIncomingCallNotification(
            getCallRecord(Objects.requireNonNull(getMessageUUID(intent))));
          break;
        case ACTION_PUSH_APP_TO_FOREGROUND:
          logger.warning("VoiceService received foreground request, ignoring");
          break;
        default:
          logger.log("Unknown notification, ignoring");
          break;
      }
    }
    return START_NOT_STICKY;
  }

  @Override
  public IBinder onBind(Intent intent) {
    return new VoiceServiceAPI();
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
  private void disconnect(final CallRecordDatabase.CallRecord callRecord) {
    logger.debug("disconnect");
    if (null != callRecord) {
      Objects.requireNonNull(callRecord.getVoiceCall()).disconnect();
    } else {
      logger.warning("No call record found");
    }
  }
  private void incomingCall(final CallRecordDatabase.CallRecord callRecord) {
    logger.debug("incomingCall: " + callRecord.getUuid());

    // verify that mic permissions have been granted and if not, throw a error
    if ((Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) &&
      ActivityCompat.checkSelfPermission(VoiceService.this,
        Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {

      // report to js layer lack of permissions issue
      sendPermissionsError();

      // report an error to logger
      logger.warning("WARNING: Incoming call cannot be handled, microphone permission not granted");
      return;
    }

    // put up notification
    callRecord.setNotificationId(NotificationUtility.createNotificationIdentifier());
    Notification notification = NotificationUtility.createIncomingCallNotification(
      VoiceService.this,
      callRecord,
      VOICE_CHANNEL_HIGH_IMPORTANCE);
    createOrReplaceNotification(callRecord.getNotificationId(), notification);



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
  private void acceptCall(final CallRecordDatabase.CallRecord callRecord) {
    logger.debug("acceptCall: " + callRecord.getUuid());

    // verify that mic permissions have been granted and if not, throw a error
    if (ActivityCompat.checkSelfPermission(VoiceService.this,
      Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
      // cancel incoming call notification
      removeNotification(callRecord.getNotificationId());

      // stop ringer sound
      VoiceApplicationProxy.getMediaPlayerManager().stop();
      VoiceApplicationProxy.getAudioSwitchManager().getAudioSwitch().deactivate();

      // report an error to JS layer
      sendPermissionsError();

      // report an error to logger
      logger.warning("WARNING: Call not accepted, microphone permission not granted");
      return;
    }

    // cancel existing notification & put up in call
    Notification notification = NotificationUtility.createCallAnsweredNotificationWithLowImportance(
      VoiceService.this,
      callRecord);
    createOrReplaceForegroundNotification(callRecord.getNotificationId(), notification);

    // stop ringer sound
    VoiceApplicationProxy.getMediaPlayerManager().stop();

    // accept call
    AcceptOptions acceptOptions = new AcceptOptions.Builder()
      .enableDscp(true)
      .callMessageListener(new CallMessageListenerProxy())
      .build();

    callRecord.setCall(
      callRecord.getCallInvite().accept(
        VoiceService.this,
        acceptOptions,
        new CallListenerProxy(callRecord.getUuid(), VoiceService.this)));
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
  private void rejectCall(final CallRecordDatabase.CallRecord callRecord) {
    logger.debug("rejectCall: " + callRecord.getUuid());

    // remove call record
    getCallRecordDatabase().remove(callRecord);

    // take down notification
    removeNotification(callRecord.getNotificationId());

    // stop ringer sound
    VoiceApplicationProxy.getMediaPlayerManager().stop();
    VoiceApplicationProxy.getAudioSwitchManager().getAudioSwitch().deactivate();

    // reject call
    callRecord.getCallInvite().reject(VoiceService.this);
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
  private void cancelCall(final CallRecordDatabase.CallRecord callRecord) {
    logger.debug("CancelCall: " + callRecord.getUuid());

    // take down notification
    removeNotification(callRecord.getNotificationId());

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
  private void raiseOutgoingCallNotification(final CallRecordDatabase.CallRecord callRecord) {
    logger.debug("raiseOutgoingCallNotification: " + callRecord.getUuid());

    // put up outgoing call notification
    Notification notification =
      NotificationUtility.createOutgoingCallNotificationWithLowImportance(
        VoiceService.this,
        callRecord);
    createOrReplaceForegroundNotification(callRecord.getNotificationId(), notification);
  }
  private void foregroundAndDeprioritizeIncomingCallNotification(final CallRecordDatabase.CallRecord callRecord) {
    logger.debug("foregroundAndDeprioritizeIncomingCallNotification: " + callRecord.getUuid());

    // cancel existing notification & put up in call
    Notification notification = NotificationUtility.createIncomingCallNotification(
      VoiceService.this,
      callRecord,
      VOICE_CHANNEL_DEFAULT_IMPORTANCE);
    createOrReplaceNotification(callRecord.getNotificationId(), notification);

    // stop active sound (if any)
    VoiceApplicationProxy.getMediaPlayerManager().stop();

    // notify JS layer
    sendJSEvent(
      ScopeCallInvite,
      constructJSMap(
        new Pair<>(CallInviteEventKeyType, CallInviteEventTypeValueNotificationTapped),
        new Pair<>(CallInviteEventKeyCallSid, callRecord.getCallSid())));
  }
  private void cancelActiveCallNotification(final CallRecordDatabase.CallRecord callRecord) {
    logger.debug("cancelNotification");
    // only take down notification & stop any active sounds if one is active
    if (null != callRecord) {
      VoiceApplicationProxy.getMediaPlayerManager().stop();
      removeForegroundNotification();
    }
  }
  private void createOrReplaceNotification(final int notificationId,
                                           final Notification notification) {
    NotificationManager mNotificationManager =
      (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
    mNotificationManager.notify(notificationId, notification);
  }
  private void createOrReplaceForegroundNotification(final int notificationId,
                                                     final Notification notification) {
    if (ActivityCompat.checkSelfPermission(VoiceService.this, Manifest.permission.POST_NOTIFICATIONS)
      == PackageManager.PERMISSION_GRANTED) {
      foregroundNotification(notificationId, notification);
    } else {
      logger.warning("WARNING: Notification not posted, permission not granted");
    }
  }
  private void removeNotification(final int notificationId) {
    logger.debug("removeNotification");
    NotificationManager mNotificationManager =
      (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
    mNotificationManager.cancel(notificationId);
  }
  private void removeForegroundNotification() {
    logger.debug("removeForegroundNotification");
    ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE);
  }
  private void foregroundNotification(int id, Notification notification) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      try {
        startForeground(id, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE);
      } catch (Exception e) {
        sendPermissionsError();
        logger.warning(e, "Failed to place notification due to lack of permissions");
      }
    } else {
      startForeground(id, notification);
    }
  }
  private static UUID getMessageUUID(@NonNull final Intent intent) {
    return (UUID)intent.getSerializableExtra(Constants.MSG_KEY_UUID);
  }
  private static CallRecordDatabase.CallRecord getCallRecord(final UUID uuid) {
    return Objects.requireNonNull(getCallRecordDatabase().get(new CallRecordDatabase.CallRecord(uuid)));
  }
  private static void sendJSEvent(@NonNull String scope, @NonNull WritableMap event) {
    getJSEventEmitter().sendEvent(scope, event);
  }
  private static void sendPermissionsError() {
    final String errorMessage = "Missing permissions.";
    final int errorCode = 31401;
    getJSEventEmitter().sendEvent(ScopeVoice, constructJSMap(
      new Pair<>(VoiceEventType, VoiceEventError),
      new Pair<>(VoiceErrorKeyError, serializeError(errorCode, errorMessage))
    ));
  }
}
