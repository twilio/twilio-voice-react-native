package com.twiliovoicereactnative;

import java.util.List;
import java.util.Vector;

import android.content.Context;
import android.util.Pair;

import androidx.annotation.NonNull;

import org.json.JSONException;

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

import static com.twiliovoicereactnative.JSEventEmitter.constructJSArray;
import static com.twiliovoicereactnative.JSEventEmitter.constructJSMap;

class StatsListenerProxy implements StatsListener {
  private final Promise promise;

  public StatsListenerProxy(String uuid, Context context, Promise promise) {
    this.promise = promise;
  }

  @Override
  public void onStats(@NonNull List<StatsReport> statsReports) {
    try {
      WritableArray statsReportsArray = Arguments.createArray();
      for(StatsReport statsReport: statsReports)  {
        statsReportsArray.pushMap(
          constructJSMap(
          new Pair<>(CommonConstants.PeerConnectionId, statsReport.getPeerConnectionId()),
          new Pair<>(
            CommonConstants.LocalAudioTrackStats,
            constructJSArray(jsonWithLocalAudioTrackStats(statsReport.getLocalAudioTrackStats()))),
          new Pair<>(
            CommonConstants.RemoteAudioTrackStats,
            constructJSArray(jsonWithRemoteAudioTrackStats(statsReport.getRemoteAudioTrackStats()))),
          new Pair<>(
            CommonConstants.IceCandidatePairStats,
            constructJSArray(jsonWithIceCandidatePairStats(statsReport.getIceCandidatePairStats()))),
          new Pair<>(
            CommonConstants.IceCandidateStats,
            constructJSArray(jsonWithIceCandidateStats(statsReport.getIceCandidateStats())))));
      }
      promise.resolve(statsReportsArray);
    } catch (JSONException e) {
      promise.reject(StatsListenerProxy.class.getSimpleName(), e.getMessage());
      e.printStackTrace();
    }
  }

  private Object[] jsonWithLocalAudioTrackStats(List<LocalAudioTrackStats> audioTrackStatsList) throws JSONException {
    Vector<WritableMap> mapList = new Vector<>();
    for (LocalAudioTrackStats localAudioTrackStats: audioTrackStatsList) {
      mapList.add(
        constructJSMap(
          // Base track stats
          new Pair<>(CommonConstants.Codec, localAudioTrackStats.codec),
          new Pair<>(CommonConstants.PacketsLost, localAudioTrackStats.packetsLost),
          new Pair<>(CommonConstants.Ssrc, localAudioTrackStats.ssrc),
          new Pair<>(CommonConstants.Timestamp, localAudioTrackStats.timestamp),
          new Pair<>(CommonConstants.TrackId, localAudioTrackStats.trackId),
          // Local track stats
          new Pair<>(CommonConstants.BytesSent, localAudioTrackStats.bytesSent),
          new Pair<>(CommonConstants.PacketsSent, localAudioTrackStats.packetsSent),
          new Pair<>(CommonConstants.RoundTripTime, localAudioTrackStats.roundTripTime),
          // Local audio track stats
          new Pair<>(CommonConstants.AudioLevel, localAudioTrackStats.audioLevel),
          new Pair<>(CommonConstants.Jitter, localAudioTrackStats.jitter)));
    }
    return mapList.toArray();
  }

  private Object[] jsonWithRemoteAudioTrackStats(List<RemoteAudioTrackStats> audioTrackStatsList) throws JSONException {
    Vector<WritableMap> mapList = new Vector<>();
    for (RemoteAudioTrackStats remoteAudioTrackStats: audioTrackStatsList) {
      mapList.add(
        constructJSMap(
        // Base track stats
        new Pair<>(CommonConstants.Codec, remoteAudioTrackStats.codec),
        new Pair<>(CommonConstants.PacketsLost, remoteAudioTrackStats.packetsLost),
        new Pair<>(CommonConstants.Ssrc, remoteAudioTrackStats.ssrc),
        new Pair<>(CommonConstants.Timestamp, remoteAudioTrackStats.timestamp),
        new Pair<>(CommonConstants.TrackId, remoteAudioTrackStats.trackId),
        // Remote track stats
        new Pair<>(CommonConstants.BytesReceived, remoteAudioTrackStats.bytesReceived),
        new Pair<>(CommonConstants.PacketsReceived, remoteAudioTrackStats.packetsReceived),
        // Remote audio track stats
        new Pair<>(CommonConstants.AudioLevel, remoteAudioTrackStats.audioLevel),
        new Pair<>(CommonConstants.Jitter, remoteAudioTrackStats.jitter),
        new Pair<>(CommonConstants.Mos, remoteAudioTrackStats.mos)));
    }
    return mapList.toArray();
  }

  private Object[] jsonWithIceCandidatePairStats(List<IceCandidatePairStats> iceCandidatePairStatsList) throws JSONException {
    Vector<WritableMap> mapList = new Vector<>();
    for (IceCandidatePairStats iceCandidatePairStats: iceCandidatePairStatsList) {
      mapList.add(
        constructJSMap(
          new Pair<>(CommonConstants.ActiveCandidatePair, iceCandidatePairStats.activeCandidatePair),
          new Pair<>(CommonConstants.AvailableIncomingBitrate, iceCandidatePairStats.availableIncomingBitrate),
          new Pair<>(CommonConstants.AvailableOutgoingBitrate, iceCandidatePairStats.availableOutgoingBitrate),
          new Pair<>(CommonConstants.BytesReceived, iceCandidatePairStats.bytesReceived),
          new Pair<>(CommonConstants.BytesSent, iceCandidatePairStats.bytesSent),
          new Pair<>(CommonConstants.ConsentRequestsReceived, iceCandidatePairStats.consentRequestsReceived),
          new Pair<>(CommonConstants.ConsentRequestsSent, iceCandidatePairStats.consentRequestsSent),
          new Pair<>(CommonConstants.ConsentResponsesReceived, iceCandidatePairStats.consentResponsesReceived),
          new Pair<>(CommonConstants.ConsentResponsesSent, iceCandidatePairStats.consentResponsesSent),
          new Pair<>(CommonConstants.CurrentRoundTripTime, iceCandidatePairStats.currentRoundTripTime),
          new Pair<>(CommonConstants.LocalCandidateId, iceCandidatePairStats.localCandidateId),
          new Pair<>(CommonConstants.LocalCandidateIp, iceCandidatePairStats.localCandidateIp),
          new Pair<>(CommonConstants.Nominated, iceCandidatePairStats.nominated),
          new Pair<>(CommonConstants.Priority, iceCandidatePairStats.priority),
          new Pair<>(CommonConstants.Readable, iceCandidatePairStats.readable),
          new Pair<>(CommonConstants.RelayProtocol, iceCandidatePairStats.relayProtocol),
          new Pair<>(CommonConstants.RemoteCandidateId, iceCandidatePairStats.remoteCandidateId),
          new Pair<>(CommonConstants.RemoteCandidateIp, iceCandidatePairStats.remoteCandidateIp),
          new Pair<>(CommonConstants.RequestsReceived, iceCandidatePairStats.requestsReceived),
          new Pair<>(CommonConstants.RequestsSent, iceCandidatePairStats.requestsSent),
          new Pair<>(CommonConstants.ResponsesReceived, iceCandidatePairStats.responsesReceived),
          new Pair<>(CommonConstants.ResponsesSent, iceCandidatePairStats.responsesSent),
          new Pair<>(CommonConstants.RetransmissionsReceived, iceCandidatePairStats.retransmissionsReceived),
          new Pair<>(CommonConstants.RetransmissionsSent, iceCandidatePairStats.retransmissionsSent),
          new Pair<>(CommonConstants.State, stringWithIceCandidatePairState(iceCandidatePairStats.state)),
          new Pair<>(CommonConstants.TotalRoundTripTime, iceCandidatePairStats.totalRoundTripTime),
          new Pair<>(CommonConstants.TransportId, iceCandidatePairStats.transportId),
          new Pair<>(CommonConstants.Writeable, iceCandidatePairStats.writeable)));
    }
    return mapList.toArray();
  }

  private Object[] jsonWithIceCandidateStats(List<IceCandidateStats> iceCandidateStatsList) throws JSONException {
    Vector<WritableMap> mapList = new Vector<>();
    for (IceCandidateStats iceCandidateStats: iceCandidateStatsList) {
      mapList.add(
        constructJSMap(
          new Pair<>(CommonConstants.CandidateType, iceCandidateStats.candidateType),
          new Pair<>(CommonConstants.Deleted, iceCandidateStats.deleted),
          new Pair<>(CommonConstants.Ip, iceCandidateStats.ip),
          new Pair<>(CommonConstants.IsRemote, iceCandidateStats.isRemote),
          new Pair<>(CommonConstants.Port, iceCandidateStats.port),
          new Pair<>(CommonConstants.Priority, iceCandidateStats.priority),
          new Pair<>(CommonConstants.Protocol, iceCandidateStats.protocol),
          new Pair<>(CommonConstants.TransportId, iceCandidateStats.transportId),
          new Pair<>(CommonConstants.Url, iceCandidateStats.url)));
    }
    return mapList.toArray();
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
