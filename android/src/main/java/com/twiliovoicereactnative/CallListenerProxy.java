package com.twiliovoicereactnative;

import android.content.Context;
import android.content.Intent;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

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
import static com.twiliovoicereactnative.ReactNativeArgumentsSerializer.*;

import java.util.Date;
import java.util.Set;

class CallListenerProxy implements Call.Listener {
  private final String uuid;
  private int notificationId;
  private final Context context;

  public CallListenerProxy(String uuid, Context context) {
    this.uuid = uuid;
    this.context = context;
  }

  @Override
  public void onConnectFailure(@NonNull Call call, @NonNull CallException callException) {
    log("onConnectFailure");

    MediaPlayerManager.getInstance(this.context).stop();
    AudioSwitchManager.getInstance(this.context).getAudioSwitch().deactivate();

    WritableMap params = Arguments.createMap();
    params.putString(VoiceEventType, CallEventConnectFailure);
    params.putMap(EVENT_KEY_CALL_INFO, serializeCall(uuid, call));
    WritableMap error = Arguments.createMap();
    error.putInt(VoiceErrorKeyCode, callException.getErrorCode());
    error.putString(VoiceErrorKeyMessage, callException.getMessage());
    params.putMap(VoiceErrorKeyError, error);
    AndroidEventEmitter.getInstance().sendEvent(ScopeCall, params);

    cancelNotification();

    Storage.callMap.remove(uuid);
  }

  @Override
  public void onRinging(@NonNull Call call) {
    log("onRinging");

    this.notificationId = (int) System.currentTimeMillis();
    MediaPlayerManager mediaPlayerManager = MediaPlayerManager.getInstance(context);
    mediaPlayerManager.play(context, MediaPlayerManager.SoundTable.RINGTONE);

    WritableMap params = Arguments.createMap();
    params.putString(VoiceEventType, CallEventRinging);
    params.putMap(EVENT_KEY_CALL_INFO, serializeCall(uuid, call));
    AndroidEventEmitter.getInstance().sendEvent(ScopeCall, params);

    raiseNotification(call);
  }

  @Override
  public void onConnected(@NonNull Call call) {
    log("onConnected");

    MediaPlayerManager.getInstance(this.context).stop();

    Storage.callConnectMap.put(uuid, (double) new Date().getTime());

    WritableMap params = Arguments.createMap();
    params.putString(VoiceEventType, CallEventConnected);
    params.putMap(EVENT_KEY_CALL_INFO, serializeCall(uuid, call));
    AndroidEventEmitter.getInstance().sendEvent(ScopeCall, params);
  }

  @Override
  public void onReconnecting(@NonNull Call call, @NonNull CallException callException) {
    log("onReconnecting");

    WritableMap params = Arguments.createMap();
    params.putString(VoiceEventType, CallEventReconnecting);
    params.putMap(EVENT_KEY_CALL_INFO, serializeCall(uuid, call));
    WritableMap error = Arguments.createMap();
    error.putInt(VoiceErrorKeyCode, callException.getErrorCode());
    error.putString(VoiceErrorKeyMessage, callException.getMessage());
    params.putMap(VoiceErrorKeyError, error);
    AndroidEventEmitter.getInstance().sendEvent(ScopeCall, params);
  }

  @Override
  public void onReconnected(@NonNull Call call) {
    log("onReconnected");

    WritableMap params = Arguments.createMap();
    params.putString(VoiceEventType, CallEventReconnected);
    params.putMap(EVENT_KEY_CALL_INFO, serializeCall(uuid, call));
    AndroidEventEmitter.getInstance().sendEvent(ScopeCall, params);
  }

  @Override
  public void onDisconnected(@NonNull Call call, @Nullable CallException callException) {
    log("onDisconnected");
    MediaPlayerManager mediaPlayerManager = MediaPlayerManager.getInstance(this.context);

    mediaPlayerManager.stop();
    mediaPlayerManager.play(context, MediaPlayerManager.SoundTable.DISCONNECT);
    AudioSwitchManager.getInstance(this.context).getAudioSwitch().deactivate();

    WritableMap params = Arguments.createMap();
    params.putString(VoiceEventType, CallEventDisconnected);
    params.putMap(EVENT_KEY_CALL_INFO, serializeCall(uuid, call));
    if (callException != null) {
      WritableMap error = Arguments.createMap();
      error.putInt(VoiceErrorKeyCode, callException.getErrorCode());
      error.putString(VoiceErrorKeyMessage, callException.getMessage());
      params.putMap(VoiceErrorKeyError, error);
    }
    AndroidEventEmitter.getInstance().sendEvent(ScopeCall, params);

    cancelNotification();
    Storage.callMap.remove(uuid);
  }

  @Override
  public void onCallQualityWarningsChanged(@NonNull Call call,
                                           @NonNull Set<Call.CallQualityWarning> currentWarnings,
                                           @NonNull Set<Call.CallQualityWarning> previousWarnings) {
    log("onCallQualityWarningsChanged");

    WritableMap params = Arguments.createMap();
    params.putString(VoiceEventType, CallEventQualityWarningsChanged);
    params.putMap(EVENT_KEY_CALL_INFO, serializeCall(uuid, call));

    WritableArray currentWarningsArray = Arguments.createArray();
    for (Call.CallQualityWarning warning : currentWarnings) {
      currentWarningsArray.pushString(warning.toString());
    }
    params.putArray(CallEventCurrentWarnings, currentWarningsArray);

    WritableArray previousWarningsArray = Arguments.createArray();
    for (Call.CallQualityWarning warning : previousWarnings) {
      previousWarningsArray.pushString(warning.toString());
    }
    params.putArray(CallEventPreviousWarnings, previousWarningsArray);
    AndroidEventEmitter.getInstance().sendEvent(ScopeCall, params);
  }

  private void cancelNotification() {
    Intent intent = new Intent(context, VoiceNotificationReceiver.class);
    intent.setAction(Constants.ACTION_CANCEL_NOTIFICATION);
    intent.putExtra(Constants.UUID, uuid);
    intent.putExtra(Constants.CALL_SID_KEY, Storage.uuidNotificationIdMap.get(uuid));
    context.sendBroadcast(intent);
  }

  private void raiseNotification(Call call) {
    Intent intent = new Intent(context, VoiceNotificationReceiver.class);
    intent.setAction(Constants.ACTION_RAISE_OUTGOING_CALL_NOTIFICATION);
    intent.putExtra(Constants.UUID, uuid);
    intent.putExtra(Constants.CALL_SID_KEY, call.getSid());
    Storage.uuidNotificationIdMap.put(uuid, this.notificationId);
    context.sendBroadcast(intent);
  }

  private static void log(final String message) {
    Log.d(CallListenerProxy.class.getSimpleName(), message);
  }
}
