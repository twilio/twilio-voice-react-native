package com.twiliovoicereactnative;

import static com.twiliovoicereactnative.CommonConstants.AudioDeviceKeyAudioDevices;
import static com.twiliovoicereactnative.CommonConstants.AudioDeviceKeyName;
import static com.twiliovoicereactnative.CommonConstants.AudioDeviceKeySelectedDevice;
import static com.twiliovoicereactnative.CommonConstants.AudioDeviceKeyType;
import static com.twiliovoicereactnative.CommonConstants.AudioDeviceKeyUuid;
import static com.twiliovoicereactnative.CommonConstants.CallInfoFrom;
import static com.twiliovoicereactnative.CommonConstants.CallInfoInitialConnectedTimestamp;
import static com.twiliovoicereactnative.CommonConstants.CallInfoSid;
import static com.twiliovoicereactnative.CommonConstants.CallInfoTo;
import static com.twiliovoicereactnative.CommonConstants.CallInfoUuid;
import static com.twiliovoicereactnative.CommonConstants.CallInfoState;
import static com.twiliovoicereactnative.CommonConstants.CallInfoIsMuted;
import static com.twiliovoicereactnative.CommonConstants.CallInfoIsOnHold;
import static com.twiliovoicereactnative.CommonConstants.CallMessageContent;
import static com.twiliovoicereactnative.CommonConstants.CallMessageContentType;
import static com.twiliovoicereactnative.CommonConstants.CallMessageMessageType;
import static com.twiliovoicereactnative.CommonConstants.ScopeVoice;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventError;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventSid;
import static com.twiliovoicereactnative.CommonConstants.CallStateConnected;
import static com.twiliovoicereactnative.CommonConstants.CallStateConnecting;
import static com.twiliovoicereactnative.CommonConstants.CallStateDisconnected;
import static com.twiliovoicereactnative.CommonConstants.CallStateReconnecting;
import static com.twiliovoicereactnative.CommonConstants.CallStateRinging;
import static com.twiliovoicereactnative.CommonConstants.CallInviteInfoCallSid;
import static com.twiliovoicereactnative.CommonConstants.CallInviteInfoCustomParameters;
import static com.twiliovoicereactnative.CommonConstants.CallInviteInfoFrom;
import static com.twiliovoicereactnative.CommonConstants.CallInviteInfoTo;
import static com.twiliovoicereactnative.CommonConstants.CallInviteInfoUuid;
import static com.twiliovoicereactnative.CommonConstants.CancelledCallInviteInfoCallSid;
import static com.twiliovoicereactnative.CommonConstants.CancelledCallInviteInfoFrom;
import static com.twiliovoicereactnative.CommonConstants.CancelledCallInviteInfoTo;
import static com.twiliovoicereactnative.CommonConstants.VoiceErrorKeyCode;
import static com.twiliovoicereactnative.CommonConstants.VoiceErrorKeyMessage;
import static com.twiliovoicereactnative.CommonConstants.VoiceEventType;
import static com.twiliovoicereactnative.JSEventEmitter.constructJSMap;

import java.text.SimpleDateFormat;
import android.util.Pair;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.twilio.voice.CallMessage;
import com.twilio.voice.CancelledCallInvite;
import com.twilio.voice.VoiceException;
import com.twiliovoicereactnative.CallRecordDatabase.CallRecord;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.twilio.audioswitch.AudioDevice;
import com.twilio.voice.Call;
import com.twilio.voice.CallInvite;

import java.util.Date;
import java.util.Locale;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

/**
 * This class provides static helper functions that serializes native objects into
 * React Native (RN) bridge objects emit-able to the JS layer.
 */
class ReactNativeArgumentsSerializer {
  private static final SDKLog logger = new SDKLog(ReactNativeArgumentsSerializer.class);
  /**
   * Serializes the custom parameters of a CallInvite.
   * @param callInvite A CallInvite object
   * @return Serialized CallInvite custom parameters
   */
  public static WritableMap serializeCallInviteCustomParameters(CallInvite callInvite) {
    if (null != callInvite) {
      WritableMap customParameters = Arguments.createMap();
      for (Entry<String, String> entry : callInvite.getCustomParameters().entrySet()) {
        String customParameterKey = entry.getKey();
        String customParameterValue = entry.getValue();

        customParameters.putString(customParameterKey, customParameterValue);
      }
      return customParameters;
    }
    return null;
  }

  /**
   * Serializes a CallInvite.
   * @param CallRecord the callRecord
   * @return A serialized CallInvite
   */
  public static WritableMap serializeCallInvite(@NonNull final CallRecord callRecord) {
    // validate input
    final UUID uuid = Objects.requireNonNull(callRecord.getUuid());
    final CallInvite callInvite = Objects.requireNonNull(callRecord.getCallInvite());

    // serialize
    return constructJSMap(
      new Pair<>(CallInviteInfoUuid, uuid.toString()),
      new Pair<>(CallInviteInfoCallSid, callInvite.getCallSid()),
      new Pair<>(CallInviteInfoFrom, callInvite.getFrom()),
      new Pair<>(CallInviteInfoTo, callInvite.getTo()),
      new Pair<>(CallInviteInfoCustomParameters, serializeCallInviteCustomParameters(callInvite)));
  }

  /**
   * Serializes a CancelledCallInvite.
   * @param CallRecord The callRecord
   * @return A serialized CancelledCallInvite
   */
  public static WritableMap serializeCancelledCallInvite(@NonNull final CallRecord callRecord) {
    // validate input
    final CancelledCallInvite callInvite = Objects.requireNonNull(callRecord.getCancelledCallInvite());

    // serialize
    return constructJSMap(
      new Pair<>(CancelledCallInviteInfoCallSid, callInvite.getCallSid()),
      new Pair<>(CancelledCallInviteInfoFrom, callInvite.getFrom()),
      new Pair<>(CancelledCallInviteInfoTo, callInvite.getTo()));
  }

  /**
   * Convert the call state enumeration to a string that the JS layer expects.
   * @param state The call state
   * @return A string representing the state
   */
  public static String callStateToString(Call.State state) {
    switch (state) {
      case CONNECTED:
        return CallStateConnected;
      case CONNECTING:
        return CallStateConnecting;
      case DISCONNECTED:
        return CallStateDisconnected;
      case RECONNECTING:
        return CallStateReconnecting;
      case RINGING:
        return CallStateRinging;
      default:
        logger.warning("Unknown call state: " + state);
        return CallStateConnecting;
    }
  }

  /**
   * Serializes a Call.
   * @param CallRecord the call record
   * @return A serialized Call
   */
  public static WritableMap serializeCall(@NonNull final CallRecord callRecord) {
    // validate input
    Objects.requireNonNull(callRecord.getUuid());
    Objects.requireNonNull(callRecord.getVoiceCall());

    // serialize
    WritableMap callInfo = constructJSMap(
      new Pair<>(CallInfoUuid, callRecord.getUuid().toString()),
      new Pair<>(CallInfoSid, callRecord.getVoiceCall().getSid()),
      new Pair<>(CallInfoFrom, callRecord.getVoiceCall().getFrom()),
      new Pair<>(CallInfoTo, callRecord.getVoiceCall().getTo()),
      new Pair<>(CallInfoState, callStateToString(callRecord.getVoiceCall().getState())),
      new Pair<>(CallInfoIsMuted, callRecord.getVoiceCall().isMuted()),
      new Pair<>(CallInfoIsOnHold, callRecord.getVoiceCall().isOnHold()),
      new Pair<>(CallInviteInfoCustomParameters, serializeCallInviteCustomParameters(callRecord.getCallInvite())),
      new Pair<>(CallInfoInitialConnectedTimestamp, simplifiedISO8601DateTimeFormat(callRecord.getTimestamp()))
    );
    return callInfo;
  }

  /**
   * Serializes an AudioDevice.
   * @param uuid The UUID of the AudioDevice
   * @param audioDevice The AudioDevice
   * @return A serialized AudioDevice
   */
  public static WritableMap serializeAudioDevice(String uuid, @Nullable AudioDevice audioDevice) {
    if (null != audioDevice) {
      String type = audioDevice.getClass().getSimpleName();
      return constructJSMap(
        new Pair<>(AudioDeviceKeyUuid, uuid),
        new Pair<>(AudioDeviceKeyName, audioDevice.getName()),
        new Pair<>(AudioDeviceKeyType, AudioSwitchManager.AUDIO_DEVICE_TYPE.get(type)));
    }
    return null;
  }

  /**
   * Serializes a map of UUIDs to AudioDevices into a list of [key, value] tuples.
   * @param audioDevices A map of UUIDs to AudioDevices
   * @return A serialized list of UUID and AudioDevice tuples
   */
  public static WritableArray serializeAudioDeviceMapIntoArray(Map<String, AudioDevice> audioDevices) {
    WritableArray audioDeviceInfoArray = Arguments.createArray();

    for (Entry<String, AudioDevice> entry : audioDevices.entrySet()) {
      String uuid = entry.getKey();
      AudioDevice audioDevice = entry.getValue();

      WritableMap audioDeviceInfoMap = serializeAudioDevice(uuid, audioDevice);
      audioDeviceInfoArray.pushMap(audioDeviceInfoMap);
    }

    return audioDeviceInfoArray;
  }

  /**
   * Serializes all audio device information.
   * @param audioDevices A map of UUIDs to AudioDevices
   * @param selectedAudioDeviceUuid The UUID of the selected audio device
   * @param selectedAudioDevice The selected audio device
   * @return Serialized audio device information
   */
  public static WritableMap serializeAudioDeviceInfo(
    Map<String, AudioDevice> audioDevices,
    String selectedAudioDeviceUuid,
    AudioDevice selectedAudioDevice) {
    return constructJSMap(
      new Pair<>(AudioDeviceKeyAudioDevices, serializeAudioDeviceMapIntoArray(audioDevices)),
      new Pair<>(AudioDeviceKeySelectedDevice, serializeAudioDevice(selectedAudioDeviceUuid, selectedAudioDevice)));
  }
  public static WritableMap serializeVoiceException(VoiceException exception) {
    if (null != exception) {
      return constructJSMap(
        new Pair<>(VoiceErrorKeyCode, exception.getErrorCode()),
        new Pair<>(VoiceErrorKeyMessage, exception.getMessage()));
    }
    return null;
  }
  public static WritableMap serializeCallException(@NonNull final CallRecord callRecord) {
    return (null != callRecord.getCallException())
      ? serializeVoiceException(callRecord.getCallException())
      : null;
  }

  public static WritableMap serializeError(int code, String message) {
    if (null != message) {
      return constructJSMap(
        new Pair<>(VoiceErrorKeyCode, code),
        new Pair<>(VoiceErrorKeyMessage, message)
      );
    }
    return null;
  }

  public static WritableArray serializeCallQualityWarnings(@NonNull Set<Call.CallQualityWarning> warnings) {
    WritableArray previousWarningsArray = Arguments.createArray();
    for (Call.CallQualityWarning warning : warnings) {
      previousWarningsArray.pushString(warning.toString());
    }
    return previousWarningsArray;
  }

  /**
   * Serializes a Call Message
   * @param CallMessage the call message
   * @return A serialized Call
   */
  public static WritableMap serializeCallMessage(@NonNull final CallMessage callMessage) {
    return constructJSMap(
      new Pair<>(VoiceEventSid, callMessage.getVoiceEventSID()),
      new Pair<>(CallMessageContent, callMessage.getContent()),
      new Pair<>(CallMessageContentType, callMessage.getMessageContentType()),
      new Pair<>(CallMessageMessageType, callMessage.getMessageType())
    );
  }

  private static String simplifiedISO8601DateTimeFormat(final Date date) {
    SimpleDateFormat simpleDateFormat =
      new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ", Locale.US);
    return (null != date) ? simpleDateFormat.format(date) : null;
  }
}
