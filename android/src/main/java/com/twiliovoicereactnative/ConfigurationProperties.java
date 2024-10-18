package com.twiliovoicereactnative;

import android.content.Context;

class ConfigurationProperties {
  public static boolean isFirebaseServiceEnabled(Context context) {
    return context.getResources()
      .getBoolean(R.bool.twiliovoicereactnative_firebasemessagingservice_enabled);
  }
}
