package com.example.twiliovoicereactnative;

import com.facebook.react.ReactActivity;
import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.content.res.ColorStateList;
import android.media.AudioManager;
import android.os.Build;
import android.os.Bundle;
import android.os.SystemClock;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Chronometer;
import android.widget.EditText;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.coordinatorlayout.widget.CoordinatorLayout;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.lifecycle.Lifecycle;
import androidx.lifecycle.ProcessLifecycleOwner;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.google.android.material.snackbar.Snackbar;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

public class MainActivity extends ReactActivity {
  private static final String TAG = "MainActivity";
  private static final int MIC_PERMISSION_REQUEST_CODE = 1;
  public static final String ACTION_FCM_TOKEN_REQUEST = "ACTION_FCM_TOKEN_REQUEST";
  public static final String ACTION_FCM_TOKEN = "ACTION_FCM_TOKEN";
  public static final String FCM_TOKEN = "FCM_TOKEN";
  private VoiceBroadcastReceiver voiceBroadcastReceiver;

  private boolean checkPermissionForMicrophone() {
    int resultMic = ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO);
    return resultMic == PackageManager.PERMISSION_GRANTED;
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    Log.d(TAG, "Inside onCreate");
    /*
     * Ensure the microphone permission is enabled
     */
    if (!checkPermissionForMicrophone()) {
      requestPermissionForMicrophone();
    }

    // These flags ensure that the activity can be launched when the screen is locked.
    Window window = getWindow();
    window.addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
      | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
      | WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

    voiceBroadcastReceiver = new VoiceBroadcastReceiver();
    registerReceiver();
  }

  private void requestPermissionForMicrophone() {
    if (ActivityCompat.shouldShowRequestPermissionRationale(this, Manifest.permission.RECORD_AUDIO)) {
        Log.d(TAG, "Microphone permissions needed. Please allow in your application settings.");
    } else {
      ActivityCompat.requestPermissions(
        this,
        new String[]{Manifest.permission.RECORD_AUDIO},
        MIC_PERMISSION_REQUEST_CODE);
    }
  }

  private void registerReceiver() {
    IntentFilter intentFilter = new IntentFilter();
    intentFilter.addAction(ACTION_FCM_TOKEN_REQUEST);
    LocalBroadcastManager.getInstance(this).registerReceiver(
      voiceBroadcastReceiver, intentFilter);
    Log.d(TAG, "Successfully registered Receiver");
  }

  private class VoiceBroadcastReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
      String action = intent.getAction();
    }
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "TwilioVoiceReactNativeExample";
  }
}
