package com.twiliovoicereactnative;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import com.twilio.voice.Call;
import com.twilio.voice.CallInvite;
import com.twilio.voice.CancelledCallInvite;

public class Storage {
  static final Map<String, Call> callMap = new HashMap<>();
  static final Map<String, CallInvite> callInviteMap = new HashMap<>();
  static final Map<String, CancelledCallInvite> cancelledCallInviteMap = new HashMap<>();
}
