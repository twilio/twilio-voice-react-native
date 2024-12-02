package com.twiliovoicereactnative;

import android.content.Context;

class ConfigurationProperties {
  private static String incomingCallContactHandleTemplate = null;

  public static void setIncomingCallContactHandleTemplate(String template) {
    ConfigurationProperties.incomingCallContactHandleTemplate = template;
  }

  public static String getIncomingCallContactHandleTemplate() {
    return ConfigurationProperties.incomingCallContactHandleTemplate;
  }

  /**
   * Get configuration boolean, used to determine if the built-in Firebase service should be enabled
   * or not.
   * @param context the application context
   * @return a boolean read from the application resources
   */
  public static boolean isFirebaseServiceEnabled(Context context) {
    return context.getResources()
      .getBoolean(R.bool.twiliovoicereactnative_firebasemessagingservice_enabled);
  }
}
