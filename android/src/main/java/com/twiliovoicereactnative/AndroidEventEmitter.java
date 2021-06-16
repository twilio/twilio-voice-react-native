package com.twiliovoicereactnative;

import androidx.annotation.Nullable;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import static com.twiliovoicereactnative.TwilioVoiceReactNativeModule.TAG;

public class AndroidEventEmitter {
  private ReactApplicationContext mContext;

  public static final String EVENT_PROXIMITY = "proximity";

  public static final String EVENT_DEVICE_READY = "deviceReady";
  public static final String EVENT_DEVICE_NOT_READY = "deviceNotReady";

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
