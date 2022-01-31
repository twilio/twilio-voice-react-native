package com.example.twiliovoicereactnative;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.util.Log;
import android.view.Window;
import android.view.WindowManager;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.facebook.react.ReactActivity;
import com.twiliovoicereactnative.MediaPlayerManager;

public class MainActivity extends ReactActivity {
  private static final String TAG = "MainActivity";
  private static final int MIC_PERMISSION_REQUEST_CODE = 1;

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
  }

  @Override
  public void onDestroy() {
    /*
     * Release resources in MediaPlayerManager
     */
    MediaPlayerManager.getInstance(this).release();
    super.onDestroy();
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

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "TwilioVoiceReactNativeExample";
  }
}
