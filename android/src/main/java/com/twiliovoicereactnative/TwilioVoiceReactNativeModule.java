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
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.twilio.voice.Voice;
import com.twilio.voice.Call;
import com.twilio.voice.CallInvite;
import com.twilio.voice.CancelledCallInvite;
import com.twilio.voice.CallException;
import com.twilio.voice.ConnectOptions;
import com.twilio.voice.AcceptOptions;
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
import com.google.firebase.messaging.FirebaseMessaging;

import static com.twiliovoicereactnative.AndroidEventEmitter.ACTION_FCM_TOKEN_REQUEST;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_REGISTERED;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_UNREGISTERED;
import static com.twiliovoicereactnative.AndroidEventEmitter.VOICE_EVENT_NAME;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_TYPE;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_ERROR;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_CALL_INVITE;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_CANCELLED_CALL_INVITE;
import static com.twiliovoicereactnative.AndroidEventEmitter.UUID_KEY;

@ReactModule(name = TwilioVoiceReactNativeModule.TAG)
public class TwilioVoiceReactNativeModule extends ReactContextBaseJavaModule {
  static final String TAG = "TwilioVoiceReactNative";
  static final Map<String, Call> callMap = new HashMap<>();
  static final Map<String, CallInvite> callInviteMap = new HashMap<>();
  private String fcmToken;
  private AndroidEventEmitter androidEventEmitter;
  private VoiceBroadcastReceiver voiceBroadcastReceiver;
  private final ReactApplicationContext reactContext;

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
        case Constants.ACTION_INCOMING_CALL:
          Log.d(TAG, "Successfully received incoming notification");
          WritableMap params = Arguments.createMap();
          CallInvite callInvite = intent.getParcelableExtra(Constants.INCOMING_CALL_INVITE);
          UUID uuid = UUID.randomUUID();
          params.putString(UUID_KEY, uuid.toString());
          params.putString(EVENT_TYPE, EVENT_CALL_INVITE);
          callInviteMap.put(uuid.toString(), callInvite);
          androidEventEmitter.sendEvent(VOICE_EVENT_NAME, params);
          break;
        default:
          break;
      }
    }
  }

  @Override
  @NonNull
  public String getName() {
    return TAG;
  }

  private RegistrationListener createRegistrationListener(Promise promise) {
    return new RegistrationListener() {
      @Override
      public void onRegistered(String accessToken, String fcmToken) {
        Log.d(TAG, "Successfully registered FCM");
        WritableMap params = Arguments.createMap();
        params.putString(EVENT_TYPE, EVENT_REGISTERED);
        androidEventEmitter.sendEvent(VOICE_EVENT_NAME, params);
        promise.resolve(null);
      }

      @Override
      public void onError(RegistrationException error, String accessToken, String fcmToken) {
        String errorMessage = String.format("Registration Error: %d, %s", error.getErrorCode(), error.getMessage());
        Log.e(TAG, errorMessage);
        WritableMap params = Arguments.createMap();
        params.putString(EVENT_TYPE, EVENT_ERROR);
        androidEventEmitter.sendEvent(VOICE_EVENT_NAME, params);
        promise.reject(errorMessage);
      }
    };
  }

  private UnregistrationListener createUnregistrationListener(Promise promise) {
    return new UnregistrationListener() {
      @Override
      public void onUnregistered(String accessToken, String fcmToken) {
        Log.d(TAG, "Successfully unregistered FCM");
        WritableMap params = Arguments.createMap();
        params.putString(EVENT_TYPE, EVENT_UNREGISTERED);
        androidEventEmitter.sendEvent(VOICE_EVENT_NAME, params);
        promise.resolve(null);
      }

      @Override
      public void onError(RegistrationException registrationException, String accessToken, String fcmToken) {
        String errorMessage = String.format("Unregistration Error: %d, %s", registrationException.getErrorCode(), registrationException.getMessage());
        Log.e(TAG, errorMessage);
        WritableMap params = Arguments.createMap();
        params.putString(EVENT_TYPE, EVENT_ERROR);
        androidEventEmitter.sendEvent(VOICE_EVENT_NAME, params);
        promise.reject(errorMessage);
      }
    };
  }

  @ReactMethod
  public void voice_connect(String uuid, String accessToken, ReadableMap params, Promise promise) {
    Log.e(TAG, String.format("Calling voice_connect"));
    HashMap<String, String> twiMLParams = new HashMap<>();

    ReadableMapKeySetIterator iterator = params.keySetIterator();
    while (iterator.hasNextKey()) {
      String key = iterator.nextKey();
      ReadableType readableType = params.getType(key);
      switch (readableType) {
        case Boolean:
          twiMLParams.put(key, String.valueOf(params.getBoolean(key)));
          break;
        case Number:
          // Can be int or double.
          twiMLParams.put(key, String.valueOf(params.getDouble(key)));
          break;
        case String:
          twiMLParams.put(key, params.getString(key));
          break;
        default:
          Log.d(TAG, "Could not convert with key: " + key + ".");
          break;
      }
    }


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
  public void call_disconnect(String uuid, Promise promise) {
    Call activeCall = callMap.get(uuid);

    if (activeCall == null) {
      promise.reject("No such \"call\" object exists with UUID" + uuid);
      return;
    }

    activeCall.disconnect();
    promise.resolve(uuid);
  }

  @ReactMethod
  public void call_getFrom(String uuid, Promise promise) {
    Call activeCall = callMap.get(uuid);

    if (activeCall == null) {
      promise.reject("No such \"call\" object exists with UUID" + uuid);
      return;
    }

    String from = activeCall.getFrom();
    promise.resolve(from);
  }

  @ReactMethod
  public void call_getTo(String uuid, Promise promise) {
    Call activeCall = callMap.get(uuid);

    if (activeCall == null) {
      promise.reject("No such \"call\" object exists with UUID" + uuid);
      return;
    }

    String to = activeCall.getTo();
    promise.resolve(to);
  }

  @ReactMethod
  public void call_getSid(String uuid, Promise promise) {
    Call activeCall = callMap.get(uuid);

    if (activeCall == null) {
      promise.reject("No such \"call\" object exists with UUID" + uuid);
      return;
    }

    String sid = activeCall.getSid();
    promise.resolve(sid);
  }

  @ReactMethod
  public void call_getState(String uuid, Promise promise) {
    Call activeCall = callMap.get(uuid);

    if (activeCall == null) {
      promise.reject("No such \"call\" object exists with UUID" + uuid);
      return;
    }

    String state = activeCall.getState().toString();
    promise.resolve(state);
  }

  @ReactMethod
  public void call_hold(String uuid, boolean hold, Promise promise) {
    Call activeCall = callMap.get(uuid);

    if (activeCall == null) {
      promise.reject("No such \"call\" object exists with UUID" + uuid);
      return;
    }

    activeCall.hold(hold);
    promise.resolve(uuid);
  }

  @ReactMethod
  public void call_mute(String uuid, boolean mute, Promise promise) {
    Call activeCall = callMap.get(uuid);

    if (activeCall == null) {
      promise.reject("No such \"call\" object exists with UUID" + uuid);
      return;
    }

    activeCall.mute(mute);
    promise.resolve(uuid);
  }

  @ReactMethod
  public void call_isMuted(String uuid, Promise promise) {
    Call activeCall = callMap.get(uuid);

    if (activeCall == null) {
      promise.reject("No such \"call\" object exists with UUID" + uuid);
      return;
    }

    boolean isMuted = activeCall.isMuted();
    promise.resolve(isMuted);
  }

  @ReactMethod
  public void call_isOnHold(String uuid, Promise promise) {
    Call activeCall = callMap.get(uuid);

    if (activeCall == null) {
      promise.reject("No such \"call\" object exists with UUID" + uuid);
      return;
    }

    boolean isOnHold = activeCall.isOnHold();
    promise.resolve(isOnHold);
  }


  @ReactMethod
  public void call_sendDigits(String uuid, String digits, Promise promise) {
    Call activeCall = callMap.get(uuid);

    if (activeCall == null) {
      promise.reject("No such \"call\" object exists with UUID" + uuid);
      return;
    }

    activeCall.sendDigits(digits);
    promise.resolve(uuid);
  }

  // Register/UnRegister

  @ReactMethod
  public void voice_register(String token, Promise promise) {
    FirebaseMessaging.getInstance().getToken()
      .addOnCompleteListener(new OnCompleteListener<String>() {
        @Override
        public void onComplete(@NonNull Task<String> task) {
          if (!task.isSuccessful()) {
            Log.w(TAG, "Fetching FCM registration token failed", task.getException());
            promise.reject("Fetching FCM registration token failed" + task.getException());
            return;
          }

          // Get new FCM registration token
          String fcmToken = task.getResult();

          if (fcmToken == null) {
            Log.d(TAG, "FCM token is \"null\".");
            promise.reject("FCM token is \"null\".");
            return;
          }

          // Log and toast
          if (BuildConfig.DEBUG) {
            Log.d(TAG, "Registering with FCM with token " + fcmToken);
          }
          RegistrationListener registrationListener = createRegistrationListener(promise);
          Voice.register(token, Voice.RegistrationChannel.FCM, fcmToken, registrationListener);
        }
      });
  }


  @ReactMethod
  public void voice_unregister(String token, Promise promise) {
    FirebaseMessaging.getInstance().getToken()
      .addOnCompleteListener(new OnCompleteListener<String>() {
        @Override
        public void onComplete(@NonNull Task<String> task) {
          if (!task.isSuccessful()) {
            Log.w(TAG, "Fetching FCM registration token failed", task.getException());
            promise.reject("Fetching FCM registration token failed" + task.getException());
            return;
          }

          // Get new FCM registration token
          String fcmToken = task.getResult();

          if (fcmToken == null) {
            Log.d(TAG, "FCM token is \"null\".");
            promise.reject("FCM token is \"null\".");
            return;
          }

          // Log and toast
          if (BuildConfig.DEBUG) {
            Log.d(TAG, "Registering with FCM with token " + fcmToken);
          }
          UnregistrationListener unregistrationListener = createUnregistrationListener(promise);
          Voice.unregister(token, Voice.RegistrationChannel.FCM, fcmToken, unregistrationListener);
        }
      });
  }

  // CallInvite

  @ReactMethod
  public void callInvite_getCallSid(String uuid, Promise promise) {
    Log.d(TAG, "callInvite_getCallSid uuid" + uuid);
    CallInvite activeCallInvite = callInviteMap.get(uuid);

    if (activeCallInvite == null) {
      promise.reject("No such \"callInvite\" object exists with UUID" + uuid);
      return;
    }

    String callSid = activeCallInvite.getCallSid();
    promise.resolve(callSid);
  }

  @ReactMethod
  public void callInvite_getTo(String uuid, Promise promise) {
    Log.d(TAG, "callInvite_getTo uuid" + uuid);
    CallInvite activeCallInvite = callInviteMap.get(uuid);

    if (activeCallInvite == null) {
      promise.reject("No such \"callInvite\" object exists with UUID" + uuid);
      return;
    }

    String callTo = activeCallInvite.getTo();
    promise.resolve(callTo);
  }

  @ReactMethod
  public void callInvite_getFrom(String uuid, Promise promise) {
    Log.d(TAG, "callInvite_getFrom uuid" + uuid);
    CallInvite activeCallInvite = callInviteMap.get(uuid);

    if (activeCallInvite == null) {
      promise.reject("No such \"callInvite\" object exists with UUID" + uuid);
      return;
    }

    String callFrom = activeCallInvite.getFrom();
    promise.resolve(callFrom);
  }

  @ReactMethod
  public void callInvite_accept(String callInviteUuid, String callUuid, ReadableMap options, Promise promise) {
    Log.d(TAG, "callInvite_accept uuid" + callInviteUuid);
    CallInvite activeCallInvite = callInviteMap.get(callInviteUuid);

    if (activeCallInvite == null) {
      promise.reject("No such \"callInvite\" object exists with UUID" + callInviteUuid);
      return;
    }

    AcceptOptions acceptOptions = new AcceptOptions.Builder()
      .enableDscp(true)
      .build();
    Call call = activeCallInvite.accept(getReactApplicationContext(), acceptOptions, new CallListenerProxy(callUuid, androidEventEmitter));
    callMap.put(callUuid, call);
    promise.resolve(callUuid);
  }

  @ReactMethod
  public void callInvite_reject(String uuid, Promise promise) {
    Log.d(TAG, "callInvite_reject uuid" + uuid);
    CallInvite activeCallInvite = callInviteMap.get(uuid);

    if (activeCallInvite == null) {
      promise.reject("No such \"callInvite\" object exists with UUID" + uuid);
      return;
    }

    activeCallInvite.reject(getReactApplicationContext());
    callInviteMap.remove(uuid);
    promise.resolve(uuid);
  }
}
