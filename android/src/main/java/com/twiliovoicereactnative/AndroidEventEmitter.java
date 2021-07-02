package com.twiliovoicereactnative;

import androidx.annotation.Nullable;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import static com.twiliovoicereactnative.TwilioVoiceReactNativeModule.TAG;

public class AndroidEventEmitter {
  private ReactApplicationContext mContext;

  public static final String CALL_EVENT_NAME = "Call";
  public static final String VOICE_EVENT_NAME = "Voice";
  public static final String EVENT_TYPE = "type";
  public static final String EVENT_ERROR = "error";
  public static final String EVENT_CALL_RINGING = "ringing";
  public static final String EVENT_CALL_CONNECTED = "connected";
  public static final String EVENT_CALL_DISCONNECTED = "disconnected";
  public static final String EVENT_CALL_CONNECT_FAILURE = "connectFailure";
  public static final String EVENT_CALL_RECONNECTED = "reconnect";
  public static final String EVENT_CALL_RECONNECTING= "reconnecting";
  public static final String UUID_KEY = "uuid";
  public static final String ACTION_FCM_TOKEN_REQUEST = "ACTION_FCM_TOKEN_REQUEST";
  public static final String EVENT_REGISTERED = "registered";
  public static final String EVENT_UNREGISTERED = "unregistered";
  public static final String EVENT_CALL_INVITE = "callInvite";
  public static final String EVENT_CANCELLED_CALL_INVITE = "canceledCallInvite";


  public AndroidEventEmitter(ReactApplicationContext context) {
    mContext = context;
  }

  public void sendEvent(String eventName, @Nullable WritableMap params) {
    if (BuildConfig.DEBUG) {
      Log.d(TAG, "sendEvent "+eventName+" params "+params);
    }
    if (mContext.hasActiveCatalystInstance()) {
      mContext
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
        .emit(eventName, params);
    } else {
      if (BuildConfig.DEBUG) {
        Log.d(TAG, "failed Catalyst instance not active");
      }
    }
  }

}
