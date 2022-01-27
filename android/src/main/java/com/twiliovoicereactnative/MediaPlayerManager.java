package com.twiliovoicereactnative;

import android.content.Context;
import android.media.AudioManager;
import android.media.MediaPlayer;

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
        // Load the sounds
        // incomingMediaPlayer = MediaPlayer.create(context, R.raw.incoming);
        // incomingMediaPlayer.setAudioStreamType(AudioManager.STREAM_MUSIC);
        // outgoingMediaPlayer = MediaPlayer.create(context, R.raw.outgoing);
        // outgoingMediaPlayer.setAudioStreamType(AudioManager.STREAM_MUSIC);
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
        } else {
            playingCalled = true;
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
        // incomingMediaPlayer.release();
        // outgoingMediaPlayer.release();
        disconnectMediaPlayer.release();
        instance = null;
    }
}
