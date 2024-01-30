package com.twiliovoicereactnative;

import static com.twiliovoicereactnative.CommonConstants.CallEventMessageFailure;
import static com.twiliovoicereactnative.CommonConstants.CallEventMessageReceived;
import static com.twiliovoicereactnative.CommonConstants.CallEventMessageSent;
import static com.twiliovoicereactnative.CommonConstants.ScopeCall;
import static com.twiliovoicereactnative.CommonConstants.ScopeCallInvite;
import static com.twiliovoicereactnative.CommonConstants.ScopeCallMessage;
import static com.twiliovoicereactnative.CommonConstants.VoiceErrorKeyError;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventSid;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventType;
import static com.twiliovoicereactnative.CommonConstants.JSEventKeyCallMessageInfo;
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
        new Pair<>(VoiceEventSid, voiceEventSID),
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
        new Pair<>(VoiceEventSid, voiceEventSID)
    ));
  }

  @Override
  public void onMessageReceived(CallMessage callMessage) {
    debug("onMessageReceived");

    // notify JS layer ScopeCall
    getJSEventEmitter().sendEvent(ScopeCall,
      constructJSMap(
        new Pair<>(VoiceEventType, CallEventMessageReceived),
        new Pair<>(JSEventKeyCallMessageInfo, serializeCallMessage(callMessage))
      )
    );

    // notify JS layer ScopeCallInvite
    getJSEventEmitter().sendEvent(ScopeCallInvite,
      constructJSMap(
        new Pair<>(VoiceEventType, CallEventMessageReceived),
        new Pair<>(JSEventKeyCallMessageInfo, serializeCallMessage(callMessage))
      )
    );
  }

  private void sendJSEvent(@NonNull WritableMap event) {
    getJSEventEmitter().sendEvent(ScopeCallMessage, event);
  }

  private void debug(final String message) {
    logger.debug(message);
  }
}
