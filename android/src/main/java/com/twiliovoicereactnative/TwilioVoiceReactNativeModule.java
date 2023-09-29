package com.twiliovoicereactnative;

import android.content.Intent;
import android.util.Log;

import androidx.annotation.NonNull;

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
import com.twilio.voice.AcceptOptions;
import com.twilio.voice.Call;
import com.twilio.voice.CallInvite;
import com.twilio.voice.ConnectOptions;
import com.twilio.voice.LogLevel;
import com.twilio.voice.RegistrationException;
import com.twilio.voice.RegistrationListener;
import com.twilio.voice.UnregistrationListener;
import com.twilio.voice.Voice;

import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;
import java.util.UUID;

import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_CALL_INVITE_INFO;
import static com.twiliovoicereactnative.CommonConstants.ReactNativeVoiceSDK;
import static com.twiliovoicereactnative.CommonConstants.ReactNativeVoiceSDKVer;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventType;
import static com.twiliovoicereactnative.CommonConstants.VoiceErrorKeyError;
import static com.twiliovoicereactnative.CommonConstants.VoiceErrorKeyCode;
import static com.twiliovoicereactnative.CommonConstants.VoiceErrorKeyMessage;
import static com.twiliovoicereactnative.CommonConstants.ScopeVoice;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventAudioDevicesUpdated;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventCallInviteAccepted;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventError;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventRegistered;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventUnregistered;
import static com.twiliovoicereactnative.ReactNativeArgumentsSerializer.*;

@ReactModule(name = TwilioVoiceReactNativeModule.TAG)
public class TwilioVoiceReactNativeModule extends ReactContextBaseJavaModule {
  static final String TAG = "TwilioVoiceReactNative";

  private static final String GLOBAL_ENV = "com.twilio.voice.env";
  private static final String SDK_VERSION = "com.twilio.voice.env.sdk.version";

  private final ReactApplicationContext reactContext;
  private final AudioSwitchManager audioSwitchManager;

  public TwilioVoiceReactNativeModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;

    System.setProperty(GLOBAL_ENV, ReactNativeVoiceSDK);
    System.setProperty(SDK_VERSION, ReactNativeVoiceSDKVer);

    if (BuildConfig.DEBUG) {
      Voice.setLogLevel(LogLevel.DEBUG);
    } else {
      Voice.setLogLevel(LogLevel.ERROR);
    }

    Log.d(TAG, "instantiation of TwilioVoiceReactNativeModule");

    AndroidEventEmitter.getInstance().setContext(reactContext);
    VoiceBroadcastReceiver.getInstance().setContext(reactContext);
    audioSwitchManager = AudioSwitchManager
      .getInstance(reactContext)
      .setListener((audioDevices, selectedDeviceUuid, selectedDevice) -> {
        WritableMap audioDeviceInfo = serializeAudioDeviceInfo(
          audioDevices,
          selectedDeviceUuid,
          selectedDevice
        );
        audioDeviceInfo.putString(VoiceEventType, VoiceEventAudioDevicesUpdated);
        AndroidEventEmitter.getInstance().sendEvent(ScopeVoice, audioDeviceInfo);
      });

    //Preload the audio files
    MediaPlayerManager.getInstance(reactContext);
  }

  /**
   * Invoked by React Native, necessary when passing this NativeModule to the constructor of a
   * NativeEventEmitter on the JS layer.
   *
   * Invoked when a listener is added to the NativeEventEmitter.
   *
   * @param eventName The string representation of the event.
   */
  @ReactMethod
  public void addListener(String eventName) {
    Log.d(TAG, String.format("Calling addListener: %s", eventName));
  }

  /**
   * Invoked by React Native, necessary when passing this NativeModule to the constructor of a
   * NativeEventEmitter on the JS layer.
   *
   * Invoked when listeners are removed from the NativeEventEmitter.
   *
   * @param count The number of event listeners removed.
   */
  @ReactMethod
  public void removeListeners(Integer count) {
    Log.d(TAG, String.format("Calling removeListeners: %d", count));
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
        params.putString(VoiceEventType, VoiceEventRegistered);
        AndroidEventEmitter.getInstance().sendEvent(ScopeVoice, params);
        promise.resolve(null);
      }

      @Override
      public void onError(RegistrationException registrationException, String accessToken, String fcmToken) {
        String errorMessage = String.format("Registration Error: %d, %s",
          registrationException.getErrorCode(), registrationException.getMessage());
        Log.e(TAG, errorMessage);
        WritableMap params = Arguments.createMap();
        params.putString(VoiceEventType, VoiceEventError);
        WritableMap error = Arguments.createMap();
        error.putInt(VoiceErrorKeyCode, registrationException.getErrorCode());
        error.putString(VoiceErrorKeyMessage, registrationException.getMessage());
        params.putMap(VoiceErrorKeyError, error);
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
        params.putString(VoiceEventType, VoiceEventUnregistered);
        AndroidEventEmitter.getInstance().sendEvent(ScopeVoice, params);
        promise.resolve(null);
      }

      @Override
      public void onError(RegistrationException registrationException, String accessToken, String fcmToken) {
        String errorMessage = String.format("Unregistration Error: %d, %s", registrationException.getErrorCode(), registrationException.getMessage());
        Log.e(TAG, errorMessage);
        WritableMap params = Arguments.createMap();
        params.putString(VoiceEventType, VoiceEventError);
        WritableMap error = Arguments.createMap();
        error.putInt(VoiceErrorKeyCode, registrationException.getErrorCode());
        error.putString(VoiceErrorKeyMessage, registrationException.getMessage());
        params.putMap(VoiceErrorKeyError, error);
        AndroidEventEmitter.getInstance().sendEvent(ScopeVoice, params);
        promise.reject(errorMessage);
      }
    };
  }

  @ReactMethod
  public void voice_connect_android(String accessToken, ReadableMap twimlParams, Promise promise) {
    Log.d(TAG, "Calling voice_connect_android");
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

    WritableMap callInfo = serializeCall(uuid, call);

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

  @ReactMethod
  public void voice_getCalls(Promise promise) {
    WritableArray callInfos = Arguments.createArray();

    for (Entry<String, Call> entry : Storage.callMap.entrySet()) {
      String uuid = entry.getKey();
      Call call = entry.getValue();

      WritableMap callInfo = serializeCall(uuid, call);
      callInfos.pushMap(callInfo);
    }

    promise.resolve(callInfos);
  }

  @ReactMethod
  public void voice_getCallInvites(Promise promise) {
    WritableArray callInviteInfos = Arguments.createArray();

    for (Entry<String, CallInvite> entry : Storage.callInviteMap.entrySet()) {
      String uuid = entry.getKey();
      CallInvite callInvite = entry.getValue();

      WritableMap callInviteInfo = serializeCallInvite(uuid, callInvite);
      callInviteInfos.pushMap(callInviteInfo);
    }

    promise.resolve(callInviteInfos);
  }

  @ReactMethod
  public void voice_getAudioDevices(Promise promise) {
    Map<String, AudioDevice> audioDevices = audioSwitchManager.getAudioDevices();
    String selectedAudioDeviceUuid = audioSwitchManager.getSelectedAudioDeviceUuid();
    AudioDevice selectedAudioDevice = audioSwitchManager.getSelectedAudioDevice();

    WritableMap audioDeviceInfo = serializeAudioDeviceInfo(
      audioDevices,
      selectedAudioDeviceUuid,
      selectedAudioDevice
    );

    promise.resolve(audioDeviceInfo);
  }

  @ReactMethod
  public void voice_selectAudioDevice(String uuid, Promise promise) {
    AudioDevice audioDevice = audioSwitchManager.getAudioDevices().get(uuid);
    if (audioDevice == null) {
      promise.reject("No such \"audioDevice\" object exists with UUID " + uuid);
      return;
    }

    audioSwitchManager.getAudioSwitch().selectDevice(audioDevice);

    promise.resolve(null);
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

  @ReactMethod
  public void callInvite_accept(String callInviteUuid, ReadableMap options, Promise promise) {
    Log.d(TAG, "callInvite_accept uuid" + callInviteUuid);
    try {
      CallInvite callInvite = Storage.callInviteMap.get(callInviteUuid);

      if (callInvite == null) {
        promise.reject("No such \"callInvite\" object exists with UUID " + callInviteUuid);
        return;
      }
      // Store promise for callback
      Storage.callAcceptedPromiseMap.put(callInviteUuid, promise);

      // Send Event to service
      final int notificationId = Storage.uuidNotificationIdMap.get(callInviteUuid);
      Intent acceptIntent = new Intent(getReactApplicationContext(), IncomingCallNotificationService.class);
      acceptIntent.setAction(Constants.ACTION_ACCEPT);
      acceptIntent.putExtra(Constants.NOTIFICATION_ID, notificationId);
      acceptIntent.putExtra(Constants.UUID, callInviteUuid);
      acceptIntent.putExtra(Constants.INCOMING_CALL_INVITE, callInvite);
      getReactApplicationContext().startService(acceptIntent);
    } catch (Exception e) {
      promise.reject("Internal Error: " + e.getMessage());
      e.printStackTrace();
    }
  }

  @ReactMethod
  public void callInvite_reject(String uuid, Promise promise) {
    Log.d(TAG, "callInvite_reject uuid" + uuid);
    try {
      CallInvite callInvite = Storage.callInviteMap.get(uuid);

      if (callInvite == null) {
        promise.reject("No such \"callInvite\" object exists with UUID " + uuid);
        return;
      }

      // Store promise for callback
      Storage.callRejectPromiseMap.put(uuid, promise);

      // Send Event to service
      final int notificationId = Storage.uuidNotificationIdMap.get(uuid);
      Intent rejectIntent = new Intent(getReactApplicationContext(), IncomingCallNotificationService.class);
      rejectIntent.setAction(Constants.ACTION_REJECT);
      rejectIntent.putExtra(Constants.NOTIFICATION_ID, notificationId);
      rejectIntent.putExtra(Constants.UUID, uuid);
      rejectIntent.putExtra(Constants.INCOMING_CALL_INVITE, callInvite);
      getReactApplicationContext().startService(rejectIntent);
    } catch (Exception e) {
      promise.reject("Internal Error: " + e.getMessage());
      e.printStackTrace();
    }
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
