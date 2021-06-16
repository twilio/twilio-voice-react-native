package com.twiliovoicereactnative;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import android.util.Log;

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

import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_DEVICE_READY;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_DEVICE_NOT_READY;

@ReactModule(name = TwilioVoiceReactNativeModule.TAG)
public class TwilioVoiceReactNativeModule extends ReactContextBaseJavaModule {
  public static final String TAG = "TwilioVoiceReactNative";
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
        androidEventEmitter.sendEvent(EVENT_DEVICE_READY, null);
      }

      @Override
      public void onError(RegistrationException error, String accessToken, String fcmToken) {
        Log.e(TAG, String.format("Registration Error: %d, %s", error.getErrorCode(), error.getMessage()));
        WritableMap params = Arguments.createMap();
        params.putString("err", error.getMessage());
        androidEventEmitter.sendEvent(EVENT_DEVICE_NOT_READY, params);
      }
    };
  }

  private Call.Listener callListener() {
    return new Call.Listener() {

      @Override
      public void onConnectFailure(@NonNull Call call, @NonNull CallException callException) {

      }

      @Override
      public void onRinging(@NonNull Call call) {

      }

      @Override
      public void onConnected(@NonNull Call call) {

      }

      @Override
      public void onReconnecting(@NonNull Call call, @NonNull CallException callException) {

      }

      @Override
      public void onReconnected(@NonNull Call call) {

      }

      @Override
      public void onDisconnected(@NonNull Call call, @Nullable CallException callException) {

      }
    };

  }

  @ReactMethod
  public void voice_connect(String accessToken, ReadableMap params, Promise promise) {
    HashMap<String, String> twiMLParams = new HashMap<>();
    twiMLParams.put("To", "alice");
    twiMLParams.put("Type", "client");
    twiMLParams.put("From", "client:kumkum");
    twiMLParams.put("Mode", "Voice");
    twiMLParams.put("PhoneNumber", "alice");
    twiMLParams.put("answer_on_bridge", "true");

    ConnectOptions connectOptions = new ConnectOptions.Builder(accessToken)
      .enableDscp(true)
      .params(twiMLParams)
      .build();

    Voice.connect(getReactApplicationContext(), connectOptions, callListener());
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
    promise.resolve(uuid);
  }
}
