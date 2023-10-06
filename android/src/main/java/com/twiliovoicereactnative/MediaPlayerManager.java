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

public class MediaPlayerManager {
    public final int DISCONNECT_WAV;
    public final int INCOMING_WAV;
    public final int OUTGOING_WAV;
    public final int RINGTONE_WAV;
    private static final String TAG = MediaPlayerManager.class.getSimpleName();
    private final SoundPool soundPool;
    private final AudioSwitch audioSwitch;
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
      audioSwitch = AudioSwitchManager.getInstance(context).getAudioSwitch();
      activeStream = 0;
      DISCONNECT_WAV = soundPool.load(context, R.raw.disconnect, 1);
      INCOMING_WAV = soundPool.load(context, R.raw.incoming, 1);
      OUTGOING_WAV = soundPool.load(context, R.raw.outgoing, 1);
      RINGTONE_WAV = soundPool.load(context, R.raw.ringtone, 1);
    }

    public static MediaPlayerManager getInstance(Context context) {
        if (instance == null) {
            instance = new MediaPlayerManager(context);
        }
        return instance;
    }

    public void play(final int soundId) {
      audioSwitch.activate();
      activeStream = soundPool.play(
        soundId,
        1.f,
        1.f,
        1,
        (DISCONNECT_WAV == soundId) ? 0 : -1,
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
}
