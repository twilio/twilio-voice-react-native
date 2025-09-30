import { PreflightTest } from '../PreflightTest';
import { Constants } from '../constants';

export const mockUuid = 'mock-uuid';

export const mockSample = {
  audioInputLevel: 10,
  audioOutputLevel: 20,
  bytesReceived: 30,
  bytesSent: 40,
  codec: 'mock-codec',
  jitter: 50,
  mos: 60,
  packetsLost: 70,
  packetsLostFraction: 80,
  packetsReceived: 90,
  packetsSent: 100,
  rtt: 110,
  timestamp: '120',
};

export const mockRtcIceCandidateStats: PreflightTest.RTCIceCandidateStats = {
  [Constants.PreflightRTCIceCandidateStatsCandidateType]: 'mock-candidatetype',
  [Constants.PreflightRTCIceCandidateStatsDeleted]: false,
  [Constants.PreflightRTCIceCandidateStatsIp]: 'mock-ip',
  [Constants.PreflightRTCIceCandidateStatsIsRemote]: false,
  [Constants.PreflightRTCIceCandidateStatsNetworkCost]: 10,
  [Constants.PreflightRTCIceCandidateStatsNetworkId]: 20,
  [Constants.PreflightRTCIceCandidateStatsNetworkType]: 'mock-networktype',
  [Constants.PreflightRTCIceCandidateStatsPort]: 30,
  [Constants.PreflightRTCIceCandidateStatsPriority]: 40,
  [Constants.PreflightRTCIceCandidateStatsProtocol]: 'mock-protocol',
  [Constants.PreflightRTCIceCandidateStatsRelatedAddress]:
    'mock-relatedaddress',
  [Constants.PreflightRTCIceCandidateStatsRelatedPort]: 50,
  [Constants.PreflightRTCIceCandidateStatsTcpType]: 'mock-tcptype',
  [Constants.PreflightRTCIceCandidateStatsTransportId]: 'mock-transportid',
  [Constants.PreflightRTCIceCandidateStatsUrl]: 'mock-url',
};

export const mockPreflightStats: PreflightTest.Stats = {
  [Constants.PreflightStatsAverage]: 10,
  [Constants.PreflightStatsMax]: 20,
  [Constants.PreflightStatsMin]: 30,
};

export const mockPreflightRtcStats: PreflightTest.RTCStats = {
  [Constants.PreflightRTCStatsJitter]: mockPreflightStats,
  [Constants.PreflightRTCStatsMos]: mockPreflightStats,
  [Constants.PreflightRTCStatsRtt]: mockPreflightStats,
};

export const mockTiming = {
  duration: 10,
  endTime: 20,
  startTime: 30,
};

export const mockNetworkTiming = {
  signaling: mockTiming,
  peerConnection: mockTiming,
  iceConnection: mockTiming,
  preflightTest: mockTiming,
};

export const mockWarning = {
  name: 'mock-warningname',
  threshold: 'mock-warningthreshold',
  timestamp: 10,
  values: 'mock-warningvalues',
};

export const mockWarningCleared = {
  name: 'mock-warningclearedname',
  timestamp: 10,
};

export const baseMockReport = {
  callSid: 'mock-callsid',
  edge: 'mock-edge',
  iceCandidates: [mockRtcIceCandidateStats, mockRtcIceCandidateStats],
  networkStats: mockPreflightRtcStats,
  networkTiming: mockNetworkTiming,
  statsSamples: [mockSample, mockSample],
  selectedEdge: 'mock-selectededge',
  selectedIceCandidatePair: {
    localCandidate: mockRtcIceCandidateStats,
    remoteCandidate: mockRtcIceCandidateStats,
  },
  warnings: [mockWarning, mockWarning],
  warningsCleared: [mockWarningCleared, mockWarningCleared],
};

export const expectedReport: PreflightTest.Report = {
  callQuality: PreflightTest.CallQuality.Excellent,
  callSid: 'mock-callsid',
  edge: 'mock-edge',
  iceCandidateStats: [
    {
      candidateType: 'mock-candidatetype',
      deleted: false,
      ip: 'mock-ip',
      isRemote: false,
      networkCost: 10,
      networkId: 20,
      networkType: 'mock-networktype',
      port: 30,
      priority: 40,
      protocol: 'mock-protocol',
      relatedAddress: 'mock-relatedaddress',
      relatedPort: 50,
      tcpType: 'mock-tcptype',
      transportId: 'mock-transportid',
      url: 'mock-url',
    },
    {
      candidateType: 'mock-candidatetype',
      deleted: false,
      ip: 'mock-ip',
      isRemote: false,
      networkCost: 10,
      networkId: 20,
      networkType: 'mock-networktype',
      port: 30,
      priority: 40,
      protocol: 'mock-protocol',
      relatedAddress: 'mock-relatedaddress',
      relatedPort: 50,
      tcpType: 'mock-tcptype',
      transportId: 'mock-transportid',
      url: 'mock-url',
    },
  ],
  isTurnRequired: false,
  networkTiming: {
    ice: {
      duration: 10,
      end: 20,
      start: 30,
    },
    peerConnection: {
      duration: 10,
      end: 20,
      start: 30,
    },
    signaling: {
      duration: 10,
      end: 20,
      start: 30,
    },
  },
  samples: [
    {
      audioInputLevel: 10,
      audioOutputLevel: 20,
      bytesReceived: 30,
      bytesSent: 40,
      codec: 'mock-codec',
      jitter: 50,
      mos: 60,
      packetsLost: 70,
      packetsLostFraction: 80,
      packetsReceived: 90,
      packetsSent: 100,
      rtt: 110,
      timestamp: 120,
    },
    {
      audioInputLevel: 10,
      audioOutputLevel: 20,
      bytesReceived: 30,
      bytesSent: 40,
      codec: 'mock-codec',
      jitter: 50,
      mos: 60,
      packetsLost: 70,
      packetsLostFraction: 80,
      packetsReceived: 90,
      packetsSent: 100,
      rtt: 110,
      timestamp: 120,
    },
  ],
  selectedEdge: 'mock-selectededge',
  selectedIceCandidatePairStats: {
    localCandidate: {
      candidateType: 'mock-candidatetype',
      deleted: false,
      ip: 'mock-ip',
      isRemote: false,
      networkCost: 10,
      networkId: 20,
      networkType: 'mock-networktype',
      port: 30,
      priority: 40,
      protocol: 'mock-protocol',
      relatedAddress: 'mock-relatedaddress',
      relatedPort: 50,
      tcpType: 'mock-tcptype',
      transportId: 'mock-transportid',
      url: 'mock-url',
    },
    remoteCandidate: {
      candidateType: 'mock-candidatetype',
      deleted: false,
      ip: 'mock-ip',
      isRemote: false,
      networkCost: 10,
      networkId: 20,
      networkType: 'mock-networktype',
      port: 30,
      priority: 40,
      protocol: 'mock-protocol',
      relatedAddress: 'mock-relatedaddress',
      relatedPort: 50,
      tcpType: 'mock-tcptype',
      transportId: 'mock-transportid',
      url: 'mock-url',
    },
  },
  stats: {
    jitter: {
      average: 10,
      max: 20,
      min: 30,
    },
    mos: {
      average: 10,
      max: 20,
      min: 30,
    },
    rtt: {
      average: 10,
      max: 20,
      min: 30,
    },
  },
  testTiming: {
    duration: 10,
    end: 20,
    start: 30,
  },
  warnings: [
    {
      name: 'mock-warningname',
      threshold: 'mock-warningthreshold',
      timestamp: 10,
      values: 'mock-warningvalues',
    },
    {
      name: 'mock-warningname',
      threshold: 'mock-warningthreshold',
      timestamp: 10,
      values: 'mock-warningvalues',
    },
  ],
  warningsCleared: [
    {
      name: 'mock-warningclearedname',
      timestamp: 10,
    },
    {
      name: 'mock-warningclearedname',
      timestamp: 10,
    },
  ],
};

export const makeMockNativePreflightEvent = (eventType: any) => ({
  [Constants.PreflightTestEventKeyUuid]: mockUuid,
  [Constants.PreflightTestEventKeyType]: eventType,
});
