package com.twiliovoicereactnative;

import android.content.Context;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.media.SoundPool;
import android.net.Uri;
import android.util.Log;

import com.twilio.audioswitch.AudioSwitch;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class MediaPlayerManager {
  public enum SoundTable {
    INCOMING,
    OUTGOING,
    DISCONNECT,
    RINGTONE
  }
  private final SoundPool soundPool;
  private final Map<SoundTable, Integer> soundMap;
  private int activeStream;
  private static MediaPlayerManager instance;

  private MediaPlayerManager(Context context) {
    soundPool = (new SoundPool.Builder())
      .setMaxStreams(2)
      .setAudioAttributes(
        new AudioAttributes.Builder()
          .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
          .setUsage(AudioAttributes.USAGE_VOICE_COMMUNICATION)
          .build())
      .build();
    activeStream = 0;
    soundMap = new HashMap<>();
    soundMap.put(SoundTable.INCOMING, soundPool.load(context, R.raw.incoming, 1));
    soundMap.put(SoundTable.OUTGOING, soundPool.load(context, R.raw.outgoing, 1));
    soundMap.put(SoundTable.DISCONNECT, soundPool.load(context, R.raw.disconnect, 1));
    soundMap.put(SoundTable.RINGTONE, soundPool.load(context, R.raw.ringtone, 1));
  }

    public static MediaPlayerManager getInstance(Context context) {
        if (instance == null) {
            instance = new MediaPlayerManager(context);
        }
        return instance;
    }

    public void play(Context context, final SoundTable sound) {
      AudioSwitchManager.getInstance(context).getAudioSwitch().activate();
      activeStream = soundPool.play(
        soundMap.get(sound),
        1.f,
        1.f,
        1,
        (SoundTable.DISCONNECT== sound) ? 0 : -1,
        1.f);
    }

    public void stop() {
      soundPool.stop(activeStream);
      activeStream = 0;
    }

    public void release() {
      soundPool.release();
      instance = null;
    }

    private static void log(final String message) {
      Log.d(MediaPlayerManager.class.getSimpleName(), message);
    }
}
