package com.twiliovoicereactnative;

import android.content.Context;

import com.twilio.audioswitch.AudioSwitch;

public class AudioSwitchManager {
  private final Context context;
  private final AudioSwitch audioSwitch;
  private static AudioSwitchManager instance;

  private AudioSwitchManager(Context context) {
    this.context = context;
    audioSwitch = new AudioSwitch(context);
  }

  public static AudioSwitchManager getInstance(Context context) {
    if (instance == null) {
      instance = new AudioSwitchManager(context);
    }
    return instance;
  }

  public AudioSwitch getAudioSwitch() {
    return audioSwitch;
  }

}
