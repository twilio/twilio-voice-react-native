import { PreflightTest } from '../PreflightTest';
export declare const mockUuid = "mock-uuid";
export declare const mockSample: {
    audioInputLevel: number;
    audioOutputLevel: number;
    bytesReceived: number;
    bytesSent: number;
    codec: string;
    jitter: number;
    mos: number;
    packetsLost: number;
    packetsLostFraction: number;
    packetsReceived: number;
    packetsSent: number;
    rtt: number;
    timestamp: string;
};
export declare const mockRtcIceCandidateStats: PreflightTest.RTCIceCandidateStats;
export declare const mockPreflightStats: PreflightTest.Stats;
export declare const mockPreflightRtcStats: PreflightTest.RTCStats;
export declare const mockTiming: {
    duration: number;
    endTime: number;
    startTime: number;
};
export declare const mockNetworkTiming: {
    signaling: {
        duration: number;
        endTime: number;
        startTime: number;
    };
    peerConnection: {
        duration: number;
        endTime: number;
        startTime: number;
    };
    iceConnection: {
        duration: number;
        endTime: number;
        startTime: number;
    };
    preflightTest: {
        duration: number;
        endTime: number;
        startTime: number;
    };
};
export declare const mockWarning: {
    name: string;
    threshold: string;
    timestamp: number;
    values: string;
};
export declare const mockWarningCleared: {
    name: string;
    timestamp: number;
};
export declare const baseMockReport: {
    callSid: string;
    edge: string;
    iceCandidates: PreflightTest.RTCIceCandidateStats[];
    networkStats: PreflightTest.RTCStats;
    networkTiming: {
        signaling: {
            duration: number;
            endTime: number;
            startTime: number;
        };
        peerConnection: {
            duration: number;
            endTime: number;
            startTime: number;
        };
        iceConnection: {
            duration: number;
            endTime: number;
            startTime: number;
        };
        preflightTest: {
            duration: number;
            endTime: number;
            startTime: number;
        };
    };
    statsSamples: {
        audioInputLevel: number;
        audioOutputLevel: number;
        bytesReceived: number;
        bytesSent: number;
        codec: string;
        jitter: number;
        mos: number;
        packetsLost: number;
        packetsLostFraction: number;
        packetsReceived: number;
        packetsSent: number;
        rtt: number;
        timestamp: string;
    }[];
    selectedEdge: string;
    selectedIceCandidatePair: {
        localCandidate: PreflightTest.RTCIceCandidateStats;
        remoteCandidate: PreflightTest.RTCIceCandidateStats;
    };
    warnings: {
        name: string;
        threshold: string;
        timestamp: number;
        values: string;
    }[];
    warningsCleared: {
        name: string;
        timestamp: number;
    }[];
};
export declare const expectedReport: PreflightTest.Report;
export declare const makeMockNativePreflightEvent: (eventType: any) => {
    preflightTestEventKeyUuid: string;
    preflightTestEventKeyType: any;
};
