package com.twiliovoicereactnative;

import android.util.Log;

import com.twilio.voice.Call;
import com.twilio.voice.CallInvite;
import com.twilio.voice.CancelledCallInvite;

import java.util.HashMap;
import java.util.Map;

public class Storage {
  private static final String TAG = Storage.class.getSimpleName();

  // A map to keep uuid and active Call mapping
  static final Map<String, Call> callMap = new HashMap<>();
  // A map to keep uuid and active CallInvite mapping
  static final Map<String, CallInvite> callInviteMap = new HashMap<>();
  // A map to keep CallSid and uuid mapping
  static final Map<String, String> callInviteCallSidUuidMap = new HashMap<>();
  // A map to keep uuid and notification id mapping
  static final Map<String, Integer> uuidNotificationIdMap = new HashMap<>();
  // A map to keep uuid and CancelledCallInvite mapping
  static final Map<String, CancelledCallInvite> cancelledCallInviteMap = new HashMap<>();

  static void releaseCallInviteStorage(String uuid, String callSid, int notificationId, String action) {
    Log.d(TAG, "Removing items in callInviteMap" +
      "uuid:" + uuid +
      " callSid:" + callSid +
      " notificationId: " + notificationId +
      " action:" + action);
    Storage.callInviteMap.remove(uuid);
    Storage.callInviteCallSidUuidMap.remove(callSid);
    Storage.uuidNotificationIdMap.remove(uuid);
  }
}
