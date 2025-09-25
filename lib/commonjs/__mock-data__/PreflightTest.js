"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeMockNativePreflightEvent = exports.expectedReport = exports.baseMockReport = exports.mockNetworkTiming = exports.mockTiming = exports.mockPreflightRtcStats = exports.mockPreflightStats = exports.mockRtcIceCandidateStats = exports.mockSample = exports.mockUuid = void 0;

var _PreflightTest = require("../PreflightTest");

var _constants = require("../constants");

const mockUuid = 'mock-uuid';
exports.mockUuid = mockUuid;
const mockSample = {
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
  timestamp: '120'
};
exports.mockSample = mockSample;
const mockRtcIceCandidateStats = {
  [_constants.Constants.PreflightRTCIceCandidateStatsCandidateType]: 'mock-candidatetype',
  [_constants.Constants.PreflightRTCIceCandidateStatsDeleted]: false,
  [_constants.Constants.PreflightRTCIceCandidateStatsIp]: 'mock-ip',
  [_constants.Constants.PreflightRTCIceCandidateStatsIsRemote]: false,
  [_constants.Constants.PreflightRTCIceCandidateStatsNetworkCost]: 10,
  [_constants.Constants.PreflightRTCIceCandidateStatsNetworkId]: 20,
  [_constants.Constants.PreflightRTCIceCandidateStatsNetworkType]: 'mock-networktype',
  [_constants.Constants.PreflightRTCIceCandidateStatsPort]: 30,
  [_constants.Constants.PreflightRTCIceCandidateStatsPriority]: 40,
  [_constants.Constants.PreflightRTCIceCandidateStatsProtocol]: 'mock-protocol',
  [_constants.Constants.PreflightRTCIceCandidateStatsRelatedAddress]: 'mock-relatedaddress',
  [_constants.Constants.PreflightRTCIceCandidateStatsRelatedPort]: 50,
  [_constants.Constants.PreflightRTCIceCandidateStatsTcpType]: 'mock-tcptype',
  [_constants.Constants.PreflightRTCIceCandidateStatsTransportId]: 'mock-transportid',
  [_constants.Constants.PreflightRTCIceCandidateStatsUrl]: 'mock-url'
};
exports.mockRtcIceCandidateStats = mockRtcIceCandidateStats;
const mockPreflightStats = {
  [_constants.Constants.PreflightStatsAverage]: 10,
  [_constants.Constants.PreflightStatsMax]: 20,
  [_constants.Constants.PreflightStatsMin]: 30
};
exports.mockPreflightStats = mockPreflightStats;
const mockPreflightRtcStats = {
  [_constants.Constants.PreflightRTCStatsJitter]: mockPreflightStats,
  [_constants.Constants.PreflightRTCStatsMos]: mockPreflightStats,
  [_constants.Constants.PreflightRTCStatsRtt]: mockPreflightStats
};
exports.mockPreflightRtcStats = mockPreflightRtcStats;
const mockTiming = {
  duration: 10,
  endTime: 20,
  startTime: 30
};
exports.mockTiming = mockTiming;
const mockNetworkTiming = {
  signaling: mockTiming,
  peerConnection: mockTiming,
  iceConnection: mockTiming,
  preflightTest: mockTiming
};
exports.mockNetworkTiming = mockNetworkTiming;
const baseMockReport = {
  callSid: 'mock-callsid',
  edge: 'mock-edge',
  iceCandidates: [mockRtcIceCandidateStats, mockRtcIceCandidateStats],
  isTurnRequired: false,
  networkStats: mockPreflightRtcStats,
  networkTiming: mockNetworkTiming,
  statsSamples: [mockSample, mockSample],
  selectedEdge: 'mock-selectededge',
  selectedIceCandidatePair: {
    localCandidate: mockRtcIceCandidateStats,
    remoteCandidate: mockRtcIceCandidateStats
  },
  warnings: [{
    name: 'mock-warningname',
    threshold: 'mock-warningthreshold',
    timestamp: 10,
    values: 'mock-warningvalues'
  }, {
    name: 'mock-warningname',
    threshold: 'mock-warningthreshold',
    timestamp: 10,
    values: 'mock-warningvalues'
  }],
  warningsCleared: [{
    name: 'mock-warningclearedname',
    timestamp: 10
  }, {
    name: 'mock-warningclearedname',
    timestamp: 10
  }]
};
exports.baseMockReport = baseMockReport;
const expectedReport = {
  callQuality: _PreflightTest.PreflightTest.CallQuality.Excellent,
  callSid: 'mock-callsid',
  edge: 'mock-edge',
  iceCandidateStats: [{
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
    url: 'mock-url'
  }, {
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
    url: 'mock-url'
  }],
  isTurnRequired: false,
  networkTiming: {
    ice: {
      duration: 10,
      end: 20,
      start: 30
    },
    peerConnection: {
      duration: 10,
      end: 20,
      start: 30
    },
    signaling: {
      duration: 10,
      end: 20,
      start: 30
    }
  },
  samples: [{
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
    timestamp: 120
  }, {
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
    timestamp: 120
  }],
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
      url: 'mock-url'
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
      url: 'mock-url'
    }
  },
  stats: {
    jitter: {
      average: 10,
      max: 20,
      min: 30
    },
    mos: {
      average: 10,
      max: 20,
      min: 30
    },
    rtt: {
      average: 10,
      max: 20,
      min: 30
    }
  },
  testTiming: {
    duration: 10,
    end: 20,
    start: 30
  },
  warnings: [{
    name: 'mock-warningname',
    threshold: 'mock-warningthreshold',
    timestamp: 10,
    values: 'mock-warningvalues'
  }, {
    name: 'mock-warningname',
    threshold: 'mock-warningthreshold',
    timestamp: 10,
    values: 'mock-warningvalues'
  }],
  warningsCleared: [{
    name: 'mock-warningclearedname',
    timestamp: 10
  }, {
    name: 'mock-warningclearedname',
    timestamp: 10
  }]
};
exports.expectedReport = expectedReport;

const makeMockNativePreflightEvent = eventType => ({
  [_constants.Constants.PreflightTestEventKeyUuid]: mockUuid,
  [_constants.Constants.PreflightTestEventKeyType]: eventType
});

exports.makeMockNativePreflightEvent = makeMockNativePreflightEvent;
//# sourceMappingURL=PreflightTest.js.map