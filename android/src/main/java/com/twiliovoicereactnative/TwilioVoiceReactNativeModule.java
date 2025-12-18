package com.twiliovoicereactnative;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.module.annotations.ReactModule;
import com.twilio.voice.AudioCodec;
import com.twilio.voice.IceOptions;
import com.twilio.voice.IceServer;
import com.twilio.voice.IceTransportPolicy;
import com.twilio.voice.OpusCodec;
import com.twilio.voice.PcmuCodec;
import com.twilio.voice.PreflightOptions;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;


@ReactModule(name = TwilioVoiceReactNativeModule.NAME)
public class TwilioVoiceReactNativeModule extends ReactContextBaseJavaModule {
  private record PromiseAdapter(Promise promise) implements ModuleProxy.UniversalPromise {
    public void resolve(Object value) {
      promise.resolve(
        ReactNativeArgumentsSerializer.serializePromiseResolution(value)
      );
    }

    public void rejectWithCode(int code, String message) {
      promise.resolve(
        ReactNativeArgumentsSerializer.serializePromiseErrorWithCode(code, message)
      );
    }

    public void rejectWithName(String name, String message) {
      promise.resolve(
        ReactNativeArgumentsSerializer.serializePromiseErrorWithName(name, message)
      );
    }
  }

  public static final String NAME = "TwilioVoiceReactNative";

  private static final SDKLog logger = new SDKLog(TwilioVoiceReactNativeModule.class);

  private final ModuleProxy moduleProxy;

  public TwilioVoiceReactNativeModule(ReactApplicationContext reactContext) {
    super(reactContext);

    logger.log("instantiation of TwilioVoiceReactNativeModule");

    this.moduleProxy = new ModuleProxy(reactContext);
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
    return NAME;
  }

  @ReactMethod
  public void testing_promiseReject(Promise promise) {
    promise.reject("is this a code", "is this a message", new Error());
  }

  /**
   * Call API
   */

  @ReactMethod
  public void call_disconnect(String uuid, Promise promise) {
    this.moduleProxy.call.disconnect(uuid, new PromiseAdapter(promise));
  }

  @ReactMethod
  public void call_getState(String uuid, Promise promise) {
    this.moduleProxy.call.getState(uuid, new PromiseAdapter(promise));
  }

  @ReactMethod
  public void call_getStats(String uuid, Promise promise) {
    this.moduleProxy.call.getStats(uuid, new PromiseAdapter(promise));
  }

  @ReactMethod
  public void call_hold(String uuid, boolean hold, Promise promise) {
    this.moduleProxy.call.hold(uuid, hold, new PromiseAdapter(promise));
  }

  @ReactMethod
  public void call_isMuted(String uuid, Promise promise) {
    this.moduleProxy.call.isMuted(uuid, new PromiseAdapter(promise));
  }

  @ReactMethod
  public void call_isOnHold(String uuid, Promise promise) {
    this.moduleProxy.call.isOnHold(uuid, new PromiseAdapter(promise));
  }

  @ReactMethod
  public void call_mute(String uuid, boolean mute, Promise promise) {
    this.moduleProxy.call.mute(uuid, mute, new PromiseAdapter(promise));
  }

  @ReactMethod
  public void call_postFeedback(String uuid, String score, String issue, Promise promise) {
    this.moduleProxy.call.postFeedback(uuid, score, issue, new PromiseAdapter(promise));
  }

  @ReactMethod
  public void call_sendDigits(String uuid, String digits, Promise promise) {
    this.moduleProxy.call.sendDigits(uuid, digits, new PromiseAdapter(promise));
  }

  @ReactMethod
  public void call_sendMessage(
    String uuid,
    String content,
    String contentType,
    String messageType,
    Promise promise
  ) {
    this.moduleProxy.call.sendMessage(
      uuid,
      content,
      contentType,
      messageType,
      new PromiseAdapter(promise)
    );
  }

  /**
   * CallInvite API
   */

  @ReactMethod
  public void callInvite_accept(String uuid, ReadableMap options, Promise promise) {
    this.moduleProxy.callInvite.accept(uuid, new PromiseAdapter(promise));
  }

  @ReactMethod
  public void callInvite_reject(String uuid, Promise promise) {
    this.moduleProxy.callInvite.reject(uuid, new PromiseAdapter(promise));
  }

  @ReactMethod
  public void callInvite_sendMessage(
    String uuid,
    String content,
    String contentType,
    String messageType,
    Promise promise
  ) {
    this.moduleProxy.callInvite.sendMessage(
      uuid,
      content,
      contentType,
      messageType,
      new PromiseAdapter(promise)
    );
  }

  /**
   * PreflightTest API
   */

  @ReactMethod
  public void preflightTest_getCallSid(String uuidStr, Promise promise) {
    this.moduleProxy.preflightTest.getCallSid(uuidStr, new PromiseAdapter(promise));
  }

  @ReactMethod
  public void preflightTest_getEndTime(String uuidStr, Promise promise) {
    this.moduleProxy.preflightTest.getEndTime(uuidStr, new PromiseAdapter(promise));
  }

  @ReactMethod
  public void preflightTest_getLatestSample(String uuidStr, Promise promise) {
    this.moduleProxy.preflightTest.getLatestSample(uuidStr, new PromiseAdapter(promise));
  }

  @ReactMethod
  public void preflightTest_getReport(String uuidStr, Promise promise) {
    this.moduleProxy.preflightTest.getReport(uuidStr, new PromiseAdapter(promise));
  }

  @ReactMethod
  public void preflightTest_getStartTime(String uuidStr, Promise promise) {
    this.moduleProxy.preflightTest.getStartTime(uuidStr, new PromiseAdapter(promise));
  }

  @ReactMethod
  public void preflightTest_getState(String uuidStr, Promise promise) {
    this.moduleProxy.preflightTest.getState(uuidStr, new PromiseAdapter(promise));
  }

  @ReactMethod
  public void preflightTest_stop(String uuidStr, Promise promise) {
    this.moduleProxy.preflightTest.stop(uuidStr, new PromiseAdapter(promise));
  }

  /**
   * Voice API
   */

  @ReactMethod
  public void voice_connect_android(
    String accessToken,
    ReadableMap twimlParams,
    String notificationDisplayName,
    Promise promise
  ) {
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

    this.moduleProxy.voice.connect(
      accessToken,
      parsedTwimlParams,
      notificationDisplayName,
      new PromiseAdapter(promise)
    );
  }

  @ReactMethod
  public void voice_getAudioDevices(Promise promise) {
    this.moduleProxy.voice.getAudioDevices(new PromiseAdapter(promise));
  }

  @ReactMethod
  public void voice_getCalls(Promise promise) {
    this.moduleProxy.voice.getCalls(new PromiseAdapter(promise));
  }

  @ReactMethod
  public void voice_getCallInvites(Promise promise) {
    this.moduleProxy.voice.getCallInvites(new PromiseAdapter(promise));
  }

  @ReactMethod
  public void voice_getDeviceToken(Promise promise) {
    this.moduleProxy.voice.getDeviceToken(new PromiseAdapter(promise));
  }

  @ReactMethod
  public void voice_getVersion(Promise promise) {
    this.moduleProxy.voice.getVersion(new PromiseAdapter(promise));
  }

  @ReactMethod
  public void voice_handleEvent(ReadableMap messageData, Promise promise) {
    // parse data to string map
    final HashMap<String, String> parsedMessageData = new HashMap<>();
    ReadableMapKeySetIterator iterator = messageData.keySetIterator();
    while (iterator.hasNextKey()) {
      String key = iterator.nextKey();
      parsedMessageData.put(key, messageData.getString(key));
    }

    this.moduleProxy.voice.handleEvent(parsedMessageData, new PromiseAdapter(promise));
  }

  @ReactMethod
  public void voice_register(String token, Promise promise) {
    this.moduleProxy.voice.register(token, new PromiseAdapter(promise));
  }

  @ReactMethod
  public void voice_runPreflight(String accessToken, ReadableMap options, Promise promise) {
    logger.debug(".voice_runPreflight");

    final ModuleProxy.UniversalPromise uPromise = new PromiseAdapter(promise);

    final PreflightOptions.Builder preflightOptionsBuilder = new PreflightOptions.Builder(accessToken);

    // parse audio codec logic
    final List<AudioCodec> preferredAudioCodecs = new ArrayList<>();

    final ReadableArray jsPreferredAudioCodecs = Optional
      .ofNullable(options.getArray(CommonConstants.CallOptionsKeyPreferredAudioCodecs))
      .orElse(Arguments.createArray());

    for (int i = 0; i < jsPreferredAudioCodecs.size(); i++) {
      final ReadableMap jsAudioCodec = jsPreferredAudioCodecs.getMap(i);
      if (jsAudioCodec == null) {
        continue;
      }

      final String jsAudioCodecType = Optional
        .ofNullable(jsAudioCodec.getString(CommonConstants.AudioCodecKeyType))
        .orElse("");

      if (jsAudioCodecType.equals(CommonConstants.AudioCodecTypeValuePCMU)) {
        preferredAudioCodecs.add(new PcmuCodec());
        continue;
      }

      if (jsAudioCodecType.equals(CommonConstants.AudioCodecTypeValueOpus)) {
        if (!jsAudioCodec.hasKey(CommonConstants.AudioCodecOpusKeyMaxAverageBitrate)) {
          preferredAudioCodecs.add(new OpusCodec());
          continue;
        }

        final ReadableType maxAvgBitrateType = jsAudioCodec
          .getDynamic(CommonConstants.AudioCodecOpusKeyMaxAverageBitrate)
          .getType();

        int maxAvgBitrate = 0;

        if (ReadableType.Number.equals(maxAvgBitrateType)) {
          maxAvgBitrate = Math.max(
            maxAvgBitrate,
            jsAudioCodec.getInt(CommonConstants.AudioCodecOpusKeyMaxAverageBitrate)
          );
        }

        preferredAudioCodecs.add(new OpusCodec(maxAvgBitrate));
      }
    }

    if (!preferredAudioCodecs.isEmpty()) {
      preflightOptionsBuilder.preferAudioCodecs(preferredAudioCodecs);
    }

    // Ice servers logic.
    final Set<IceServer> iceServers = new HashSet<>();

    final ReadableArray jsIceServers = Optional
      .ofNullable(options.getArray(CommonConstants.CallOptionsKeyIceServers))
      .orElse(Arguments.createArray());

    for (int i = 0; i < jsIceServers.size(); i++) {
      final ReadableMap jsIceServer = Optional
        .ofNullable(jsIceServers.getMap(i))
        .orElse(Arguments.createMap());

      final String serverUrl = jsIceServer.getString(CommonConstants.IceServerKeyServerUrl);

      final String username = Optional
        .ofNullable(jsIceServer.getString(CommonConstants.IceServerKeyUsername))
        .orElse("");

      final String password = Optional
        .ofNullable(jsIceServer.getString(CommonConstants.IceServerKeyPassword))
        .orElse("");

      if (serverUrl == null) {
        uPromise.rejectWithName(
          CommonConstants.ErrorCodeInvalidArgumentError,
          "Server URL must be a non-null string."
        );
        return;
      }

      iceServers.add(new IceServer(serverUrl, username, password));
    }

    // Ice transport policy logic.
    final String jsIceTransportPolicy = Optional
      .ofNullable(options.getString(CommonConstants.CallOptionsKeyIceTransportPolicy))
      .orElse("");

    final IceTransportPolicy iceTransportPolicy = switch (jsIceTransportPolicy) {
      case CommonConstants.IceTransportPolicyValueAll -> IceTransportPolicy.ALL;
      case CommonConstants.IceTransportPolicyValueRelay -> IceTransportPolicy.RELAY;
      default -> null;
    };

    // Finally, build the options.
    final IceOptions.Builder iceOptionsBuilder = new IceOptions.Builder();

    if (iceTransportPolicy != null) {
      iceOptionsBuilder.iceTransportPolicy(iceTransportPolicy);
    }

    if (!iceServers.isEmpty()) {
      iceOptionsBuilder.iceServers(iceServers);
    }

    if (!iceServers.isEmpty() || iceTransportPolicy != null) {
      preflightOptionsBuilder.iceOptions(iceOptionsBuilder.build());
    }

    final PreflightOptions preflightOptions = preflightOptionsBuilder.build();
    this.moduleProxy.voice.runPreflight(preflightOptions, new PromiseAdapter(promise));
  }

  @ReactMethod
  public void voice_selectAudioDevice(String uuid, Promise promise) {
    this.moduleProxy.voice.selectAudioDevice(uuid, new PromiseAdapter(promise));
  }

  @ReactMethod
  public void voice_setIncomingCallContactHandleTemplate(String template, Promise promise) {
    this.moduleProxy.voice.setIncomingCallContactHandleTemplate(template, new PromiseAdapter(promise));
  }

  @ReactMethod
  public void voice_unregister(String token, Promise promise) {
    this.moduleProxy.voice.unregister(token, new PromiseAdapter(promise));
  }
}
