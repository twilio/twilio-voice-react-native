package com.twiliovoicereactnative;

import android.content.Context;
import android.util.Log;
import android.util.Pair;
import com.facebook.react.bridge.WritableMap;
import com.twilio.voice.RegistrationException;
import com.twilio.voice.RegistrationListener;
import com.twilio.voice.UnregistrationListener;

public class RegistrationListenerProxy {
  private static final String TAG = "RegistrationListenerProxy";

  public static RegistrationListener createRegistrationListener(Context context, ModuleProxy.UniversalPromise promise) {
    return new RegistrationListener() {
      @Override
      public void onRegistered(String accessToken, String fcmToken) {
        Log.d(TAG, "Successfully registered FCM");

        final WritableMap payload = JSEventEmitter.constructJSMap(
          new Pair(CommonConstants.VoiceEventType, CommonConstants.VoiceEventRegistered)
        );
        VoiceApplicationProxy.getJSEventEmitter().sendEvent(CommonConstants.ScopeVoice, payload);
        promise.resolve(null);
      }

      @Override
      public void onError(
        RegistrationException registrationException,
        String accessToken,
        String fcmToken
      ) {
        final String errorMessage = context.getString(
          R.string.registration_error,
          registrationException.getErrorCode(),
          registrationException.getMessage()
        );
        Log.e(TAG, errorMessage);

        final WritableMap payload = JSEventEmitter.constructJSMap(
          new Pair(
            CommonConstants.VoiceEventType,
            CommonConstants.VoiceEventError
          ),
          new Pair(
            CommonConstants.VoiceErrorKeyError,
            ReactNativeArgumentsSerializer.serializeVoiceException(registrationException)
          )
        );
        VoiceApplicationProxy.getJSEventEmitter().sendEvent(CommonConstants.ScopeVoice, payload);
        promise.rejectWithCode(
          registrationException.getErrorCode(),
          registrationException.getMessage()
        );
      }
    };
  }

  public static UnregistrationListener createUnregistrationListener(Context context, ModuleProxy.UniversalPromise promise) {
    return new UnregistrationListener() {
      @Override
      public void onUnregistered(String accessToken, String fcmToken) {
        Log.d(TAG, "Successfully unregistered FCM");
        final WritableMap payload = JSEventEmitter.constructJSMap(
          new Pair(CommonConstants.VoiceEventType, CommonConstants.VoiceEventUnregistered)
        );
        VoiceApplicationProxy.getJSEventEmitter().sendEvent(CommonConstants.ScopeVoice, payload);
        promise.resolve(null);
      }

      @Override
      public void onError(RegistrationException registrationException, String accessToken, String fcmToken) {
        final String errorMessage = context.getString(
          R.string.unregistration_error,
          registrationException.getErrorCode(),
          registrationException.getMessage()
        );
        Log.e(TAG, errorMessage);
        final WritableMap payload = JSEventEmitter.constructJSMap(
          new Pair(CommonConstants.VoiceEventType, CommonConstants.VoiceEventError),
          new Pair(CommonConstants.VoiceErrorKeyError, ReactNativeArgumentsSerializer.serializeVoiceException(registrationException))
        );
        VoiceApplicationProxy.getJSEventEmitter().sendEvent(CommonConstants.ScopeVoice, payload);
        promise.rejectWithCode(registrationException.getErrorCode(), registrationException.getMessage());
      }
    };
  }
}
