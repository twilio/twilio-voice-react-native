package com.twiliovoicereactnative;

import android.os.Handler;
import android.os.Looper;

import com.facebook.react.bridge.ReactApplicationContext;
import com.twilio.voice.Call;
import com.twilio.voice.CallMessage;

import java.util.Map;
import java.util.function.Consumer;

class CallModuleProxy {
  /**
   * Map of common constant score strings to the Call.Score enum.
   */
  public static final Map<String, Call.Score> scoreMap = Map.of(
    CommonConstants.CallFeedbackScoreNotReported, Call.Score.NOT_REPORTED,
    CommonConstants.CallFeedbackScoreOne, Call.Score.ONE,
    CommonConstants.CallFeedbackScoreTwo, Call.Score.TWO,
    CommonConstants.CallFeedbackScoreThree, Call.Score.THREE,
    CommonConstants.CallFeedbackScoreFour, Call.Score.FOUR,
    CommonConstants.CallFeedbackScoreFive, Call.Score.FIVE
  );

  /**
   * Map of common constant issue strings to the Call.Issue enum.
   */
  public static final Map<String, Call.Issue> issueMap = Map.of(
    CommonConstants.CallFeedbackIssueAudioLatency, Call.Issue.AUDIO_LATENCY,
    CommonConstants.CallFeedbackIssueChoppyAudio, Call.Issue.CHOPPY_AUDIO,
    CommonConstants.CallFeedbackIssueEcho, Call.Issue.ECHO,
    CommonConstants.CallFeedbackIssueDroppedCall, Call.Issue.DROPPED_CALL,
    CommonConstants.CallFeedbackIssueNoisyCall, Call.Issue.NOISY_CALL,
    CommonConstants.CallFeedbackIssueNotReported, Call.Issue.NOT_REPORTED,
    CommonConstants.CallFeedbackIssueOneWayAudio, Call.Issue.ONE_WAY_AUDIO
  );

  /**
   * Use the score map to get a Call.Score value from a string.
   * @param score The score as a string passed from the JS layer.
   * @return a Call.Score enum value. If the passed string is not in the enum, defaults to
   * Call.Score.NOT_REPORTED.
   */
  public static Call.Score getScoreFromString(String score) {
    return scoreMap.getOrDefault(score, Call.Score.NOT_REPORTED);
  }

  /**
   * Use the issue map to get a Call.Issue value from a string.
   * @param issue The issue as a string passed from the JS layer.
   * @return a Call.Issue enum value. If the passed string is not in the enum, defaults to
   * Call.Issue.NOT_REPORTED.
   */
  public static Call.Issue getIssueFromString(String issue) {
    return issueMap.getOrDefault(issue, Call.Issue.NOT_REPORTED);
  }

  private final SDKLog logger = new SDKLog(CallModuleProxy.class);

  private final Handler mainHandler = new Handler(Looper.getMainLooper());

  private final ReactApplicationContext reactApplicationContext;

  public CallModuleProxy(ReactApplicationContext reactApplicationContext) {
    this.reactApplicationContext = reactApplicationContext;
  }

  private void getCallRecord(
    String uuid,
    ModuleProxy.UniversalPromise promise,
    Consumer<CallRecordDatabase.CallRecord> onSuccess
  ) {
    logger.debug(".getCallRecord()");

    final CallRecordDatabase.CallRecord callRecord = VoiceApplicationProxy
      .getCallRecordDatabase()
      .get(new CallRecordDatabase.CallRecord(uuid));

    if (null == callRecord || null == callRecord.getVoiceCall()) {
      final String warningMsg = this.reactApplicationContext
        .getString(R.string.missing_call_uuid, uuid);
      promise.rejectWithName(CommonConstants.ErrorCodeInvalidArgumentError, warningMsg);
      return;
    }

    mainHandler.post(() -> {
      logger.debug(".getCallRecord() > runnable");
      onSuccess.accept(callRecord);
    });
  }

  public void getState(String uuid, ModuleProxy.UniversalPromise promise) {
    logger.debug(".getState()");

    getCallRecord(uuid, promise, (callRecord) -> {
      final String state = callRecord
        .getVoiceCall()
        .getState()
        .toString()
        .toLowerCase();
      promise.resolve(state);
    });
  }

  public void isMuted(String uuid, ModuleProxy.UniversalPromise promise) {
    logger.debug(".isMuted()");

    getCallRecord(uuid, promise, (callRecord) -> {
      final boolean isMuted = callRecord
        .getVoiceCall()
        .isMuted();
      promise.resolve(isMuted);
    });
  }

  public void isOnHold(String uuid, ModuleProxy.UniversalPromise promise) {
    logger.debug(".isOnHold()");

    getCallRecord(uuid, promise, (callRecord) -> {
      final boolean isOnHold = callRecord
        .getVoiceCall()
        .isOnHold();
      promise.resolve(isOnHold);
    });
  }

  public void disconnect(String uuid, ModuleProxy.UniversalPromise promise) {
    logger.debug(".disconnect()");

    getCallRecord(uuid, promise, (callRecord) -> {
      callRecord
        .getVoiceCall()
        .disconnect();
      promise.resolve(null);
    });
  }

  public void hold(String uuid, boolean hold, ModuleProxy.UniversalPromise promise) {
    logger.debug(".hold()");

    getCallRecord(uuid, promise, (callRecord) -> {
      callRecord
        .getVoiceCall()
        .hold(hold);
      promise.resolve(null);
    });
  }

  public void mute(String uuid, boolean mute, ModuleProxy.UniversalPromise promise) {
    logger.debug(".mute()");

    getCallRecord(uuid, promise, (callRecord) -> {
      callRecord
        .getVoiceCall()
        .mute(mute);
      promise.resolve(null);
    });
  }

  public void sendDigits(String uuid, String digits, ModuleProxy.UniversalPromise promise) {
    logger.debug(".sendDigits()");

    getCallRecord(uuid, promise, (callRecord) -> {
      callRecord
        .getVoiceCall()
        .sendDigits(digits);
      promise.resolve(null);
    });
  }

  public void postFeedback(String uuid, String score, String issue, ModuleProxy.UniversalPromise promise) {
    logger.debug(".postFeedback()");

    getCallRecord(uuid, promise, (callRecord) -> {
      Call.Score parsedScore = CallModuleProxy.getScoreFromString(score);
      Call.Issue parsedIssue = CallModuleProxy.getIssueFromString(issue);

      callRecord
        .getVoiceCall()
        .postFeedback(parsedScore, parsedIssue);

      promise.resolve(null);
    });
  }

  public void getStats(String uuid, ModuleProxy.UniversalPromise promise) {
    logger.debug(".getStats()");

    getCallRecord(uuid, promise, (callRecord) -> {
      callRecord
        .getVoiceCall()
        .getStats(new StatsListenerProxy(promise));
    });
  }

  public void sendMessage(
    String uuid,
    String content,
    String contentType,
    String messageType,
    ModuleProxy.UniversalPromise promise
  ) {
    logger.debug(".sendMessage()");

    getCallRecord(uuid, promise, (callRecord) -> {
      final CallMessage callMessage = new CallMessage.Builder(messageType)
        .contentType(contentType)
        .content(content)
        .build();

      final String callMessageSid =
        CallRecordDatabase.CallRecord.CallInviteState.ACTIVE == callRecord.getCallInviteState()
          ? callRecord.getCallInvite().sendMessage(callMessage)
          : callRecord.getVoiceCall().sendMessage(callMessage);

      promise.resolve(callMessageSid);
    });
  }
}
