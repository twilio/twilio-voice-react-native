package com.twiliovoicereactnative;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import android.util.Log;

import com.twilio.voice.Call;
import com.twilio.voice.CallInvite;
import com.twilio.voice.CancelledCallInvite;

public class Storage {
  private static final String TAG = Storage.class.getSimpleName();

  static final Map<String, Call> callMap = new HashMap<>();
  static final Map<String, CallInvite> callInviteMap = new HashMap<>();
  static final Map<String, String> callInviteCallSidUuidMap = new HashMap<>();
  static final Map<String, Integer> callInviteUuidNotificaionIdMap = new HashMap<>();
  static final Map<String, CancelledCallInvite> cancelledCallInviteMap = new HashMap<>();

  static AndroidEventEmitter androidEventEmitter = null;

  static void releaseCallInviteStorage(String uuid, String callSid, int notificationId, String action) {
    Log.d(TAG, "Removing items in callInviteMap uuid:" + uuid + " callSid:" + callSid + " notificationId: " + notificationId + " action:" + action);
    Storage.callInviteMap.remove(uuid);
    Storage.callInviteCallSidUuidMap.remove(callSid);
    Storage.callInviteUuidNotificaionIdMap.remove(uuid);
  }
}
