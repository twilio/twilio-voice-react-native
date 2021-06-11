package com.twiliovoicereactnative;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.modules.core.DeviceEventManagerModule;

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


    @ReactMethod
    public void connect(String token, ReadableMap params) {
        // Create a new call object here, generate it a UUID.
        // Store in some global mapping the UUID to the new call object.
        // Bind event emitter such that all call events are scoped to that UUID.

        // For example:
        // When call.onConnected
        // Emit "CallEvent" with UUID as parameter.
    }

    @ReactMethod
    public void callMute(String callUUID) {
        // Get the call object through the UUID mapping.
        // Mute the call.
    }
}
