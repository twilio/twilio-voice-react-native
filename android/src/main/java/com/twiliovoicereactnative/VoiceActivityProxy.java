package com.twiliovoicereactnative;

import java.util.List;
import java.util.Vector;

import android.Manifest;
import android.app.Activity;
import android.app.NotificationManager;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

public class VoiceActivityProxy {
  private static final SDKLog logger = new SDKLog(VoiceActivityProxy.class);
  private static final int PERMISSION_REQUEST_CODE = 101;
  private static final String[] permissionList;
  private final Activity context;
  private final PermissionsRationaleNotifier notifier;

  public interface PermissionsRationaleNotifier {
    void displayRationale(final String permission);
  }

  public VoiceActivityProxy(@NonNull Activity activity,
                            @NonNull PermissionsRationaleNotifier notifier) {
    this.context = activity;
    this.notifier = notifier;
  }
  public void onCreate(Bundle ignoredSavedInstanceState) {
    logger.debug("onCreate(): invoked");
    // Ensure the microphone permission is enabled
    if (!checkPermissions()) {
      requestPermissions();
    }
    // Check full screen intent permission for newer Android versions
    checkFullScreenIntentPermission();
    // These flags ensure that the activity can be launched when the screen is locked.
    Window window = context.getWindow();
    window.addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
      | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
      | WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    // handle any incoming intents
    handleIntent(context.getIntent());
  }
  public void onDestroy() {
    logger.debug("onDestroy(): invoked");
  }
  public void onNewIntent(Intent intent) {
    logger.debug("onNewIntent(...): invoked");
    handleIntent(intent);
  }
  private void requestPermissions() {
    List<String> permissionsRequestList = new Vector<>();
    for (final String permission: VoiceActivityProxy.permissionList) {
      permissionsRequestList.add(permission);
      if (ActivityCompat.shouldShowRequestPermissionRationale(context, permission)) {
        notifier.displayRationale(permission);
      }
    }
    ActivityCompat.requestPermissions(
      context,
      permissionsRequestList.toArray(new String[0]),
      PERMISSION_REQUEST_CODE);
  }
  private boolean checkPermissions() {
    for (String permission: VoiceActivityProxy.permissionList) {
      if (PackageManager.PERMISSION_GRANTED !=
        ContextCompat.checkSelfPermission(context, permission)) {
        return false;
      }
    }
    return true;
  }
  private void checkFullScreenIntentPermission() {
    // Check full screen intent permission for Android 14+ (API 34+)
    // This is a non-blocking check that just logs the status
    // The actual permission request should be handled by the React Native side
    // using system_requestFullScreenNotificationPermission() method
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
      try {
        NotificationManager notificationManager = (NotificationManager) context.getSystemService(Activity.NOTIFICATION_SERVICE);
        
        if (notificationManager != null && !notificationManager.canUseFullScreenIntent()) {
          logger.info("Full screen intent permission not granted. Incoming call popup may not display properly on Android 14+.");
          logger.info("Use system_requestFullScreenNotificationPermission() from React Native to request this permission.");
        } else {
          logger.debug("Full screen intent permission is granted");
        }
      } catch (Exception e) {
        logger.debug("Could not check full screen intent permission: " + e.getMessage());
        // Don't crash the app if there's an issue with permission check
      }
    }
  }

  private void handleIntent(Intent intent) {
    String action = intent.getAction();
    if ((null != action) && (!action.equals(Constants.ACTION_PUSH_APP_TO_FOREGROUND))) {
      Intent copiedIntent = new Intent(intent);
      copiedIntent.setClass(context.getApplicationContext(), VoiceService.class);
      copiedIntent.setFlags(0);
      context.getApplicationContext().startService(copiedIntent);
    }
  }

  static {
    if (Build.VERSION.SDK_INT > Build.VERSION_CODES.S_V2) {
      permissionList = new String[] {
        Manifest.permission.RECORD_AUDIO,
        Manifest.permission.BLUETOOTH_CONNECT,
        Manifest.permission.POST_NOTIFICATIONS };
    } else if (Build.VERSION.SDK_INT > Build.VERSION_CODES.R) {
      permissionList = new String[] {
        Manifest.permission.RECORD_AUDIO, Manifest.permission.BLUETOOTH_CONNECT };
    } else {
      permissionList = new String[] { Manifest.permission.RECORD_AUDIO };
    }
  }
}
