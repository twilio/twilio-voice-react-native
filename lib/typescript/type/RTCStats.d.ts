/**
 * Types related to WebRTC stats.
 *
 * @public
 */
export declare namespace RTCStats {
    enum IceCandidatePairState {
        STATE_FAILED = "STATE_FAILED",
        STATE_FROZEN = "STATE_FROZEN",
        STATE_IN_PROGRESS = "STATE_IN_PROGRESS",
        STATE_SUCCEEDED = "STATE_SUCCEEDED",
        STATE_WAITING = "STATE_WAITING"
    }
    interface IceCandidatePairStats {
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
    interface IceCandidateStats {
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
    interface BaseTrackStats {
        codec: string;
        packetsLost: number;
        ssrc: string;
        timestamp: number;
        trackId: string;
    }
    interface LocalTrackStats extends BaseTrackStats {
        bytesSent: number;
        packetsSent: number;
        roundTripTime: number;
    }
    interface LocalAudioTrackStats extends LocalTrackStats {
        audioLevel: number;
        jitter: number;
    }
    interface RemoteTrackStats extends BaseTrackStats {
        bytesRecieved: number;
        packetsReceived: number;
    }
    interface RemoteAudioTrackStats extends RemoteTrackStats {
        audioLevel: number;
        jitter: number;
        mos: number;
    }
    /**
     * WebRTC stats report. Contains diagnostics information about
     * `RTCPeerConnection`s and summarizes data for an ongoing call.
     */
    interface StatsReport {
        iceCandidatePairStats: IceCandidatePairStats[];
        iceCandidateStats: IceCandidateStats[];
        localAudioTrackStats: LocalAudioTrackStats[];
        peerConnectionId: string;
        remoteAudioTrackStats: RemoteAudioTrackStats[];
    }
}
