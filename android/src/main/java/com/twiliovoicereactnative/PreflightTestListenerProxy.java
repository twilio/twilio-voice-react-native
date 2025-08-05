package com.twiliovoicereactnative;

import java.util.Set;
import java.util.UUID;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableArray;

import com.twilio.voice.Call;
import com.twilio.voice.CallException;
import com.twilio.voice.PreflightTest;

import static com.twiliovoicereactnative.VoiceApplicationProxy.getJSEventEmitter;

import androidx.annotation.NonNull;

import org.json.JSONObject;

public class PreflightTestListenerProxy implements PreflightTest.Listener {
  private final SDKLog logger = new SDKLog(PreflightTestListenerProxy.class);

  private final UUID uuid;

  PreflightTestListenerProxy(UUID uuid) {
    this.uuid = uuid;
  }

  @Override
  public void onPreflightConnected(@NonNull PreflightTest preflightTest) {
    logger.debug("onPreflightConnected");
    sendJSEvent(serializePreflightBaseEvent(CommonConstants.PreflightTestEventTypeValueConnected));
  }

  @Override
  public void onPreflightCompleted(@NonNull PreflightTest preflightTest, @NonNull JSONObject report) {
    logger.debug("onPreflightCompleted");
    sendJSEvent(serializePreflightCompletedEvent(report));
  }

  @Override
  public void onPreflightFailed(@NonNull PreflightTest preflightTest, @NonNull CallException error) {
    logger.debug("onPreflightFailed");
    sendJSEvent(serializePreflightFailedEvent(error));
  }

  @Override
  public void onPreflightWarning(@NonNull PreflightTest preflightTest, @NonNull Set<Call.CallQualityWarning> currentWarnings, @NonNull Set<Call.CallQualityWarning> previousWarnings) {
    logger.debug("onPreflightWarning");
    sendJSEvent(serializePreflightWarningEvent(currentWarnings, previousWarnings));
  }

  @Override
  public void onPreflightSample(@NonNull PreflightTest preflightTest, @NonNull JSONObject sample) {
    logger.debug("onPreflightSample");
    sendJSEvent(serializePreflightSampleEvent(sample));
  }

  private WritableMap serializePreflightBaseEvent(String type) {
    final WritableMap eventPayload = Arguments.createMap();
    eventPayload.putString(CommonConstants.PreflightTestEventKeyUuid, this.uuid.toString());
    eventPayload.putString(CommonConstants.PreflightTestEventKeyType, type);
    return eventPayload;
  }

  private WritableMap serializePreflightCompletedEvent(JSONObject report) {
    final WritableMap eventPayload = serializePreflightBaseEvent(CommonConstants.PreflightTestEventTypeValueCompleted);
    eventPayload.putString(CommonConstants.PreflightTestCompletedEventKeyReport, report.toString());
    return eventPayload;
  }

  private WritableMap serializePreflightFailedEvent(CallException error) {
    final WritableMap eventPayload = serializePreflightBaseEvent(CommonConstants.PreflightTestEventTypeValueFailed);
    final WritableMap errorPayload = ReactNativeArgumentsSerializer.serializeVoiceException(error);
    eventPayload.putMap(CommonConstants.PreflightTestFailedEventKeyError, errorPayload);
    return eventPayload;
  }

  private WritableMap serializePreflightWarningEvent(Set<Call.CallQualityWarning> currentWarnings, Set<Call.CallQualityWarning> previousWarnings) {
    final WritableMap eventPayload = serializePreflightBaseEvent(CommonConstants.PreflightTestEventTypeValueQualityWarning);
    final WritableArray currentWarningsPayload = ReactNativeArgumentsSerializer.serializeCallQualityWarnings(currentWarnings);
    final WritableArray previousWarningsPayload = ReactNativeArgumentsSerializer.serializeCallQualityWarnings(previousWarnings);
    eventPayload.putArray(CommonConstants.PreflightTestQualityWarningEventKeyCurrentWarnings, currentWarningsPayload);
    eventPayload.putArray(CommonConstants.PreflightTestQualityWarningEventKeyPreviousWarnings, previousWarningsPayload);
    return eventPayload;
  }

  private WritableMap serializePreflightSampleEvent(JSONObject sample) {
    final WritableMap eventPayload = serializePreflightBaseEvent(CommonConstants.PreflightTestEventTypeValueSample);
    eventPayload.putString(CommonConstants.PreflightTestSampleEventKeySample, sample.toString());
    return eventPayload;
  }

  private void sendJSEvent(WritableMap eventPayload) {
    getJSEventEmitter().sendEvent(CommonConstants.ScopePreflightTest, eventPayload);
  }
}
