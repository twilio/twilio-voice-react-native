package com.twiliovoicereactnative;

import android.content.Context;
import android.util.Pair;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

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
import static com.twiliovoicereactnative.CommonConstants.CallEventCurrentWarnings;
import static com.twiliovoicereactnative.CommonConstants.CallEventPreviousWarnings;
import static com.twiliovoicereactnative.CommonConstants.CallEventConnectFailure;
import static com.twiliovoicereactnative.CommonConstants.CallEventQualityWarningsChanged;
import static com.twiliovoicereactnative.Constants.JS_EVENT_KEY_CALL_INFO;
import static com.twiliovoicereactnative.VoiceApplicationProxy.getCallRecordDatabase;
import static com.twiliovoicereactnative.VoiceApplicationProxy.getJSEventEmitter;
import static com.twiliovoicereactnative.VoiceApplicationProxy.getAudioSwitchManager;
import static com.twiliovoicereactnative.VoiceApplicationProxy.getMediaPlayerManager;
import static com.twiliovoicereactnative.VoiceApplicationProxy.getVoiceServiceApi;
import static com.twiliovoicereactnative.JSEventEmitter.constructJSMap;
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

  public CallListenerProxy(UUID uuid, Context context) {
    this.uuid = uuid;
    this.context = context;
  }

  @Override
  public void onConnectFailure(@NonNull Call call, @NonNull CallException callException) {
    debug("onConnectFailure");

    // stop sound and routing
    getMediaPlayerManager().stop();
    getAudioSwitchManager().getAudioSwitch().deactivate();

    // find call record & remove
    CallRecord callRecord = Objects.requireNonNull(getCallRecordDatabase().remove(new CallRecord(uuid)));

    // take down notification
    getVoiceServiceApi().cancelActiveCallNotification(callRecord);

    // serialize and notify JS
    sendJSEvent(
      constructJSMap(
        new Pair<>(VoiceEventType, CallEventConnectFailure),
        new Pair<>(JS_EVENT_KEY_CALL_INFO, serializeCall(callRecord)),
        new Pair<>(VoiceErrorKeyError, serializeVoiceException(callException))));
  }

  @Override
  public void onRinging(@NonNull Call call) {
    debug("onRinging");

    // find call record
    CallRecord callRecord = Objects.requireNonNull(getCallRecordDatabase().get(new CallRecord(uuid)));
    callRecord.setCall(call);

    // create notification & sound
    callRecord.setNotificationId(NotificationUtility.createNotificationIdentifier());
    getAudioSwitchManager().getAudioSwitch().activate();
    getMediaPlayerManager().play(MediaPlayerManager.SoundTable.RINGTONE);
    getVoiceServiceApi().raiseOutgoingCallNotification(callRecord);

    // notify JS layer
    sendJSEvent(
      constructJSMap(
        new Pair<>(VoiceEventType, CallEventRinging),
        new Pair<>(JS_EVENT_KEY_CALL_INFO, serializeCall(callRecord))));
  }

  @Override
  public void onConnected(@NonNull Call call) {
    debug("onConnected");

    // find call record
    CallRecord callRecord = Objects.requireNonNull(getCallRecordDatabase().get(new CallRecord(uuid)));
    callRecord.setCall(call);
    callRecord.setTimestamp(new Date());
    getMediaPlayerManager().stop();

    // notify JS layer
    sendJSEvent(
      constructJSMap(
        new Pair<>(VoiceEventType, CallEventConnected),
        new Pair<>(JS_EVENT_KEY_CALL_INFO, serializeCall(callRecord))));
  }

  @Override
  public void onReconnecting(@NonNull Call call, @NonNull CallException callException) {
    debug("onReconnecting");

    // find & update call record
    CallRecord callRecord = Objects.requireNonNull(getCallRecordDatabase().get(new CallRecord(uuid)));

    // notify JS layer
    sendJSEvent(
      constructJSMap(
        new Pair<>(VoiceEventType, CallEventReconnecting),
        new Pair<>(JS_EVENT_KEY_CALL_INFO, serializeCall(callRecord)),
        new Pair<>(VoiceErrorKeyError, serializeVoiceException(callException))));
  }

  @Override
  public void onReconnected(@NonNull Call call) {
    debug("onReconnected");

    // find & update call record
    CallRecord callRecord = Objects.requireNonNull(getCallRecordDatabase().get(new CallRecord(uuid)));

    // notify JS layer
    sendJSEvent(
      constructJSMap(
        new Pair<>(VoiceEventType, CallEventReconnected),
        new Pair<>(JS_EVENT_KEY_CALL_INFO, serializeCall(callRecord))));
  }

  @Override
  public void onDisconnected(@NonNull Call call, @Nullable CallException callException) {
    debug("onDisconnected");

    // find & remove call record
    CallRecord callRecord = Objects.requireNonNull(getCallRecordDatabase().remove(new CallRecord(uuid)));

    // stop audio & cancel notification
    getMediaPlayerManager().stop();
    getMediaPlayerManager().play(MediaPlayerManager.SoundTable.DISCONNECT);
    getAudioSwitchManager().getAudioSwitch().deactivate();
    getVoiceServiceApi().cancelActiveCallNotification(callRecord);

    // notify JS layer
    sendJSEvent(
      constructJSMap(
        new Pair<>(VoiceEventType, CallEventDisconnected),
        new Pair<>(JS_EVENT_KEY_CALL_INFO, serializeCall(callRecord)),
        new Pair<>(VoiceErrorKeyError, serializeVoiceException(callException))));
  }

  @Override
  public void onCallQualityWarningsChanged(@NonNull Call call,
                                           @NonNull Set<Call.CallQualityWarning> currentWarnings,
                                           @NonNull Set<Call.CallQualityWarning> previousWarnings) {
    debug("onCallQualityWarningsChanged");

    // find call record
    CallRecord callRecord = Objects.requireNonNull(getCallRecordDatabase().get(new CallRecord(uuid)));

    // notify JS layer
    sendJSEvent(
      constructJSMap(
        new Pair<>(VoiceEventType, CallEventQualityWarningsChanged),
        new Pair<>(JS_EVENT_KEY_CALL_INFO, serializeCall(callRecord)),
        new Pair<>(CallEventCurrentWarnings, serializeCallQualityWarnings(currentWarnings)),
        new Pair<>(CallEventPreviousWarnings, serializeCallQualityWarnings(previousWarnings))));
  }

  private void sendJSEvent(@NonNull WritableMap event) {
    getJSEventEmitter().sendEvent(ScopeCall, event);
  }

  private void debug(final String message) {
    logger.debug(String.format("%s UUID:%s", message, uuid.toString()));
  }
}
