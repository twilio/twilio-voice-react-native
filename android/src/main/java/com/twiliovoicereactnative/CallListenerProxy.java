package com.twiliovoicereactnative;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.twilio.voice.Call;
import com.twilio.voice.CallException;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

import static com.twiliovoicereactnative.AndroidEventEmitter.CALL_EVENT_NAME;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_TYPE;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_ERROR;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_CALL_RINGING;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_CALL_CONNECTED;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_CALL_DISCONNECTED;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_CALL_CONNECT_FAILURE;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_CALL_RECONNECTED;
import static com.twiliovoicereactnative.AndroidEventEmitter.CALL_UUID;

class CallListenerProxy implements Call.Listener {
  private final String uuid;
  private final AndroidEventEmitter androidEventEmitter;

  public CallListenerProxy(String uuid, AndroidEventEmitter androidEventEmitter) {
    this.uuid = uuid;
    this.androidEventEmitter = androidEventEmitter;
  }

  @Override
  public void onConnectFailure(@NonNull Call call, @NonNull CallException callException) {
    WritableMap params = Arguments.createMap();
    params.putString(EVENT_TYPE, EVENT_CALL_CONNECT_FAILURE);
    params.putString(EVENT_ERROR, callException.getMessage());
    params.putString(CALL_UUID, this.uuid);
    androidEventEmitter.sendEvent(CALL_EVENT_NAME, params);
  }

  @Override
  public void onRinging(@NonNull Call call) {
    WritableMap params = Arguments.createMap();
    params.putString(EVENT_TYPE, EVENT_CALL_RINGING);
    params.putString(CALL_UUID, this.uuid);
    androidEventEmitter.sendEvent(CALL_EVENT_NAME, params);
  }

  @Override
  public void onConnected(@NonNull Call call) {
    WritableMap params = Arguments.createMap();
    params.putString(EVENT_TYPE, EVENT_CALL_CONNECTED);
    params.putString(CALL_UUID, this.uuid);
    androidEventEmitter.sendEvent(CALL_EVENT_NAME, params);
  }

  @Override
  public void onReconnecting(@NonNull Call call, @NonNull CallException callException) {
    WritableMap params = Arguments.createMap();
    params.putString(EVENT_TYPE, EVENT_CALL_CONNECTED);
    params.putString(EVENT_ERROR, callException.getMessage());
    params.putString(CALL_UUID, this.uuid);
    androidEventEmitter.sendEvent(CALL_EVENT_NAME, params);
  }

  @Override
  public void onReconnected(@NonNull Call call) {
    WritableMap params = Arguments.createMap();
    params.putString(EVENT_TYPE, EVENT_CALL_RECONNECTED);
    params.putString(CALL_UUID, this.uuid);
    androidEventEmitter.sendEvent(CALL_EVENT_NAME, params);

  }

  @Override
  public void onDisconnected(@NonNull Call call, @Nullable CallException callException) {
    WritableMap params = Arguments.createMap();
    params.putString(EVENT_TYPE, EVENT_CALL_DISCONNECTED);
    params.putString(CALL_UUID, uuid);
    androidEventEmitter.sendEvent(CALL_EVENT_NAME, params);
  }
}
