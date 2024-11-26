package com.twiliovoicereactnative;

import static com.twiliovoicereactnative.CallRecordDatabase.CallRecord.CallInviteState.ACTIVE;
import static com.twiliovoicereactnative.CallRecordDatabase.CallRecord.CallInviteState.NONE;
import static com.twiliovoicereactnative.CallRecordDatabase.CallRecord.CallInviteState.USED;

import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.Vector;
import java.util.Map;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.twilio.voice.Call;
import com.twilio.voice.CallException;
import com.twilio.voice.CallInvite;
import com.twilio.voice.CancelledCallInvite;

class CallRecordDatabase  {
  public static class CallRecord {
    public enum CallInviteState { NONE, ACTIVE, USED }
    public enum Direction { INCOMING, OUTGOING }
    private final UUID uuid;
    private String callSid = null;
    private Date timestamp = null;
    private int notificationId = -1;
    private Call voiceCall = null;
    private String callRecipient = "";
    private CallInvite callInvite = null;
    private CallInviteState callInviteState = NONE;
    private CancelledCallInvite cancelledCallInvite = null;
    private Promise callAcceptedPromise = null;
    private Promise callRejectedPromise = null;
    private CallException callException = null;
    private Map<String, String> customParameters = null;
    private String notificationDisplayName = null;
    private Direction direction = Direction.INCOMING;
    public CallRecord(final UUID uuid) {
      this.uuid = uuid;
    }
    public CallRecord(final String callSid) {
      this.uuid = null;
      this.callSid = callSid;
    }
    public CallRecord(final UUID uuid, final CallInvite callInvite) {
      this.uuid = uuid;
      this.callSid = callInvite.getCallSid();
      this.callInvite = callInvite;
      this.callInviteState = ACTIVE;
    }
    public CallRecord(
      final UUID uuid,
      final Call call,
      final String recipient,
      final Map<String, String> customParameters,
      final Direction direction,
      final String notificationDisplayName
    ) {
      this.uuid = uuid;
      this.callSid = call.getSid();
      this.voiceCall = call;
      this.callRecipient = recipient;
      this.customParameters = customParameters;
      this.direction = direction;
      this.notificationDisplayName = notificationDisplayName;
    }
    public final UUID getUuid() {
      return uuid;
    }
    public String getCallSid() {
      return callSid;
    }
    public int getNotificationId() {
      return notificationId;
    }
    public Date getTimestamp() {
      return timestamp;
    }
    public Call getVoiceCall() {
      return this.voiceCall;
    }
    public final Map<String, String> getCustomParameters() {
      if (this.direction == Direction.INCOMING) {
        return this.callInvite.getCustomParameters();
      }
      return this.customParameters;
    }
    public final String getNotificationDisplayName() {
      return this.notificationDisplayName;
    }
    public final Direction getDirection() {
      return this.direction;
    }
    public CallInvite getCallInvite() {
      return this.callInvite;
    }
    public CallInviteState getCallInviteState() {
      return this.callInviteState;
    }
    public CancelledCallInvite getCancelledCallInvite() {
      return this.cancelledCallInvite;
    }
    public Promise getCallAcceptedPromise() {
      return this.callAcceptedPromise;
    }
    public Promise getCallRejectedPromise() {
      return this.callRejectedPromise;
    }
    public CallException getCallException() {
      return this.callException;
    }
    public String getCallRecipient() { return this.callRecipient; }
    public void setNotificationId(int notificationId) {
      this.notificationId = notificationId;
    }
    public void setTimestamp(Date timestamp) {
      this.timestamp = timestamp;
    }
    public void setCall(@NonNull Call voiceCall) {
      this.callSid = voiceCall.getSid();
      this.voiceCall = voiceCall;
    }
    public void setCallInviteUsedState() {
      this.callInviteState = (this.callInviteState == ACTIVE) ? USED : this.callInviteState;
    }
    public void setCancelledCallInvite(@NonNull CancelledCallInvite cancelledCallInvite) {
      this.callSid = cancelledCallInvite.getCallSid();
      this.cancelledCallInvite = cancelledCallInvite;
      this.callInvite = null;
      this.callInviteState = NONE;
    }
    public void setCallAcceptedPromise(@NonNull Promise callAcceptedPromise) {
      this.callAcceptedPromise = callAcceptedPromise;
    }
    public void setCallRejectedPromise(@NonNull Promise callRejectedPromise) {
      this.callRejectedPromise = callRejectedPromise;
    }
    public void setCallException(CallException callException) {
      this.callException = callException;
    }
    @Override
    public boolean equals(Object obj) {
      return (obj instanceof CallRecord) && comparator(this, (CallRecord)obj);
    }
  }
  private final List<CallRecord> callRecordList = new Vector<>();

  public void add(final CallRecord callRecord) {
    callRecordList.add(callRecord);
  }
  public void clear() {
    callRecordList.clear();
  }

  public CallRecord get(final CallRecord record) {
    try {
      return callRecordList.get(callRecordList.indexOf(record));
    } catch (IndexOutOfBoundsException e) {
      return null;
    }
  }
  public CallRecord remove(final CallRecord record) {
    try {
      return callRecordList.remove(callRecordList.indexOf(record));
    } catch (IndexOutOfBoundsException e) {
      return null;
    }
  }
  public Collection<CallRecord> getCollection() {
    return callRecordList;
  }
  private static boolean comparator(@NonNull final CallRecord lhs, @NonNull final CallRecord rhs) {
    if (null != lhs.uuid && null != rhs.uuid) {
      return lhs.uuid.equals(rhs.uuid);
    } else if (null != lhs.callSid && null != rhs.callSid) {
      return lhs.callSid.equals(rhs.callSid);
    }
    return false;
  }
}
