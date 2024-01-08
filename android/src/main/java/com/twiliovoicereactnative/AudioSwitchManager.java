package com.twiliovoicereactnative;

import android.content.Context;

import com.twilio.audioswitch.AudioDevice;
import com.twilio.audioswitch.AudioSwitch;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static com.twiliovoicereactnative.CommonConstants.AudioDeviceKeyEarpiece;
import static com.twiliovoicereactnative.CommonConstants.AudioDeviceKeySpeaker;
import static com.twiliovoicereactnative.CommonConstants.AudioDeviceKeyBluetooth;

import kotlin.Unit;

/**
 * AudioSwitchManager maintains a persistent AudioSwitch object and listens for audio
 * device changes. Generates UUIDs per audio device when the AudioSwitch library updates available
 * audio devices.
 */
class AudioSwitchManager {
  /**
   * The functional interface of a listener to be bound to the AudioSwitchManager.
   */
  @FunctionalInterface
  interface AudioManagerListener {
    void apply(
      Map<String, AudioDevice> audioDevices,
      String selectedAudioDeviceUuid,
      AudioDevice selectedDevice
    );
  }

  /**
   * Audio device type mapping. Normalizes the class name into a string the JS layer expects.
   */
  public static final Map<String, String> AUDIO_DEVICE_TYPE = Map.of(
    "Speakerphone", AudioDeviceKeySpeaker,
    "BluetoothHeadset", AudioDeviceKeyBluetooth,
    "WiredHeadset", AudioDeviceKeyEarpiece,
    "Earpiece", AudioDeviceKeyEarpiece);

  /**
   * Map of UUIDs to all available AudioDevices. Kept up-to-date by the AudioSwitch.
   */
  private final HashMap<String, AudioDevice> audioDevices;
  /**
   * The AudioSwitch.
   */
  private final AudioSwitch audioSwitch;
  /**
   * A listener function that is invoked when the AudioSwitch updates.
   */
  private AudioManagerListener listener = null;
  /**
   * The UUID of the selected audio device.
   */
  private String selectedAudioDeviceUuid = null;

  /**
   * Constructor for the AudioSwitchManager class. Intended to be a singleton.
   * @param context The Android application context
   */
  public AudioSwitchManager(Context context) {
    audioDevices = new HashMap<>();
    audioSwitch = new AudioSwitch(context);
  }

  public void start() {
    audioSwitch.start((devices, selectedDevice) -> {

      audioDevices.clear();
      for (AudioDevice device : devices) {
        String uuid = UUID.randomUUID().toString();
        audioDevices.put(uuid, device);
        if (device.equals(selectedDevice)) {
          selectedAudioDeviceUuid = uuid;
        }
      }

      if (this.listener != null) {
        this.listener.apply(audioDevices, selectedAudioDeviceUuid, selectedDevice);
      }
      return Unit.INSTANCE;
    });
  }

  public void stop() {
    audioSwitch.stop();
  }

  /**
   * Set a listener for the AudioSwitchManager. The listener function is invoked every time the
   * AudioSwitch updates. Also invoked at the point the listener is set.
   * @param listener A listener function.
   * @return The singleton AudioSwitchManager.
   */
  public AudioSwitchManager setListener(AudioManagerListener listener) {
    this.listener = listener;

    this.listener.apply(audioDevices, selectedAudioDeviceUuid, getSelectedAudioDevice());

    return this;
  }

  /**
   * Get the AudioSwitch. Note that the AudioSwitchManager is a singleton, and only instantiates an
   * AudioSwitch once in the construction of the AudioSwitchManager. Therefore, there should only be one
   * AudioSwitch object and it is effectively a singleton.
   * @return The AudioSwitch singleton
   */
  public AudioSwitch getAudioSwitch() {
    return audioSwitch;
  }

  /**
   * Get the audio devices.
   * @return A map of UUIDs to available audio devices
   */
  public HashMap<String, AudioDevice> getAudioDevices() {
    return audioDevices;
  }

  /**
   * Get the UUID of the selected audio device.
   * @return The UUID of the selected audio device.
   */
  public String getSelectedAudioDeviceUuid() {
    return selectedAudioDeviceUuid;
  }

  /**
   * Get the selected audio device.
   * @return The selected audio device.
   */
  public AudioDevice getSelectedAudioDevice() {
    return audioDevices.get(selectedAudioDeviceUuid);
  }
}
