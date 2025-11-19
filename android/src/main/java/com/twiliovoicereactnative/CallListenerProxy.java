package com.twiliovoicereactnative;

import android.content.Context;
import android.util.Pair;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.moego.logger.helper.MGOTwilioVoiceHelper;
import com.twilio.voice.Call;
import com.twilio.voice.CallException;

import static com.moego.logger.helper.MGOTwilioVoiceHelperKt.mgoCallErrorLog;
import static com.moego.logger.helper.MGOTwilioVoiceHelperKt.mgoCallInfoLog;
import static com.moego.logger.helper.MGOTwilioVoiceHelperKt.twilioVoiceLogInvoke;
import static com.twiliovoicereactnative.CallRecordDatabase.CallRecord.Direction.INCOMING;
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
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.Collections;

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
    twilioVoiceLogInvoke("CallListenerProxy onConnectFailure");

    // stop sound and routing
    getMediaPlayerManager().stop();
    getAudioSwitchManager().getAudioSwitch().deactivate();

    // find & remove call record (fallback to Call when missing)
    CallRecord callRecord = removeOrBuildRecord(call);

    // take down notification
    getVoiceServiceApi().cancelActiveCallNotification(callRecord);

    if (callRecord.getDirection() == INCOMING) {
      mgoCallErrorLog("call connect failure", "twilio_voice_call_connect_failure", null,
              serializeVoiceException(callException), callRecord.getCallSid());
    }
    MGOTwilioVoiceHelper.removeIncomingContext(callRecord.getCallSid());

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
    twilioVoiceLogInvoke("CallListenerProxy onRinging");

    // find call record (fallback to Call when missing)
    CallRecord callRecord = findOrBuildRecord(call);

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
    twilioVoiceLogInvoke("CallListenerProxy onConnected");

    // find & update call record (fallback to Call when missing)
    CallRecord callRecord = findOrBuildRecord(call);

    callRecord.setTimestamp(new Date());
    getMediaPlayerManager().stop();

    if (callRecord.getDirection() == INCOMING) {
      mgoCallInfoLog("call connect success", "twilio_voice_call_connect_success", null, null,
              callRecord.getCallSid());
    }
    MGOTwilioVoiceHelper.sendAudioStatusEvent(context);

    // notify JS layer
    sendJSEvent(
      constructJSMap(
        new Pair<>(VoiceEventType, CallEventConnected),
        new Pair<>(JS_EVENT_KEY_CALL_INFO, serializeCall(callRecord))));
  }

  @Override
  public void onReconnecting(@NonNull Call call, @NonNull CallException callException) {
    debug("onReconnecting");
    // find & update call record (fallback to Call when missing)
    CallRecord callRecord = findOrBuildRecord(call);

    if (callRecord.getDirection() == INCOMING) {
      mgoCallErrorLog("call reconnecting", "twilio_voice_call_reconnecting", null, serializeVoiceException(callException), callRecord.getCallSid());
    }

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
    // find & update call record (fallback to Call when missing)
    CallRecord callRecord = findOrBuildRecord(call);

    if (callRecord.getDirection() == INCOMING) {
      mgoCallInfoLog("call reconnected", "twilio_voice_call_reconnected", null, null, callRecord.getCallSid());
    }

    // notify JS layer
    sendJSEvent(
      constructJSMap(
        new Pair<>(VoiceEventType, CallEventReconnected),
        new Pair<>(JS_EVENT_KEY_CALL_INFO, serializeCall(callRecord))));
  }

  @Override
  public void onDisconnected(@NonNull Call call, @Nullable CallException callException) {
    debug("onDisconnected");
    twilioVoiceLogInvoke("CallListenerProxy onDisconnected");
    MGOTwilioVoiceHelper.sendAudioStatusEvent(context);

    // find & remove call record (fallback to Call when missing)
    CallRecord callRecord = removeOrBuildRecord(call);

    // stop audio & cancel notification
    getMediaPlayerManager().stop();
    getAudioSwitchManager().getAudioSwitch().deactivate();
    getMediaPlayerManager().play(MediaPlayerManager.SoundTable.DISCONNECT);
    getVoiceServiceApi().cancelActiveCallNotification(callRecord);

    if (callRecord.getDirection() == INCOMING) {
      if (callException == null) {
        mgoCallInfoLog("call disconnect success", "twilio_voice_call_disconnect_success", null, null, callRecord.getCallSid());
      } else {
        mgoCallErrorLog("call disconnect failure", "twilio_voice_call_disconnect_failure", null, null, callRecord.getCallSid());
      }
    }
    MGOTwilioVoiceHelper.removeIncomingContext(callRecord.getCallSid());

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

    CallRecord callRecord = findOrBuildRecord(call);

    WritableArray currentArray = serializeCallQualityWarnings(currentWarnings);
    WritableArray previousArray = serializeCallQualityWarnings(previousWarnings);

    // Notify JS
    sendJSEvent(
      constructJSMap(
        new Pair<>(VoiceEventType, CallEventQualityWarningsChanged),
        new Pair<>(JS_EVENT_KEY_CALL_INFO, serializeCall(callRecord)),
        new Pair<>(CallEventCurrentWarnings, currentArray),
        new Pair<>(CallEventPreviousWarnings, previousArray)));
  }

  private void sendJSEvent(@NonNull WritableMap event) {
    getJSEventEmitter().sendEvent(ScopeCall, event);
  }

  private void debug(final String message) {
    logger.debug(String.format("%s UUID:%s", message, uuid.toString()));
  }

  // Helpers to safely fetch or remove CallRecord with fallback to Call fields when missing
  private CallRecord buildFallbackRecordFromCall(@NonNull Call call) {
    logger.warning("Building fallback CallRecord from Call for UUID:" + uuid);
    return new CallRecord(
      uuid,
      call,
      "",
      Collections.<String, String>emptyMap(),
      CallRecord.Direction.INCOMING,
      null
    );
  }

  private CallRecord findOrBuildRecord(@NonNull Call call) {
    CallRecord rec = getCallRecordDatabase().get(new CallRecord(uuid));
    if (rec == null) {
      logger.warning("CallRecord not found for UUID:" + uuid + " (find), using fallback Call data");
      return buildFallbackRecordFromCall(call);
    }
    rec.setCall(call);
    return rec;
  }

  private CallRecord removeOrBuildRecord(@NonNull Call call) {
    CallRecord rec = getCallRecordDatabase().remove(new CallRecord(uuid));
    if (rec == null) {
      logger.warning("CallRecord not found for UUID:" + uuid + " (remove), using fallback Call data");
      return buildFallbackRecordFromCall(call);
    }
    return rec;
  }
}
