package com.twiliovoicereactnative;

import static com.twiliovoicereactnative.CommonConstants.CallEventMessageFailure;
import static com.twiliovoicereactnative.CommonConstants.CallEventMessageReceived;
import static com.twiliovoicereactnative.CommonConstants.CallEventMessageSent;
import static com.twiliovoicereactnative.CommonConstants.CallMessageSID;
import static com.twiliovoicereactnative.CommonConstants.ScopeCall;
import static com.twiliovoicereactnative.CommonConstants.VoiceErrorKeyError;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventType;
import static com.twiliovoicereactnative.Constants.JS_EVENT_KEY_CALL_MESSAGE_INFO;
import static com.twiliovoicereactnative.JSEventEmitter.constructJSMap;
import static com.twiliovoicereactnative.ReactNativeArgumentsSerializer.serializeCallMessage;
import static com.twiliovoicereactnative.ReactNativeArgumentsSerializer.serializeVoiceException;
import static com.twiliovoicereactnative.VoiceApplicationProxy.getJSEventEmitter;

import android.util.Pair;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.WritableMap;
import com.twilio.voice.Call;
import com.twilio.voice.CallMessage;
import com.twilio.voice.VoiceException;

public class CallMessageListenerProxy implements Call.CallMessageListener {
  private static final SDKLog logger = new SDKLog(CallMessageListenerProxy.class);

  @Override
  public void onMessageFailure(String voiceEventSID, VoiceException voiceException) {
    debug("onMessageFailure");

    // notify JS layer
    sendJSEvent(
      constructJSMap(
        new Pair<>(VoiceEventType, CallEventMessageFailure),
        new Pair<>(VoiceErrorKeyError, serializeVoiceException(voiceException))
      )
    );
  }

  @Override
  public void onMessageSent(String voiceEventSID) {
    debug("onMessageSent");

    // notify JS layer
    sendJSEvent(
      constructJSMap(
        new Pair<>(VoiceEventType, CallEventMessageSent),
        new Pair<>(CallMessageSID, voiceEventSID)
    ));
  }

  @Override
  public void onMessageReceived(CallMessage callMessage) {
    debug("onMessageReceived");

    // notify JS layer
    sendJSEvent(
      constructJSMap(
        new Pair<>(VoiceEventType, CallEventMessageReceived),
        new Pair<>(CallMessageSID, callMessage.getVoiceEventSID()),
        new Pair<>(JS_EVENT_KEY_CALL_MESSAGE_INFO, serializeCallMessage(callMessage))
      )
    );
  }

  private void sendJSEvent(@NonNull WritableMap event) {
    getJSEventEmitter().sendEvent(ScopeCall, event);
  }

  private void debug(final String message) {
    logger.debug(String.format(message));
  }
}