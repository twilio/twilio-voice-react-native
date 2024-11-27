package com.twiliovoicereactnative;

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
import com.google.firebase.messaging.FirebaseMessaging;
import com.twilio.audioswitch.AudioDevice;
import com.twilio.voice.Call;
import com.twilio.voice.CallMessage;
import com.twilio.voice.ConnectOptions;
import com.twilio.voice.LogLevel;
import com.twilio.voice.RegistrationException;
import com.twilio.voice.RegistrationListener;
import com.twilio.voice.UnregistrationListener;
import com.twilio.voice.Voice;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static com.twiliovoicereactnative.CommonConstants.ReactNativeVoiceSDK;
import static com.twiliovoicereactnative.CommonConstants.ReactNativeVoiceSDKVer;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventType;
import static com.twiliovoicereactnative.CommonConstants.VoiceErrorKeyError;
import static com.twiliovoicereactnative.CommonConstants.ScopeVoice;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventAudioDevicesUpdated;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventError;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventRegistered;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventUnregistered;
import static com.twiliovoicereactnative.JSEventEmitter.constructJSMap;
import static com.twiliovoicereactnative.ReactNativeArgumentsSerializer.serializeCall;
import static com.twiliovoicereactnative.ReactNativeArgumentsSerializer.serializeCallInvite;
import static com.twiliovoicereactnative.VoiceApplicationProxy.getCallRecordDatabase;
import static com.twiliovoicereactnative.VoiceApplicationProxy.getJSEventEmitter;
import static com.twiliovoicereactnative.VoiceApplicationProxy.getVoiceServiceApi;
import static com.twiliovoicereactnative.ReactNativeArgumentsSerializer.*;

import android.annotation.SuppressLint;
import android.content.Context;
import android.util.Pair;

import com.twiliovoicereactnative.CallRecordDatabase.CallRecord;

@ReactModule(name = TwilioVoiceReactNativeModule.TAG)
public class TwilioVoiceReactNativeModule extends ReactContextBaseJavaModule {
  static final String TAG = "TwilioVoiceReactNative";

  private static final SDKLog logger = new SDKLog(TwilioVoiceReactNativeModule.class);
  private static final String GLOBAL_ENV = "com.twilio.voice.env";
  private static final String SDK_VERSION = "com.twilio.voice.env.sdk.version";

  /**
   * Map of common constant score strings to the Call.Score enum.
   */
  private static final Map<String, Call.Score> scoreMap = Map.of(
    CommonConstants.CallFeedbackScoreNotReported, Call.Score.NOT_REPORTED,
    CommonConstants.CallFeedbackScoreOne, Call.Score.ONE,
    CommonConstants.CallFeedbackScoreTwo, Call.Score.TWO,
    CommonConstants.CallFeedbackScoreThree, Call.Score.THREE,
    CommonConstants.CallFeedbackScoreFour, Call.Score.FOUR,
    CommonConstants.CallFeedbackScoreFive, Call.Score.FIVE
  );

  /**
   * Map of common constant issue strings to the Call.Issue enum.
   */
  private static final Map<String, Call.Issue> issueMap = Map.of(
    CommonConstants.CallFeedbackIssueAudioLatency, Call.Issue.AUDIO_LATENCY,
    CommonConstants.CallFeedbackIssueChoppyAudio, Call.Issue.CHOPPY_AUDIO,
    CommonConstants.CallFeedbackIssueEcho, Call.Issue.ECHO,
    CommonConstants.CallFeedbackIssueDroppedCall, Call.Issue.DROPPED_CALL,
    CommonConstants.CallFeedbackIssueNoisyCall, Call.Issue.NOISY_CALL,
    CommonConstants.CallFeedbackIssueNotReported, Call.Issue.NOT_REPORTED,
    CommonConstants.CallFeedbackIssueOneWayAudio, Call.Issue.ONE_WAY_AUDIO
  );

  private final ReactApplicationContext reactContext;
  private final AudioSwitchManager audioSwitchManager;

  public TwilioVoiceReactNativeModule(ReactApplicationContext reactContext) {
    super(reactContext);

    logger.log("instantiation of TwilioVoiceReactNativeModule");
    this.reactContext = reactContext;
    System.setProperty(GLOBAL_ENV, ReactNativeVoiceSDK);
    System.setProperty(SDK_VERSION, ReactNativeVoiceSDKVer);
    Voice.setLogLevel(BuildConfig.DEBUG ? LogLevel.DEBUG : LogLevel.ERROR);

    getJSEventEmitter().setContext(reactContext);

    audioSwitchManager = VoiceApplicationProxy.getAudioSwitchManager()
      .setListener((audioDevices, selectedDeviceUuid, selectedDevice) -> {
        WritableMap audioDeviceInfo = serializeAudioDeviceInfo(
          audioDevices,
          selectedDeviceUuid,
          selectedDevice
        );
        audioDeviceInfo.putString(VoiceEventType, VoiceEventAudioDevicesUpdated);
        getJSEventEmitter().sendEvent(ScopeVoice, audioDeviceInfo);
      });
  }

  /**
   * Invoked by React Native, necessary when passing this NativeModule to the constructor of a
   * NativeEventEmitter on the JS layer.
   * <p>
   * Invoked when a listener is added to the NativeEventEmitter.
   *
   * @param eventName The string representation of the event.
   */
  @ReactMethod
  public void addListener(String eventName) {
    logger.debug(String.format("Calling addListener: %s", eventName));
  }

  /**
   * Invoked by React Native, necessary when passing this NativeModule to the constructor of a
   * NativeEventEmitter on the JS layer.
   * <p>
   * Invoked when listeners are removed from the NativeEventEmitter.
   *
   * @param count The number of event listeners removed.
   */
  @ReactMethod
  public void removeListeners(Integer count) {
    logger.debug("Calling removeListeners: " + count);
  }

  @Override
  @NonNull
  public String getName() {
    return TAG;
  }

  private RegistrationListener createRegistrationListener(Promise promise) {
    return new RegistrationListener() {
      @Override
      public void onRegistered(@NonNull String accessToken, @NonNull String fcmToken) {
        logger.log("Successfully registered FCM");
        sendJSEvent(constructJSMap(new Pair<>(VoiceEventType, VoiceEventRegistered)));
        promise.resolve(null);
      }

      @Override
      public void onError(@NonNull RegistrationException registrationException,
                          @NonNull String accessToken,
                          @NonNull String fcmToken) {
        String errorMessage = reactContext.getString(
          R.string.registration_error,
          registrationException.getErrorCode(),
          registrationException.getMessage());
        logger.error(errorMessage);

        sendJSEvent(constructJSMap(
          new Pair<>(VoiceEventType, VoiceEventError),
          new Pair<>(VoiceErrorKeyError, serializeVoiceException(registrationException))));

        promise.reject(errorMessage);
      }
    };
  }

  private UnregistrationListener createUnregistrationListener(Promise promise) {
    return new UnregistrationListener() {
      @Override
      public void onUnregistered(String accessToken, String fcmToken) {
        logger.log("Successfully unregistered FCM");
        sendJSEvent(constructJSMap(new Pair<>(VoiceEventType, VoiceEventUnregistered)));
        promise.resolve(null);
      }

      @Override
      public void onError(RegistrationException registrationException, String accessToken, String fcmToken) {
        @SuppressLint("DefaultLocale")
        String errorMessage = reactContext.getString(
          R.string.unregistration_error,
          registrationException.getErrorCode(),
          registrationException.getMessage());
        logger.error(errorMessage);

        sendJSEvent(constructJSMap(
          new Pair<>(VoiceEventType, VoiceEventError),
          new Pair<>(VoiceErrorKeyError, serializeVoiceException(registrationException))));

        promise.reject(errorMessage);
      }
    };
  }

  @ReactMethod
  public void voice_connect_android(
    String accessToken,
    ReadableMap twimlParams,
    String notificationDisplayName,
    Promise promise
  ) {
    logger.debug("Calling voice_connect_android");
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
          logger.warning("Could not convert with key: " + key + ".");
          break;
      }
    }

    // connect & create call record
    final UUID uuid = UUID.randomUUID();
    final String callRecipient =
      (parsedTwimlParams.containsKey("to") && !(parsedTwimlParams.get("to").isBlank()))
        ? parsedTwimlParams.get("to")
        : getReactApplicationContext().getString(R.string.unknown_call_recipient);
    ConnectOptions connectOptions = new ConnectOptions.Builder(accessToken)
      .enableDscp(true)
      .params(parsedTwimlParams)
      .callMessageListener(new CallMessageListenerProxy())
      .build();
    try {
      CallRecord callRecord = new CallRecord(
        uuid,
        getVoiceServiceApi().connect(
          connectOptions,
          new CallListenerProxy(uuid, getVoiceServiceApi().getServiceContext())),
        callRecipient,
        parsedTwimlParams,
        CallRecord.Direction.OUTGOING,
        notificationDisplayName);
      getCallRecordDatabase().add(callRecord);
      // notify JS layer
      promise.resolve(serializeCall(callRecord));
    } catch (SecurityException e) {
      promise.reject(e, serializeError(31401, e.getMessage()));
    }
  }

  @ReactMethod
  public void voice_getVersion(Promise promise) {
    promise.resolve(Voice.getVersion());
  }

  @ReactMethod
  public void voice_getDeviceToken(Promise promise) {
    FirebaseMessaging.getInstance().getToken()
      .addOnCompleteListener(task -> {
        if (!task.isSuccessful()) {
          final String warningMsg =
            reactContext.getString(R.string.fcm_token_registration_fail, task.getException());
          logger.warning(warningMsg);
          promise.reject(warningMsg);
          return;
        }

        // Get FCM registration token
        String fcmToken = task.getResult();

        if (fcmToken == null) {
          final String warningMsg = reactContext.getString(R.string.fcm_token_null);
          logger.warning(warningMsg);
          promise.reject(warningMsg);
        } else {
          promise.resolve(fcmToken);
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
    for (CallRecord callRecord: getCallRecordDatabase().getCollection()) {
      // incoming calls that have not been acted on do not have call-objects
      if (null != callRecord.getVoiceCall()) {
        callInfos.pushMap(serializeCall(callRecord));
      }
    }
    promise.resolve(callInfos);
  }

  @ReactMethod
  public void voice_getCallInvites(Promise promise) {
    WritableArray callInviteInfos = Arguments.createArray();
    for (CallRecord callRecord: getCallRecordDatabase().getCollection()) {
      if (null != callRecord.getCallInvite() &&
          CallRecord.CallInviteState.ACTIVE == callRecord.getCallInviteState()) {
        callInviteInfos.pushMap(serializeCallInvite(callRecord));
      }
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
      promise.reject(reactContext.getString(R.string.missing_audiodevice_uuid, uuid));
      return;
    }

    audioSwitchManager.getAudioSwitch().selectDevice(audioDevice);

    promise.resolve(null);
  }

  @ReactMethod
  public void voice_setIncomingCallContactHandleTemplate(String template, Promise promise) {
    ConfigurationProperties.setIncomingCallContactHandleTemplate(template);
    promise.resolve(null);
  }

  /**
   * Call methods.
   */

  @ReactMethod
  public void call_getState(String uuid, Promise promise) {
    final CallRecord callRecord = validateCallRecord(reactContext, UUID.fromString(uuid), promise);

    if (null != callRecord) {
      promise.resolve(callRecord.getVoiceCall().getState().toString().toLowerCase());
    }
  }

  @ReactMethod
  public void call_isMuted(String uuid, Promise promise) {
    final CallRecord callRecord = validateCallRecord(reactContext, UUID.fromString(uuid), promise);

    if (null != callRecord) {
      promise.resolve(callRecord.getVoiceCall().isMuted());
    }
  }

  @ReactMethod
  public void call_isOnHold(String uuid, Promise promise) {
    final CallRecord callRecord = validateCallRecord(reactContext, UUID.fromString(uuid), promise);

    if (null != callRecord) {
      promise.resolve(callRecord.getVoiceCall().isOnHold());
    }
  }

  @ReactMethod
  public void call_disconnect(String uuid, Promise promise) {
    final CallRecord callRecord = validateCallRecord(reactContext, UUID.fromString(uuid), promise);

    if (null != callRecord) {
      getVoiceServiceApi().disconnect(callRecord);
      promise.resolve(uuid);
    }
  }

  @ReactMethod
  public void call_hold(String uuid, boolean hold, Promise promise) {
    final CallRecord callRecord = validateCallRecord(reactContext, UUID.fromString(uuid), promise);

    if (null != callRecord) {
      callRecord.getVoiceCall().hold(hold);
      promise.resolve(callRecord.getVoiceCall().isOnHold());
    }
  }

  @ReactMethod
  public void call_mute(String uuid, boolean mute, Promise promise) {
    final CallRecord callRecord = validateCallRecord(reactContext, UUID.fromString(uuid), promise);

    if (null != callRecord) {
      callRecord.getVoiceCall().mute(mute);
      promise.resolve(callRecord.getVoiceCall().isMuted());
    }
  }

  @ReactMethod
  public void call_sendDigits(String uuid, String digits, Promise promise) {
    final CallRecord callRecord = validateCallRecord(reactContext, UUID.fromString(uuid), promise);

    if (null != callRecord) {
      callRecord.getVoiceCall().sendDigits(digits);
      promise.resolve(uuid);
    }
  }

  @ReactMethod
  public void call_postFeedback(String uuid, String score, String issue, Promise promise) {
    final CallRecord callRecord = validateCallRecord(reactContext, UUID.fromString(uuid), promise);

    if (null != callRecord) {
      Call.Score parsedScore = getScoreFromString(score);
      Call.Issue parsedIssue = getIssueFromString(issue);

      callRecord.getVoiceCall().postFeedback(parsedScore, parsedIssue);

      promise.resolve(uuid);
    }
  }


  @ReactMethod
  public void call_getStats(String uuid, Promise promise) {
    final CallRecord callRecord = validateCallRecord(reactContext, UUID.fromString(uuid), promise);

    if (null != callRecord) {
      callRecord.getVoiceCall().getStats(new StatsListenerProxy(uuid, reactContext, promise));
    }
  }

  @ReactMethod
  public void call_sendMessage(String uuid, String content, String contentType, String messageType, Promise promise) {
    final CallRecord callRecord = getCallRecordDatabase().get(new CallRecord(UUID.fromString(uuid)));

    final CallMessage callMessage = new CallMessage.Builder(messageType)
      .contentType(contentType).content(content).build();

    promise.resolve((CallRecord.CallInviteState.ACTIVE == callRecord.getCallInviteState())
      ? callRecord.getCallInvite().sendMessage(callMessage)
      : callRecord.getVoiceCall().sendMessage(callMessage));
  }

  // Register/UnRegister

  @ReactMethod
  public void voice_register(String token, Promise promise) {
    FirebaseMessaging.getInstance().getToken()
      .addOnCompleteListener(task -> {
        if (!task.isSuccessful()) {
          final String warningMsg =
            reactContext.getString(R.string.fcm_token_registration_fail, task.getException());
          logger.warning(warningMsg);
          promise.reject(warningMsg);
          return;
        }

        // Get new FCM registration token
        String fcmToken = task.getResult();

        if (fcmToken == null) {
          final String warningMsg = reactContext.getString(R.string.fcm_token_null);
          logger.warning(warningMsg);
          promise.reject(warningMsg);
          return;
        }

        // Log and toast
        logger.debug("Registering with FCM with token " + fcmToken);
        RegistrationListener registrationListener = createRegistrationListener(promise);
        Voice.register(token, Voice.RegistrationChannel.FCM, fcmToken, registrationListener);
      });
  }

  @ReactMethod
  public void voice_unregister(String token, Promise promise) {
    FirebaseMessaging.getInstance().getToken()
      .addOnCompleteListener(task -> {
        if (!task.isSuccessful()) {
          final String warningMsg =
            reactContext.getString(R.string.fcm_token_registration_fail, task.getException());
          logger.warning(warningMsg);
          promise.reject(warningMsg);
          return;
        }

        // Get new FCM registration token
        String fcmToken = task.getResult();

        if (fcmToken == null) {
          final String warningMsg = reactContext.getString(R.string.fcm_token_null);
          logger.warning(warningMsg);
          promise.reject(warningMsg);
          return;
        }

        // Log and toast
        logger.debug("Registering with FCM with token " + fcmToken);
        UnregistrationListener unregistrationListener = createUnregistrationListener(promise);
        Voice.unregister(token, Voice.RegistrationChannel.FCM, fcmToken, unregistrationListener);
      });
  }

  @ReactMethod void voice_handleEvent(ReadableMap messageData, Promise promise) {
    // validate embedded firebase module is disabled
    if (ConfigurationProperties.isFirebaseServiceEnabled(reactContext)) {
      final String errorMsg = reactContext.getString(R.string.method_invocation_invalid);
      logger.warning("Embedded firebase messaging enabled, handleEvent invocation invalid!");
      promise.reject(errorMsg);
      return;
    }
    // parse data to string map
    final HashMap<String, String> parsedMessageData = new HashMap<>();
    ReadableMapKeySetIterator iterator = messageData.keySetIterator();
    while (iterator.hasNextKey()) {
      String key = iterator.nextKey();
      parsedMessageData.put(key, messageData.getString(key));
    }
    // attempt to parse message
    if (Voice.handleMessage(
      reactContext,
      parsedMessageData,
      new VoiceFirebaseMessagingService.MessageHandler(),
      new CallMessageListenerProxy())) {
      promise.resolve(true);
    } else {
      promise.resolve(false);
    }
  }

  // CallInvite

  @ReactMethod
  public void callInvite_accept(String callInviteUuid, ReadableMap options, Promise promise) {
    logger.debug("callInvite_accept uuid" + callInviteUuid);
    final CallRecord callRecord =
      validateCallInviteRecord(reactContext, UUID.fromString(callInviteUuid), promise);

    if (null != callRecord) {
      // Store promise for callback
      callRecord.setCallAcceptedPromise(promise);

      // Send Event to service
      try {
        getVoiceServiceApi().acceptCall(callRecord);
      } catch (SecurityException e) {
        promise.reject(e, serializeError(31401, e.getMessage()));
      }
    }
  }

  @ReactMethod
  public void callInvite_reject(String uuid, Promise promise) {
    logger.debug("callInvite_reject uuid" + uuid);

    final CallRecord callRecord =
      validateCallInviteRecord(reactContext, UUID.fromString(uuid), promise);

    if (null != callRecord) {
      // Store promise for callback
      callRecord.setCallRejectedPromise(promise);

      // Send Event to service
      getVoiceServiceApi().rejectCall(callRecord);
    }
  }

  /**
   * Use the score map to get a Call.Score value from a string.
   * @param score The score as a string passed from the JS layer.
   * @return a Call.Score enum value. If the passed string is not in the enum, defaults to
   * Call.Score.NOT_REPORTED.
   */
  private static Call.Score getScoreFromString(String score) {
    return scoreMap.containsKey(score)
      ? scoreMap.get(score)
      : Call.Score.NOT_REPORTED;
  }

  /**
   * Use the issue map to get a Call.Issue value from a string.
   * @param issue The issue as a string passed from the JS layer.
   * @return a Call.Issue enum value. If the passed string is not in the enum, defaults to
   * Call.Issue.NOT_REPORTED.
   */
  private static Call.Issue getIssueFromString(String issue) {
    return issueMap.containsKey(issue)
      ? issueMap.get(issue)
      : Call.Issue.NOT_REPORTED;
  }

  private static CallRecord validateCallRecord(@NonNull final Context context,
                                               @NonNull final UUID uuid,
                                               @NonNull final Promise promise) {
    CallRecord callRecord = getCallRecordDatabase().get(new CallRecord(uuid));

    if (null == callRecord || null == callRecord.getVoiceCall()) {
      promise.reject(context.getString(R.string.missing_call_uuid, uuid));
      return null;
    }
    return callRecord;
  }
  private static CallRecord validateCallInviteRecord(@NonNull final Context context,
                                                     @NonNull final UUID uuid,
                                                     @NonNull final Promise promise) {
    CallRecord callRecord = getCallRecordDatabase().get(new CallRecord(uuid));

    if (null == callRecord || null == callRecord.getCallInvite()) {
      promise.reject(context.getString(R.string.missing_callinvite_uuid, uuid));
      return null;
    }
    return callRecord;
  }
  private static void sendJSEvent(@NonNull WritableMap event) {
    getJSEventEmitter().sendEvent(ScopeVoice, event);
  }
}
