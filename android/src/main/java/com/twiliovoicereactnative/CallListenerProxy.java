package com.twiliovoicereactnative;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import android.content.Context;
import android.util.Log;

import com.twilio.voice.Call;
import com.twilio.voice.CallException;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

import static com.twiliovoicereactnative.AndroidEventEmitter.CALL_EVENT_NAME;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_TYPE;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_ERROR;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_TYPE_CALL_RINGING;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_TYPE_CALL_CONNECTED;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_TYPE_CALL_DISCONNECTED;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_TYPE_CALL_CONNECT_FAILURE;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_TYPE_CALL_RECONNECTED;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_TYPE_CALL_RECONNECTING;

import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_UUID;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_CALL_INFO;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_CALL_SID;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_CALL_FROM;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_CALL_TO;

import static com.twiliovoicereactnative.Storage.androidEventEmitter;

class CallListenerProxy implements Call.Listener {
  static final String TAG = "CallListenerProxy";
  private final String uuid;
  private Context context;

  public CallListenerProxy(String uuid) {
    this.uuid = uuid;
  }

  public CallListenerProxy(String uuid, Context context) {
    this.uuid = uuid;
    this.context = context;
  }

  private WritableMap getCallInfo(String uuid, Call call) {
    WritableMap callInfo = Arguments.createMap();
    callInfo.putString(EVENT_KEY_UUID, uuid);
    callInfo.putString(EVENT_KEY_CALL_SID, call.getSid());
    callInfo.putString(EVENT_KEY_CALL_FROM, call.getFrom());
    callInfo.putString(EVENT_KEY_CALL_TO, call.getTo());
    return callInfo;
  }

  @Override
  public void onConnectFailure(@NonNull Call call, @NonNull CallException callException) {
    Log.d(TAG, "onConnectFailure");
    SoundPoolManager.getInstance(this.context).stopRinging();
    if (androidEventEmitter != null) {
      WritableMap params = Arguments.createMap();
      params.putString(EVENT_KEY_TYPE, EVENT_TYPE_CALL_CONNECT_FAILURE);
      params.putString(EVENT_KEY_ERROR, callException.getMessage());
      params.putMap(EVENT_KEY_CALL_INFO, getCallInfo(uuid, call));
      androidEventEmitter.sendEvent(CALL_EVENT_NAME, params);
    }
    Storage.callMap.remove(uuid);
  }

  @Override
  public void onRinging(@NonNull Call call) {
    Log.d(TAG, "onRinging");
    SoundPoolManager.getInstance(this.context).playRinging();
    if (androidEventEmitter != null) {
      WritableMap params = Arguments.createMap();
      params.putString(EVENT_KEY_TYPE, EVENT_TYPE_CALL_RINGING);
      params.putMap(EVENT_KEY_CALL_INFO, getCallInfo(uuid, call));
      androidEventEmitter.sendEvent(CALL_EVENT_NAME, params);
    }
  }

  @Override
  public void onConnected(@NonNull Call call) {
    Log.d(TAG, "onConnected");
    SoundPoolManager.getInstance(this.context).stopRinging();
    if (androidEventEmitter != null) {
      WritableMap params = Arguments.createMap();
      params.putString(EVENT_KEY_TYPE, EVENT_TYPE_CALL_CONNECTED);
      params.putMap(EVENT_KEY_CALL_INFO, getCallInfo(uuid, call));
      androidEventEmitter.sendEvent(CALL_EVENT_NAME, params);
    }
  }

  @Override
  public void onReconnecting(@NonNull Call call, @NonNull CallException callException) {
    Log.d(TAG, "onReconnecting");
    if (androidEventEmitter != null) {
      WritableMap params = Arguments.createMap();
      params.putString(EVENT_KEY_TYPE, EVENT_TYPE_CALL_RECONNECTING);
      params.putString(EVENT_KEY_ERROR, callException.getMessage());
      params.putMap(EVENT_KEY_CALL_INFO, getCallInfo(uuid, call));
      androidEventEmitter.sendEvent(CALL_EVENT_NAME, params);
    }
  }

  @Override
  public void onReconnected(@NonNull Call call) {
    Log.d(TAG, "onReconnected");
    if (androidEventEmitter != null) {
      WritableMap params = Arguments.createMap();
      params.putString(EVENT_KEY_TYPE, EVENT_TYPE_CALL_RECONNECTED);
      params.putMap(EVENT_KEY_CALL_INFO, getCallInfo(uuid, call));
      androidEventEmitter.sendEvent(CALL_EVENT_NAME, params);
    }
  }

  @Override
  public void onDisconnected(@NonNull Call call, @Nullable CallException callException) {
    Log.d(TAG, "onDisconnected");
    SoundPoolManager.getInstance(this.context).stopRinging();
    SoundPoolManager.getInstance(this.context).playDisconnect();
    if (androidEventEmitter != null) {
      WritableMap params = Arguments.createMap();
      params.putString(EVENT_KEY_TYPE, EVENT_TYPE_CALL_DISCONNECTED);
      params.putMap(EVENT_KEY_CALL_INFO, getCallInfo(uuid, call));
      androidEventEmitter.sendEvent(CALL_EVENT_NAME, params);
    }
    Storage.callMap.remove(uuid);
  }
}
