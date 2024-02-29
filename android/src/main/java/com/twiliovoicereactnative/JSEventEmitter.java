package com.twiliovoicereactnative;

import android.util.Pair;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.lang.ref.WeakReference;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

class JSEventEmitter {
  private static final SDKLog logger = new SDKLog(JSEventEmitter.class);
  private WeakReference<ReactApplicationContext> context = new WeakReference<>(null);

  private static class JSEventRecord {
    public JSEventRecord(String eventName, WritableMap params) {
      this.eventName = eventName;
      this.params = params;
    }
    public final String eventName;
    public final WritableMap params;
  }

  public void setContext(ReactApplicationContext context) {
    this.context = new WeakReference<>(context);
  }
  public void sendEvent(String eventName, @Nullable WritableMap params) {
    logger.debug("sendEvent " + eventName + " params " + params);
    if ((null != context.get()) &&
        context.get().hasActiveReactInstance()) {
      context.get()
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
        .emit(eventName, params);
    } else {
      logger.warning(
        String.format(
          "attempt to flush events without context {%s} or Catalyst instance not active",
          context.get()));
    }
  }

  public static WritableArray constructJSArray(@NonNull Object...entries) {
    WritableArray params = Arguments.createArray();
    for (Object entry: entries) {
      if ((entry instanceof String)) {
        params.pushString((String)entry);
      } else if (entry instanceof ReadableMap) {
        params.pushMap((ReadableMap) entry);
      } else if (entry instanceof ReadableArray) {
        params.pushArray((ReadableArray) entry);
      } else if (entry instanceof Boolean) {
        params.pushBoolean((Boolean) entry);
      } else if (entry instanceof Integer) {
        params.pushInt((Integer) entry);
      } else if (entry instanceof Double) {
        params.pushDouble((Double)entry);
      }
    }
    return params;
  }
  @SafeVarargs
  public static WritableMap constructJSMap(@NonNull Pair<String, Object>...entries) {
    WritableMap params = Arguments.createMap();
    for (Pair<String, Object> entry: entries) {
      if ((entry.second instanceof String)) {
        params.putString(entry.first, (String) entry.second);
      } else if (entry.second instanceof ReadableMap) {
        params.putMap(entry.first, (ReadableMap) entry.second);
      } else if (entry.second instanceof ReadableArray) {
        params.putArray(entry.first, (ReadableArray) entry.second);
      } else if (entry.second instanceof Boolean) {
        params.putBoolean(entry.first, (Boolean) entry.second);
      } else if (entry.second instanceof Integer) {
        params.putInt(entry.first, (Integer) entry.second);
      } else if (entry.second instanceof Double) {
        params.putDouble(entry.first, (Double)entry.second);
      }
    }
    return params;
  }
}
