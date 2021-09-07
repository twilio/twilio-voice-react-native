package com.twiliovoicereactnative;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import android.os.Build;
import android.util.Log;

import java.util.Map;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.Callback;

import android.app.NotificationManager;
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

import com.twilio.audioswitch.AudioSwitch;
import com.twilio.audioswitch.AudioDevice;

import java.util.HashMap;
import java.util.UUID;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;

import androidx.annotation.RequiresApi;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.messaging.FirebaseMessaging;

import static com.twiliovoicereactnative.AndroidEventEmitter.ACTION_FCM_TOKEN_REQUEST;

import static com.twiliovoicereactnative.AndroidEventEmitter.VOICE_EVENT_NAME;

import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_ERROR;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_TYPE;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_UUID;

import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_CALL_INVITE_INFO;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_CALL_INVITE_CALL_SID;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_CALL_INVITE_FROM;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_CALL_INVITE_TO;

import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_CANCELLED_CALL_INVITE_INFO;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_CANCELLED_CALL_INVITE_CALL_SID;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_CANCELLED_CALL_INVITE_FROM;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_CANCELLED_CALL_INVITE_TO;

import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_CALL_INFO;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_CALL_SID;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_CALL_FROM;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_CALL_TO;

import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_AUDIO_DEVICES_NAME;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_AUDIO_DEVICES_AUDIO_DEVICES;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_AUDIO_DEVICES_SELECTED_DEVICE;

import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_TYPE_VOICE_REGISTERED;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_TYPE_VOICE_UNREGISTERED;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_TYPE_VOICE_CALL_INVITE;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_TYPE_VOICE_CALL_INVITE_ACCEPTED;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_TYPE_VOICE_CALL_INVITE_REJECTED;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_TYPE_VOICE_CANCELLED_CALL_INVITE;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_TYPE_VOICE_AUDIO_DEVICES_UPDATED;

import com.twiliovoicereactnative.Storage;

import static com.twiliovoicereactnative.Storage.androidEventEmitter;

@ReactModule(name = TwilioVoiceReactNativeModule.TAG)
public class TwilioVoiceReactNativeModule extends ReactContextBaseJavaModule {
  static final String TAG = "TwilioVoiceReactNative";
  private String fcmToken;
  private VoiceBroadcastReceiver voiceBroadcastReceiver;
  private final ReactApplicationContext reactContext;
  private final AudioSwitch audioSwitch;
  private final Map<String, AudioDevice> audioDeviceMap;
  private WritableMap audioDevicesInfo;

  public TwilioVoiceReactNativeModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
    if (BuildConfig.DEBUG) {
      Voice.setLogLevel(LogLevel.DEBUG);
    } else {
      Voice.setLogLevel(LogLevel.ERROR);
    }

    Log.d(TAG, "instantiation of TwilioVoiceReactNativeModule");

    androidEventEmitter = new AndroidEventEmitter(reactContext);
    voiceBroadcastReceiver = new VoiceBroadcastReceiver();
    registerReceiver();

    audioDeviceMap = new HashMap();

    audioSwitch = new AudioSwitch(reactContext);

    audioSwitch.start((audioDevices, selectedDevice) -> {
      audioDeviceMap.clear();

      WritableArray audioDeviceInfos = Arguments.createArray();
      audioDevices.forEach((audioDevice) -> {
        String uuid = UUID.randomUUID().toString();
        audioDeviceMap.put(uuid, audioDevice);
        audioDeviceInfos.pushMap(getAudioDeviceInfo(uuid, audioDevice));
      });

      String uuid = UUID.randomUUID().toString();
      audioDeviceMap.put(uuid, selectedDevice);

      audioDevicesInfo = Arguments.createMap();
      audioDevicesInfo.putArray(EVENT_KEY_AUDIO_DEVICES_AUDIO_DEVICES, audioDeviceInfos);
      audioDevicesInfo.putMap(EVENT_KEY_AUDIO_DEVICES_SELECTED_DEVICE, getAudioDeviceInfo(uuid, selectedDevice));

      androidEventEmitter.sendEvent(VOICE_EVENT_NAME, audioDevicesInfo);

      return null;
    });
  }

  private void registerReceiver() {
    IntentFilter intentFilter = new IntentFilter();
    intentFilter.addAction(Constants.ACTION_INCOMING_CALL);
    intentFilter.addAction(Constants.ACTION_CANCEL_CALL);
    intentFilter.addAction(Constants.ACTION_FCM_TOKEN);
    intentFilter.addAction(Constants.ACTION_ACCEPT);
    intentFilter.addAction(Constants.ACTION_REJECT);
    LocalBroadcastManager.getInstance(reactContext).registerReceiver(
      voiceBroadcastReceiver, intentFilter);
    Log.d(TAG, "Successfully registerReceiver");
  }

  private WritableMap getCallInviteInfo(String uuid, CallInvite callInvite) {
    WritableMap callInviteInfo = Arguments.createMap();
    callInviteInfo.putString(EVENT_KEY_UUID, uuid);
    callInviteInfo.putString(EVENT_KEY_CALL_INVITE_CALL_SID, callInvite.getCallSid());
    callInviteInfo.putString(EVENT_KEY_CALL_INVITE_FROM, callInvite.getFrom());
    callInviteInfo.putString(EVENT_KEY_CALL_INVITE_TO, callInvite.getTo());
    return callInviteInfo;
  }

  private WritableMap getCancelledCallInviteInfo(CancelledCallInvite cancelledCallInvite) {
    WritableMap cancelledCallInviteInfo = Arguments.createMap();
    cancelledCallInviteInfo.putString(EVENT_KEY_CANCELLED_CALL_INVITE_CALL_SID, cancelledCallInvite.getCallSid());
    cancelledCallInviteInfo.putString(EVENT_KEY_CANCELLED_CALL_INVITE_FROM, cancelledCallInvite.getFrom());
    cancelledCallInviteInfo.putString(EVENT_KEY_CANCELLED_CALL_INVITE_TO, cancelledCallInvite.getTo());
    return cancelledCallInviteInfo;
  }

  private WritableMap getCallInfo(String uuid, Call call) {
    WritableMap callInfo = Arguments.createMap();
    callInfo.putString(EVENT_KEY_UUID, uuid);
    callInfo.putString(EVENT_KEY_CALL_SID, call.getSid());
    callInfo.putString(EVENT_KEY_CALL_FROM, call.getFrom());
    callInfo.putString(EVENT_KEY_CALL_TO, call.getTo());
    return callInfo;
  }

  private WritableMap getAudioDeviceInfo(String uuid, AudioDevice audioDevice) {
    WritableMap audioDeviceInfo = Arguments.createMap();
    audioDeviceInfo.putString(EVENT_KEY_UUID, uuid);
    audioDeviceInfo.putString(EVENT_KEY_AUDIO_DEVICES_NAME, audioDevice.toString());
    return audioDeviceInfo;
  }

  private class VoiceBroadcastReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
      String action = intent.getAction();
      /*
       * Handle the incoming or cancelled call invite
       */
      Log.d(TAG, "Successfully received intent " + action);
      WritableMap params = Arguments.createMap();
      switch (action) {
        case Constants.ACTION_FCM_TOKEN:
          fcmToken = intent.getStringExtra(Constants.FCM_TOKEN);
          Log.d(TAG, "Successfully set token" + fcmToken);
          break;
        case Constants.ACTION_INCOMING_CALL: {
          Log.d(TAG, "Successfully received incoming notification");

          String uuid = intent.getStringExtra(Constants.UUID);
          CallInvite callInvite = intent.getParcelableExtra(Constants.INCOMING_CALL_INVITE);
          WritableMap callInviteInfo = getCallInviteInfo(uuid, callInvite);

          params.putString(EVENT_KEY_TYPE, EVENT_TYPE_VOICE_CALL_INVITE);
          params.putMap(EVENT_KEY_CALL_INVITE_INFO, callInviteInfo);

          androidEventEmitter.sendEvent(VOICE_EVENT_NAME, params);
          break;
        }
        case Constants.ACTION_ACCEPT: {
          Log.d(TAG, "Accepted call");

          String uuid = intent.getStringExtra(Constants.UUID);
          CallInvite callInvite = intent.getParcelableExtra(Constants.INCOMING_CALL_INVITE);
          WritableMap callInviteInfo = getCallInviteInfo(uuid, callInvite);

          params.putString(EVENT_KEY_TYPE, EVENT_TYPE_VOICE_CALL_INVITE_ACCEPTED);
          params.putMap(EVENT_KEY_CALL_INVITE_INFO, callInviteInfo);

          androidEventEmitter.sendEvent(VOICE_EVENT_NAME, params);
          break;
        }
        case Constants.ACTION_REJECT:
          Log.d(TAG, "Rejected call");

          String uuid = intent.getStringExtra(Constants.UUID);
          CallInvite callInvite = intent.getParcelableExtra(Constants.INCOMING_CALL_INVITE);
          WritableMap callInviteInfo = getCallInviteInfo(uuid, callInvite);

          params.putString(EVENT_KEY_TYPE, EVENT_TYPE_VOICE_CALL_INVITE_REJECTED);
          params.putMap(EVENT_KEY_CALL_INVITE_INFO, callInviteInfo);

          androidEventEmitter.sendEvent(VOICE_EVENT_NAME, params);
          break;
        case Constants.ACTION_CANCEL_CALL:
          Log.d(TAG, "Successfully received cancel notification");

          CancelledCallInvite cancelledCallInvite = intent.getParcelableExtra(Constants.CANCELLED_CALL_INVITE);
          WritableMap cancelledCallInviteInfo = getCancelledCallInviteInfo(cancelledCallInvite);

          params.putString(EVENT_KEY_TYPE, EVENT_TYPE_VOICE_CANCELLED_CALL_INVITE);
          params.putMap(EVENT_KEY_CANCELLED_CALL_INVITE_INFO, cancelledCallInviteInfo);

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
        params.putString(EVENT_KEY_TYPE, EVENT_TYPE_VOICE_REGISTERED);
        androidEventEmitter.sendEvent(VOICE_EVENT_NAME, params);
        promise.resolve(null);
      }

      @Override
      public void onError(RegistrationException error, String accessToken, String fcmToken) {
        String errorMessage = String.format("Registration Error: %d, %s", error.getErrorCode(), error.getMessage());
        Log.e(TAG, errorMessage);
        WritableMap params = Arguments.createMap();
        params.putString(EVENT_KEY_TYPE, EVENT_KEY_ERROR);
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
        params.putString(EVENT_KEY_TYPE, EVENT_TYPE_VOICE_UNREGISTERED);
        androidEventEmitter.sendEvent(VOICE_EVENT_NAME, params);
        promise.resolve(null);
      }

      @Override
      public void onError(RegistrationException registrationException, String accessToken, String fcmToken) {
        String errorMessage = String.format("Unregistration Error: %d, %s", registrationException.getErrorCode(), registrationException.getMessage());
        Log.e(TAG, errorMessage);
        WritableMap params = Arguments.createMap();
        params.putString(EVENT_KEY_TYPE, EVENT_KEY_ERROR);
        androidEventEmitter.sendEvent(VOICE_EVENT_NAME, params);
        promise.reject(errorMessage);
      }
    };
  }

  @ReactMethod
  public void voice_connect(String accessToken, ReadableMap twimlParams, Promise promise) {
    Log.e(TAG, String.format("Calling voice_connect"));
    HashMap<String, String> parsedTwimlParams = new HashMap<>();

    ReadableMapKeySetIterator iterator = twimlParams.keySetIterator();
    while (iterator.hasNextKey()) {
      String key = iterator.nextKey();
      ReadableType readableType = twimlParams.getType(key);
      switch (readableType) {
        case Boolean:
          parsedTwimlParams.put(key, String.valueOf(twimlParams.getBoolean(key)));
          break;
        case Number:
          // Can be int or double.
          parsedTwimlParams.put(key, String.valueOf(twimlParams.getDouble(key)));
          break;
        case String:
          parsedTwimlParams.put(key, twimlParams.getString(key));
          break;
        default:
          Log.d(TAG, "Could not convert with key: " + key + ".");
          break;
      }
    }

    String uuid = UUID.randomUUID().toString();

    ConnectOptions connectOptions = new ConnectOptions.Builder(accessToken)
      .enableDscp(true)
      .params(parsedTwimlParams)
      .build();

    Call call = Voice.connect(getReactApplicationContext(), connectOptions, new CallListenerProxy(uuid));
    Storage.callMap.put(uuid, call);

    WritableMap callInfo = getCallInfo(uuid, call);

    promise.resolve(callInfo);
  }

  @ReactMethod
  public void voice_getVersion(Promise promise) {
    promise.resolve(Voice.getVersion());
  }

  @ReactMethod
  public void voice_getDeviceToken(Promise promise) {
    FirebaseMessaging.getInstance().getToken()
      .addOnCompleteListener(new OnCompleteListener<String>() {
        @Override
        public void onComplete(@NonNull Task<String> task) {
          if (!task.isSuccessful()) {
            Log.w(TAG, "Fetching FCM registration token failed", task.getException());
            promise.reject("Fetching FCM registration token failed" + task.getException());
            return;
          }

          // Get FCM registration token
          String fcmToken = task.getResult();

          if (fcmToken == null) {
            Log.d(TAG, "FCM token is \"null\".");
            promise.reject("FCM token is \"null\".");
            return;
          } else {
            promise.resolve(fcmToken);
          }
        }
      });
  }

  @RequiresApi(api = Build.VERSION_CODES.N)
  @ReactMethod
  public void voice_getCalls(Promise promise) {
    WritableArray callInfos = Arguments.createArray();

    Storage.callMap.forEach((uuid, call) -> {
      WritableMap callInfo = getCallInfo(uuid, call);
      callInfos.pushMap(callInfo);
    });

    promise.resolve(callInfos);
  }

  @RequiresApi(api = Build.VERSION_CODES.N)
  @ReactMethod
  public void voice_getCallInvites(Promise promise) {
    WritableArray callInviteInfos = Arguments.createArray();

    Storage.callInviteMap.forEach((uuid, callInvite) -> {
      WritableMap callInviteInfo = getCallInviteInfo(uuid, callInvite);
      callInviteInfos.pushMap(callInviteInfo);
    });

    promise.resolve(callInviteInfos);
  }

  @ReactMethod
  public void voice_getAudioDevices(Promise promise) {
    promise.resolve(audioDevicesInfo);
  }

  @ReactMethod
  public void voice_selectAudioDevice(String uuid, Promise promise) {
    AudioDevice audioDevice = audioDeviceMap.get(uuid);

    if (audioDevice == null) {
      promise.reject("No such \"audioDevice\" object exists with UUID " + uuid);
      return;
    }

    audioSwitch.selectDevice(audioDevice);

    audioSwitch.activate();

    promise.resolve(audioDevicesInfo);
  }

  /**
   * Call methods.
   */

  @ReactMethod
  public void call_getState(String uuid, Promise promise) {
    Call activeCall = Storage.callMap.get(uuid);

    if (activeCall == null) {
      promise.reject("No such \"call\" object exists with UUID " + uuid);
      return;
    }

    promise.resolve(activeCall.getState().toString().toLowerCase());
  }

  @ReactMethod
  public void call_isMuted(String uuid, Promise promise) {
    Call activeCall = Storage.callMap.get(uuid);

    if (activeCall == null) {
      promise.reject("No such \"call\" object exists with UUID " + uuid);
      return;
    }

    promise.resolve(activeCall.isMuted());
  }

  @ReactMethod
  public void call_isOnHold(String uuid, Promise promise) {
    Call activeCall = Storage.callMap.get(uuid);

    if (activeCall == null) {
      promise.reject("No such \"call\" object exists with UUID " + uuid);
      return;
    }

    promise.resolve(activeCall.isOnHold());
  }

  @ReactMethod
  public void call_disconnect(String uuid, Promise promise) {
    Call activeCall = Storage.callMap.get(uuid);

    if (activeCall == null) {
      promise.reject("No such \"call\" object exists with UUID " + uuid);
      return;
    }

    activeCall.disconnect();
    promise.resolve(uuid);
  }

  @ReactMethod
  public void call_hold(String uuid, boolean hold, Promise promise) {
    Call activeCall = Storage.callMap.get(uuid);

    if (activeCall == null) {
      promise.reject("No such \"call\" object exists with UUID " + uuid);
      return;
    }

    activeCall.hold(hold);

    boolean isOnHold = activeCall.isOnHold();
    promise.resolve(isOnHold);
  }

  @ReactMethod
  public void call_mute(String uuid, boolean mute, Promise promise) {
    Call activeCall = Storage.callMap.get(uuid);

    if (activeCall == null) {
      promise.reject("No such \"call\" object exists with UUID " + uuid);
      return;
    }

    activeCall.mute(mute);

    boolean isMuted = activeCall.isMuted();
    promise.resolve(isMuted);
  }

  @ReactMethod
  public void call_sendDigits(String uuid, String digits, Promise promise) {
    Call activeCall = Storage.callMap.get(uuid);

    if (activeCall == null) {
      promise.reject("No such \"call\" object exists with UUID " + uuid);
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
  public void callInvite_accept(String callInviteUuid, ReadableMap options, Promise promise) {
    Log.d(TAG, "callInvite_accept uuid" + callInviteUuid);
    CallInvite activeCallInvite = Storage.callInviteMap.get(callInviteUuid);

    if (activeCallInvite == null) {
      promise.reject("No such \"callInvite\" object exists with UUID " + callInviteUuid);
      return;
    }

    AcceptOptions acceptOptions = new AcceptOptions.Builder()
      .enableDscp(true)
      .build();

    Call call = activeCallInvite.accept(getReactApplicationContext(), acceptOptions, new CallListenerProxy(callInviteUuid));
    Storage.callMap.put(callInviteUuid, call);

    // Send Event to upstream
    WritableMap params = Arguments.createMap();
    WritableMap callInviteInfo = getCallInviteInfo(callInviteUuid, activeCallInvite);
    params.putString(EVENT_KEY_TYPE, EVENT_TYPE_VOICE_CALL_INVITE_ACCEPTED);
    params.putMap(EVENT_KEY_CALL_INVITE_INFO, callInviteInfo);
    androidEventEmitter.sendEvent(VOICE_EVENT_NAME, params);

    int notificationId = Storage.callInviteUuidNotificaionIdMap.get(callInviteUuid);
    Intent acceptIntent = new Intent(getReactApplicationContext(), IncomingCallNotificationService.class);
    acceptIntent.setAction(Constants.ACTION_CANCEL_NOTIFICATION);
    acceptIntent.putExtra(Constants.INCOMING_CALL_NOTIFICATION_ID, notificationId);
    acceptIntent.putExtra(Constants.UUID, callInviteUuid);

    getReactApplicationContext().startService(acceptIntent);

    Storage.releaseCallInviteStorage(callInviteUuid, activeCallInvite.getCallSid(), Storage.callInviteUuidNotificaionIdMap.get(callInviteUuid), "accept");

    WritableMap callInfo = getCallInfo(callInviteUuid, call);

    promise.resolve(callInfo);
  }

  @ReactMethod
  public void callInvite_reject(String uuid, Promise promise) {
    Log.d(TAG, "callInvite_reject uuid" + uuid);
    CallInvite activeCallInvite = Storage.callInviteMap.get(uuid);

    if (activeCallInvite == null) {
      promise.reject("No such \"callInvite\" object exists with UUID " + uuid);
      return;
    }

    activeCallInvite.reject(getReactApplicationContext());

    int notificationId = Storage.callInviteUuidNotificaionIdMap.get(uuid);
    Intent rejectIntent = new Intent(getReactApplicationContext(), IncomingCallNotificationService.class);
    rejectIntent.setAction(Constants.ACTION_CANCEL_NOTIFICATION);
    rejectIntent.putExtra(Constants.INCOMING_CALL_NOTIFICATION_ID, notificationId);
    rejectIntent.putExtra(Constants.UUID, uuid);
    getReactApplicationContext().startService(rejectIntent);

    Storage.releaseCallInviteStorage(uuid, activeCallInvite.getCallSid(), Storage.callInviteUuidNotificaionIdMap.get(uuid), "reject");

    promise.resolve(uuid);
  }
}
