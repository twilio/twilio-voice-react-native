package com.twiliovoicereactnative;

import android.os.Handler;
import android.os.Looper;

import com.facebook.react.bridge.ReactApplicationContext;
import com.twilio.voice.PreflightTest;

import java.util.UUID;
import java.util.function.Function;

class PreflightTestModuleProxy {
  private static final SDKLog logger = new SDKLog(PreflightTestModuleProxy.class);

  private final Handler mainHandler = new Handler(Looper.getMainLooper());

  private void getPreflightTest(
    String uuidStr,
    ModuleProxy.UniversalPromise promise,
    Function<PreflightTest, Object> onSuccess
  ) {
    logger.debug(String.format(".getPreflightRecord(%s)", uuidStr));

    UUID uuid = UUID.fromString(uuidStr);

    final PreflightTestRecordDatabase.PreflightTestRecord record = VoiceApplicationProxy
      .getPreflightTestRecordDatabase()
      .getRecord();

    if (!uuid.equals(record.getUuid())) {
      final String errorMessage = String.format(
        "PreflightTest with UUID \"%s\" has already been garbage-collected. " +
          "This method must be invoked before starting another PreflightTest.",
        uuid
      );
      logger.warning(errorMessage);
      promise.rejectWithName(CommonConstants.ErrorCodeInvalidStateError, errorMessage);
      return;
    }

    mainHandler.post(() -> {
      logger.debug(String.format(".getPreflightRecord(%s) > runnable", uuidStr));
      final Object result = onSuccess.apply(record.getPreflightTest());
      promise.resolve(result);
    });
  }

  public void getCallSid(String uuid, ModuleProxy.UniversalPromise promise) {
    logger.debug(String.format(".getCallSid(%s)", uuid));

    getPreflightTest(uuid, promise, (preflightTest) -> {
      logger.debug(String.format(".getCallSid(%s) > runnable", uuid));
      return preflightTest.getCallSid();
    });
  }

  public void getEndTime(String uuid, ModuleProxy.UniversalPromise promise) {
    logger.debug(String.format(".getEndTime(%s)", uuid));

    getPreflightTest(uuid, promise, (preflightTest) -> {
      logger.debug(String.format(".getEndTime(%s) > runnable", uuid));
      return preflightTest.getEndTime();
    });
  }

  public void getLatestSample(String uuid, ModuleProxy.UniversalPromise promise) {
    logger.debug(String.format(".getLatestSample(%s)", uuid));

    getPreflightTest(uuid, promise, (preflightTest) -> {
      logger.debug(String.format(".getLatestSample(%s) > runnable", uuid));
      return preflightTest.getLatestSample().toString();
    });
  }

  public void getReport(String uuid, ModuleProxy.UniversalPromise promise) {
    logger.debug(String.format(".getReport(%s)", uuid));

    getPreflightTest(uuid, promise, (preflightTest) -> {
      logger.debug(String.format(".getReport(%s) > runnable", uuid));
      return preflightTest.getReport().toString();
    });
  }

  public void getStartTime(String uuid, ModuleProxy.UniversalPromise promise) {
    logger.debug(String.format(".getStartTime(%s)", uuid));

    getPreflightTest(uuid, promise, (preflightTest) -> {
      logger.debug(String.format(".getStartTime(%s) > runnable", uuid));
      return preflightTest.getStartTime();
    });
  }

  public void getState(String uuid, ModuleProxy.UniversalPromise promise) {
    logger.debug(String.format(".getState(%s)", uuid));

    getPreflightTest(uuid, promise, (preflightTest) -> {
      logger.debug(String.format(".getState(%s) > runnable", uuid));

      final PreflightTest.State state = preflightTest.getState();

      return switch (state) {
        case COMPLETED -> CommonConstants.PreflightTestStateCompleted;
        case CONNECTED -> CommonConstants.PreflightTestStateConnected;
        case CONNECTING -> CommonConstants.PreflightTestStateConnecting;
        case FAILED -> CommonConstants.PreflightTestStateFailed;
      };
    });
  }

  public void stop(String uuid, ModuleProxy.UniversalPromise promise) {
    logger.debug(String.format(".stop(%s)", uuid));

    getPreflightTest(uuid, promise, (preflightTest) -> {
      logger.debug(String.format(".stop(%s) > runnable", uuid));
      preflightTest.stop();
      return null;
    });
  }
}
