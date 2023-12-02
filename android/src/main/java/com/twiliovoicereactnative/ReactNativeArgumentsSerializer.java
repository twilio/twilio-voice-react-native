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
import static com.twiliovoicereactnative.VoiceApplicationProxy.getCallRecordDatabase;

import androidx.annotation.NonNull;

import com.twilio.voice.CancelledCallInvite;
import com.twiliovoicereactnative.CallRecordDatabase.CallRecord;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.twilio.audioswitch.AudioDevice;
import com.twilio.voice.Call;
import com.twilio.voice.CallInvite;

import java.util.Map;
import java.util.Map.Entry;
import java.util.Objects;

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
    WritableMap customParameters = Arguments.createMap();
    for (Entry<String, String> entry : callInvite.getCustomParameters().entrySet()) {
      String customParameterKey = entry.getKey();
      String customParameterValue = entry.getValue();

      customParameters.putString(customParameterKey, customParameterValue);
    }
    return customParameters;
  }

  /**
   * Serializes a CallInvite.
   * @param CallRecord the callRecord
   * @return A serialized CallInvite
   */
  public static WritableMap serializeCallInvite(@NonNull final CallRecord callRecord) {
    // validate input
    Objects.requireNonNull(callRecord.getUuid());
    final CallInvite callInvite = Objects.requireNonNull(callRecord.getCallInvite());

    // serialize
    WritableMap callInviteInfo = Arguments.createMap();
    callInviteInfo.putString(CallInviteInfoUuid, callRecord.getUuid().toString());
    callInviteInfo.putString(CallInviteInfoCallSid, callInvite.getCallSid());
    callInviteInfo.putString(CallInviteInfoFrom, callInvite.getFrom());
    callInviteInfo.putString(CallInviteInfoTo, callInvite.getTo());
    callInviteInfo.putMap(CallInviteInfoCustomParameters, serializeCallInviteCustomParameters(callInvite));
    return callInviteInfo;
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
    WritableMap cancelledCallInviteInfo = Arguments.createMap();
    cancelledCallInviteInfo.putString(CancelledCallInviteInfoCallSid, callInvite.getCallSid());
    cancelledCallInviteInfo.putString(CancelledCallInviteInfoFrom, callInvite.getFrom());
    cancelledCallInviteInfo.putString(CancelledCallInviteInfoTo, callInvite.getTo());
    return cancelledCallInviteInfo;
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
    WritableMap callInfo = Arguments.createMap();
    callInfo.putString(CallInfoUuid, callRecord.getUuid().toString());
    callInfo.putString(CallInfoSid, callRecord.getVoiceCall().getSid());
    callInfo.putString(CallInfoFrom, callRecord.getVoiceCall().getFrom());
    callInfo.putString(CallInfoTo, callRecord.getVoiceCall().getTo());
    callInfo.putString(CallInfoState, callStateToString(callRecord.getVoiceCall().getState()));
    if (callRecord.getTimestamp() != null) {
      callInfo.putDouble(
        CallInfoInitialConnectedTimestamp,
        (double)callRecord.getTimestamp().getTime());
    }
    if (callRecord.getCallInvite() != null) {
      WritableMap customParams = serializeCallInviteCustomParameters(callRecord.getCallInvite());
      callInfo.putMap(CallInviteInfoCustomParameters, customParams);
    }
    return callInfo;
  }

  /**
   * Serializes an AudioDevice.
   * @param uuid The UUID of the AudioDevice
   * @param audioDevice The AudioDevice
   * @return A serialized AudioDevice
   */
  public static WritableMap serializeAudioDevice(String uuid, @NonNull AudioDevice audioDevice) {
    WritableMap audioDeviceInfo = Arguments.createMap();
    audioDeviceInfo.putString(AudioDeviceKeyUuid, uuid);
    audioDeviceInfo.putString(AudioDeviceKeyName, audioDevice.getName());

    String type = audioDevice.getClass().getSimpleName();
    audioDeviceInfo.putString(AudioDeviceKeyType, AudioSwitchManager.AUDIO_DEVICE_TYPE.get(type));

    return audioDeviceInfo;
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
    AudioDevice selectedAudioDevice
  ) {
    WritableMap audioDevicesInfo = Arguments.createMap();

    audioDevicesInfo.putArray(AudioDeviceKeyAudioDevices, serializeAudioDeviceMapIntoArray(audioDevices));
    if (selectedAudioDevice != null) {
      audioDevicesInfo.putMap(AudioDeviceKeySelectedDevice, serializeAudioDevice(selectedAudioDeviceUuid, selectedAudioDevice));
    }

    return audioDevicesInfo;
  }
}
