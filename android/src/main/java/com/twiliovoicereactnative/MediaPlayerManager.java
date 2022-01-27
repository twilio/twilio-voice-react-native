package com.twiliovoicereactnative;

import android.content.Context;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.util.Log;

import static android.content.Context.AUDIO_SERVICE;

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
        audioManager.setMode(AudioManager.MODE_IN_CALL);
        audioManager.setSpeakerphoneOn(false);
        Log.d("Use AudioManager.MODE_IN_CALL this time");

        // Load the sounds
        ringtoneMediaPlayer = MediaPlayer.create(context, R.raw.ringtone);
        ringtoneMediaPlayer.setAudioStreamType(AudioManager.STREAM_MUSIC);
        ringtoneMediaPlayer.setLooping(true);
        disconnectMediaPlayer = MediaPlayer.create(context, R.raw.disconnect);
        disconnectMediaPlayer.setAudioStreamType(AudioManager.STREAM_MUSIC);
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
