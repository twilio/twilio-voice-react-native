package com.twiliovoicereactnative;

import android.content.Context;
import android.content.Intent;

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
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_CALL_INFO;
import static com.twiliovoicereactnative.CommonConstants.CallEventConnectFailure;
import static com.twiliovoicereactnative.CommonConstants.CallEventQualityWarningsChanged;
import static com.twiliovoicereactnative.VoiceApplicationProxy.getCallRecordDatabase;
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
  private final AudioSwitchManager audioSwitchManager;
  private final MediaPlayerManager mediaPlayerManager;

  public CallListenerProxy(UUID uuid, Context context) {
    this.uuid = uuid;
    this.context = context;
    this.audioSwitchManager = VoiceApplicationProxy.getAudioSwitchManager();
    this.mediaPlayerManager = VoiceApplicationProxy.getMediaPlayerManager();
  }

  @Override
  public void onConnectFailure(@NonNull Call call, @NonNull CallException callException) {
    logger.debug("onConnectFailure");

    mediaPlayerManager.stop();
    audioSwitchManager.getAudioSwitch().deactivate();

    // find call record
    CallRecord callRecord = Objects.requireNonNull(getCallRecordDatabase().get(new CallRecord(uuid)));

    // serialize and notify JS
    WritableMap params = Arguments.createMap();
    params.putString(VoiceEventType, CallEventConnectFailure);
    params.putMap(EVENT_KEY_CALL_INFO, serializeCall(callRecord));
    params.putMap(VoiceErrorKeyError, serializeCallException(callException));
    AndroidEventEmitter.getInstance().sendEvent(ScopeCall, params);

    // take down notification
    cancelNotification(callRecord);
  }

  @Override
  public void onRinging(@NonNull Call call) {
    logger.debug("onRinging");

    // find call record
    CallRecord callRecord = Objects.requireNonNull(getCallRecordDatabase().get(new CallRecord(uuid)));

    // create notificationn & sound
    callRecord.setNotificationId(NotificationUtility.createNotificationIdentifier());
    audioSwitchManager.getAudioSwitch().activate();
    mediaPlayerManager.play(MediaPlayerManager.SoundTable.RINGTONE);
    raiseNotification(callRecord);

    // notify JS layer
    WritableMap params = Arguments.createMap();
    params.putString(VoiceEventType, CallEventRinging);
    params.putMap(EVENT_KEY_CALL_INFO, serializeCall(callRecord));
    AndroidEventEmitter.getInstance().sendEvent(ScopeCall, params);
  }

  @Override
  public void onConnected(@NonNull Call call) {
    logger.debug("onConnected");

    // find call record
    CallRecord callRecord = Objects.requireNonNull(getCallRecordDatabase().get(new CallRecord(uuid)));
    callRecord.setTimestamp(new Date());
    mediaPlayerManager.stop();

    // notify JS layer
    WritableMap params = Arguments.createMap();
    params.putString(VoiceEventType, CallEventConnected);
    params.putMap(EVENT_KEY_CALL_INFO, serializeCall(callRecord));
    AndroidEventEmitter.getInstance().sendEvent(ScopeCall, params);
  }

  @Override
  public void onReconnecting(@NonNull Call call, @NonNull CallException callException) {
    logger.debug("onReconnecting");

    // find & update call record
    CallRecord callRecord = Objects.requireNonNull(getCallRecordDatabase().get(new CallRecord(uuid)));

    // notify JS layer
    WritableMap params = Arguments.createMap();
    params.putString(VoiceEventType, CallEventReconnecting);
    params.putMap(EVENT_KEY_CALL_INFO, serializeCall(callRecord));
    params.putMap(VoiceErrorKeyError, serializeCallException(callException));
    AndroidEventEmitter.getInstance().sendEvent(ScopeCall, params);
  }

  @Override
  public void onReconnected(@NonNull Call call) {
    logger.debug("onReconnected");

    // find & update call record
    CallRecord callRecord = Objects.requireNonNull(getCallRecordDatabase().get(new CallRecord(uuid)));

    // notify JS layer
    WritableMap params = Arguments.createMap();
    params.putString(VoiceEventType, CallEventReconnected);
    params.putMap(EVENT_KEY_CALL_INFO, serializeCall(callRecord));
    AndroidEventEmitter.getInstance().sendEvent(ScopeCall, params);
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
    cancelNotification(callRecord);

    // notify JS layer
    WritableMap params = Arguments.createMap();
    params.putString(VoiceEventType, CallEventDisconnected);
    params.putMap(EVENT_KEY_CALL_INFO, serializeCall(callRecord));
    if (callException != null) {
      params.putMap(VoiceErrorKeyError, serializeCallException(callException));
    }
    AndroidEventEmitter.getInstance().sendEvent(ScopeCall, params);
  }

  @Override
  public void onCallQualityWarningsChanged(@NonNull Call call,
                                           @NonNull Set<Call.CallQualityWarning> currentWarnings,
                                           @NonNull Set<Call.CallQualityWarning> previousWarnings) {
    logger.debug("onCallQualityWarningsChanged");

    // find call record
    CallRecord callRecord = Objects.requireNonNull(getCallRecordDatabase().get(new CallRecord(uuid)));

    // notify JS layer
    WritableMap params = Arguments.createMap();
    params.putString(VoiceEventType, CallEventQualityWarningsChanged);
    params.putMap(EVENT_KEY_CALL_INFO, serializeCall(callRecord));
    params.putArray(CallEventCurrentWarnings, serializeCallQualityWarnings(currentWarnings));
    params.putArray(CallEventPreviousWarnings, serializeCallQualityWarnings(previousWarnings));
    AndroidEventEmitter.getInstance().sendEvent(ScopeCall, params);
  }

  private void cancelNotification(final CallRecord callRecord) {
    Intent intent = new Intent(context, VoiceNotificationReceiver.class);
    intent.setAction(Constants.ACTION_CANCEL_NOTIFICATION);
    intent.putExtra(Constants.UUID, callRecord.getUuid());
    context.sendBroadcast(intent);
  }

  private void raiseNotification(final CallRecord callRecord) {
    Intent intent = new Intent(context, VoiceNotificationReceiver.class);
    intent.setAction(Constants.ACTION_RAISE_OUTGOING_CALL_NOTIFICATION);
    intent.putExtra(Constants.UUID, callRecord.getUuid());
    context.sendBroadcast(intent);
  }

  private static WritableMap serializeCallException(CallException callException) {
    WritableMap error = Arguments.createMap();
    error.putInt(VoiceErrorKeyCode, callException.getErrorCode());
    error.putString(VoiceErrorKeyMessage, callException.getMessage());
    return error;
  }

  private static WritableArray serializeCallQualityWarnings(@NonNull Set<Call.CallQualityWarning> warnings) {
    WritableArray previousWarningsArray = Arguments.createArray();
    for (Call.CallQualityWarning warning : warnings) {
      previousWarningsArray.pushString(warning.toString());
    }
    return previousWarningsArray;
  }
}
