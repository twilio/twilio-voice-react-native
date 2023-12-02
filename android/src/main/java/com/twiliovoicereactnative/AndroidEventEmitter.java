package com.twiliovoicereactnative;

import android.util.Pair;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.lang.ref.WeakReference;

class AndroidEventEmitter {
  private static final SDKLog logger = new SDKLog(AndroidEventEmitter.class);
  private static AndroidEventEmitter instance;
  private WeakReference<ReactApplicationContext> context;

  public static AndroidEventEmitter getInstance() {
    if (AndroidEventEmitter.instance == null) {
      instance = new AndroidEventEmitter();
    }
    return instance;
  }
  public void setContext(ReactApplicationContext context) {
    this.context = new WeakReference<>(context);
  }
  public void sendEvent(String eventName, @Nullable WritableMap params) {
    logger.debug("sendEvent " + eventName + " params " + params);

    if ((null != context.get() && context.get().hasActiveReactInstance())) {
      context.get()
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
        .emit(eventName, params);
    } else {
      logger.warning(
        String.format(
          "attempt to sendEvent without context {%s} or Catalyst instance not active",
          context.get()));
    }
  }
  @SafeVarargs
  public static WritableMap constructJSEvent(@NonNull Pair<String, Object>...entries) {
    WritableMap params = Arguments.createMap();
    for (Pair<String, Object> entry: entries) {
      if ((entry.second instanceof String)) {
        params.putString(entry.first, (String)entry.second);
      } else if(entry.second instanceof ReadableMap) {
        params.putMap(entry.first, (ReadableMap)entry.second);
      } else if (entry.second instanceof ReadableArray) {
        params.putArray(entry.first, (ReadableArray)entry.second);
      }
    }
    return params;
  }
}
