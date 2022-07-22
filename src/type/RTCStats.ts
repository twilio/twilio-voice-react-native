/**
 * Types related to WebRTC stats.
 *
 * @public
 */
export namespace RTCStats {
  export enum IceCandidatePairState {
    STATE_FAILED = 'STATE_FAILED',
    STATE_FROZEN = 'STATE_FROZEN',
    STATE_IN_PROGRESS = 'STATE_IN_PROGRESS',
    STATE_SUCCEEDED = 'STATE_SUCCEEDED',
    STATE_WAITING = 'STATE_WAITING',
  }

  export interface IceCandidatePairStats {
    activeCandidatePair: boolean;
    availableIncomingBitrate: number;
    availableOutgoingBitrate: number;
    bytesReceived: number;
    bytesSent: number;
    consentRequestsReceived: number;
    consentRequestsSent: number;
    consentResponsesReceived: number;
    consentResponsesSent: number;
    currentRoundTripTime: number;
    localCandidateId: string;
    localCandidateIp: string;
    nominated: boolean;
    priority: number;
    readable: boolean;
    relayProtocol: string;
    remoteCandidateId: string;
    remoteCandidateIp: string;
    requestsReceieved: number;
    requestsSent: number;
    responsesRecieved: number;
    responsesSent: number;
    retransmissionsReceived: number;
    retransmissionsSent: number;
    state: IceCandidatePairState;
    totalRoundTripTime: number;
    transportId: string;
    writeable: boolean;
  }

  export interface IceCandidateStats {
    candidateType: string;
    deleted: boolean;
    ip: string;
    isRemote: boolean;
    port: number;
    priority: number;
    protocol: string;
    transportId: string;
    url: string;
  }

  export interface BaseTrackStats {
    codec: string;
    packetsLost: number;
    ssrc: string;
    timestamp: number;
    trackId: string;
  }

  export interface LocalTrackStats extends BaseTrackStats {
    bytesSent: number;
    packetsSent: number;
    roundTripTime: number;
  }

  export interface LocalAudioTrackStats extends LocalTrackStats {
    audioLevel: number;
    jitter: number;
  }

  export interface RemoteTrackStats extends BaseTrackStats {
    bytesRecieved: number;
    packetsReceived: number;
  }

  export interface RemoteAudioTrackStats extends RemoteTrackStats {
    audioLevel: number;
    jitter: number;
    mos: number;
  }

  /**
   * WebRTC stats report. Contains diagnostics information about
   * `RTCPeerConnection`s and summarizes data for an ongoing call.
   */
  export interface StatsReport {
    iceCandidatePairStats: IceCandidatePairStats[];
    iceCandidateStats: IceCandidateStats[];
    localAudioTrackStats: LocalAudioTrackStats[];
    peerConnectionId: string;
    remoteAudioTrackStats: RemoteAudioTrackStats[];
  }
}
