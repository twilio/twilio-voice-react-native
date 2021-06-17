package com.twiliovoicereactnative;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import android.util.Log;

import java.util.Map;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.twilio.voice.Voice;
import com.twilio.voice.Call;
import com.twilio.voice.CallException;
import com.twilio.voice.ConnectOptions;
import com.twilio.voice.RegistrationException;
import com.twilio.voice.RegistrationListener;
import com.twilio.voice.LogLevel;

import java.util.HashMap;
import java.util.UUID;


import static com.twiliovoicereactnative.AndroidEventEmitter.CALL_EVENT_NAME;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_TYPE;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_ERROR;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_CALL_RINGING;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_CALL_CONNECTED;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_CALL_DISCONNECTED;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_CALL_CONNECT_FAILURE;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_CALL_RECONNECTED;

@ReactModule(name = TwilioVoiceReactNativeModule.TAG)
public class TwilioVoiceReactNativeModule extends ReactContextBaseJavaModule {
  public static final String TAG = "TwilioVoiceReactNative";
  static final Map<String, Call> callMap = new HashMap<>();

  private AndroidEventEmitter androidEventEmitter;


  public TwilioVoiceReactNativeModule(ReactApplicationContext reactContext) {
    super(reactContext);
    if (BuildConfig.DEBUG) {
      Voice.setLogLevel(LogLevel.DEBUG);
    } else {
      Voice.setLogLevel(LogLevel.ERROR);
    }

    androidEventEmitter = new AndroidEventEmitter(reactContext);
  }

  @Override
  @NonNull
  public String getName() {
    return TAG;
  }

  private RegistrationListener registrationListener() {
    return new RegistrationListener() {
      @Override
      public void onRegistered(String accessToken, String fcmToken) {
        if (BuildConfig.DEBUG) {
          Log.d(TAG, "Successfully registered FCM");
        }
        //androidEventEmitter.sendEvent(EVENT_DEVICE_READY, null);
      }

      @Override
      public void onError(RegistrationException error, String accessToken, String fcmToken) {
        Log.e(TAG, String.format("Registration Error: %d, %s", error.getErrorCode(), error.getMessage()));
        WritableMap params = Arguments.createMap();
        params.putString("err", error.getMessage());
        //androidEventEmitter.sendEvent(EVENT_DEVICE_NOT_READY, params);
      }
    };
  }

  @ReactMethod
  public void voice_connect(String uuid, String accessToken, ReadableMap params, Promise promise) {
    Log.e(TAG, String.format("Calling voice_connect"));
    HashMap<String, String> twiMLParams = new HashMap<>();
    twiMLParams.put("To", "bob");
    twiMLParams.put("Type", "client");
    twiMLParams.put("From", "client:react_native_android");
    twiMLParams.put("Mode", "Voice");
    twiMLParams.put("PhoneNumber", "bob");
    twiMLParams.put("answer_on_bridge", "true");

    ConnectOptions connectOptions = new ConnectOptions.Builder(accessToken)
      .enableDscp(true)
      .params(twiMLParams)
      .build();

    Call call = Voice.connect(getReactApplicationContext(), connectOptions, new CallListenerProxy(uuid, androidEventEmitter));
    callMap.put(uuid, call);
    promise.resolve(uuid);
  }

  @ReactMethod
  public void call_mute(String callUUID, Promise promise) {
    // Get the call object through the UUID mapping.
    // Mute the call.
  }

  @ReactMethod
  public void voice_getVersion(Promise promise) {
    String version = Voice.getVersion();
    promise.resolve(version);
  }

  @ReactMethod
  public void util_generateId(Promise promise) {
    UUID uuid = UUID.randomUUID();
    promise.resolve(uuid.toString());
  }

  @ReactMethod
  public void call_disconnect(String uuid) {
    Call activeCall = callMap.get(uuid);
    if (activeCall != null) {
      activeCall.disconnect();
      activeCall = null;
    }
  }

  @ReactMethod
  public String call_getFrom(String uuid) {
    Call activeCall = callMap.get(uuid);
    String from = (activeCall != null) ? activeCall.getFrom() : null;
    return from;
  }

  @ReactMethod
  public String call_getTo(String uuid) {
    Call activeCall = callMap.get(uuid);
    String to = (activeCall != null) ? activeCall.getTo() : null;
    return to;
  }

  @ReactMethod
  public String call_getSid(String uuid) {
    Call activeCall = callMap.get(uuid);
    String sid = (activeCall != null) ? activeCall.getSid() : null;
    return sid;
  }

  @ReactMethod
  public String call_getState(String uuid) {
    Call activeCall = callMap.get(uuid);
    String state = (activeCall != null) ? activeCall.getState().toString() : null;
    return state;
  }

  @ReactMethod
  public void call_hold(String uuid, boolean hold) {
    Call activeCall = callMap.get(uuid);
    if (activeCall != null) {
      activeCall.hold(hold);
    }
  }

  @ReactMethod
  public void call_mute(String uuid, boolean mute) {
    Call activeCall = callMap.get(uuid);
    if (activeCall != null) {
      activeCall.mute(mute);
    }
  }

  @ReactMethod
  public void call_sendDigits(String uuid, String digits) {
    Call activeCall = callMap.get(uuid);
    if (activeCall != null) {
      activeCall.sendDigits(digits);
    }
  }

}
