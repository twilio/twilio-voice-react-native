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
import static com.twiliovoicereactnative.CommonConstants.AudioDeviceKeyUnknown;

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
   * Maps an AudioDevice to the string the JS layer expects. Uses `instanceof` rather than the
   * class name (e.g. via reflection) because code shrinkers such as R8 can rename AudioSwitch's
   * classes in a consuming app's release build, and AudioSwitch does not ship a consumer
   * ProGuard rule that prevents this.
   */
  public static String getAudioDeviceType(AudioDevice audioDevice) {
    if (audioDevice instanceof AudioDevice.Speakerphone) {
      return AudioDeviceKeySpeaker;
    } else if (audioDevice instanceof AudioDevice.BluetoothHeadset) {
      return AudioDeviceKeyBluetooth;
    } else if (audioDevice instanceof AudioDevice.WiredHeadset
      || audioDevice instanceof AudioDevice.Earpiece) {
      return AudioDeviceKeyEarpiece;
    } else {
      return AudioDeviceKeyUnknown;
    }
  }

  /**
   * Maps an AudioDevice to a string describing its native, unprocessed type, for the same
   * `instanceof`-over-reflection reason as {@link #getAudioDeviceType}.
   */
  public static String getAudioDeviceNativeType(AudioDevice audioDevice) {
    if (audioDevice instanceof AudioDevice.Speakerphone) {
      return "Speakerphone";
    } else if (audioDevice instanceof AudioDevice.BluetoothHeadset) {
      return "BluetoothHeadset";
    } else if (audioDevice instanceof AudioDevice.WiredHeadset) {
      return "WiredHeadset";
    } else if (audioDevice instanceof AudioDevice.Earpiece) {
      return "Earpiece";
    } else {
      // AudioDevice is a sealed class with only the four subclasses handled above, so this
      // branch is currently unreachable. It only becomes reachable if a future AudioSwitch
      // release adds a new subclass and this method isn't updated to match before the
      // dependency is bumped. See VBLOCKS-6942. In that case, falling back to reflection here
      // remains subject to renaming by code shrinkers such as R8 in a consuming app's release
      // build.
      return audioDevice.getClass().getSimpleName();
    }
  }

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
