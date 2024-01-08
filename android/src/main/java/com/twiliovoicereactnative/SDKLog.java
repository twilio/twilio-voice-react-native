package com.twiliovoicereactnative;

import android.util.Log;

class SDKLog {
  private final String logTag;
  public SDKLog(Class<?> clazz) {
    logTag = clazz.getSimpleName();
  }

  public void debug(final String message) {
    if (BuildConfig.DEBUG) {
      Log.d(logTag, message);
    }
  }

  public void log(final String message) {
    Log.i(logTag, message);
  }

  public void warning(final String message) {
    Log.w(logTag, message);
  }

  public void error(final String message) {
    Log.e(logTag, message);
  }
}
