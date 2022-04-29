package com.twiliovoicereactnative;

import android.content.Context;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.twilio.voice.IceCandidatePairState;
import com.twilio.voice.IceCandidatePairStats;
import com.twilio.voice.IceCandidateStats;
import com.twilio.voice.LocalAudioTrackStats;
import com.twilio.voice.RemoteAudioTrackStats;
import com.twilio.voice.StatsListener;
import com.twilio.voice.StatsReport;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.List;

public class StatsListenerProxy implements StatsListener {

  static final String TAG = "CallListenerProxy";
  private final Promise promise;

  public StatsListenerProxy(String uuid, Context context, Promise promise) {
    this.promise = promise;
  }

  @Override
  public void onStats(@NonNull List<StatsReport> statsReports) {
    try {
      if (statsReports != null) {
        JSONObject jsonObject = new JSONObject();
        for (int i = 0; i < statsReports.size(); i++) {
          jsonObject.put("peerConnectionId", statsReports.get(i).getPeerConnectionId());

          List<LocalAudioTrackStats> localAudioStatsList = statsReports.get(i).getLocalAudioTrackStats();
          JSONArray localAudioStatsArray = new JSONArray();
          for (int j = 0; j < localAudioStatsList.size(); i++) {
            localAudioStatsArray.put(jsonWithLocalAudioTrackStats(localAudioStatsList.get(j)));
          }
          jsonObject.put("localAudioTrackStats", localAudioStatsArray);

          List<RemoteAudioTrackStats> remoteAudioStatsList = statsReports.get(i).getRemoteAudioTrackStats();
          JSONArray remoteAudioStatsArray = new JSONArray();
          for (int j = 0; j < remoteAudioStatsList.size(); i++) {
            remoteAudioStatsArray.put(jsonWithRemoteAudioTrackStats(remoteAudioStatsList.get(j)));
          }
          jsonObject.put("remoteAudioTrackStats", remoteAudioStatsArray);

          List<IceCandidatePairStats> iceCandidatePairStatsList = statsReports.get(i).getIceCandidatePairStats();
          JSONArray iceCandidatePairStatsArray = new JSONArray();
          for (int j = 0; j < iceCandidatePairStatsList.size(); i++) {
            iceCandidatePairStatsArray.put(jsonWithIceCandidatePairStats(iceCandidatePairStatsList.get(j)));
          }
          jsonObject.put("iceCandidatePairStats", iceCandidatePairStatsArray);

          List<IceCandidateStats> iceCandidateStatsList = statsReports.get(i).getIceCandidateStats();
          JSONArray iceCandidateStatsArray = new JSONArray();
          for (int j = 0; j < iceCandidateStatsList.size(); i++) {
            iceCandidateStatsArray.put(jsonWithIceCandidateStats(iceCandidateStatsList.get(j)));
          }
          jsonObject.put("iceCandidateStats", iceCandidateStatsArray);
        }
        Log.d(TAG, jsonObject.toString());
        promise.resolve(jsonObject.toString());
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
  }

  private JSONObject jsonWithLocalAudioTrackStats(LocalAudioTrackStats audioTrackStats) throws JSONException {
    return new JSONObject()
      .put("codec", audioTrackStats.codec)
      .put("packetsLost",audioTrackStats.packetsLost)
      .put("ssrc", audioTrackStats.ssrc)
      .put("timestamp", audioTrackStats.timestamp)
      .put("trackId", audioTrackStats.trackId)

      // Local track stats
      .put("bytesSent", audioTrackStats.bytesSent)
      .put("packetsSent", audioTrackStats.packetsSent)
      .put("roundTripTime", audioTrackStats.roundTripTime)

      // Local audio track stats
      .put("audioLevel", audioTrackStats.audioLevel)
      .put("jitter", audioTrackStats.jitter);
  }

  private JSONObject jsonWithRemoteAudioTrackStats(RemoteAudioTrackStats audioTrackStats) throws JSONException {
    return new JSONObject()
      // Base track stats
      .put("codec", audioTrackStats.codec)
      .put("packetsLost", audioTrackStats.packetsLost)
      .put("ssrc", audioTrackStats.ssrc)
      .put("timestamp", audioTrackStats.timestamp)
      .put("trackId", audioTrackStats.trackId)

      // Remote track stats
      .put("bytesRecieved", audioTrackStats.bytesReceived)
      .put("packetsReceived", audioTrackStats.packetsReceived)

      // Remote audio track stats
      .put("audioLevel", audioTrackStats.audioLevel)
      .put("jitter", audioTrackStats.jitter)
      .put("mos", audioTrackStats.mos);
  }

  private JSONObject jsonWithIceCandidatePairStats(IceCandidatePairStats iceCandidatePairStats) throws JSONException {
    return new JSONObject()
      .put("activeCandidatePair", iceCandidatePairStats.activeCandidatePair)
      .put("availableIncomingBitrate", iceCandidatePairStats.availableIncomingBitrate)
      .put("availableOutgoingBitrate", iceCandidatePairStats.availableOutgoingBitrate)
      .put("bytesReceived", iceCandidatePairStats.bytesReceived)
      .put("bytesSent", iceCandidatePairStats.bytesSent)
      .put("consentRequestsReceived", iceCandidatePairStats.consentRequestsReceived)
      .put("consentRequestsSent", iceCandidatePairStats.consentRequestsSent)
      .put("consentResponsesReceived", iceCandidatePairStats.consentResponsesReceived)
      .put("consentResponsesSent", iceCandidatePairStats.consentResponsesSent)
      .put("currentRoundTripTime", iceCandidatePairStats.currentRoundTripTime)
      .put("localCandidateId", iceCandidatePairStats.localCandidateId)
      .put("localCandidateIp", iceCandidatePairStats.localCandidateIp)
      .put("nominated", iceCandidatePairStats.nominated)
      .put("priority", iceCandidatePairStats.priority)
      .put("readable", iceCandidatePairStats.readable)
      .put("relayProtocol", iceCandidatePairStats.relayProtocol)
      .put("remoteCandidateId", iceCandidatePairStats.remoteCandidateId)
      .put("remoteCandidateIp", iceCandidatePairStats.remoteCandidateIp)
      .put("requestsReceieved", iceCandidatePairStats.requestsReceived)
      .put("requestsSent", iceCandidatePairStats.requestsSent)
      .put("responsesRecieved", iceCandidatePairStats.responsesReceived)
      //TODO - Read the value of iceCandidatePairStats.responsesSent
      .put("responsesSent", "iceCandidatePairStats.responsesSent")
      .put("retransmissionsReceived", iceCandidatePairStats.retransmissionsReceived)
      .put("retransmissionsSent", iceCandidatePairStats.retransmissionsSent)
      .put("state" ,stringWithIceCandidatePairState(iceCandidatePairStats.state))
      .put("totalRoundTripTime", iceCandidatePairStats.totalRoundTripTime)
      .put("transportId",iceCandidatePairStats.transportId)
      .put("writeable", iceCandidatePairStats.writeable);
  }

  JSONObject jsonWithIceCandidateStats(IceCandidateStats iceCandidateStats) throws JSONException {
    return new JSONObject()
      .put( "candidateType", iceCandidateStats.candidateType)
      .put( "deleted", iceCandidateStats.deleted)
      .put( "ip", iceCandidateStats.ip)
      .put( "isRemote", iceCandidateStats.isRemote)
      .put( "port", iceCandidateStats.port)
      .put( "priority", iceCandidateStats.priority)
      .put( "protocol", iceCandidateStats.protocol)
      .put( "transportId", iceCandidateStats.transportId)
      .put( "url", iceCandidateStats.url);
  }

  private String stringWithIceCandidatePairState(IceCandidatePairState state) {
    switch (state) {
      case STATE_FAILED:
        return "STATE_FAILED";
      case STATE_FROZEN:
        return "STATE_FROZEN";
      case STATE_IN_PROGRESS:
        return "STATE_IN_PROGRESS";
      case STATE_SUCCEEDED:
        return "STATE_SUCCEEDED";
      case STATE_WAITING:
        return "STATE_WAITING";
      default:
        return "STATE_UNKNOWN";
    }
  }
}
