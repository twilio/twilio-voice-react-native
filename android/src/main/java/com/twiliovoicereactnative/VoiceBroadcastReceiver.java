package com.twiliovoicereactnative;

import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_CALL_INVITE_INFO;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_CANCELLED_CALL_INVITE_INFO;
import static com.twiliovoicereactnative.CommonConstants.ScopeVoice;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventCallInviteNotificationTapped;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventType;
import static com.twiliovoicereactnative.CommonConstants.VoiceErrorKeyError;
import static com.twiliovoicereactnative.CommonConstants.VoiceErrorKeyCode;
import static com.twiliovoicereactnative.CommonConstants.VoiceErrorKeyMessage;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventCallInvite;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventCallInviteAccepted;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventCallInviteCancelled;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventCallInviteRejected;
import static com.twiliovoicereactnative.ReactNativeArgumentsSerializer.*;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.util.Log;

import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.twilio.voice.Call;
import com.twilio.voice.CallInvite;
import com.twilio.voice.CancelledCallInvite;

public class VoiceBroadcastReceiver extends BroadcastReceiver {
  static final String TAG = "VoiceBroadcastReceiver";
  private static VoiceBroadcastReceiver instance;

  private String fcmToken;
  private ReactApplicationContext registeredContext;

  /**
   * Register this `VoiceBroadcastReceiver`.
   */
  private void register(ReactApplicationContext context) {
    IntentFilter intentFilter = new IntentFilter();
    intentFilter.addAction(Constants.ACTION_INCOMING_CALL);
    intentFilter.addAction(Constants.ACTION_CANCEL_CALL);
    intentFilter.addAction(Constants.ACTION_FCM_TOKEN);
    intentFilter.addAction(Constants.ACTION_ACCEPT);
    intentFilter.addAction(Constants.ACTION_REJECT);
    intentFilter.addAction(Constants.ACTION_PUSH_APP_TO_FOREGROUND_AND_MINIMIZE_NOTIFICATION);

    LocalBroadcastManager
      .getInstance(context)
      .registerReceiver(this, intentFilter);

    this.registeredContext = context;

    Log.d(TAG, "Successfully registered receiver");
  }

  /**
   * Unregister this `VoiceBroadcastReceiver`.
   */
  private void unregister() {
    if (this.registeredContext == null) {
      Log.d(TAG, "attempt to unregister from a null context");
      return;
    }

    LocalBroadcastManager
      .getInstance(this.registeredContext)
      .unregisterReceiver(this);

    Log.d(TAG, "Successfully unregistered receiver");
  }

  /**
   * Unregister this `VoiceBroadcastReceiver` if applicable and then register to the context.
   */
  public void setContext(ReactApplicationContext context) {
    this.unregister();
    this.register(context);
  }

  /**
   * Create and return a singleton `VoiceBroadcastReceiver`.
   */
  public static VoiceBroadcastReceiver getInstance() {
    if (instance == null) {
      instance = new VoiceBroadcastReceiver();
    }

    return instance;
  }

  @Override
  public void onReceive(Context context, Intent intent) {
    String action = intent.getAction();
    /*
     * Handle the incoming or cancelled call invite
     */
    Log.d(TAG, "Successfully received intent " + action);
    WritableMap params = Arguments.createMap();
    switch (action) {
      case Constants.ACTION_FCM_TOKEN:
        fcmToken = intent.getStringExtra(Constants.FCM_TOKEN);
        Log.d(TAG, "Successfully set token" + fcmToken);
        break;
      case Constants.ACTION_INCOMING_CALL: {
        Log.d(TAG, "Successfully received incoming notification");

        String uuid = intent.getStringExtra(Constants.UUID);
        CallInvite callInvite = intent.getParcelableExtra(Constants.INCOMING_CALL_INVITE);
        WritableMap callInviteInfo = serializeCallInvite(uuid, callInvite);

        params.putString(VoiceEventType, VoiceEventCallInvite);
        params.putMap(EVENT_KEY_CALL_INVITE_INFO, callInviteInfo);

        AndroidEventEmitter.getInstance().sendEvent(ScopeVoice, params);
        break;
      }
      case Constants.ACTION_ACCEPT: {
        Log.d(TAG, "Accepted call");

        String uuid = intent.getStringExtra(Constants.UUID);
        CallInvite callInvite = intent.getParcelableExtra(Constants.INCOMING_CALL_INVITE);
        WritableMap callInviteInfo = serializeCallInvite(uuid, callInvite);

        params.putString(VoiceEventType, VoiceEventCallInviteAccepted);
        params.putMap(EVENT_KEY_CALL_INVITE_INFO, callInviteInfo);

        AndroidEventEmitter.getInstance().sendEvent(ScopeVoice, params);

        if (Storage.callAcceptedPromiseMap.containsKey(uuid)) {
          Promise promise = Storage.callAcceptedPromiseMap.get(uuid);
          final Call call = Storage.callMap.get(uuid);
          final WritableMap callInfo = serializeCall(uuid, call);

          Storage.releaseCallInviteStorage(uuid, callInvite.getCallSid(), Storage.uuidNotificationIdMap.get(uuid), "accept");

          promise.resolve(callInfo);
        } else {
          Storage.releaseCallInviteStorage(uuid, callInvite.getCallSid(), Storage.uuidNotificationIdMap.get(uuid), "accept");
        }
        break;
      }
      case Constants.ACTION_REJECT:
        Log.d(TAG, "Rejected call");

        String uuid = intent.getStringExtra(Constants.UUID);
        CallInvite callInvite = intent.getParcelableExtra(Constants.INCOMING_CALL_INVITE);
        WritableMap callInviteInfo = serializeCallInvite(uuid, callInvite);

        params.putString(VoiceEventType, VoiceEventCallInviteRejected);
        params.putMap(EVENT_KEY_CALL_INVITE_INFO, callInviteInfo);

        AndroidEventEmitter.getInstance().sendEvent(ScopeVoice, params);

        if (Storage.callRejectPromiseMap.containsKey(uuid)) {
          Promise promise = Storage.callRejectPromiseMap.get(uuid);
          Storage.releaseCallInviteStorage(uuid, callInvite.getCallSid(), Storage.uuidNotificationIdMap.get(uuid), "reject");
          promise.resolve(uuid);
        } else {
          Storage.releaseCallInviteStorage(uuid, callInvite.getCallSid(), Storage.uuidNotificationIdMap.get(uuid), "reject");
        }
        break;
      case Constants.ACTION_CANCEL_CALL:
        Log.d(TAG, "Successfully received cancel notification");

        CancelledCallInvite cancelledCallInvite = intent.getParcelableExtra(Constants.CANCELLED_CALL_INVITE);
        int errorCode = intent.getIntExtra(VoiceErrorKeyCode, 0);
        String errorMessage = intent.getStringExtra(VoiceErrorKeyMessage);
        WritableMap cancelledCallInviteInfo = serializeCancelledCallInvite(cancelledCallInvite);

        params.putString(VoiceEventType, VoiceEventCallInviteCancelled);
        params.putMap(EVENT_KEY_CANCELLED_CALL_INVITE_INFO, cancelledCallInviteInfo);
        WritableMap error = Arguments.createMap();
        error.putInt(VoiceErrorKeyCode, errorCode);
        error.putString(VoiceErrorKeyMessage, errorMessage);
        params.putMap(VoiceErrorKeyError, error);

        AndroidEventEmitter.getInstance().sendEvent(ScopeVoice, params);
        break;
      case Constants.ACTION_PUSH_APP_TO_FOREGROUND_AND_MINIMIZE_NOTIFICATION:
        Log.d(TAG, "Successfully received ACTION_PUSH_APP_TO_FOREGROUND_AND_MINIMIZE_NOTIFICATION notification");
        // send some event to JS
        params.putString(VoiceEventType, VoiceEventCallInviteNotificationTapped);
        AndroidEventEmitter.getInstance().sendEvent(ScopeVoice, params);
        break;
      default:
        break;
    }
  }
}
