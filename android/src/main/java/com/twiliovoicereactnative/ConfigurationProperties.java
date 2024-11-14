package com.twiliovoicereactnative;

import android.content.Context;

class ConfigurationProperties {
  private static String incomingNotificationTemplate = null;
  private static String outgoingNotificationTemplate = null;
  private static String answeredNotificationTemplate = null;

  public static void setIncomingNotificationTemplate(String incomingNotificationTemplate) {
    ConfigurationProperties.incomingNotificationTemplate = incomingNotificationTemplate;
  }

  public static String getIncomingNotificationTemplate() {
    return ConfigurationProperties.incomingNotificationTemplate;
  }

  public static void setOutgoingNotificationTemplate(String outgoingNotificationTemplate) {
    ConfigurationProperties.outgoingNotificationTemplate = outgoingNotificationTemplate;
  }

  public static String getOutgoingNotificationTemplate() {
    return ConfigurationProperties.outgoingNotificationTemplate;
  }

  public static void setAnsweredNotificationTemplate(String answeredNotificationTemplate) {
    ConfigurationProperties.answeredNotificationTemplate = answeredNotificationTemplate;
  }

  public static String getAnsweredNotificationTemplate() {
    return ConfigurationProperties.answeredNotificationTemplate;
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
