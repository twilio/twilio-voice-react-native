package com.twiliovoicereactnative;

import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_CALL_INVITE_INFO;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_CANCELLED_CALL_INVITE_INFO;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_ERROR;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_ERROR_CODE;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_ERROR_MESSAGE;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_TYPE;
import static com.twiliovoicereactnative.CommonConstants.SCOPE_VOICE;
import static com.twiliovoicereactnative.CommonConstants.VOICE_EVENT_CALL_INVITE;
import static com.twiliovoicereactnative.CommonConstants.VOICE_EVENT_CALL_INVITE_ACCEPTED;
import static com.twiliovoicereactnative.CommonConstants.VOICE_EVENT_CALL_INVITE_CANCELLED;
import static com.twiliovoicereactnative.CommonConstants.VOICE_EVENT_CALL_INVITE_REJECTED;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.util.Log;

import androidx.annotation.RequiresApi;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
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

  @RequiresApi(api = Build.VERSION_CODES.N)
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
        WritableMap callInviteInfo = TwilioVoiceReactNativeModule.getCallInviteInfo(uuid, callInvite);

        params.putString(EVENT_KEY_TYPE, VOICE_EVENT_CALL_INVITE);
        params.putMap(EVENT_KEY_CALL_INVITE_INFO, callInviteInfo);

        AndroidEventEmitter.getInstance().sendEvent(SCOPE_VOICE, params);
        break;
      }
      case Constants.ACTION_ACCEPT: {
        Log.d(TAG, "Accepted call");

        String uuid = intent.getStringExtra(Constants.UUID);
        CallInvite callInvite = intent.getParcelableExtra(Constants.INCOMING_CALL_INVITE);
        WritableMap callInviteInfo = TwilioVoiceReactNativeModule.getCallInviteInfo(uuid, callInvite);

        params.putString(EVENT_KEY_TYPE, VOICE_EVENT_CALL_INVITE_ACCEPTED);
        params.putMap(EVENT_KEY_CALL_INVITE_INFO, callInviteInfo);

        AndroidEventEmitter.getInstance().sendEvent(SCOPE_VOICE, params);
        break;
      }
      case Constants.ACTION_REJECT:
        Log.d(TAG, "Rejected call");

        String uuid = intent.getStringExtra(Constants.UUID);
        CallInvite callInvite = intent.getParcelableExtra(Constants.INCOMING_CALL_INVITE);
        WritableMap callInviteInfo = TwilioVoiceReactNativeModule.getCallInviteInfo(uuid, callInvite);

        params.putString(EVENT_KEY_TYPE, VOICE_EVENT_CALL_INVITE_REJECTED);
        params.putMap(EVENT_KEY_CALL_INVITE_INFO, callInviteInfo);

        AndroidEventEmitter.getInstance().sendEvent(SCOPE_VOICE, params);
        break;
      case Constants.ACTION_CANCEL_CALL:
        Log.d(TAG, "Successfully received cancel notification");

        CancelledCallInvite cancelledCallInvite = intent.getParcelableExtra(Constants.CANCELLED_CALL_INVITE);
        int errorCode = intent.getIntExtra(EVENT_KEY_ERROR_CODE, 0);
        String errorMessage = intent.getStringExtra(EVENT_KEY_ERROR_MESSAGE);
        WritableMap cancelledCallInviteInfo = TwilioVoiceReactNativeModule.getCancelledCallInviteInfo(cancelledCallInvite);

        params.putString(EVENT_KEY_TYPE, VOICE_EVENT_CALL_INVITE_CANCELLED);
        params.putMap(EVENT_KEY_CANCELLED_CALL_INVITE_INFO, cancelledCallInviteInfo);
        WritableMap error = Arguments.createMap();
        error.putInt(EVENT_KEY_ERROR_CODE, errorCode);
        error.putString(EVENT_KEY_ERROR_MESSAGE, errorMessage);
        params.putMap(EVENT_KEY_ERROR, error);

        AndroidEventEmitter.getInstance().sendEvent(SCOPE_VOICE, params);
        break;
      default:
        break;
    }
  }
}
