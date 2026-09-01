package com.twiliovoicereactnative;

import java.util.List;
import java.util.Vector;

import android.Manifest;
import android.app.Activity;
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
