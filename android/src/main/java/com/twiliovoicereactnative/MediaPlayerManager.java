package com.twiliovoicereactnative;

import android.content.Context;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.net.Uri;
import android.util.Log;

import java.io.IOException;

public class MediaPlayerManager {
    private static final String TAG = MediaPlayerManager.class.getSimpleName();

    private boolean playing = false;
    private MediaPlayer ringtoneMediaPlayer;
    private MediaPlayer disconnectMediaPlayer;
    private static MediaPlayerManager instance;

    private MediaPlayerManager(Context context) {
        try {
            ringtoneMediaPlayer = new MediaPlayer();
            ringtoneMediaPlayer.setDataSource(context, Uri.parse("android.resource://" + context.getPackageName() + "/" + R.raw.ringtone));
            ringtoneMediaPlayer.setAudioAttributes(new AudioAttributes.Builder()
                    .setFlags(AudioAttributes.FLAG_AUDIBILITY_ENFORCED)
                    .setLegacyStreamType(AudioManager.STREAM_VOICE_CALL)
                    .setUsage(AudioAttributes.USAGE_VOICE_COMMUNICATION)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build());
            ringtoneMediaPlayer.setLooping(true);
            ringtoneMediaPlayer.prepare();

            disconnectMediaPlayer = new MediaPlayer();
            disconnectMediaPlayer.setDataSource(context, Uri.parse("android.resource://" + context.getPackageName() + "/" + R.raw.disconnect));
            disconnectMediaPlayer.setAudioAttributes(new AudioAttributes.Builder()
                    .setFlags(AudioAttributes.FLAG_AUDIBILITY_ENFORCED)
                    .setLegacyStreamType(AudioManager.STREAM_VOICE_CALL)
                    .setUsage(AudioAttributes.USAGE_VOICE_COMMUNICATION)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build());
            disconnectMediaPlayer.prepare();
        } catch (IOException e) {
            Log.e(TAG, "Failed to load soundtracks");
        }
    }

    public static MediaPlayerManager getInstance(Context context) {
        if (instance == null) {
            instance = new MediaPlayerManager(context);
        }
        return instance;
    }

    public void playRinging() {
        if (!playing) {
            ringtoneMediaPlayer.start();
            playing = true;
        }
    }

    public void stopRinging() {
        if (playing) {
            ringtoneMediaPlayer.stop();
            try {
                ringtoneMediaPlayer.prepare();
            } catch (IOException e) {
                Log.e(TAG, "Failed to prepare ringtone");
            }
            playing = false;
        }
    }

    public void playDisconnect() {
        if (!playing) {
            disconnectMediaPlayer.start();
            playing = false;
        }
    }

    public void release() {
        ringtoneMediaPlayer.release();
        disconnectMediaPlayer.release();
        instance = null;
    }
}
