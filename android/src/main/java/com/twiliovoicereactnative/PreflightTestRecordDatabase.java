package com.twiliovoicereactnative;

import com.twilio.voice.PreflightTest;

import java.util.UUID;
import java.util.Vector;

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
  }

  private final Vector<PreflightTestRecord> preflightTestRecords;

  PreflightTestRecordDatabase() {
    this.preflightTestRecords = new Vector<>();
  }

  public void add(UUID uuid, PreflightTest preflightTest) {
    final PreflightTestRecord record = new PreflightTestRecord(uuid);
    record.preflightTest = preflightTest;
    this.preflightTestRecords.add(record);
  }

  public PreflightTest get(UUID uuid) {
    for (PreflightTestRecord record : this.preflightTestRecords) {
      if (record.getUuid().equals(uuid)) {
        return record.preflightTest;
      }
    }
    return null;
  }

  public Vector<PreflightTestRecord> getCollection() {
    return this.preflightTestRecords;
  }
}
