package com.twiliovoicereactnative;

import android.content.Context;
import android.os.Build;

import androidx.annotation.RequiresApi;

import com.twilio.audioswitch.AudioDevice;
import com.twilio.audioswitch.AudioSwitch;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * AudioSwitchManager singleton class. Maintains a persistent AudioSwitch object and listens for audio
 * device changes. Generates UUIDs per audio device when the AudioSwitch library updates available
 * audio devices.
 */
@RequiresApi(api = Build.VERSION_CODES.N)
public class AudioSwitchManager {
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
  public static final HashMap<String, String> AUDIO_DEVICE_TYPE = new HashMap();

  /**
   * Singleton instance of this class.
   */
  private static AudioSwitchManager instance;

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
  private AudioSwitchManager(Context context) {
    if (AUDIO_DEVICE_TYPE.isEmpty()) {
      AUDIO_DEVICE_TYPE.put("Speakerphone", "speaker");
      AUDIO_DEVICE_TYPE.put("BluetoothHeadset", "bluetooth");
      AUDIO_DEVICE_TYPE.put("WiredHeadset", "earpiece");
      AUDIO_DEVICE_TYPE.put("Earpiece", "earpiece");
    }

    audioDevices = new HashMap<String, AudioDevice>();

    audioSwitch = new AudioSwitch(context);

    audioSwitch.start((devices, selectedDevice) -> {
      devices.forEach((device) -> {
        audioDevices.clear();

        String uuid = UUID.randomUUID().toString();
        audioDevices.put(uuid, device);

        if (device.equals(selectedDevice)) {
          selectedAudioDeviceUuid = uuid;
        }
      });

      if (this.listener != null) {
        this.listener.apply(audioDevices, selectedAudioDeviceUuid, selectedDevice);
      }

      return null;
    });
  }

  /**
   * Get the singleton AudioSwitchManager instance. Instantiates the AudioSwitchManager singleton if it does
   * not exist.
   * @param context The Android application context
   * @return The singleton AudioSwitchManager instance.
   */
  public static AudioSwitchManager getInstance(Context context) {
    if (instance == null) {
      instance = new AudioSwitchManager(context);
    }
    return instance;
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
  public AudioSwitch getSwitch() {
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
