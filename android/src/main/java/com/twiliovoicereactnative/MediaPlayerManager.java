package com.twiliovoicereactnative;

import android.content.Context;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.net.Uri;
import android.util.Log;

import static android.content.Context.AUDIO_SERVICE;

import java.io.IOException;

public class MediaPlayerManager {
    private boolean playing = false;
    private boolean playingCalled = false;
    private float volume;
    private MediaPlayer ringtoneMediaPlayer;
    // private MediaPlayer incomingMediaPlayer;
    // private MediaPlayer outgoingMediaPlayer;
    private MediaPlayer disconnectMediaPlayer;
    private int ringingSoundId;
    private int ringingStreamId;
    private int disconnectSoundId;
    private static MediaPlayerManager instance;

    private MediaPlayerManager(Context context) {
        AudioManager audioManager = (AudioManager) context.getSystemService(AUDIO_SERVICE);
        audioManager.setMode(AudioManager.STREAM_MUSIC);
        Log.d("MediaPlayerManager", "Use ctor and USAGE this time");

        // Load the sounds
        try {
            ringtoneMediaPlayer = new MediaPlayer();
            ringtoneMediaPlayer.setDataSource(context, Uri.parse("android.resource://" + context.getPackageName() + "/" + R.raw.ringtone));
            ringtoneMediaPlayer.setAudioAttributes(new AudioAttributes.Builder()
                    .setFlags(AudioAttributes.FLAG_AUDIBILITY_ENFORCED)
                    .setLegacyStreamType(AudioManager.STREAM_MUSIC)
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .build());
            ringtoneMediaPlayer.setLooping(true);
            ringtoneMediaPlayer.prepare();


            disconnectMediaPlayer = new MediaPlayer();
            disconnectMediaPlayer.setDataSource(context, Uri.parse("android.resource://" + context.getPackageName() + "/" + R.raw.disconnect));
            disconnectMediaPlayer.setAudioAttributes(new AudioAttributes.Builder()
                    .setFlags(AudioAttributes.FLAG_AUDIBILITY_ENFORCED)
                    .setLegacyStreamType(AudioManager.STREAM_MUSIC)
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .build());
            disconnectMediaPlayer.prepare();
        } catch (IOException e) {
            Log.e("MediaPlayerManager", "Failed to load soundtracks");
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
            ringtoneMediaPlayer.pause();
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
