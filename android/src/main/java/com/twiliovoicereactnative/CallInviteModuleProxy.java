package com.twiliovoicereactnative;

import android.os.Handler;
import android.os.Looper;

import com.facebook.react.bridge.ReactApplicationContext;

import java.util.function.Consumer;
import java.util.UUID;

class CallInviteModuleProxy {
  private static final SDKLog logger = new SDKLog(CallInviteModuleProxy.class);

  private final Handler mainHandler = new Handler(Looper.getMainLooper());

  private final ReactApplicationContext reactApplicationContext;

  public CallInviteModuleProxy(ReactApplicationContext reactApplicationContext) {
    this.reactApplicationContext = reactApplicationContext;
  }

  private void getCallRecord(
    String uuidStr,
    ModuleProxy.UniversalPromise promise,
    Consumer<CallRecordDatabase.CallRecord> onSuccess
  ) {
    logger.debug(String.format(".getCallRecord(%s)", uuidStr));

    final UUID uuid = UUID.fromString(uuidStr);

    CallRecordDatabase.CallRecord callRecord = VoiceApplicationProxy
      .getCallRecordDatabase()
      .get(new CallRecordDatabase.CallRecord(uuid));

    if (null == callRecord || null == callRecord.getCallInvite()) {
      final String warningMsg = this.reactApplicationContext
        .getString(R.string.missing_callinvite_uuid, uuid);
      promise.rejectWithName(CommonConstants.ErrorCodeInvalidArgumentError, warningMsg);
      return;
    }

    mainHandler.post(() -> {
      logger.debug(String.format(".getCallRecord(%s) > runnable", uuid));
      onSuccess.accept(callRecord);
    });
  }

  public void accept(String uuid, ModuleProxy.UniversalPromise promise) {
    logger.debug(String.format(".accept(%s)", uuid));

    getCallRecord(uuid, promise, (callRecord) -> {
      logger.debug(String.format(".accept(%s) > runnable", uuid));

      callRecord.setCallAcceptedPromise(promise);

      try {
        VoiceApplicationProxy
          .getVoiceServiceApi()
          .acceptCall(callRecord);
      } catch (SecurityException e) {
        logger.error(e.toString());
        promise.rejectWithCode(31401, e.getMessage());
      }
    });
  }

  public void reject(String uuid, ModuleProxy.UniversalPromise promise) {
    logger.debug(String.format(".reject(%s)", uuid));

    getCallRecord(uuid, promise, (callRecord) -> {
      logger.debug(String.format(".reject(%s) > runnable", uuid));

      // Store promise for callback
      callRecord.setCallRejectedPromise(promise);

      // Send Event to service
      VoiceApplicationProxy
        .getVoiceServiceApi()
        .rejectCall(callRecord);
    });
  }
}
