package com.twiliovoicereactnative;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import android.util.Log;

import java.util.Map;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.twilio.voice.Voice;
import com.twilio.voice.Call;
import com.twilio.voice.CallException;
import com.twilio.voice.ConnectOptions;
import com.twilio.voice.RegistrationException;
import com.twilio.voice.RegistrationListener;
import com.twilio.voice.UnregistrationListener;
import com.twilio.voice.LogLevel;

import java.util.HashMap;
import java.util.UUID;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.iid.InstanceIdResult;


import static com.twiliovoicereactnative.AndroidEventEmitter.ACTION_FCM_TOKEN_REQUEST;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_REGISTERED;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_UNREGISTERED;
import static com.twiliovoicereactnative.AndroidEventEmitter.VOICE_EVENT_NAME;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_TYPE;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_ERROR;

@ReactModule(name = TwilioVoiceReactNativeModule.TAG)
public class TwilioVoiceReactNativeModule extends ReactContextBaseJavaModule {
  static final String TAG = "TwilioVoiceReactNative";
  static final Map<String, Call> callMap = new HashMap<>();
  private String fcmToken;
  private AndroidEventEmitter androidEventEmitter;
  private VoiceBroadcastReceiver voiceBroadcastReceiver;
  private final ReactApplicationContext reactContext;
  RegistrationListener registrationListener = registrationListener();
  UnregistrationListener unregistrationListener = unregistrationListener();

  public TwilioVoiceReactNativeModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
    if (BuildConfig.DEBUG) {
      Voice.setLogLevel(LogLevel.DEBUG);
    } else {
      Voice.setLogLevel(LogLevel.ERROR);
    }

    androidEventEmitter = new AndroidEventEmitter(reactContext);
    voiceBroadcastReceiver = new VoiceBroadcastReceiver();
    registerReceiver();
  }

  private void registerReceiver() {
    IntentFilter intentFilter = new IntentFilter();
    intentFilter.addAction(Constants.ACTION_INCOMING_CALL);
    intentFilter.addAction(Constants.ACTION_CANCEL_CALL);
    intentFilter.addAction(Constants.ACTION_FCM_TOKEN);
    LocalBroadcastManager.getInstance(reactContext).registerReceiver(
      voiceBroadcastReceiver, intentFilter);
    Log.d(TAG, "Successfully registerReceiver");
  }

  private class VoiceBroadcastReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
      String action = intent.getAction();
      /*
       * Handle the incoming or cancelled call invite
       */
      Log.d(TAG, "Successfully received intent" + action);
      switch (action) {
        case Constants.ACTION_FCM_TOKEN:
          fcmToken = intent.getStringExtra(Constants.FCM_TOKEN);
          Log.d(TAG, "Successfully set token" + fcmToken);
          break;
        default:
          break;
      }
      //Voice.register("accessToken", Voice.RegistrationChannel.FCM, "fcmToken", registrationListener);
    }
  }

  @Override
  @NonNull
  public String getName() {
    return TAG;
  }

  private RegistrationListener registrationListener() {
    return new RegistrationListener() {
      @Override
      public void onRegistered(String accessToken, String fcmToken) {
        Log.d(TAG, "Successfully registered FCM");
        WritableMap params = Arguments.createMap();
        params.putString(EVENT_TYPE, EVENT_REGISTERED);
        androidEventEmitter.sendEvent(VOICE_EVENT_NAME, params);
      }

      @Override
      public void onError(RegistrationException error, String accessToken, String fcmToken) {
        Log.e(TAG, String.format("Registration Error: %d, %s", error.getErrorCode(), error.getMessage()));
        WritableMap params = Arguments.createMap();
        params.putString(EVENT_TYPE, EVENT_ERROR);
        androidEventEmitter.sendEvent(VOICE_EVENT_NAME, params);
      }
    };
  }

  private UnregistrationListener unregistrationListener() {
    return new UnregistrationListener() {
      @Override
      public void onUnregistered(String accessToken, String fcmToken) {
        Log.d(TAG, "Successfully unregistered FCM");
        WritableMap params = Arguments.createMap();
        params.putString(EVENT_TYPE, EVENT_UNREGISTERED);
        androidEventEmitter.sendEvent(VOICE_EVENT_NAME, params);
      }

      @Override
      public void onError(RegistrationException registrationException, String accessToken, String fcmToken) {
        Log.e(TAG, String.format("unregistration Error: %d, %s", registrationException.getErrorCode(), registrationException.getMessage()));
        WritableMap params = Arguments.createMap();
        params.putString(EVENT_TYPE, EVENT_ERROR);
        androidEventEmitter.sendEvent(VOICE_EVENT_NAME, params);
      }
    };
  }

  @ReactMethod
  public void voice_connect(String uuid, String accessToken, ReadableMap params, Promise promise) {
    Log.e(TAG, String.format("Calling voice_connect"));
    HashMap<String, String> twiMLParams = new HashMap<>();
    twiMLParams.put("To", "bob");
    twiMLParams.put("Type", "client");
    twiMLParams.put("From", "client:react_native_android");
    twiMLParams.put("Mode", "Voice");
    twiMLParams.put("PhoneNumber", "bob");
    twiMLParams.put("answer_on_bridge", "true");

    ConnectOptions connectOptions = new ConnectOptions.Builder(accessToken)
      .enableDscp(true)
      .params(twiMLParams)
      .build();

    Call call = Voice.connect(getReactApplicationContext(), connectOptions, new CallListenerProxy(uuid, androidEventEmitter));
    callMap.put(uuid, call);
    promise.resolve(uuid);
  }

  @ReactMethod
  public void voice_getVersion(Promise promise) {
    promise.resolve(Voice.getVersion());
  }

  @ReactMethod
  public void util_generateId(Promise promise) {
    UUID uuid = UUID.randomUUID();
    promise.resolve(uuid.toString());
  }

  @ReactMethod
  public void call_disconnect(String uuid) {
    Call activeCall = callMap.get(uuid);
    if (activeCall != null) {
      activeCall.disconnect();
      activeCall = null;
    }
  }

  @ReactMethod
  public void call_getFrom(String uuid, Promise promise) {
    Call activeCall = callMap.get(uuid);
    String from = (activeCall != null) ? activeCall.getFrom() : null;
    promise.resolve(from);
  }

  @ReactMethod
  public void call_getTo(String uuid, Promise promise) {
    Call activeCall = callMap.get(uuid);
    String to = (activeCall != null) ? activeCall.getTo() : null;
    promise.resolve(to);
  }

  @ReactMethod
  public void call_getSid(String uuid, Promise promise) {
    Call activeCall = callMap.get(uuid);
    String sid = (activeCall != null) ? activeCall.getSid() : null;
    promise.resolve(sid);
  }

  @ReactMethod
  public void call_getState(String uuid, Promise promise) {
    Call activeCall = callMap.get(uuid);
    String state = (activeCall != null) ? activeCall.getState().toString() : null;
    promise.resolve(state);
  }

  @ReactMethod
  public void call_hold(String uuid, boolean hold) {
    Call activeCall = callMap.get(uuid);
    if (activeCall != null) {
      activeCall.hold(hold);
    }
  }

  @ReactMethod
  public void call_mute(String uuid, boolean mute) {
    Call activeCall = callMap.get(uuid);
    if (activeCall != null) {
      activeCall.mute(mute);
    }
  }

  @ReactMethod
  public void call_sendDigits(String uuid, String digits) {
    Call activeCall = callMap.get(uuid);
    if (activeCall != null) {
      activeCall.sendDigits(digits);
    }
  }

  @ReactMethod
  public void voice_register(String token, String channel, Promise promise) {
    //Intent intent = new Intent(ACTION_FCM_TOKEN_REQUEST);
    //LocalBroadcastManager.getInstance(reactContext).sendBroadcast(intent);
    Log.i(TAG, "Requesting fcm token ");
    FirebaseInstanceId.getInstance().getInstanceId()
      .addOnCompleteListener(new OnCompleteListener<InstanceIdResult>() {
        @Override
        public void onComplete(@NonNull Task<InstanceIdResult> task) {
          if (!task.isSuccessful()) {
            Log.w(TAG, "getInstanceId failed", task.getException());
            return;
          }

          // Get new Instance ID token
          fcmToken = task.getResult().getToken();
          if (fcmToken != null) {
            if (BuildConfig.DEBUG) {
              Log.d(TAG, "Registering with FCM with token "+fcmToken);
            }
            Voice.register(token, Voice.RegistrationChannel.FCM, fcmToken, registrationListener);
          }
        }
      });
    promise.resolve(null);
  }


   @ReactMethod
  public void voice_unregister(String token, String channel, Promise promise) {
    Log.i(TAG, "Requesting fcm token ");
    FirebaseInstanceId.getInstance().getInstanceId()
      .addOnCompleteListener(new OnCompleteListener<InstanceIdResult>() {
        @Override
        public void onComplete(@NonNull Task<InstanceIdResult> task) {
          if (!task.isSuccessful()) {
            Log.w(TAG, "getInstanceId failed", task.getException());
            return;
          }

          // Get new Instance ID token
          String fcmToken = task.getResult().getToken();
          if (fcmToken != null) {
            if (BuildConfig.DEBUG) {
              Log.d(TAG, "UnRegistering with FCM");
            }
            Voice.unregister(token, Voice.RegistrationChannel.FCM, fcmToken, unregistrationListener);
          }
        }
      });
    promise.resolve(token);
  }

}
