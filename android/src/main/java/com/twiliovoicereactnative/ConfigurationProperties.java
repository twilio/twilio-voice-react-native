package com.twiliovoicereactnative;

import android.content.Context;
import android.content.SharedPreferences;

class ConfigurationProperties {
  public static void setIncomingCallContactHandleTemplate(Context ctx, String template) {
    SharedPreferences sharedPreferences = ctx.getSharedPreferences(Constants.PREFERENCES_FILE, Context.MODE_PRIVATE);
    sharedPreferences
      .edit()
      .putString(Constants.INCOMING_CALL_CONTACT_HANDLE_TEMPLATE_PREFERENCES_KEY, template)
      .apply();
  }

  public static String getIncomingCallContactHandleTemplate(Context ctx) {
    SharedPreferences sharedPreferences = ctx.getSharedPreferences(Constants.PREFERENCES_FILE, Context.MODE_PRIVATE);
    return sharedPreferences.getString(Constants.INCOMING_CALL_CONTACT_HANDLE_TEMPLATE_PREFERENCES_KEY, null);
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

  /**
   * Get configuration boolean, used to determine if full screen notifications are enabled
   * or not.
   * @param context the application context
   * @return a boolean read from the application resources
   */
  public static boolean isFullScreenNotificationEnabled(Context context) {
    return context.getResources()
      .getBoolean(R.bool.twiliovoicereactnative_fullscreennotification_enabled);
  }
}
