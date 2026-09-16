package com.twiliovoicereactnative;

import android.content.Context;

import com.twilio.audioswitch.AudioDevice;
import com.twilio.audioswitch.AudioSwitch;

import java.util.HashMap;
import java.util.List;
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
  private static final SDKLog logger = new SDKLog(AudioSwitchManager.class);

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
   * Identity for an AudioDevice that survives AudioSwitch handing back a new
   * instance for the same physical device.
   *
   * Uses the type string from {@link #getAudioDeviceNativeType} rather than the
   * class name, for the same reason that method does: code shrinkers rename
   * AudioSwitch's classes in a consuming app's release build.
   *
   * `type` and `name` together are not unique: two headsets of the same model
   * report the same name, and a key built from those two alone mapped both of
   * them to one UUID, so the device list handed to JavaScript lost an entry and
   * the UUID that went missing became a dead handle for `select()`. The
   * occurrence ordinal -- how many devices with this same type and name came
   * earlier in the list -- disambiguates them. AudioSwitch reports devices in a
   * stable order, so the ordinal is stable for as long as the set of devices
   * is.
   */
  private static String audioDeviceIdentity(AudioDevice audioDevice, int ordinal) {
    return getAudioDeviceNativeType(audioDevice)
      + "|" + audioDevice.getName()
      + "|" + ordinal;
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
   * Stable UUIDs, keyed by a device identity that survives an AudioSwitch update.
   *
   * AudioSwitch hands back fresh AudioDevice instances on every update, and
   * selecting a device causes an update. Minting a new random UUID each time
   * meant `AudioDevice.uuid` changed underneath the caller, so an application
   * that selected a device and then compared `selectedDevice.uuid` against the
   * device it had selected saw a mismatch even though the correct device was
   * active. The UUID is the handle `select()` takes, so it has to be stable for
   * as long as the device is present.
   */
  private final HashMap<String, String> audioDeviceUuids = new HashMap<>();

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
      updateAudioDevices(devices, selectedDevice);

      if (this.listener != null) {
        this.listener.apply(audioDevices, selectedAudioDeviceUuid, selectedDevice);
      }
      return Unit.INSTANCE;
    });
  }

  /**
   * Rebuild the UUID-to-device map from the list AudioSwitch just reported,
   * keeping the UUID of every device that was already present.
   */
  private void updateAudioDevices(List<? extends AudioDevice> devices, AudioDevice selectedDevice) {
    audioDevices.clear();

    final HashMap<String, Integer> occurrences = new HashMap<>();
    final HashMap<String, String> seen = new HashMap<>();
    boolean selectedFound = false;

    for (AudioDevice device : devices) {
      final String base = getAudioDeviceNativeType(device) + "|" + device.getName();
      final Integer previous = occurrences.get(base);
      final int ordinal = (null == previous) ? 0 : previous;
      occurrences.put(base, ordinal + 1);

      final String identity = audioDeviceIdentity(device, ordinal);
      String uuid = audioDeviceUuids.get(identity);
      if (null == uuid || seen.containsValue(uuid)) {
        // Either the device is new, or a UUID carried over from the previous
        // update would collide with one already assigned in this one. Either
        // way a fresh UUID keeps every device reachable, which matters more
        // than keeping this one's handle stable.
        uuid = UUID.randomUUID().toString();
      }
      seen.put(identity, uuid);

      audioDevices.put(uuid, device);
      if (!selectedFound && device.equals(selectedDevice)) {
        // First match rather than last: two devices of the same model compare
        // equal, so without this the selected UUID depended on list order.
        selectedAudioDeviceUuid = uuid;
        selectedFound = true;
      }
    }

    // Retain only devices still present, so a device that disappears and
    // returns is treated as new rather than resurrecting a stale handle.
    audioDeviceUuids.clear();
    audioDeviceUuids.putAll(seen);

    if (audioDevices.size() != devices.size()) {
      // Unreachable while the identity key is unique per device in the list.
      // Logged rather than asserted because losing a device from the list is a
      // degradation, not a reason to take down the host application.
      logger.warning(String.format(
        "Audio device list collapsed from %d devices to %d handles",
        devices.size(),
        audioDevices.size()));
    }
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
