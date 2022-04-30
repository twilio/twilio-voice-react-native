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

  static final String TAG = "StatsListenerProxy";
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
          params.putString(CommonConstants.PEER_CONNECTION_ID, statsReports.get(i).getPeerConnectionId());

          List<LocalAudioTrackStats> localAudioStatsList = statsReports.get(i).getLocalAudioTrackStats();
          WritableArray localAudioStatsArray = Arguments.createArray();
          for (int j = 0; j < localAudioStatsList.size(); j++) {
            localAudioStatsArray.pushMap(jsonWithLocalAudioTrackStats(localAudioStatsList.get(j)));
          }
          params.putArray(CommonConstants.LOCAL_AUDIO_TRACK_STATS, localAudioStatsArray);

          List<RemoteAudioTrackStats> remoteAudioStatsList = statsReports.get(i).getRemoteAudioTrackStats();
          WritableArray remoteAudioStatsArray = Arguments.createArray();
          for (int j = 0; j < remoteAudioStatsList.size(); j++) {
            remoteAudioStatsArray.pushMap(jsonWithRemoteAudioTrackStats(remoteAudioStatsList.get(j)));
          }
          params.putArray(CommonConstants.REMOTE_AUDIO_TRACK_STATS, remoteAudioStatsArray);

          List<IceCandidatePairStats> iceCandidatePairStatsList = statsReports.get(i).getIceCandidatePairStats();
          WritableArray iceCandidatePairStatsArray = Arguments.createArray();
          for (int j = 0; j < iceCandidatePairStatsList.size(); j++) {
            iceCandidatePairStatsArray.pushMap(jsonWithIceCandidatePairStats(iceCandidatePairStatsList.get(j)));
          }
          params.putArray(CommonConstants.ICE_CANDIDATE_PAIR_STATS, iceCandidatePairStatsArray);

          List<IceCandidateStats> iceCandidateStatsList = statsReports.get(i).getIceCandidateStats();
          WritableArray iceCandidateStatsArray = Arguments.createArray();
          for (int j = 0; j < iceCandidateStatsList.size(); j++) {
            iceCandidateStatsArray.pushMap(jsonWithIceCandidateStats(iceCandidateStatsList.get(j)));
          }
          params.putArray(CommonConstants.ICE_CANDIDATE_STATS, iceCandidateStatsArray);

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
    params.putString(CommonConstants.CODEC, audioTrackStats.codec);
    params.putDouble(CommonConstants.PACKET_LOST, audioTrackStats.packetsLost);
    params.putString(CommonConstants.SSRC, audioTrackStats.ssrc);
    params.putDouble(CommonConstants.TIME_STAMP, audioTrackStats.timestamp);
    params.putString(CommonConstants.TRACK_ID, audioTrackStats.trackId);

    // Local track stats
    params.putDouble(CommonConstants.BYTES_SENT, audioTrackStats.bytesSent);
    params.putDouble(CommonConstants.PACKET_SENT, audioTrackStats.packetsSent);
    params.putDouble(CommonConstants.ROUND_TRIP_TIME, audioTrackStats.roundTripTime);

    // Local audio track stats
    params.putDouble(CommonConstants.AUDIO_LEVEL, audioTrackStats.audioLevel);
    params.putDouble(CommonConstants.JITTER, audioTrackStats.jitter);
    return params;
  }

  private WritableMap jsonWithRemoteAudioTrackStats(RemoteAudioTrackStats audioTrackStats) throws JSONException {
    WritableMap params = Arguments.createMap();
    // Base track stats
    params.putString(CommonConstants.CODEC, audioTrackStats.codec);
    params.putDouble(CommonConstants.PACKET_LOST, audioTrackStats.packetsLost);
    params.putString(CommonConstants.SSRC, audioTrackStats.ssrc);
    params.putDouble(CommonConstants.TIME_STAMP, audioTrackStats.timestamp);
    params.putString(CommonConstants.TRACK_ID, audioTrackStats.trackId);

    // Remote track stats
    params.putDouble(CommonConstants.BYTES_RECEIVED, audioTrackStats.bytesReceived);
    params.putDouble(CommonConstants.PACKET_RECEIVED, audioTrackStats.packetsReceived);

    // Remote audio track stats
    params.putDouble(CommonConstants.AUDIO_LEVEL, audioTrackStats.audioLevel);
    params.putDouble(CommonConstants.JITTER, audioTrackStats.jitter);
    params.putDouble(CommonConstants.MOS, audioTrackStats.mos);
    return params;
  }

  private WritableMap jsonWithIceCandidatePairStats(IceCandidatePairStats iceCandidatePairStats) throws JSONException {
    WritableMap params = Arguments.createMap();
    params.putBoolean(CommonConstants.ACTIVE_CANDIDATE_PAIR, iceCandidatePairStats.activeCandidatePair);
    params.putDouble(CommonConstants.AVAILABLE_INCOMING_BITRATE, iceCandidatePairStats.availableIncomingBitrate);
    params.putDouble(CommonConstants.AVAILABLE_OUTGOING_BITRATE, iceCandidatePairStats.availableOutgoingBitrate);
    params.putDouble(CommonConstants.BYTES_RECEIVED, iceCandidatePairStats.bytesReceived);
    params.putDouble(CommonConstants.BYTES_SENT, iceCandidatePairStats.bytesSent);
    params.putDouble(CommonConstants.CONSENT_REQUEST_RECEIVED, iceCandidatePairStats.consentRequestsReceived);
    params.putDouble(CommonConstants.CONSENT_REQUEST_SENT, iceCandidatePairStats.consentRequestsSent);
    params.putDouble(CommonConstants.CONSENT_RESPONSE_RECEIVED, iceCandidatePairStats.consentResponsesReceived);
    params.putDouble(CommonConstants.CONSENT_RESPONSE_SENT, iceCandidatePairStats.consentResponsesSent);
    params.putDouble(CommonConstants.CURRENT_ROUND_TRIP_TIME, iceCandidatePairStats.currentRoundTripTime);
    params.putString(CommonConstants.LOCAL_CANDIDATE_ID, iceCandidatePairStats.localCandidateId);
    params.putString(CommonConstants.LOCAL_CANDIDATE_IP, iceCandidatePairStats.localCandidateIp);
    params.putBoolean(CommonConstants.NOMINATED, iceCandidatePairStats.nominated);
    params.putDouble(CommonConstants.PRIORITY, iceCandidatePairStats.priority);
    params.putBoolean(CommonConstants.READABLE, iceCandidatePairStats.readable);
    params.putString(CommonConstants.RELAY_PROTOCOL, iceCandidatePairStats.relayProtocol);
    params.putString(CommonConstants.REMOTE_CANDIDATE_ID, iceCandidatePairStats.remoteCandidateId);
    params.putString(CommonConstants.REMOTE_CANDIDATE_IP, iceCandidatePairStats.remoteCandidateIp);
    params.putDouble(CommonConstants.REQUEST_RECEIVED, iceCandidatePairStats.requestsReceived);
    params.putDouble(CommonConstants.REQUEST_SENT, iceCandidatePairStats.requestsSent);
    params.putDouble(CommonConstants.RESPONSE_RECEIVED, iceCandidatePairStats.responsesReceived);
    //TODO - Read the value of iceCandidatePairStats.responsesSent
    params.putString(CommonConstants.RESPONSE_SENT, "iceCandidatePairStats.responsesSent");
    params.putDouble(CommonConstants.RETRANSMISSION_RECEIVED, iceCandidatePairStats.retransmissionsReceived);
    params.putDouble(CommonConstants.RETRANSMISSION_SENT, iceCandidatePairStats.retransmissionsSent);
    params.putString(CommonConstants.STATE, stringWithIceCandidatePairState(iceCandidatePairStats.state));
    params.putDouble(CommonConstants.TOTAL_ROUND_TRIP_TIME, iceCandidatePairStats.totalRoundTripTime);
    params.putString(CommonConstants.TRANSPORT_ID, iceCandidatePairStats.transportId);
    params.putBoolean(CommonConstants.WRITEABLE, iceCandidatePairStats.writeable);

    return params;
  }

  WritableMap jsonWithIceCandidateStats(IceCandidateStats iceCandidateStats) throws JSONException {
    WritableMap params = Arguments.createMap();
    params.putString(CommonConstants.CANDIDATE_TYPE, iceCandidateStats.candidateType);
    params.putBoolean(CommonConstants.DELETED, iceCandidateStats.deleted);
    params.putString(CommonConstants.IP, iceCandidateStats.ip);
    params.putBoolean(CommonConstants.IS_REMOTE, iceCandidateStats.isRemote);
    params.putInt(CommonConstants.PORT, iceCandidateStats.port);
    params.putInt(CommonConstants.PRIORITY, iceCandidateStats.priority);
    params.putString(CommonConstants.PROTOCOL, iceCandidateStats.protocol);
    params.putString(CommonConstants.TRANSPORT_ID, iceCandidateStats.transportId);
    params.putString(CommonConstants.URL, iceCandidateStats.url);
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
