package com.twiliovoicereactnative;

import static com.twiliovoicereactnative.AndroidEventEmitter.EVENT_KEY_TYPE;
import static com.twiliovoicereactnative.CommonConstants.CallEventReconnecting;

import android.content.Context;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
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
        WritableArray statsReportsArray = Arguments.createArray();

        for (int i = 0; i < statsReports.size(); i++) {
          WritableMap params = Arguments.createMap();
          params.putString("peerConnectionId", statsReports.get(i).getPeerConnectionId());

          List<LocalAudioTrackStats> localAudioStatsList = statsReports.get(i).getLocalAudioTrackStats();
          WritableArray localAudioStatsArray = Arguments.createArray();
          for (int j = 0; j < localAudioStatsList.size(); j++) {
            localAudioStatsArray.pushMap(jsonWithLocalAudioTrackStats(localAudioStatsList.get(j)));
          }
          params.putArray("localAudioTrackStats", localAudioStatsArray);

          List<RemoteAudioTrackStats> remoteAudioStatsList = statsReports.get(i).getRemoteAudioTrackStats();
          WritableArray remoteAudioStatsArray = Arguments.createArray();
          for (int j = 0; j < remoteAudioStatsList.size(); j++) {
            remoteAudioStatsArray.pushMap(jsonWithRemoteAudioTrackStats(remoteAudioStatsList.get(j)));
          }
          params.putArray("remoteAudioTrackStats", remoteAudioStatsArray);

          List<IceCandidatePairStats> iceCandidatePairStatsList = statsReports.get(i).getIceCandidatePairStats();
          WritableArray iceCandidatePairStatsArray = Arguments.createArray();
          for (int j = 0; j < iceCandidatePairStatsList.size(); j++) {
            iceCandidatePairStatsArray.pushMap(jsonWithIceCandidatePairStats(iceCandidatePairStatsList.get(j)));
          }
          params.putArray("iceCandidatePairStats", iceCandidatePairStatsArray);

          List<IceCandidateStats> iceCandidateStatsList = statsReports.get(i).getIceCandidateStats();
          WritableArray iceCandidateStatsArray = Arguments.createArray();
          for (int j = 0; j < iceCandidateStatsList.size(); j++) {
            iceCandidateStatsArray.pushMap(jsonWithIceCandidateStats(iceCandidateStatsList.get(j)));
          }
          params.putArray("iceCandidateStats", iceCandidateStatsArray);

          statsReportsArray.pushMap(params);
        }

        promise.resolve(statsReportsArray);
      }
    } catch (JSONException e) {
      promise.reject(TAG, e.getMessage());
      e.printStackTrace();
    }
  }

  private WritableMap jsonWithLocalAudioTrackStats(LocalAudioTrackStats audioTrackStats) throws JSONException {
    WritableMap params = Arguments.createMap();
    params.putString("codec", audioTrackStats.codec);
    params.putDouble("packetsLost", audioTrackStats.packetsLost);
    params.putString("ssrc", audioTrackStats.ssrc);
    params.putDouble("timestamp", audioTrackStats.timestamp);
    params.putString("trackId", audioTrackStats.trackId);

    // Local track stats
    params.putDouble("bytesSent", audioTrackStats.bytesSent);
    params.putDouble("packetsSent", audioTrackStats.packetsSent);
    params.putDouble("roundTripTime", audioTrackStats.roundTripTime);

    // Local audio track stats
    params.putDouble("audioLevel", audioTrackStats.audioLevel);
    params.putDouble("jitter", audioTrackStats.jitter);
    return params;
  }

  private WritableMap jsonWithRemoteAudioTrackStats(RemoteAudioTrackStats audioTrackStats) throws JSONException {
    WritableMap params = Arguments.createMap();
    // Base track stats
    params.putString("codec", audioTrackStats.codec);
    params.putDouble("packetsLost", audioTrackStats.packetsLost);
    params.putString("ssrc", audioTrackStats.ssrc);
    params.putDouble("timestamp", audioTrackStats.timestamp);
    params.putString("trackId", audioTrackStats.trackId);

    // Remote track stats
    params.putDouble("bytesReceived", audioTrackStats.bytesReceived);
    params.putDouble("packetsReceived", audioTrackStats.packetsReceived);

    // Remote audio track stats
    params.putDouble("audioLevel", audioTrackStats.audioLevel);
    params.putDouble("jitter", audioTrackStats.jitter);
    params.putDouble("mos", audioTrackStats.mos);
    return params;
  }

  private WritableMap jsonWithIceCandidatePairStats(IceCandidatePairStats iceCandidatePairStats) throws JSONException {
    WritableMap params = Arguments.createMap();
    params.putBoolean("activeCandidatePair", iceCandidatePairStats.activeCandidatePair);
    params.putDouble("availableIncomingBitrate", iceCandidatePairStats.availableIncomingBitrate);
    params.putDouble("availableOutgoingBitrate", iceCandidatePairStats.availableOutgoingBitrate);
    params.putDouble("bytesReceived", iceCandidatePairStats.bytesReceived);
    params.putDouble("bytesSent", iceCandidatePairStats.bytesSent);
    params.putDouble("consentRequestsReceived", iceCandidatePairStats.consentRequestsReceived);
    params.putDouble("consentRequestsSent", iceCandidatePairStats.consentRequestsSent);
    params.putDouble("consentResponsesReceived", iceCandidatePairStats.consentResponsesReceived);
    params.putDouble("consentResponsesSent", iceCandidatePairStats.consentResponsesSent);
    params.putDouble("currentRoundTripTime", iceCandidatePairStats.currentRoundTripTime);
    params.putString("localCandidateId", iceCandidatePairStats.localCandidateId);
    params.putString("localCandidateIp", iceCandidatePairStats.localCandidateIp);
    params.putBoolean("nominated", iceCandidatePairStats.nominated);
    params.putDouble("priority", iceCandidatePairStats.priority);
    params.putBoolean("readable", iceCandidatePairStats.readable);
    params.putString("relayProtocol", iceCandidatePairStats.relayProtocol);
    params.putString("remoteCandidateId", iceCandidatePairStats.remoteCandidateId);
    params.putString("remoteCandidateIp", iceCandidatePairStats.remoteCandidateIp);
    params.putDouble("requestsReceived", iceCandidatePairStats.requestsReceived);
    params.putDouble("requestsSent", iceCandidatePairStats.requestsSent);
    params.putDouble("responsesRecieved", iceCandidatePairStats.responsesReceived);
    //TODO - Read the value of iceCandidatePairStats.responsesSent
    params.putString("responsesSent", "iceCandidatePairStats.responsesSent");
    params.putDouble("retransmissionsReceived", iceCandidatePairStats.retransmissionsReceived);
    params.putDouble("retransmissionsSent", iceCandidatePairStats.retransmissionsSent);
    params.putString("state", stringWithIceCandidatePairState(iceCandidatePairStats.state));
    params.putDouble("totalRoundTripTime", iceCandidatePairStats.totalRoundTripTime);
    params.putString("transportId", iceCandidatePairStats.transportId);
    params.putBoolean("writeable", iceCandidatePairStats.writeable);

    return params;
  }

  WritableMap jsonWithIceCandidateStats(IceCandidateStats iceCandidateStats) throws JSONException {
    WritableMap params = Arguments.createMap();
    params.putString(EVENT_KEY_TYPE, CallEventReconnecting);
    params.putString("candidateType", iceCandidateStats.candidateType);
    params.putBoolean("deleted", iceCandidateStats.deleted);
    params.putString("ip", iceCandidateStats.ip);
    params.putBoolean("isRemote", iceCandidateStats.isRemote);
    params.putInt("port", iceCandidateStats.port);
    params.putInt("priority", iceCandidateStats.priority);
    params.putString("protocol", iceCandidateStats.protocol);
    params.putString("transportId", iceCandidateStats.transportId);
    params.putString("url", iceCandidateStats.url);
    return params;
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
