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
import static com.twiliovoicereactnative.Constants.JS_EVENT_KEY_CALL_INFO;
import static com.twiliovoicereactnative.JSEventEmitter.constructJSMap;
import static com.twiliovoicereactnative.ReactNativeArgumentsSerializer.serializeCall;
import static com.twiliovoicereactnative.ReactNativeArgumentsSerializer.serializeCallMessage;
import static com.twiliovoicereactnative.ReactNativeArgumentsSerializer.serializeVoiceException;
import static com.twiliovoicereactnative.VoiceApplicationProxy.getCallRecordDatabase;
import static com.twiliovoicereactnative.VoiceApplicationProxy.getJSEventEmitter;

import android.util.Pair;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.twilio.voice.Call;
import com.twilio.voice.CallMessage;
import com.twilio.voice.VoiceException;

import com.twiliovoicereactnative.CallRecordDatabase.CallRecord;


public class CallMessageListenerProxy implements Call.CallMessageListener {
  private static final SDKLog logger = new SDKLog(CallMessageListenerProxy.class);

  @Override
  public void onMessageFailure(String callSid, String voiceEventSID, VoiceException voiceException) {
    logger.debug("onMessageFailure");

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
  public void onMessageSent(String callSid, String voiceEventSID) {
    logger.debug("onMessageSent");

    // notify JS layer
    sendJSEvent(
      constructJSMap(
        new Pair<>(VoiceEventType, CallEventMessageSent),
        new Pair<>(VoiceEventSid, voiceEventSID)
    ));
  }

  @Override
  public void onMessageReceived(String callSid, CallMessage callMessage) {
    logger.debug("onMessageReceived");

    for (CallRecord callRecord: getCallRecordDatabase().getCollection()) {
      if (callRecord.getCallSid() == callSid &&
        CallRecord.CallInviteState.ACTIVE == callRecord.getCallInviteState()) {
        // notify JS layer ScopeCallInvite
        getJSEventEmitter().sendEvent(ScopeCallInvite,
          constructJSMap(
            new Pair<>(VoiceEventType, CallEventMessageReceived),
            new Pair<>(JSEventKeyCallMessageInfo, serializeCallMessage(callMessage))
          )
        );
        return;
      }
    }

    for (CallRecord callRecord: getCallRecordDatabase().getCollection()) {
      if (callRecord.getCallSid() == callSid) {
        // notify JS layer ScopeCall
        getJSEventEmitter().sendEvent(ScopeCall,
          constructJSMap(
            new Pair<>(VoiceEventType, CallEventMessageReceived),
            new Pair<>(JS_EVENT_KEY_CALL_INFO, serializeCall(callRecord)),
            new Pair<>(JSEventKeyCallMessageInfo, serializeCallMessage(callMessage))
          )
        );
        return;
      }
    }

    logger.debug(String.format("No match call or callInvite for %s", callSid));
  }

  private void sendJSEvent(@NonNull WritableMap event) {
    getJSEventEmitter().sendEvent(ScopeCallMessage, event);
  }
}
