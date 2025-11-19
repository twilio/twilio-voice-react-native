package com.twiliovoicereactnative;

import static com.moego.logger.helper.MGOTwilioVoiceHelperKt.TwilioVoiceLoggerTag;
import static com.moego.logger.helper.MGOTwilioVoiceHelperKt.twilioVoiceLogInvoke;
import static com.twiliovoicereactnative.VoiceApplicationProxy.getCallRecordDatabase;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.Vector;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

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

import com.moego.logger.MGOLogEvent;
import com.moego.logger.MGOLogger;

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
    twilioVoiceLogInvoke("VoiceActivityProxy onCreate");
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
    twilioVoiceLogInvoke("VoiceActivityProxy onDestroy");
  }
  public void onNewIntent(Intent intent) {
    logger.debug("onNewIntent(...): invoked");
    twilioVoiceLogInvoke("VoiceActivityProxy onNewIntent");
    handleIntent(intent);
  }
  private void requestPermissions() {
    twilioVoiceLogInvoke("VoiceActivityProxy requestPermissions");
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
    twilioVoiceLogInvoke("VoiceActivityProxy checkPermissions");
    for (String permission: VoiceActivityProxy.permissionList) {
      if (PackageManager.PERMISSION_GRANTED !=
        ContextCompat.checkSelfPermission(context, permission)) {
        return false;
      }
    }
    return true;
  }
  private void handleIntent(Intent intent) {
    if (intent == null) {
      logger.debug("handleIntent: Received null intent. Will not start VoiceService.");
      return;
    }
    String action = intent.getAction();
    if (null == action) return;

    // Define allowed actions (whitelist)
    Set<String> allowedActions = new HashSet<>(Arrays.asList(
      Constants.ACTION_ACCEPT_CALL,
      Constants.ACTION_REJECT_CALL,
      Constants.ACTION_CANCEL_ACTIVE_CALL_NOTIFICATION,
      Constants.ACTION_INCOMING_CALL,
      Constants.ACTION_CANCEL_CALL,
      Constants.ACTION_CALL_DISCONNECT,
      Constants.ACTION_RAISE_OUTGOING_CALL_NOTIFICATION,
      Constants.ACTION_FOREGROUND_AND_DEPRIORITIZE_INCOMING_CALL_NOTIFICATION
    ));
    if (!allowedActions.contains(action)) {
      twilioVoiceLogInvoke("handleIntent: Received unknown or disallowed action: " + action + ". Will not start VoiceService.");
      return;
    }

    UUID uuid = (UUID) intent.getSerializableExtra(Constants.MSG_KEY_UUID);
    if (uuid == null) return;
    CallRecordDatabase.CallRecord record = getCallRecordDatabase().get(new CallRecordDatabase.CallRecord(uuid));

    // 对方先取消，然后用户马上接听，就会出现record == null的场景
    if (record == null) {
      Map<String, Object> paramsMap = new HashMap<>();
      paramsMap.put("action", action);
      MGOLogEvent event = MGOLogEvent
        .errorBuilder("Missing UUID for action: " + action+ ", ignore call",
          "twilio_voice_incoming_ignore",
          TwilioVoiceLoggerTag)
        .params(paramsMap)
        .build();
      MGOLogger.logEvent(event);

      // 避免record == null，导致代码 startForegroundService 后无法继续调用 startForeground，出现"应用无响应"的弹窗
      return;
    }

    Intent copiedIntent = new Intent(intent);
    copiedIntent.setClass(context.getApplicationContext(), VoiceService.class);
    copiedIntent.setFlags(0);

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S &&
      (action.equals(Constants.ACTION_RAISE_OUTGOING_CALL_NOTIFICATION) ||
        action.equals(Constants.ACTION_ACCEPT_CALL))) {
      // 针对 Android 12 及以上的来电和前台服务请求使用 startForegroundService
      context.getApplicationContext().startForegroundService(copiedIntent);
    } else {
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
