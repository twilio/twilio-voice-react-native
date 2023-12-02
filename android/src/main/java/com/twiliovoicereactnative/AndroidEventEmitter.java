package com.twiliovoicereactnative;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class AndroidEventEmitter {
  private static final SDKLog logger = new SDKLog(AndroidEventEmitter.class);
  private static AndroidEventEmitter instance;
  private ReactApplicationContext context;

  /**
   * Push notification registration.
   */
  public static final String ACTION_FCM_TOKEN_REQUEST = "ACTION_FCM_TOKEN_REQUEST";

  /**
   * Call keys.
   */
  public static final String EVENT_KEY_CALL_INFO = "call";
  public static final String EVENT_KEY_CALL_STATE = "state";

  /**
   * CallInvite event keys.
   */
  public static final String EVENT_KEY_CALL_INVITE_INFO = "callInvite";

  /**
   * CancelledCallInvite event keys.
   */
  public static final String EVENT_KEY_CANCELLED_CALL_INVITE_INFO = "cancelledCallInvite";

  public static AndroidEventEmitter getInstance() {
    if (AndroidEventEmitter.instance == null) {
      instance = new AndroidEventEmitter();
    }

    return instance;
  }

  public void setContext(ReactApplicationContext context) {
    this.context = context;
  }

  public void sendEvent(String eventName, @Nullable WritableMap params) {
    logger.debug("sendEvent " + eventName+" params " + params);

    if (context == null) {
      logger.warning("attempt to sendEvent without context");
      return;
    }

    if (!context.hasActiveReactInstance()) {
      logger.warning("failed Catalyst instance not active");
      return;
    }

    context
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
      .emit(eventName, params);
  }

}
