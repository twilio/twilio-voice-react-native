package com.twiliovoicereactnative;

import android.content.ContentResolver;
import android.content.Context;
import android.net.Uri;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.twilio.voice.Call;
import com.twilio.voice.CallInvite;
import com.twilio.voice.CancelledCallInvite;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public class Storage {
  private static final String TAG = Storage.class.getSimpleName();

  // A map to keep uuid and active Call mapping
  static final Map<String, Call> callMap = new HashMap<>();
  // A map to keep uuid and initial connection timestamp
  static final Map<String, Double> callConnectMap = new HashMap<>();
  // A map to keep uuid and active CallInvite mapping
  static final Map<String, CallInvite> callInviteMap = new HashMap<>();
  // A map to keep CallSid and uuid mapping
  static final Map<String, String> callInviteCallSidUuidMap = new HashMap<>();
  // A map to keep uuid and notification id mapping
  static final Map<String, Integer> uuidNotificationIdMap = new HashMap<>();
  // A map to keep uuid and CancelledCallInvite mapping
  static final Map<String, CancelledCallInvite> cancelledCallInviteMap = new HashMap<>();
  // A map to keep uuid and js promise objects associated
  static final Map<String, Promise> callAcceptedPromiseMap = new HashMap<>();

  static void releaseCallInviteStorage(String uuid, String callSid, int notificationId, String action) {
    Log.d(TAG, "Removing items in callInviteMap" +
      "uuid:" + uuid +
      " callSid:" + callSid +
      " notificationId: " + notificationId +
      " action:" + action);
    Storage.callInviteMap.remove(uuid);
    Storage.callInviteCallSidUuidMap.remove(callSid);
    Storage.uuidNotificationIdMap.remove(uuid);
    Storage.callAcceptedPromiseMap.remove(uuid);
  }

  static Uri provideResourceSilent_wav(@NonNull Context context) {
    return provideResource(context, R.raw.silent);
  }

  private static Uri provideResource(@NonNull Context context, int id) {
    return (new Uri.Builder()
      .scheme(ContentResolver.SCHEME_ANDROID_RESOURCE)
      .authority(context.getResources().getResourcePackageName(id))
      .appendPath(String.valueOf(id))
    ).build();
  }
}
