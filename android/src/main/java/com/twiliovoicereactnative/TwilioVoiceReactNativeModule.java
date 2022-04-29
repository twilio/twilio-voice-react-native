package com.twiliovoicereactnative;

import android.content.Intent;
import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.module.annotations.ReactModule;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.messaging.FirebaseMessaging;
import com.twilio.audioswitch.AudioDevice;
import com.twilio.audioswitch.AudioSwitch;
import com.twilio.voice.AcceptOptions;
import com.twilio.voice.Call;
import com.twilio.voice.CallInvite;
import com.twilio.voice.CancelledCallInvite;
import com.twilio.voice.ConnectOptions;
import com.twilio.voice.LogLevel;
import com.twilio.voice.RegistrationException;
import com.twilio.voice.RegistrationListener;
import com.twilio.voice.UnregistrationListener;
import com.twilio.voice.Voice;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_CALL_CUSTOM_PARAMETERS;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_AUDIO_DEVICES_AUDIO_DEVICES;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_AUDIO_DEVICES_NAME;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_AUDIO_DEVICES_SELECTED_DEVICE;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_AUDIO_DEVICES_TYPE;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_CALL_FROM;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_CALL_INVITE_CALL_SID;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_CALL_INVITE_CUSTOM_PARAMETERS;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_CALL_INVITE_FROM;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_CALL_INVITE_INFO;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_CALL_INVITE_TO;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_CALL_SID;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_CALL_TO;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_CANCELLED_CALL_INVITE_CALL_SID;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_CANCELLED_CALL_INVITE_FROM;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_CANCELLED_CALL_INVITE_TO;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_ERROR;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_ERROR_CODE;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_ERROR_MESSAGE;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_TYPE;
import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_UUID;
import static com.twiliovoicereactnative.CommonConstants.Issue;
import static com.twiliovoicereactnative.CommonConstants.ScopeVoice;
import static com.twiliovoicereactnative.CommonConstants.Score;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventAudioDevicesUpdated;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventCallInviteAccepted;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventError;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventRegistered;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventUnregistered;

@ReactModule(name = TwilioVoiceReactNativeModule.TAG)
public class TwilioVoiceReactNativeModule extends ReactContextBaseJavaModule {

  static final String TAG = "TwilioVoiceReactNative";
  private final ReactApplicationContext reactContext;
  private final AudioSwitch audioSwitch;
  private final Map<String, AudioDevice> audioDeviceMap;
  private String selectedDeviceUuid;
  private Map<String, String> audioDeviceTypeMap = new HashMap();

  @RequiresApi(api = Build.VERSION_CODES.N)
  public TwilioVoiceReactNativeModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
    if (BuildConfig.DEBUG) {
      Voice.setLogLevel(LogLevel.DEBUG);
    } else {
      Voice.setLogLevel(LogLevel.ERROR);
    }

    Log.d(TAG, "instantiation of TwilioVoiceReactNativeModule");

    AndroidEventEmitter.getInstance().setContext(reactContext);
    VoiceBroadcastReceiver.getInstance().setContext(reactContext);

    audioDeviceTypeMap.put("Speakerphone", "speaker");
    audioDeviceTypeMap.put("BluetoothHeadset", "bluetooth");
    audioDeviceTypeMap.put("WiredHeadset", "earpiece");
    audioDeviceTypeMap.put("Earpiece", "earpiece");

    audioDeviceMap = new HashMap();
    audioSwitch = AudioSwitchManager.getInstance(reactContext).getAudioSwitch();

    audioSwitch.start((audioDevices, selectedDevice) -> {
      audioDeviceMap.clear();

      audioDevices.forEach((audioDevice) -> {
        String uuid = UUID.randomUUID().toString();
        audioDeviceMap.put(uuid, audioDevice);

        if (audioDevice.equals(selectedDevice)) {
          selectedDeviceUuid = uuid;
        }
      });

      WritableMap params = Arguments.createMap();
      params.putString(EVENT_KEY_TYPE, VoiceEventAudioDevicesUpdated);
      params.putArray(EVENT_KEY_AUDIO_DEVICES_AUDIO_DEVICES, getAudioDeviceInfoArray(audioDeviceMap));
      params.putMap(EVENT_KEY_AUDIO_DEVICES_SELECTED_DEVICE, getAudioDeviceInfoMap(selectedDeviceUuid, selectedDevice));

      AndroidEventEmitter.getInstance().sendEvent(ScopeVoice, params);

      return null;
    });

    //Preload the audio files
    MediaPlayerManager.getInstance(reactContext);
  }

  @RequiresApi(api = Build.VERSION_CODES.N)
  public static WritableMap getCallInviteCustomParameters(CallInvite callInvite) {
    WritableMap customParameters = Arguments.createMap();

    callInvite.getCustomParameters().forEach((customParamKey, customParamVal) -> {
      customParameters.putString(customParamKey, customParamVal);
    });

    return customParameters;
  }

  @RequiresApi(api = Build.VERSION_CODES.N)
  public static WritableMap getCallInviteInfo(String uuid, CallInvite callInvite) {
    WritableMap callInviteInfo = Arguments.createMap();
    callInviteInfo.putString(EVENT_KEY_UUID, uuid);
    callInviteInfo.putString(EVENT_KEY_CALL_INVITE_CALL_SID, callInvite.getCallSid());
    callInviteInfo.putString(EVENT_KEY_CALL_INVITE_FROM, callInvite.getFrom());
    callInviteInfo.putString(EVENT_KEY_CALL_INVITE_TO, callInvite.getTo());

    WritableMap customParameters = getCallInviteCustomParameters(callInvite);
    callInviteInfo.putMap(EVENT_KEY_CALL_INVITE_CUSTOM_PARAMETERS, customParameters);

    return callInviteInfo;
  }

  public static WritableMap getCancelledCallInviteInfo(CancelledCallInvite cancelledCallInvite) {
    WritableMap cancelledCallInviteInfo = Arguments.createMap();
    cancelledCallInviteInfo.putString(EVENT_KEY_CANCELLED_CALL_INVITE_CALL_SID, cancelledCallInvite.getCallSid());
    cancelledCallInviteInfo.putString(EVENT_KEY_CANCELLED_CALL_INVITE_FROM, cancelledCallInvite.getFrom());
    cancelledCallInviteInfo.putString(EVENT_KEY_CANCELLED_CALL_INVITE_TO, cancelledCallInvite.getTo());
    return cancelledCallInviteInfo;
  }

  @RequiresApi(api = Build.VERSION_CODES.N)
  public static WritableMap getCallInfo(String uuid, Call call) {
    WritableMap callInfo = Arguments.createMap();
    callInfo.putString(EVENT_KEY_UUID, uuid);
    callInfo.putString(EVENT_KEY_CALL_SID, call.getSid());
    callInfo.putString(EVENT_KEY_CALL_FROM, call.getFrom());
    callInfo.putString(EVENT_KEY_CALL_TO, call.getTo());

    CallInvite callInvite = Storage.callInviteMap.get(uuid);
    if (callInvite != null) {
      WritableMap customParams = getCallInviteCustomParameters(callInvite);
      callInfo.putMap(EVENT_KEY_CALL_CUSTOM_PARAMETERS, customParams);
    }

    return callInfo;
  }

  private WritableMap getAudioDeviceInfoMap(String uuid, AudioDevice audioDevice) {
    WritableMap audioDeviceInfo = Arguments.createMap();
    audioDeviceInfo.putString(EVENT_KEY_UUID, uuid);
    audioDeviceInfo.putString(EVENT_KEY_AUDIO_DEVICES_NAME, audioDevice.getName());
    String type = audioDevice.getClass().getSimpleName();
    audioDeviceInfo.putString(EVENT_KEY_AUDIO_DEVICES_TYPE, audioDeviceTypeMap.get(type));
    return audioDeviceInfo;
  }

  @RequiresApi(api = Build.VERSION_CODES.N)
  private WritableArray getAudioDeviceInfoArray(Map<String, AudioDevice> audioDevices) {
    WritableArray audioDeviceInfoArray = Arguments.createArray();
    audioDevices.forEach((uuid, audioDevice) -> {
      WritableMap audioDeviceInfoMap = getAudioDeviceInfoMap(uuid, audioDevice);
      audioDeviceInfoArray.pushMap(audioDeviceInfoMap);
    });
    return audioDeviceInfoArray;
  }

  @RequiresApi(api = Build.VERSION_CODES.N)
  private WritableMap getAudioDeviceInfo() {
    WritableMap audioDevicesInfo = Arguments.createMap();
    audioDevicesInfo.putArray(EVENT_KEY_AUDIO_DEVICES_AUDIO_DEVICES, getAudioDeviceInfoArray(audioDeviceMap));
    audioDevicesInfo.putMap(EVENT_KEY_AUDIO_DEVICES_SELECTED_DEVICE, getAudioDeviceInfoMap(selectedDeviceUuid, audioSwitch.getSelectedAudioDevice()));
    return audioDevicesInfo;
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
        params.putString(EVENT_KEY_TYPE, VoiceEventRegistered);
        AndroidEventEmitter.getInstance().sendEvent(ScopeVoice, params);
        promise.resolve(null);
      }

      @Override
      public void onError(RegistrationException registrationException, String accessToken, String fcmToken) {
        String errorMessage = String.format("Registration Error: %d, %s",
          registrationException.getErrorCode(), registrationException.getMessage());
        Log.e(TAG, errorMessage);
        WritableMap params = Arguments.createMap();
        params.putString(EVENT_KEY_TYPE, VoiceEventError);
        WritableMap error = Arguments.createMap();
        error.putInt(EVENT_KEY_ERROR_CODE, registrationException.getErrorCode());
        error.putString(EVENT_KEY_ERROR_MESSAGE, registrationException.getMessage());
        params.putMap(EVENT_KEY_ERROR, error);
        AndroidEventEmitter.getInstance().sendEvent(ScopeVoice, params);
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
        params.putString(EVENT_KEY_TYPE, VoiceEventUnregistered);
        AndroidEventEmitter.getInstance().sendEvent(ScopeVoice, params);
        promise.resolve(null);
      }

      @Override
      public void onError(RegistrationException registrationException, String accessToken, String fcmToken) {
        String errorMessage = String.format("Unregistration Error: %d, %s", registrationException.getErrorCode(), registrationException.getMessage());
        Log.e(TAG, errorMessage);
        WritableMap params = Arguments.createMap();
        params.putString(EVENT_KEY_TYPE, VoiceEventError);
        WritableMap error = Arguments.createMap();
        error.putInt(EVENT_KEY_ERROR_CODE, registrationException.getErrorCode());
        error.putString(EVENT_KEY_ERROR_MESSAGE, registrationException.getMessage());
        params.putMap(EVENT_KEY_ERROR, error);
        AndroidEventEmitter.getInstance().sendEvent(ScopeVoice, params);
        promise.reject(errorMessage);
      }
    };
  }

  @RequiresApi(api = Build.VERSION_CODES.N)
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

    Call call = Voice.connect(getReactApplicationContext(), connectOptions, new CallListenerProxy(uuid, reactContext));
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

  @ReactMethod
  public void voice_showNativeAvRoutePicker(Promise promise) {
    // This API is iOS specific.
    promise.resolve(null);
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

  @RequiresApi(api = Build.VERSION_CODES.N)
  @ReactMethod
  public void voice_getAudioDevices(Promise promise) {
    promise.resolve(getAudioDeviceInfo());
  }

  @RequiresApi(api = Build.VERSION_CODES.N)
  @ReactMethod
  public void voice_selectAudioDevice(String uuid, Promise promise) {
    AudioDevice audioDevice = audioDeviceMap.get(uuid);

    if (audioDevice == null) {
      promise.reject("No such \"audioDevice\" object exists with UUID " + uuid);
      return;
    }

    audioSwitch.selectDevice(audioDevice);

    promise.resolve(getAudioDeviceInfo());
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

  @ReactMethod
  public void call_postFeedback(String uuid,  int scoreData, String issueData, Promise promise) {
    Call activeCall = Storage.callMap.get(uuid);

    if (activeCall == null) {
      promise.reject("No such \"call\" object exists with UUID " + uuid);
      return;
    }

    Call.Score score = getScoreFromId(scoreData);
    Call.Issue issue = getIssueFromString(issueData);

    activeCall.postFeedback(score, issue);
    promise.resolve(uuid);
  }


  @RequiresApi(api = Build.VERSION_CODES.N)
  @ReactMethod
  public void call_getStats(String uuid,  Promise promise) {
    Call activeCall = Storage.callMap.get(uuid);

    if (activeCall == null) {
      promise.reject("No such \"call\" object exists with UUID " + uuid);
      return;
    }

    activeCall.getStats(new StatsListenerProxy(uuid, reactContext, promise));
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

  @RequiresApi(api = Build.VERSION_CODES.N)
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

    Call call = activeCallInvite.accept(getReactApplicationContext(), acceptOptions, new CallListenerProxy(callInviteUuid, reactContext));
    Storage.callMap.put(callInviteUuid, call);

    // Send Event to upstream
    WritableMap params = Arguments.createMap();
    WritableMap callInviteInfo = getCallInviteInfo(callInviteUuid, activeCallInvite);
    params.putString(EVENT_KEY_TYPE, VoiceEventCallInviteAccepted);
    params.putMap(EVENT_KEY_CALL_INVITE_INFO, callInviteInfo);
    AndroidEventEmitter.getInstance().sendEvent(ScopeVoice, params);

    int notificationId = Storage.uuidNotificaionIdMap.get(callInviteUuid);
    Intent acceptIntent = new Intent(getReactApplicationContext(), IncomingCallNotificationService.class);
    acceptIntent.setAction(Constants.ACTION_CANCEL_NOTIFICATION);
    acceptIntent.putExtra(Constants.NOTIFICATION_ID, notificationId);
    acceptIntent.putExtra(Constants.UUID, callInviteUuid);

    getReactApplicationContext().startService(acceptIntent);

    WritableMap callInfo = getCallInfo(callInviteUuid, call);

    Storage.releaseCallInviteStorage(callInviteUuid, activeCallInvite.getCallSid(), Storage.uuidNotificaionIdMap.get(callInviteUuid), "accept");

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

    int notificationId = Storage.uuidNotificaionIdMap.get(uuid);
    Intent rejectIntent = new Intent(getReactApplicationContext(), IncomingCallNotificationService.class);
    rejectIntent.setAction(Constants.ACTION_CANCEL_NOTIFICATION);
    rejectIntent.putExtra(Constants.NOTIFICATION_ID, notificationId);
    rejectIntent.putExtra(Constants.UUID, uuid);
    getReactApplicationContext().startService(rejectIntent);

    Storage.releaseCallInviteStorage(uuid, activeCallInvite.getCallSid(), Storage.uuidNotificaionIdMap.get(uuid), "reject");

    promise.resolve(uuid);
  }

  Call.Score getScoreFromId (int x) {
    switch(x) {
      case 0:
        return Call.Score.NOT_REPORTED;
      case 1:
        return Call.Score.ONE;
      case 2:
        return Call.Score.TWO;
      case 3:
        return Call.Score.THREE;
      case 4:
        return Call.Score.FOUR;
      case 5:
        return Call.Score.FIVE;
    }
    return Call.Score.NOT_REPORTED;
  }

  Call.Issue getIssueFromString(String issue) {
    if (issue.compareTo(Call.Issue.NOT_REPORTED.toString()) == 0) {
      return Call.Issue.NOT_REPORTED;
    } else if (issue.compareTo(Call.Issue.DROPPED_CALL.toString()) == 0) {
      return Call.Issue.DROPPED_CALL;
    } else if (issue.compareTo(Call.Issue.AUDIO_LATENCY.toString()) == 0) {
      return Call.Issue.AUDIO_LATENCY;
    } else if (issue.compareTo(Call.Issue.ONE_WAY_AUDIO.toString()) == 0) {
      return Call.Issue.ONE_WAY_AUDIO;
    } else if (issue.compareTo(Call.Issue.CHOPPY_AUDIO.toString()) == 0) {
      return Call.Issue.CHOPPY_AUDIO;
    } else if (issue.compareTo(Call.Issue.NOISY_CALL.toString()) == 0) {
      return Call.Issue.NOISY_CALL;
    }
    return Call.Issue.NOT_REPORTED;
  }

}
