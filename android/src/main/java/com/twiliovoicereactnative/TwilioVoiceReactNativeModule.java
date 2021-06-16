package com.twiliovoicereactnative;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

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
import java.util.HashMap;
import java.util.UUID;

@ReactModule(name = TwilioVoiceReactNativeModule.NAME)
public class TwilioVoiceReactNativeModule extends ReactContextBaseJavaModule {
    public static final String NAME = "TwilioVoiceReactNative";

    public TwilioVoiceReactNativeModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    @NonNull
    public String getName() {
        return NAME;
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
