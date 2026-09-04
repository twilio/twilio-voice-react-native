package com.twiliovoicereactnative;

import android.os.Handler;
import android.os.Looper;

import com.facebook.react.bridge.ReactApplicationContext;
import com.twilio.voice.PreflightTest;

import org.json.JSONObject;

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
      return String.valueOf(preflightTest.getEndTime());
    });
  }

  public void getLatestSample(String uuid, ModuleProxy.UniversalPromise promise) {
    logger.debug(String.format(".getLatestSample(%s)", uuid));

    getPreflightTest(uuid, promise, (preflightTest) -> {
      logger.debug(String.format(".getLatestSample(%s) > runnable", uuid));
      // No null sample is reported today. An absent sample arrives as an empty
      // object, which the JS layer detects. This check is defensive against a
      // future change below this layer.
      final JSONObject latestSample = preflightTest.getLatestSample();
      return latestSample == null ? null : latestSample.toString();
    });
  }

  public void getReport(String uuid, ModuleProxy.UniversalPromise promise) {
    logger.debug(String.format(".getReport(%s)", uuid));

    getPreflightTest(uuid, promise, (preflightTest) -> {
      logger.debug(String.format(".getReport(%s) > runnable", uuid));
      // An empty report is reported while the PreflightTest has not completed.
      // The null check keeps this consistent with iOS, where no report arrives
      // as null.
      final JSONObject report = preflightTest.getReport();
      return report == null ? null : report.toString();
    });
  }

  public void getStartTime(String uuid, ModuleProxy.UniversalPromise promise) {
    logger.debug(String.format(".getStartTime(%s)", uuid));

    getPreflightTest(uuid, promise, (preflightTest) -> {
      logger.debug(String.format(".getStartTime(%s) > runnable", uuid));
      return String.valueOf(preflightTest.getStartTime());
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
