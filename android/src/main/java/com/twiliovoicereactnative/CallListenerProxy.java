package com.twiliovoicereactnative;

import android.content.Context;
import android.util.Pair;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.twilio.voice.Call;
import com.twilio.voice.CallException;

import static com.twiliovoicereactnative.CommonConstants.CallEventConnected;
import static com.twiliovoicereactnative.CommonConstants.CallEventDisconnected;
import static com.twiliovoicereactnative.CommonConstants.CallEventReconnected;
import static com.twiliovoicereactnative.CommonConstants.CallEventReconnecting;
import static com.twiliovoicereactnative.CommonConstants.CallEventRinging;
import static com.twiliovoicereactnative.CommonConstants.ScopeCall;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventType;
import static com.twiliovoicereactnative.CommonConstants.VoiceErrorKeyError;
import static com.twiliovoicereactnative.CommonConstants.VoiceErrorKeyCode;
import static com.twiliovoicereactnative.CommonConstants.VoiceErrorKeyMessage;
import static com.twiliovoicereactnative.CommonConstants.CallEventCurrentWarnings;
import static com.twiliovoicereactnative.CommonConstants.CallEventPreviousWarnings;
import static com.twiliovoicereactnative.CommonConstants.CallEventConnectFailure;
import static com.twiliovoicereactnative.CommonConstants.CallEventQualityWarningsChanged;
import static com.twiliovoicereactnative.Constants.JS_EVENT_KEY_CALL_INFO;
import static com.twiliovoicereactnative.VoiceApplicationProxy.getCallRecordDatabase;
import static com.twiliovoicereactnative.VoiceNotificationReceiver.sendMessage;
import static com.twiliovoicereactnative.AndroidEventEmitter.constructJSEvent;
import static com.twiliovoicereactnative.ReactNativeArgumentsSerializer.*;

import com.twiliovoicereactnative.CallRecordDatabase.CallRecord;

import java.util.Date;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

class CallListenerProxy implements Call.Listener {
  private static final SDKLog logger = new SDKLog(CallListenerProxy.class);
  private final UUID uuid;
  private final Context context;
  private final AndroidEventEmitter androidEventEmitter;
  private final AudioSwitchManager audioSwitchManager;
  private final MediaPlayerManager mediaPlayerManager;

  public CallListenerProxy(UUID uuid, Context context) {
    this.uuid = uuid;
    this.context = context;
    this.androidEventEmitter = AndroidEventEmitter.getInstance();
    this.audioSwitchManager = VoiceApplicationProxy.getAudioSwitchManager();
    this.mediaPlayerManager = VoiceApplicationProxy.getMediaPlayerManager();
  }

  @Override
  public void onConnectFailure(@NonNull Call call, @NonNull CallException callException) {
    logger.debug("onConnectFailure");

    // stop sound and routing
    mediaPlayerManager.stop();
    audioSwitchManager.getAudioSwitch().deactivate();

    // find call record
    CallRecord callRecord = Objects.requireNonNull(getCallRecordDatabase().get(new CallRecord(uuid)));

    // take down notification
    sendMessage(context, Constants.ACTION_CANCEL_NOTIFICATION, callRecord.getUuid());

    // serialize and notify JS
    sendJSEvent(
      constructJSEvent(
        new Pair<>(VoiceEventType, CallEventConnectFailure),
        new Pair<>(JS_EVENT_KEY_CALL_INFO, serializeCall(callRecord)),
        new Pair<>(VoiceErrorKeyError, serializeCallException(callException))));
  }

  @Override
  public void onRinging(@NonNull Call call) {
    logger.debug("onRinging");

    // find call record
    CallRecord callRecord = Objects.requireNonNull(getCallRecordDatabase().get(new CallRecord(uuid)));

    // create notification & sound
    callRecord.setNotificationId(NotificationUtility.createNotificationIdentifier());
    audioSwitchManager.getAudioSwitch().activate();
    mediaPlayerManager.play(MediaPlayerManager.SoundTable.RINGTONE);
    sendMessage(context, Constants.ACTION_RAISE_OUTGOING_CALL_NOTIFICATION, callRecord.getUuid());

    // notify JS layer
    sendJSEvent(
      constructJSEvent(
        new Pair<>(VoiceEventType, CallEventRinging),
        new Pair<>(JS_EVENT_KEY_CALL_INFO, serializeCall(callRecord))));
  }

  @Override
  public void onConnected(@NonNull Call call) {
    logger.debug("onConnected");

    // find call record
    CallRecord callRecord = Objects.requireNonNull(getCallRecordDatabase().get(new CallRecord(uuid)));
    callRecord.setTimestamp(new Date());
    mediaPlayerManager.stop();

    // notify JS layer
    sendJSEvent(
      constructJSEvent(
        new Pair<>(VoiceEventType, CallEventConnected),
        new Pair<>(JS_EVENT_KEY_CALL_INFO, serializeCall(callRecord))));
  }

  @Override
  public void onReconnecting(@NonNull Call call, @NonNull CallException callException) {
    logger.debug("onReconnecting");

    // find & update call record
    CallRecord callRecord = Objects.requireNonNull(getCallRecordDatabase().get(new CallRecord(uuid)));

    // notify JS layer
    sendJSEvent(
      constructJSEvent(
        new Pair<>(VoiceEventType, CallEventReconnecting),
        new Pair<>(JS_EVENT_KEY_CALL_INFO, serializeCall(callRecord)),
        new Pair<>(VoiceErrorKeyError, serializeCallException(callException))));
  }

  @Override
  public void onReconnected(@NonNull Call call) {
    logger.debug("onReconnected");

    // find & update call record
    CallRecord callRecord = Objects.requireNonNull(getCallRecordDatabase().get(new CallRecord(uuid)));

    // notify JS layer
    sendJSEvent(
      constructJSEvent(
        new Pair<>(VoiceEventType, CallEventReconnected),
        new Pair<>(JS_EVENT_KEY_CALL_INFO, serializeCall(callRecord))));
  }

  @Override
  public void onDisconnected(@NonNull Call call, @Nullable CallException callException) {
    logger.debug("onDisconnected");

    // find & update call record
    CallRecord callRecord = Objects.requireNonNull(getCallRecordDatabase().get(new CallRecord(uuid)));

    // stop audio & cancel notification
    mediaPlayerManager.stop();
    mediaPlayerManager.play(MediaPlayerManager.SoundTable.DISCONNECT);
    audioSwitchManager.getAudioSwitch().deactivate();
    sendMessage(context, Constants.ACTION_CANCEL_NOTIFICATION, callRecord.getUuid());

    // notify JS layer
    sendJSEvent(
      constructJSEvent(
        new Pair<>(VoiceEventType, CallEventDisconnected),
        new Pair<>(JS_EVENT_KEY_CALL_INFO, serializeCall(callRecord)),
        new Pair<>(VoiceErrorKeyError, serializeCallException(callException))));
  }

  @Override
  public void onCallQualityWarningsChanged(@NonNull Call call,
                                           @NonNull Set<Call.CallQualityWarning> currentWarnings,
                                           @NonNull Set<Call.CallQualityWarning> previousWarnings) {
    logger.debug("onCallQualityWarningsChanged");

    // find call record
    CallRecord callRecord = Objects.requireNonNull(getCallRecordDatabase().get(new CallRecord(uuid)));

    // notify JS layer
    sendJSEvent(
      constructJSEvent(
        new Pair<>(VoiceEventType, CallEventQualityWarningsChanged),
        new Pair<>(JS_EVENT_KEY_CALL_INFO, serializeCall(callRecord)),
        new Pair<>(CallEventCurrentWarnings, serializeCallQualityWarnings(currentWarnings)),
        new Pair<>(CallEventPreviousWarnings, serializeCallQualityWarnings(previousWarnings))));
  }

  private void sendJSEvent(@NonNull WritableMap event) {
    androidEventEmitter.sendEvent(ScopeCall, event);
  }

  private static WritableMap serializeCallException(@Nullable CallException callException) {
    if (null != callException) {
      return constructJSEvent(
        new Pair<>(VoiceErrorKeyCode, callException.getErrorCode()),
        new Pair<>(VoiceErrorKeyMessage, callException.getMessage()));
    }
    return null;
  }

  private static WritableArray serializeCallQualityWarnings(@NonNull Set<Call.CallQualityWarning> warnings) {
    WritableArray previousWarningsArray = Arguments.createArray();
    for (Call.CallQualityWarning warning : warnings) {
      previousWarningsArray.pushString(warning.toString());
    }
    return previousWarningsArray;
  }
}
