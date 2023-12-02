package com.twiliovoicereactnative;



import android.content.Context;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.twilio.voice.IceCandidatePairState;
import com.twilio.voice.IceCandidatePairStats;
import com.twilio.voice.IceCandidateStats;
import com.twilio.voice.LocalAudioTrackStats;
import com.twilio.voice.RemoteAudioTrackStats;
import com.twilio.voice.StatsListener;
import com.twilio.voice.StatsReport;

import org.json.JSONException;


import java.util.List;

class StatsListenerProxy implements StatsListener {
  private final Promise promise;

  public StatsListenerProxy(String uuid, Context context, Promise promise) {
    this.promise = promise;
  }

  @Override
  public void onStats(@NonNull List<StatsReport> statsReports) {
    try {
      WritableArray statsReportsArray = Arguments.createArray();

      for (int i = 0; i < statsReports.size(); i++) {
        WritableMap params = Arguments.createMap();
        params.putString(CommonConstants.PeerConnectionId, statsReports.get(i).getPeerConnectionId());

        List<LocalAudioTrackStats> localAudioStatsList = statsReports.get(i).getLocalAudioTrackStats();
        WritableArray localAudioStatsArray = Arguments.createArray();
        for (int j = 0; j < localAudioStatsList.size(); j++) {
          localAudioStatsArray.pushMap(jsonWithLocalAudioTrackStats(localAudioStatsList.get(j)));
        }
        params.putArray(CommonConstants.LocalAudioTrackStats, localAudioStatsArray);

        List<RemoteAudioTrackStats> remoteAudioStatsList = statsReports.get(i).getRemoteAudioTrackStats();
        WritableArray remoteAudioStatsArray = Arguments.createArray();
        for (int j = 0; j < remoteAudioStatsList.size(); j++) {
          remoteAudioStatsArray.pushMap(jsonWithRemoteAudioTrackStats(remoteAudioStatsList.get(j)));
        }
        params.putArray(CommonConstants.RemoteAudioTrackStats, remoteAudioStatsArray);

        List<IceCandidatePairStats> iceCandidatePairStatsList = statsReports.get(i).getIceCandidatePairStats();
        WritableArray iceCandidatePairStatsArray = Arguments.createArray();
        for (int j = 0; j < iceCandidatePairStatsList.size(); j++) {
          iceCandidatePairStatsArray.pushMap(jsonWithIceCandidatePairStats(iceCandidatePairStatsList.get(j)));
        }
        params.putArray(CommonConstants.IceCandidatePairStats, iceCandidatePairStatsArray);

        List<IceCandidateStats> iceCandidateStatsList = statsReports.get(i).getIceCandidateStats();
        WritableArray iceCandidateStatsArray = Arguments.createArray();
        for (int j = 0; j < iceCandidateStatsList.size(); j++) {
          iceCandidateStatsArray.pushMap(jsonWithIceCandidateStats(iceCandidateStatsList.get(j)));
        }
        params.putArray(CommonConstants.IceCandidateStats, iceCandidateStatsArray);

        statsReportsArray.pushMap(params);
      }

      promise.resolve(statsReportsArray);
    } catch (JSONException e) {
      promise.reject(StatsListenerProxy.class.getSimpleName(), e.getMessage());
      e.printStackTrace();
    }
  }

  private WritableMap jsonWithLocalAudioTrackStats(LocalAudioTrackStats audioTrackStats) throws JSONException {
    WritableMap params = Arguments.createMap();
    params.putString(CommonConstants.Codec, audioTrackStats.codec);
    params.putDouble(CommonConstants.PacketsLost, audioTrackStats.packetsLost);
    params.putString(CommonConstants.Ssrc, audioTrackStats.ssrc);
    params.putDouble(CommonConstants.Timestamp, audioTrackStats.timestamp);
    params.putString(CommonConstants.TrackId, audioTrackStats.trackId);

    // Local track stats
    params.putDouble(CommonConstants.BytesSent, audioTrackStats.bytesSent);
    params.putDouble(CommonConstants.PacketsSent, audioTrackStats.packetsSent);
    params.putDouble(CommonConstants.RoundTripTime, audioTrackStats.roundTripTime);

    // Local audio track stats
    params.putDouble(CommonConstants.AudioLevel, audioTrackStats.audioLevel);
    params.putDouble(CommonConstants.Jitter, audioTrackStats.jitter);
    return params;
  }

  private WritableMap jsonWithRemoteAudioTrackStats(RemoteAudioTrackStats audioTrackStats) throws JSONException {
    WritableMap params = Arguments.createMap();
    // Base track stats
    params.putString(CommonConstants.Codec, audioTrackStats.codec);
    params.putDouble(CommonConstants.PacketsLost, audioTrackStats.packetsLost);
    params.putString(CommonConstants.Ssrc, audioTrackStats.ssrc);
    params.putDouble(CommonConstants.Timestamp, audioTrackStats.timestamp);
    params.putString(CommonConstants.TrackId, audioTrackStats.trackId);

    // Remote track stats
    params.putDouble(CommonConstants.BytesReceived, audioTrackStats.bytesReceived);
    params.putDouble(CommonConstants.PacketsReceived, audioTrackStats.packetsReceived);

    // Remote audio track stats
    params.putDouble(CommonConstants.AudioLevel, audioTrackStats.audioLevel);
    params.putDouble(CommonConstants.Jitter, audioTrackStats.jitter);
    params.putDouble(CommonConstants.Mos, audioTrackStats.mos);
    return params;
  }

  private WritableMap jsonWithIceCandidatePairStats(IceCandidatePairStats iceCandidatePairStats) throws JSONException {
    WritableMap params = Arguments.createMap();
    params.putBoolean(CommonConstants.ActiveCandidatePair, iceCandidatePairStats.activeCandidatePair);
    params.putDouble(CommonConstants.AvailableIncomingBitrate, iceCandidatePairStats.availableIncomingBitrate);
    params.putDouble(CommonConstants.AvailableOutgoingBitrate, iceCandidatePairStats.availableOutgoingBitrate);
    params.putDouble(CommonConstants.BytesReceived, iceCandidatePairStats.bytesReceived);
    params.putDouble(CommonConstants.BytesSent, iceCandidatePairStats.bytesSent);
    params.putDouble(CommonConstants.ConsentRequestsReceived, iceCandidatePairStats.consentRequestsReceived);
    params.putDouble(CommonConstants.ConsentRequestsSent, iceCandidatePairStats.consentRequestsSent);
    params.putDouble(CommonConstants.ConsentResponsesReceived, iceCandidatePairStats.consentResponsesReceived);
    params.putDouble(CommonConstants.ConsentResponsesSent, iceCandidatePairStats.consentResponsesSent);
    params.putDouble(CommonConstants.CurrentRoundTripTime, iceCandidatePairStats.currentRoundTripTime);
    params.putString(CommonConstants.LocalCandidateId, iceCandidatePairStats.localCandidateId);
    params.putString(CommonConstants.LocalCandidateIp, iceCandidatePairStats.localCandidateIp);
    params.putBoolean(CommonConstants.Nominated, iceCandidatePairStats.nominated);
    params.putDouble(CommonConstants.Priority, iceCandidatePairStats.priority);
    params.putBoolean(CommonConstants.Readable, iceCandidatePairStats.readable);
    params.putString(CommonConstants.RelayProtocol, iceCandidatePairStats.relayProtocol);
    params.putString(CommonConstants.RemoteCandidateId, iceCandidatePairStats.remoteCandidateId);
    params.putString(CommonConstants.RemoteCandidateIp, iceCandidatePairStats.remoteCandidateIp);
    params.putDouble(CommonConstants.RequestsReceived, iceCandidatePairStats.requestsReceived);
    params.putDouble(CommonConstants.RequestsSent, iceCandidatePairStats.requestsSent);
    params.putDouble(CommonConstants.ResponsesReceived, iceCandidatePairStats.responsesReceived);
    params.putDouble(CommonConstants.ResponsesSent, iceCandidatePairStats.responsesSent);
    params.putDouble(CommonConstants.RetransmissionsReceived, iceCandidatePairStats.retransmissionsReceived);
    params.putDouble(CommonConstants.RetransmissionsSent, iceCandidatePairStats.retransmissionsSent);
    params.putString(CommonConstants.State, stringWithIceCandidatePairState(iceCandidatePairStats.state));
    params.putDouble(CommonConstants.TotalRoundTripTime, iceCandidatePairStats.totalRoundTripTime);
    params.putString(CommonConstants.TransportId, iceCandidatePairStats.transportId);
    params.putBoolean(CommonConstants.Writeable, iceCandidatePairStats.writeable);

    return params;
  }

  WritableMap jsonWithIceCandidateStats(IceCandidateStats iceCandidateStats) throws JSONException {
    WritableMap params = Arguments.createMap();
    params.putString(CommonConstants.CandidateType, iceCandidateStats.candidateType);
    params.putBoolean(CommonConstants.Deleted, iceCandidateStats.deleted);
    params.putString(CommonConstants.Ip, iceCandidateStats.ip);
    params.putBoolean(CommonConstants.IsRemote, iceCandidateStats.isRemote);
    params.putInt(CommonConstants.Port, iceCandidateStats.port);
    params.putInt(CommonConstants.Priority, iceCandidateStats.priority);
    params.putString(CommonConstants.Protocol, iceCandidateStats.protocol);
    params.putString(CommonConstants.TransportId, iceCandidateStats.transportId);
    params.putString(CommonConstants.Url, iceCandidateStats.url);
    return params;
  }

  private String stringWithIceCandidatePairState(IceCandidatePairState state) {
    switch (state) {
      case STATE_FAILED:
        return CommonConstants.StateFailed;
      case STATE_FROZEN:
        return CommonConstants.StateFrozen;
      case STATE_IN_PROGRESS:
        return CommonConstants.StateInProgress;
      case STATE_SUCCEEDED:
        return CommonConstants.StateSucceeded;
      case STATE_WAITING:
        return CommonConstants.StateWaiting;
      default:
        return CommonConstants.StateUnknown;
    }
  }
}
