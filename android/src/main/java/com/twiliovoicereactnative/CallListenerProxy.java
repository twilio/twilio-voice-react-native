package com.twiliovoicereactnative;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import android.util.Log;

import com.twilio.voice.Call;
import com.twilio.voice.CallException;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import android.content.Intent;
import android.content.Context;
import com.facebook.react.bridge.ReactApplicationContext;

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
  private final Context reactContext;

  public CallListenerProxy(String uuid, Context reactContext) {
    this.uuid = uuid;
    this.reactContext = reactContext;
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
    if (androidEventEmitter != null) {
      WritableMap params = Arguments.createMap();
      params.putString(EVENT_KEY_TYPE, EVENT_TYPE_CALL_CONNECT_FAILURE);
      params.putString(EVENT_KEY_ERROR, callException.getMessage());
      params.putMap(EVENT_KEY_CALL_INFO, getCallInfo(uuid, call));
      androidEventEmitter.sendEvent(CALL_EVENT_NAME, params);
    }
    cancelNotification();
  }

  @Override
  public void onRinging(@NonNull Call call) {
    Log.d(TAG, "onRinging");
    final int notificationId = (int) System.currentTimeMillis();
    if (androidEventEmitter != null) {
      WritableMap params = Arguments.createMap();
      params.putString(EVENT_KEY_TYPE, EVENT_TYPE_CALL_RINGING);
      params.putMap(EVENT_KEY_CALL_INFO, getCallInfo(uuid, call));
      androidEventEmitter.sendEvent(CALL_EVENT_NAME, params);
    }
    raiseNotification(notificationId, call);
  }

  @Override
  public void onConnected(@NonNull Call call) {
    Log.d(TAG, "onConnected");
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
    if (androidEventEmitter != null) {
      WritableMap params = Arguments.createMap();
      params.putString(EVENT_KEY_TYPE, EVENT_TYPE_CALL_DISCONNECTED);
      params.putMap(EVENT_KEY_CALL_INFO, getCallInfo(uuid, call));
      androidEventEmitter.sendEvent(CALL_EVENT_NAME, params);
    }
    cancelNotification();
   }

   private void cancelNotification() {
     Intent intent = new Intent(reactContext, IncomingCallNotificationService.class);
     intent.setAction(Constants.ACTION_CANCEL_NOTIFICATION);
     intent.putExtra(Constants.UUID, this.uuid);
     intent.putExtra(Constants.CALL_SID_KEY, Storage.uuidNotificaionIdMap.get(this.uuid));

     reactContext.startService(intent);
   }

  private void raiseNotification(int notificationId, Call call) {
    Log.d(TAG, "Raising call in progress notifiation uuid:" + uuid + " notificationId: " + notificationId);
    Intent intent = new Intent(reactContext, IncomingCallNotificationService.class);
    intent.setAction(Constants.ACTION_OUTGOING_CALL);
    intent.putExtra(Constants.UUID, this.uuid);
    intent.putExtra(Constants.NOTIFICATION_ID, notificationId);
    intent.putExtra(Constants.CALL_SID_KEY, call.getSid());
    Storage.uuidNotificaionIdMap.put(uuid, notificationId);
    reactContext.startService(intent);
  }
}
