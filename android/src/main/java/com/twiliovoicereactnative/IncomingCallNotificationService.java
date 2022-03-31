package com.twiliovoicereactnative;

import android.annotation.TargetApi;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.media.AudioManager;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;

import androidx.annotation.RequiresApi;
import androidx.lifecycle.Lifecycle;
import androidx.lifecycle.ProcessLifecycleOwner;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.twilio.voice.AcceptOptions;
import com.twilio.voice.Call;
import com.twilio.voice.CallInvite;
import com.twilio.voice.CancelledCallInvite;

public class IncomingCallNotificationService extends Service {

  private static final String TAG = IncomingCallNotificationService.class.getSimpleName();

  @RequiresApi(api = Build.VERSION_CODES.N)
  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    String action = intent.getAction();
    NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);

    Log.d(TAG, "Received command " + action);
    if (action != null) {
      CallInvite callInvite = intent.getParcelableExtra(Constants.INCOMING_CALL_INVITE);
      CancelledCallInvite cancelledCallInvite = intent.getParcelableExtra(Constants.CANCELLED_CALL_INVITE);
      int notificationId = intent.getIntExtra(Constants.NOTIFICATION_ID, 0);
      String uuid = intent.getStringExtra(Constants.UUID);
      String callSid;
      Log.d(TAG, "UUID " + uuid + " action " + action + " intent " + intent.toString() + " notificationId " + notificationId);
      switch (action) {
        case Constants.ACTION_INCOMING_CALL:
          handleIncomingCall(callInvite, notificationId, uuid);
          break;
        case Constants.ACTION_ACCEPT:
          acceptCall(callInvite, notificationId, uuid);
          sendCallInviteToActivity(callInvite, notificationId);
          break;
        case Constants.ACTION_REJECT:
          rejectCall(callInvite, notificationId, uuid);
          break;
        case Constants.ACTION_CANCEL_CALL:
          handleCancelledCall(intent, cancelledCallInvite.getCallSid(), notificationId, uuid);
          break;
        case Constants.ACTION_CANCEL_NOTIFICATION:
          endForeground();
          Log.d(TAG, "Cancelling notification uuid:" + uuid + " notificationId: " + notificationId);
          notificationManager.cancel(notificationId);
          Storage.uuidNotificaionIdMap.remove(uuid);
          break;
        case Constants.ACTION_CALL_DISCONNECT:
          Log.i(TAG, "ACTION_CALL_DISCONNECT " + uuid + " notificationId" + notificationId);
          Storage.uuidNotificaionIdMap.remove(uuid);
          disconnectCall(notificationId, uuid);
          break;
        case Constants.ACTION_OUTGOING_CALL:
          Log.d(TAG, "Raising call in progress notification uuid:" + uuid + " notificationId: " + notificationId);
          callSid = intent.getStringExtra(Constants.CALL_SID_KEY);
          handleOutgoingCall(callSid, notificationId, uuid);
          break;
        case Constants.ACTION_PUSH_APP_TO_FOREGROUND:
          Log.i(TAG, "ACTION_PUSH_APP_TO_FOREGROUND " + uuid + " notificationId" + notificationId);
          callSid = intent.getStringExtra(Constants.CALL_SID_KEY);
          bringAppToForeground(callSid, notificationId, uuid);
        default:
          break;
      }
    }
    return START_NOT_STICKY;
  }

  @Override
  public IBinder onBind(Intent intent) {
    return null;
  }

  @RequiresApi(api = Build.VERSION_CODES.N)
  private void acceptCall(CallInvite callInvite, int notificationId, String uuid) {
    Log.e(TAG, "CallInvite UUID accept " + uuid);
    endForeground();
    Intent activeCallIntent = new Intent(Constants.ACTION_ACCEPT);
    activeCallIntent.putExtra(Constants.INCOMING_CALL_INVITE, callInvite);
    activeCallIntent.putExtra(Constants.UUID, uuid);
    // Need to answer the call here in case TwilioVoiceReactNative is not loaded
    AcceptOptions acceptOptions = new AcceptOptions.Builder()
      .enableDscp(true)
      .build();

    Call call = callInvite.accept(this, acceptOptions, new CallListenerProxy(uuid, this));
    Log.i(TAG, "acceptCall" + uuid + " notificationId" + notificationId);
    Storage.callMap.put(uuid, call);
    Storage.callMap.forEach((key, value) -> Log.i(TAG, "CallInvite UUID accept callMap value " + key + ":" + value));
    Storage.releaseCallInviteStorage(uuid, callInvite.getCallSid(), notificationId, "accept");

    NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
    notificationManager.cancel(notificationId);

    Storage.uuidNotificaionIdMap.put(uuid, notificationId);
    startForeground(notificationId, NotificationUtility.createCallAnsweredNotificationWithLowImportance(callInvite, notificationId, uuid, this));
    // Send the broadcast in case TwilioVoiceReactNative is loaded, it can emit the event
    LocalBroadcastManager.getInstance(this).sendBroadcast(activeCallIntent);
  }

  private void rejectCall(CallInvite callInvite, int notificationId, String uuid) {
    endForeground();
    callInvite.reject(getApplicationContext());
    Storage.releaseCallInviteStorage(uuid, callInvite.getCallSid(), notificationId, "reject");

    Intent rejectCallInviteIntent = new Intent(Constants.ACTION_REJECT);
    rejectCallInviteIntent.putExtra(Constants.INCOMING_CALL_INVITE, callInvite);
    rejectCallInviteIntent.putExtra(Constants.UUID, uuid);
    LocalBroadcastManager.getInstance(this).sendBroadcast(rejectCallInviteIntent);
  }

  private void disconnectCall(int notificationId, String uuid) {
    endForeground();
    Call call = Storage.callMap.get(uuid);
    if (call != null) {
      call.disconnect();
    }
  }

  private void handleOutgoingCall(String callSid, int notificationId, String uuid) {
    Log.e(TAG, "Outgoing Call UUID " + uuid + " notificationId " + notificationId + " callSid " + callSid);

    NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
    startForeground(notificationId, NotificationUtility.createOutgoingCallNotificationWithLowImportance(callSid, notificationId, uuid, this, true));
  }

  private void handleCancelledCall(Intent intent, String callSid, int notificationId, String uuid) {
    endForeground();
    Storage.releaseCallInviteStorage(uuid, callSid, notificationId, "cancel");
    LocalBroadcastManager.getInstance(this).sendBroadcast(intent);
  }

  private void handleIncomingCall(CallInvite callInvite, int notificationId, String uuid) {
    Log.d(TAG, "Calling handleIncomingCall for " + callInvite + " with CallInvite UUID " + uuid);
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      setIncomingCallNotification(callInvite, notificationId, uuid);
    }
    Intent intent = new Intent(Constants.ACTION_INCOMING_CALL);
    intent.putExtra(Constants.INCOMING_CALL_INVITE, callInvite);
    intent.putExtra(Constants.UUID, uuid);
    LocalBroadcastManager.getInstance(this).sendBroadcast(intent);
  }

  private void endForeground() {
    // after inbound call is accepted or rejected / disconnected
    // release the override of setSpeakerphoneOn(true) from NotificationUtility::createChannel
    AudioManager audioManager = (AudioManager) getSystemService(AUDIO_SERVICE);
    audioManager.setSpeakerphoneOn(false);
    stopForeground(true);
  }

  @TargetApi(Build.VERSION_CODES.O)
  private void setIncomingCallNotification(CallInvite callInvite, int notificationId, String uuid) {
    if (isAppVisible()) {
      Log.i(TAG, "setCallInProgressNotification - app is visible with CallInvite UUID " + uuid + " notificationId" + notificationId);
    } else {
      Log.i(TAG, "setCallInProgressNotification - app is NOT visible with CallInvite UUID " + " notificationId" + notificationId);
    }
    startForeground(notificationId, NotificationUtility.createIncomingCallNotification(callInvite, notificationId, uuid, NotificationManager.IMPORTANCE_HIGH, this));
    Log.d(TAG, "Adding items in callInviteUuidNotificaionIdMap uuid:" + uuid + " notificationId: " + notificationId);
    Storage.uuidNotificaionIdMap.put(uuid, notificationId);
  }

  /*
   * Send the CallInvite to the main activity. Start the activity if it is not running already.
   */
  private void sendCallInviteToActivity(CallInvite callInvite, int notificationId) {
    Intent intent = new Intent(this, getMainActivityClass(getApplicationContext()));
    intent.setAction(Constants.ACTION_INCOMING_CALL);
    intent.putExtra(Constants.NOTIFICATION_ID, notificationId);
    intent.putExtra(Constants.INCOMING_CALL_INVITE, callInvite);
    intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    this.startActivity(intent);
  }

  /*
   * Send the CallInvite to the main activity. Start the activity if it is not running already.
   */
  private void bringAppToForeground(String callSid, int notificationId, String uuid) {
    NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
    notificationManager.cancel(notificationId);
    sendBroadcast(new Intent(Intent.ACTION_CLOSE_SYSTEM_DIALOGS));
    Log.i(TAG, "bringAppToForeground " + uuid + " notificationId" + notificationId);
    startForeground(notificationId, NotificationUtility.createWakeupAppNotification(callSid, notificationId, uuid, NotificationManager.IMPORTANCE_LOW, this));
    Intent intent = new Intent(this, getMainActivityClass(getApplicationContext()));
    intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    this.startActivity(intent);
  }

  private boolean isAppVisible() {
    return ProcessLifecycleOwner
      .get()
      .getLifecycle()
      .getCurrentState()
      .isAtLeast(Lifecycle.State.STARTED);
  }

  private static Class getMainActivityClass(Context context) {
    String packageName = context.getPackageName();
    Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage(packageName);
    String className = launchIntent.getComponent().getClassName();
    try {
      return Class.forName(className);
    } catch (ClassNotFoundException e) {
      e.printStackTrace();
      return null;
    }
  }
}
