package com.twiliovoicereactnative;

import static com.moego.logger.helper.MGOTwilioVoiceHelperKt.TwilioVoiceLoggerTag;
import static com.moego.logger.helper.MGOTwilioVoiceHelperKt.mgoCallErrorLog;
import static com.moego.logger.helper.MGOTwilioVoiceHelperKt.mgoCallInfoLog;
import static com.moego.logger.helper.MGOTwilioVoiceHelperKt.twilioVoiceLogInvoke;
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
import com.moego.logger.MGOLogEvent;
import com.moego.logger.MGOLogger;
import com.moego.logger.helper.MGOTwilioVoiceHelper;
import com.twilio.voice.AcceptOptions;
import com.twilio.voice.Call;
import com.twilio.voice.ConnectOptions;
import com.twilio.voice.Voice;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

public class VoiceService extends Service {
  private static final SDKLog logger = new SDKLog(VoiceService.class);

  public class VoiceServiceAPI extends Binder {
    public Call connect(@NonNull ConnectOptions cxnOptions,
                        @NonNull Call.Listener listener) {
      logger.debug("connect");
      twilioVoiceLogInvoke("VoiceService connect");
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
    if (intent != null) {
      twilioVoiceLogInvoke("VoiceService onStartCommand with intent: " + intent.getAction());
    } else {
      twilioVoiceLogInvoke("VoiceService onStartCommand with null intent");
    }
    // apparently the system can recreate the service without sending it an intent so protect
    // against that case (GH-430).
    if (null != intent) {
      String action = intent.getAction();

      UUID uuid = getMessageUUID(intent);
      CallRecordDatabase.CallRecord record = getCallRecord(uuid);
      if (record == null) {
        return START_NOT_STICKY;
      }

      logger.debug("VoiceService onStartCommand with intent: " + intent.getAction());
      switch (Objects.requireNonNull(action)) {
        case ACTION_INCOMING_CALL:
          incomingCall(record);
          break;
        case ACTION_ACCEPT_CALL:
          try {
            acceptCall(record);
          } catch (SecurityException e) {
            sendPermissionsError();
            logger.warning(e, "Cannot accept call, lacking necessary permissions");
          }
          break;
        case ACTION_REJECT_CALL:
          rejectCall(record);
          break;
        case ACTION_CANCEL_CALL:
          cancelCall(record);
          break;
        case ACTION_CALL_DISCONNECT:
          disconnect(record);
          break;
        case ACTION_RAISE_OUTGOING_CALL_NOTIFICATION:
          raiseOutgoingCallNotification(record);
          break;
        case ACTION_CANCEL_ACTIVE_CALL_NOTIFICATION:
          cancelActiveCallNotification(record);
          break;
        case ACTION_FOREGROUND_AND_DEPRIORITIZE_INCOMING_CALL_NOTIFICATION:
          foregroundAndDeprioritizeIncomingCallNotification(record);
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
    twilioVoiceLogInvoke("VoiceService onBind");
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
    twilioVoiceLogInvoke("VoiceService disconnect");
    logger.debug("disconnect");
    if (null != callRecord) {
      Objects.requireNonNull(callRecord.getVoiceCall()).disconnect();
    } else {
      logger.warning("No call record found");
    }
  }
  private void incomingCall(final CallRecordDatabase.CallRecord callRecord) {
    MGOTwilioVoiceHelper.sendAudioStatusEvent(VoiceService.this);
    logger.debug("incomingCall: " + callRecord.getUuid());

    // verify that mic permissions have been granted and if not, throw a error
    if ((Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) &&
      ActivityCompat.checkSelfPermission(VoiceService.this,
        Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {

      // report to js layer lack of permissions issue
      sendPermissionsError();

      mgoCallErrorLog("Incoming call cannot be handled, microphone permission not granted",
        "twilio_voice_show_incoming_call_failure", null, null, callRecord.getCallSid());

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

    mgoCallInfoLog("show incoming call success", "twilio_voice_show_incoming_call_success", null, null, callRecord.getCallSid());

    // play ringer sound
    VoiceApplicationProxy.getAudioSwitchManager().getAudioSwitch().activate();
    VoiceApplicationProxy.getMediaPlayerManager().play(MediaPlayerManager.SoundTable.INCOMING);

    // trigger JS layer
    sendJSEvent(
      ScopeVoice,
      constructJSMap(
        new Pair<>(VoiceEventType, VoiceEventTypeValueIncomingCallInvite),
        new Pair<>(JS_EVENT_KEY_CALL_INVITE_INFO, serializeCallInvite(callRecord))));
  };

  private void acceptCall(final CallRecordDatabase.CallRecord callRecord) {
    logger.debug("acceptCall: " + callRecord.getUuid());
    twilioVoiceLogInvoke("VoiceService acceptCall");

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

      mgoCallErrorLog("Call not accepted, microphone permission not granted",
              "twilio_voice_call_answer_failure", null, null, callRecord.getCallSid());

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

    mgoCallInfoLog("call answer success", "twilio_voice_call_answer_success", null, null, callRecord.getCallSid());

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
    twilioVoiceLogInvoke("VoiceService rejectCall");

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

    mgoCallInfoLog("call rejected", "twilio_voice_call_reject", null, null, callRecord.getCallSid());
    MGOTwilioVoiceHelper.removeIncomingContext(callRecord.getCallSid());

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
    twilioVoiceLogInvoke("VoiceService cancelCall");

    // take down notification
    removeNotification(callRecord.getNotificationId());

    // stop ringer sound
    VoiceApplicationProxy.getMediaPlayerManager().stop();
    VoiceApplicationProxy.getAudioSwitchManager().getAudioSwitch().deactivate();

    mgoCallInfoLog("call cancelled", "twilio_voice_call_cancelled", null, null, callRecord.getCallSid());
    MGOTwilioVoiceHelper.removeIncomingContext(callRecord.getCallSid());

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
    twilioVoiceLogInvoke("VoiceService raiseOutgoingCallNotification");

    // put up outgoing call notification
    Notification notification = NotificationUtility.createOutgoingCallNotificationWithLowImportance(
      VoiceService.this,
      callRecord);
    createOrReplaceForegroundNotification(callRecord.getNotificationId(), notification);
  }

  private void foregroundAndDeprioritizeIncomingCallNotification(final CallRecordDatabase.CallRecord callRecord) {
    logger.debug("foregroundAndDeprioritizeIncomingCallNotification: " + callRecord.getUuid());
    twilioVoiceLogInvoke("VoiceService foregroundAndDeprioritizeIncomingCallNotification");

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
    twilioVoiceLogInvoke("VoiceService cancelNotification");
    // only take down notification & stop any active sounds if one is active
    if (null != callRecord) {
      VoiceApplicationProxy.getMediaPlayerManager().stop();
      removeForegroundNotification();
    }
  }

  private void createOrReplaceNotification(final int notificationId,
                                           final Notification notification) {
    twilioVoiceLogInvoke("VoiceService createOrReplaceNotification");
    NotificationManager mNotificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
    mNotificationManager.notify(notificationId, notification);
  }

  private void createOrReplaceForegroundNotification(final int notificationId,
                                                     final Notification notification) {
    twilioVoiceLogInvoke("VoiceService createOrReplaceForegroundNotification");
    // 前台服务必须尽快调用 startForeground，否则 Android 12+ 会触发 ANR。
    // 即使未授予通知权限，也应调用 startForeground（系统可自行处理展示逻辑）。
    foregroundNotification(notificationId, notification);
  }

  private void removeNotification(final int notificationId) {
    logger.debug("removeNotification");
    twilioVoiceLogInvoke("VoiceService removeNotification");
    NotificationManager mNotificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
    mNotificationManager.cancel(notificationId);
  }

  private void removeForegroundNotification() {
    logger.debug("removeForegroundNotification");
    twilioVoiceLogInvoke("VoiceService removeForegroundNotification");
    ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE);
  }

  private void foregroundNotification(int id, Notification notification) {
    twilioVoiceLogInvoke("VoiceService foregroundNotification");
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
    return (UUID) intent.getSerializableExtra(Constants.MSG_KEY_UUID);
  }

  private static CallRecordDatabase.CallRecord getCallRecord(final UUID uuid) {
    if (uuid == null) return null;
    return getCallRecordDatabase().get(new CallRecordDatabase.CallRecord(uuid));
  }

  private static void sendJSEvent(@NonNull String scope, @NonNull WritableMap event) {
    getJSEventEmitter().sendEvent(scope, event);
  }

  private static void sendPermissionsError() {
    final String errorMessage = "Missing permissions.";
    final int errorCode = 31401;
    getJSEventEmitter().sendEvent(ScopeVoice, constructJSMap(
      new Pair<>(VoiceEventType, VoiceEventError),
      new Pair<>(VoiceErrorKeyError, serializeError(errorCode, errorMessage))));
  }
}
