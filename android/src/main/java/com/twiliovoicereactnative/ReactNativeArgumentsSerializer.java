package com.twiliovoicereactnative;

import static com.twiliovoicereactnative.CommonConstants.AudioDeviceKeyAudioDevices;
import static com.twiliovoicereactnative.CommonConstants.AudioDeviceKeyName;
import static com.twiliovoicereactnative.CommonConstants.AudioDeviceKeySelectedDevice;
import static com.twiliovoicereactnative.CommonConstants.AudioDeviceKeyType;
import static com.twiliovoicereactnative.CommonConstants.AudioDeviceKeyUuid;
import static com.twiliovoicereactnative.CommonConstants.CallInfoFrom;
import static com.twiliovoicereactnative.CommonConstants.CallInfoSid;
import static com.twiliovoicereactnative.CommonConstants.CallInfoTo;
import static com.twiliovoicereactnative.CommonConstants.CallInfoUuid;
import static com.twiliovoicereactnative.CommonConstants.CallInviteInfoCallSid;
import static com.twiliovoicereactnative.CommonConstants.CallInviteInfoCustomParameters;
import static com.twiliovoicereactnative.CommonConstants.CallInviteInfoFrom;
import static com.twiliovoicereactnative.CommonConstants.CallInviteInfoTo;
import static com.twiliovoicereactnative.CommonConstants.CallInviteInfoUuid;
import static com.twiliovoicereactnative.CommonConstants.CancelledCallInviteInfoCallSid;
import static com.twiliovoicereactnative.CommonConstants.CancelledCallInviteInfoFrom;
import static com.twiliovoicereactnative.CommonConstants.CancelledCallInviteInfoTo;

import android.os.Build;

import androidx.annotation.RequiresApi;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.twilio.audioswitch.AudioDevice;
import com.twilio.voice.Call;
import com.twilio.voice.CallInvite;
import com.twilio.voice.CancelledCallInvite;

import java.util.Map;

/**
 * This class provides static helper functions that serializes native objects into
 * React Native (RN) bridge objects emit-able to the JS layer.
 */
@RequiresApi(api = Build.VERSION_CODES.N)
public class ReactNativeArgumentsSerializer {
  /**
   * Serializes the custom parameters of a CallInvite.
   * @param callInvite A CallInvite object
   * @return Serialized CallInvite custom parameters
   */
  public static WritableMap serializeCallInviteCustomParameters(CallInvite callInvite) {
    WritableMap customParameters = Arguments.createMap();
    callInvite.getCustomParameters().forEach(customParameters::putString);
    return customParameters;
  }

  /**
   * Serializes a CallInvite.
   * @param uuid The UUID of the CallInvite
   * @param callInvite The CallInvite
   * @return A serialized CallInvite
   */
  public static WritableMap serializeCallInvite(String uuid, CallInvite callInvite) {
    WritableMap callInviteInfo = Arguments.createMap();
    callInviteInfo.putString(CallInviteInfoUuid, uuid);
    callInviteInfo.putString(CallInviteInfoCallSid, callInvite.getCallSid());
    callInviteInfo.putString(CallInviteInfoFrom, callInvite.getFrom());
    callInviteInfo.putString(CallInviteInfoTo, callInvite.getTo());

    WritableMap customParameters = serializeCallInviteCustomParameters(callInvite);
    callInviteInfo.putMap(CallInviteInfoCustomParameters, customParameters);

    return callInviteInfo;
  }

  /**
   * Serializes a CancelledCallInvite.
   * @param cancelledCallInvite The CancelledCallInvite
   * @return A serialized CancelledCallInvite
   */
  public static WritableMap serializeCancelledCallInvite(CancelledCallInvite cancelledCallInvite) {
    WritableMap cancelledCallInviteInfo = Arguments.createMap();
    cancelledCallInviteInfo.putString(CancelledCallInviteInfoCallSid, cancelledCallInvite.getCallSid());
    cancelledCallInviteInfo.putString(CancelledCallInviteInfoFrom, cancelledCallInvite.getFrom());
    cancelledCallInviteInfo.putString(CancelledCallInviteInfoTo, cancelledCallInvite.getTo());

    return cancelledCallInviteInfo;
  }

  /**
   * Serializes a Call.
   * @param uuid The UUID of the Call
   * @param call The Call
   * @return A serialized Call
   */
  public static WritableMap serializeCall(String uuid, Call call) {
    WritableMap callInfo = Arguments.createMap();
    callInfo.putString(CallInfoUuid, uuid);
    callInfo.putString(CallInfoSid, call.getSid());
    callInfo.putString(CallInfoFrom, call.getFrom());
    callInfo.putString(CallInfoTo, call.getTo());

    CallInvite callInvite = Storage.callInviteMap.get(uuid);
    if (callInvite != null) {
      WritableMap customParams = serializeCallInviteCustomParameters(callInvite);
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
  public static WritableMap serializeAudioDevice(String uuid, AudioDevice audioDevice) {
    WritableMap audioDeviceInfo = Arguments.createMap();
    audioDeviceInfo.putString(AudioDeviceKeyUuid, uuid);
    audioDeviceInfo.putString(AudioDeviceKeyName, audioDevice.getName());

    String type = audioDevice.getClass().getSimpleName();
    audioDeviceInfo.putString(AudioDeviceKeyType, AudioManager.AUDIO_DEVICE_TYPE.get(type));

    return audioDeviceInfo;
  }

  /**
   * Serializes a map of UUIDs to AudioDevices into a list of [key, value] tuples.
   * @param audioDevices A map of UUIDs to AudioDevices
   * @return A serialized list of UUID and AudioDevice tuples
   */
  public static WritableArray serializeAudioDeviceMapIntoArray(Map<String, AudioDevice> audioDevices) {
    WritableArray audioDeviceInfoArray = Arguments.createArray();

    audioDevices.forEach((uuid, audioDevice) -> {
      WritableMap audioDeviceInfoMap = serializeAudioDevice(uuid, audioDevice);
      audioDeviceInfoArray.pushMap(audioDeviceInfoMap);
    });

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
    audioDevicesInfo.putMap(AudioDeviceKeySelectedDevice, serializeAudioDevice(selectedAudioDeviceUuid, selectedAudioDevice));

    return audioDevicesInfo;
  }
}
