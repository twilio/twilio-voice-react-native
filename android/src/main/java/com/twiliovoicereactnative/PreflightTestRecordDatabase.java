package com.twiliovoicereactnative;

import com.twilio.voice.PreflightTest;

import java.util.UUID;

public class PreflightTestRecordDatabase {
  public static class PreflightTestRecord {
    private final UUID uuid;

    private PreflightTest preflightTest;

    PreflightTestRecord(UUID uuid) {
      this.uuid = uuid;
    }

    public UUID getUuid() {
      return uuid;
    }

    public PreflightTest getPreflightTest() {
      return preflightTest;
    }
  }

  private PreflightTestRecord preflightTestRecord;

  public void setRecord(UUID uuid, PreflightTest preflightTest) {
    PreflightTestRecord record = new PreflightTestRecord(uuid);
    record.preflightTest = preflightTest;
    this.preflightTestRecord = record;
  }

  public PreflightTestRecord getRecord() {
    return this.preflightTestRecord;
  }
}
