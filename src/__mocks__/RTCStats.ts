import { RTCStats } from '../type/RTCStats';

export function createIceCandidatePairStats(): RTCStats.IceCandidatePairStats {
  return {
    activeCandidatePair: false,
    availableIncomingBitrate: 0,
    availableOutgoingBitrate: 0,
    bytesReceived: 0,
    bytesSent: 0,
    consentRequestsReceived: 0,
    consentRequestsSent: 0,
    consentResponsesReceived: 0,
    consentResponsesSent: 0,
    currentRoundTripTime: 0,
    localCandidateId: 'mock-statsreport-localcandidateid',
    localCandidateIp: 'mock-statsreport-localcandidateip',
    nominated: false,
    priority: 0,
    readable: false,
    relayProtocol: 'mock-statsreport-relayprotocol',
    remoteCandidateId: 'mock-statsreport-remotecandidateid',
    remoteCandidateIp: 'mock-statsreport-remotecandidateip',
    requestsReceieved: 0,
    requestsSent: 0,
    responsesRecieved: 0,
    responsesSent: 0,
    retransmissionsReceived: 0,
    retransmissionsSent: 0,
    state: RTCStats.IceCandidatePairState.STATE_IN_PROGRESS,
    totalRoundTripTime: 0,
    transportId: 'mock-statsreport-transportid',
    writeable: false,
  };
}

export function createIceCandidateStats(): RTCStats.IceCandidateStats {
  return {
    candidateType: 'mock-icecandidatestats-candidatetype',
    deleted: false,
    ip: 'mock-icecandidatestats-ip',
    isRemote: false,
    port: 0,
    priority: 0,
    protocol: 'mock-icecandidatestats-protocol',
    transportId: 'mock-icecandidatestats-transportid',
    url: 'mock-icecandidatestats-url',
  };
}

export function createLocalAudioTrackStats(): RTCStats.LocalAudioTrackStats {
  return {
    codec: 'mock-localaudiotrackstats-codec',
    packetsLost: 0,
    ssrc: 'mock-localaudiotrackstats-ssrc',
    timestamp: 0,
    trackId: 'mock-localaudiotrackstats-trackid',
    bytesSent: 0,
    packetsSent: 0,
    roundTripTime: 0,
    audioLevel: 0,
    jitter: 0,
  };
}

export function createRemoteAudioTrackStats(): RTCStats.RemoteAudioTrackStats {
  return {
    codec: 'mock-remoteaudiotrackstats-codec',
    packetsLost: 0,
    ssrc: 'mock-remoteaudiotrackstats-ssrc',
    timestamp: 0,
    trackId: 'mock-remoteaudiotrackstats-trackid',
    bytesRecieved: 0,
    packetsReceived: 0,
    audioLevel: 0,
    jitter: 0,
    mos: 0,
  };
}

export function createStatsReport(): RTCStats.StatsReport {
  return {
    iceCandidatePairStats: [createIceCandidatePairStats()],
    iceCandidateStats: [createIceCandidateStats()],
    localAudioTrackStats: [createLocalAudioTrackStats()],
    peerConnectionId: 'mock-statsreport-peerconnectionid',
    remoteAudioTrackStats: [createRemoteAudioTrackStats()],
  };
}
