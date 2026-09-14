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

/**
 * Both platforms report this exact all-zero-valued sample/report before the
 * PreflightTest has a real one to report.
 */
export const mockAllZeroSample = {
  audioInputLevel: 0,
  audioOutputLevel: 0,
  bytesReceived: 0,
  bytesSent: 0,
  codec: '',
  jitter: 0,
  mos: 0,
  packetsLost: 0,
  packetsLostFraction: 0,
  packetsReceived: 0,
  packetsSent: 0,
  rtt: 0,
  timestamp: '0',
};

export const expectedAllZeroSample: PreflightTest.RTCSample = {
  ...mockAllZeroSample,
  timestamp: 0,
};

const mockAllZeroIceCandidateStats = {
  candidateType: '',
  deleted: false,
  ip: '',
  isRemote: false,
  networkCost: 0,
  networkId: 0,
  networkType: '',
  port: 0,
  priority: 0,
  protocol: '',
  relatedAddress: '',
  relatedPort: 0,
  tcpType: '',
  transportId: '',
  url: '',
};

const expectedAllZeroIceCandidateStats: PreflightTest.RTCIceCandidateStats =
  mockAllZeroIceCandidateStats;

const mockAllZeroTiming = {
  duration: 0,
  endTime: 0,
  startTime: 0,
};

const expectedAllZeroTiming: PreflightTest.TimeMeasurement = {
  duration: 0,
  end: 0,
  start: 0,
};

const mockAllZeroRtcStats = {
  jitter: { average: 0, max: 0, min: 0 },
  mos: { average: 0, max: 0, min: 0 },
  rtt: { average: 0, max: 0, min: 0 },
};

export const mockAllZeroReport = {
  callSid: '',
  callQuality: null,
  edge: '',
  iceCandidates: [],
  isTurnRequired: null,
  networkStats: mockAllZeroRtcStats,
  networkTiming: {
    signaling: mockAllZeroTiming,
    peerConnection: mockAllZeroTiming,
    iceConnection: mockAllZeroTiming,
    preflightTest: mockAllZeroTiming,
  },
  statsSamples: [],
  selectedEdge: '',
  selectedIceCandidatePair: {
    localCandidate: mockAllZeroIceCandidateStats,
    remoteCandidate: mockAllZeroIceCandidateStats,
  },
  warnings: [],
  warningsCleared: [],
};

export const expectedAllZeroReport: PreflightTest.Report = {
  callSid: '',
  callQuality: null,
  edge: '',
  iceCandidateStats: [],
  isTurnRequired: null,
  stats: mockAllZeroRtcStats,
  networkTiming: {
    signaling: expectedAllZeroTiming,
    peerConnection: expectedAllZeroTiming,
    ice: expectedAllZeroTiming,
  },
  testTiming: expectedAllZeroTiming,
  samples: [],
  selectedEdge: '',
  selectedIceCandidatePairStats: {
    localCandidate: expectedAllZeroIceCandidateStats,
    remoteCandidate: expectedAllZeroIceCandidateStats,
  },
  warnings: [],
  warningsCleared: [],
};

export const makeMockNativePreflightEvent = (eventType: any) => ({
  [Constants.PreflightTestEventKeyUuid]: mockUuid,
  [Constants.PreflightTestEventKeyType]: eventType,
});
