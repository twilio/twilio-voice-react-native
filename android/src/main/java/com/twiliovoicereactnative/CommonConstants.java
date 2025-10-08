package com.twiliovoicereactnative;

public class CommonConstants {
  // React Native Voice SDK
  public static final String ReactNativeVoiceSDK = "react-native";
  public static final String ReactNativeVoiceSDKVer = "1.7.0";

  // Scope names
  public static final String ScopeVoice = "scopeVoice";
  public static final String ScopeCall = "scopeCall";
  public static final String ScopeCallMessage = "scopeCallMessage";
  public static final String ScopeCallInvite = "scopeCallInvite";
  public static final String ScopePreflightTest = "scopePreflightTest";

  // Voice events
  // Common
  public static final String VoiceEventError = "voiceEventError";
  public static final String VoiceEventType = "type";

  // Error
  public static final String VoiceErrorKeyError = "error";
  public static final String VoiceErrorKeyCode = "code";
  public static final String VoiceErrorKeyMessage = "message";

  // Registration
  public static final String VoiceEventRegistered = "voiceEventRegistered";
  public static final String VoiceEventUnregistered = "voiceEventUnregistered";

  // Call Info
  public static final String CallInfoUuid = "uuid";
  public static final String CallInfoSid = "sid";
  public static final String CallInfoFrom = "from";
  public static final String CallInfoTo = "to";
  public static final String CallInfoIsMuted = "isMuted";
  public static final String CallInfoIsOnHold = "isOnHold";
  public static final String CallInfoState = "state";
  public static final String CallInfoInitialConnectedTimestamp = "initialConnectedTimestamp";

  // Call States
  public static final String CallStateConnected = "connected";
  public static final String CallStateConnecting = "connecting";
  public static final String CallStateDisconnected = "disconnected";
  public static final String CallStateReconnecting = "reconnecting";
  public static final String CallStateRinging = "ringing";

  // Call Options
  public static final String AudioCodecKeyType = "type";

  public static final String AudioCodecTypeValueOpus = "opus";
  public static final String AudioCodecOpusKeyMaxAverageBitrate = "maxAverageBitrate";

  public static final String AudioCodecTypeValuePCMU = "pcmu";

  public static final String IceTransportPolicyValueAll = "all";
  public static final String IceTransportPolicyValueRelay = "relay";

  public static final String IceServerKeyPassword = "password";
  public static final String IceServerKeyServerUrl = "serverUrl";
  public static final String IceServerKeyUsername = "username";

  public static final String CallOptionsKeyIceTransportPolicy = "iceTransportPolicy";
  public static final String CallOptionsKeyIceServers = "iceServers";
  public static final String CallOptionsKeyPreferredAudioCodecs = "preferredAudioCodecs";

  // Call Invite Info
  public static final String CallInviteInfoUuid = "uuid";
  public static final String CallInviteInfoCallSid = "callSid";
  public static final String CallInviteInfoFrom = "from";
  public static final String CallInviteInfoTo = "to";
  public static final String CallInviteInfoCustomParameters = "customParameters";

  // Cancelled Call Invite Info
  public static final String CancelledCallInviteInfoUuid = "uuid";
  public static final String CancelledCallInviteInfoCallSid = "callSid";
  public static final String CancelledCallInviteInfoFrom = "from";
  public static final String CancelledCallInviteInfoTo = "to";
  public static final String CancelledCallInviteInfoCustomParameters = "customParameters";

  // Incoming Call Invite event
  public static final String VoiceEventTypeValueIncomingCallInvite = "voiceEventTypeValueIncomingCallInvite";

  // Call Message
  public static final String VoiceEventSid = "voiceEventSid";
  public static final String CallMessage = "callMessage";
  public static final String CallMessageContent = "content";
  public static final String CallMessageContentType = "contentType";
  public static final String CallMessageMessageType = "messageType";
  public static final String JSEventKeyCallMessageInfo = "callMessage";

  // Audio Devices Updated Event
  public static final String VoiceEventAudioDevicesUpdated = "voiceEventAudioDevicesUpdated";

  // Audio Device
  public static final String AudioDeviceKeyUuid = "uuid";
  public static final String AudioDeviceKeyName = "name";
  public static final String AudioDeviceKeyType = "type";
  public static final String AudioDeviceKeyAudioDevices = "audioDevices";
  public static final String AudioDeviceKeySelectedDevice = "selectedDevice";
  public static final String AudioDeviceKeyEarpiece = "earpiece";
  public static final String AudioDeviceKeySpeaker = "speaker";
  public static final String AudioDeviceKeyBluetooth = "bluetooth";

  // CallInvite events
  public static final String CallInviteEventKeyType = "type";
  public static final String CallInviteEventTypeValueAccepted = "callInviteEventTypeValueCallInviteAccepted";
  public static final String CallInviteEventTypeValueNotificationTapped = "callInviteEventTypeValueCallInviteNotificationTapped";
  public static final String CallInviteEventTypeValueRejected = "callInviteEventTypeValueCallInviteRejected";
  public static final String CallInviteEventTypeValueCancelled = "callInviteEventTypeValueCallInviteCancelled";
  public static final String CallInviteEventKeyCallSid = "callSid";

  // Call events
  // State
  public static final String CallEventConnected = "callEventConnected";
  public static final String CallEventConnectFailure = "callEventConnectFailure";
  public static final String CallEventDisconnected = "callEventDisconnected";
  public static final String CallEventReconnecting = "callEventReconnecting";
  public static final String CallEventReconnected = "callEventReconnected";
  public static final String CallEventRinging = "callEventRinging";

  // Quality warnings
  public static final String CallEventQualityWarningsChanged = "callEventQualityWarningsChanged";
  public static final String CallEventCurrentWarnings = "callEventCurrentWarnings";
  public static final String CallEventPreviousWarnings = "callEventPreviousWarnings";

  // Call message events
  public static final String CallEventMessageFailure = "callEventMessageFailure";
  public static final String CallEventMessageReceived = "callEventMessageReceived";
  public static final String CallEventMessageSent = "callEventMessageSent";

  // Call feedback score
  public static final String CallFeedbackScoreNotReported = "callFeedbackScoreNotReported";
  public static final String CallFeedbackScoreOne = "callFeedbackScoreOne";
  public static final String CallFeedbackScoreTwo = "callFeedbackScoreTwo";
  public static final String CallFeedbackScoreThree = "callFeedbackScoreThree";
  public static final String CallFeedbackScoreFour = "callFeedbackScoreFour";
  public static final String CallFeedbackScoreFive = "callFeedbackScoreFive";

  // Call feedback issue
  public static final String CallFeedbackIssueNotReported = "callFeedbackIssueNotReported";
  public static final String CallFeedbackIssueDroppedCall = "callFeedbackIssueDroppedCall";
  public static final String CallFeedbackIssueAudioLatency = "callFeedbackIssueAudioLatency";
  public static final String CallFeedbackIssueOneWayAudio = "callFeedbackIssueOneWayAudio";
  public static final String CallFeedbackIssueChoppyAudio = "callFeedbackIssueChoppyAudio";
  public static final String CallFeedbackIssueNoisyCall = "callFeedbackIssueNoisyCall";
  public static final String CallFeedbackIssueEcho = "callFeedbackIssueEcho";

  // StatsReport
  public static final String PeerConnectionId = "peerConnectionId";
  public static final String LocalAudioTrackStats = "localAudioTrackStats";
  public static final String RemoteAudioTrackStats = "remoteAudioTrackStats";
  public static final String IceCandidatePairStats = "iceCandidatePairStats";
  public static final String IceCandidateStats = "iceCandidateStats";
  public static final String Codec = "codec";
  public static final String PacketsLost = "packetsLost";
  public static final String Ssrc = "ssrc";
  public static final String TrackId = "trackId";
  public static final String Timestamp = "timestamp";
  public static final String BytesSent = "bytesSent";
  public static final String PacketsSent = "packetsSent";
  public static final String RoundTripTime = "roundTripTime";
  public static final String AudioLevel = "audioLevel";
  public static final String Jitter = "jitter";
  public static final String BytesReceived = "bytesReceived";
  public static final String Mos = "mos";
  public static final String TransportId = "transportId";
  public static final String LocalCandidateId = "localCandidateId";
  public static final String RemoteCandidateId = "remoteCandidateId";
  public static final String State = "state";
  public static final String LocalCandidateIp = "localCandidateIp";
  public static final String RemoteCandidateIp = "remoteCandidateIp";
  public static final String Nominated = "nominated";
  public static final String Writeable = "writeable";
  public static final String Readable = "readable";
  public static final String TotalRoundTripTime = "totalRoundTripTime";
  public static final String CurrentRoundTripTime = "currentRoundTripTime";
  public static final String AvailableOutgoingBitrate = "availableOutgoingBitrate";
  public static final String AvailableIncomingBitrate = "availableIncomingBitrate";
  public static final String RequestsReceived = "requestsReceived";
  public static final String RequestsSent = "requestsSent";
  public static final String ResponsesReceived = "responsesReceived";
  public static final String ResponsesSent = "responsesSent";
  public static final String RetransmissionsReceived = "retransmissionsReceived";
  public static final String RetransmissionsSent = "retransmissionsSent";
  public static final String ConsentRequestsReceived = "consentRequestsReceived";
  public static final String ConsentRequestsSent = "consentRequestsSent";
  public static final String ConsentResponsesReceived = "consentResponsesReceived";
  public static final String ConsentResponsesSent = "consentResponsesSent";
  public static final String ActiveCandidatePair = "activeCandidatePair";
  public static final String RelayProtocol = "relayProtocol";
  public static final String IsRemote = "isRemote";
  public static final String Ip = "ip";
  public static final String Port = "port";
  public static final String Protocol = "protocol";
  public static final String CandidateType = "candidateType";
  public static final String Priority = "priority";
  public static final String Url = "url";
  public static final String Deleted = "deleted";
  public static final String PacketsReceived = "packetsReceived";

  // IceCandidatePairState
  public static final String StateFailed = "stateFailed";
  public static final String StateFrozen = "stateFrozen";
  public static final String StateInProgress = "stateInProgress";
  public static final String StateSucceeded = "stateSucceeded";
  public static final String StateWaiting = "stateWaiting";
  public static final String StateUnknown = "stateUnknown";

  // iOS CallKit configuration
  public static final String CallKitMaximumCallsPerCallGroup = "callKitMaximumCallsPerCallGroup";
  public static final String CallKitMaximumCallGroups = "callKitMaximumCallGroups";
  public static final String CallKitIncludesCallsInRecents = "callKitIncludesCallsInRecents";
  public static final String CallKitSupportedHandleTypes = "callKitSupportedHandleTypes";
  public static final String CallKitIconTemplateImageData = "callKitIconTemplateImageData";
  public static final String CallKitRingtoneSound = "callKitRingtoneSound";

  // PreflightTest events
  public static final String PreflightTestEventKeyType = "preflightTestEventKeyType";
  public static final String PreflightTestEventKeyUuid = "preflightTestEventKeyUuid";

  public static final String PreflightTestEventTypeValueConnected = "preflightTestEventTypeValueConnected";

  public static final String PreflightTestEventTypeValueCompleted = "preflightTestEventTypeValueCompleted";
  public static final String PreflightTestCompletedEventKeyReport = "preflightTestCompletedEventKeyReport";

  public static final String PreflightTestEventTypeValueFailed = "preflightTestEventTypeValueFailed";
  public static final String PreflightTestFailedEventKeyError = "preflightTestFailedEventKeyError";

  public static final String PreflightTestEventTypeValueSample = "preflightTestEventTypeValueSample";
  public static final String PreflightTestSampleEventKeySample = "preflightTestSampleEventKeySample";

  public static final String PreflightTestEventTypeValueQualityWarning = "preflightTestEventTypeValueQualityWarning";
  public static final String PreflightTestQualityWarningEventKeyCurrentWarnings = "preflightTestQualityWarningEventKeyCurrentWarnings";
  public static final String PreflightTestQualityWarningEventKeyPreviousWarnings = "preflightTestQualityWarningEventKeyPreviousWarnings";

  // PreflightTest state
  public static final String PreflightTestStateConnecting = "connecting";
  public static final String PreflightTestStateConnected = "connected";
  public static final String PreflightTestStateCompleted = "completed";
  public static final String PreflightTestStateFailed = "failed";

  // PreflightStats
  public static final String PreflightStatsAverage = "average";
  public static final String PreflightStatsMin = "min";
  public static final String PreflightStatsMax = "max";

  // PreflightRTCStats
  public static final String PreflightRTCStatsJitter = "jitter";
  public static final String PreflightRTCStatsMos = "mos";
  public static final String PreflightRTCStatsRtt = "rtt";

  // PreflightTimeMeasurement
  public static final String PreflightTimeMeasurementStart = "start";
  public static final String PreflightTimeMeasurementEnd = "end";
  public static final String PreflightTimeMeasurementDuration = "duration";

  // PreflightNetworkTiming
  public static final String PreflightNetworkTimingSignaling = "signaling";
  public static final String PreflightNetworkTimingPeerConnection = "peerConnection";
  public static final String PreflightNetworkTimingIce = "ice";

  // PreflightWarning
  public static final String PreflightWarningName = "name";
  public static final String PreflightWarningThreshold = "threshold";
  public static final String PreflightWarningValues = "values";
  public static final String PreflightWarningTimestamp = "timestamp";

  // PreflightWarningCleared
  public static final String PreflightWarningClearedName = "name";
  public static final String PreflightWarningClearedTimestamp = "timestamp";

  // PreflightRTCIceCandidateStats
  public static final String PreflightRTCIceCandidateStatsTransportId = "transportId";
  public static final String PreflightRTCIceCandidateStatsIsRemote = "isRemote";
  public static final String PreflightRTCIceCandidateStatsIp = "ip";
  public static final String PreflightRTCIceCandidateStatsPort = "port";
  public static final String PreflightRTCIceCandidateStatsProtocol = "protocol";
  public static final String PreflightRTCIceCandidateStatsCandidateType = "candidateType";
  public static final String PreflightRTCIceCandidateStatsPriority = "priority";
  public static final String PreflightRTCIceCandidateStatsUrl = "url";
  public static final String PreflightRTCIceCandidateStatsDeleted = "deleted";
  public static final String PreflightRTCIceCandidateStatsNetworkCost = "networkCost";
  public static final String PreflightRTCIceCandidateStatsNetworkId = "networkId";
  public static final String PreflightRTCIceCandidateStatsNetworkType = "networkType";
  public static final String PreflightRTCIceCandidateStatsRelatedAddress = "relatedAddress";
  public static final String PreflightRTCIceCandidateStatsRelatedPort = "relatedPort";
  public static final String PreflightRTCIceCandidateStatsTcpType = "tcpType";

  // PreflightRTCSelectedIceCandidatePairStats
  public static final String PreflightRTCSelectedIceCandidatePairStatsLocalCandidate = "localCandidate";
  public static final String PreflightRTCSelectedIceCandidatePairStatsRemoteCandidate = "remoteCandidate";

  // PreflightRTCSample
  public static final String PreflightRTCSampleCodec = "codec";
  public static final String PreflightRTCSampleAudioInputLevel = "audioInputLevel";
  public static final String PreflightRTCSampleAudioOutputLevel = "audioOutputLevel";
  public static final String PreflightRTCSampleBytesReceived = "bytesReceived";
  public static final String PreflightRTCSampleBytesSent = "bytesSent";
  public static final String PreflightRTCSamplePacketsReceived = "packetsReceived";
  public static final String PreflightRTCSamplePacketsSent = "packetsSent";
  public static final String PreflightRTCSamplePacketsLost = "packetsLost";
  public static final String PreflightRTCSamplePacketsLostFraction = "packetsLostFraction";
  public static final String PreflightRTCSampleJitter = "jitter";
  public static final String PreflightRTCSampleMos = "mos";
  public static final String PreflightRTCSampleRtt = "rtt";
  public static final String PreflightRTCSampleTimestamp = "timestamp";

  // PreflightCallQuality
  public static final String PreflightCallQualityExcellent = "excellent";
  public static final String PreflightCallQualityGreat = "great";
  public static final String PreflightCallQualityGood = "good";
  public static final String PreflightCallQualityFair = "fair";
  public static final String PreflightCallQualityDegraded = "degraded";
  public static final String PreflightCallQualityNull = "null";

  // PreflightReport
  public static final String PreflightReportCallSid = "callSid";
  public static final String PreflightReportEdge = "edge";
  public static final String PreflightReportSelectedEdge = "selectedEdge";
  public static final String PreflightReportIceCandidateStats = "iceCandidateStats";
  public static final String PreflightReportNetworkTiming = "networkTiming";
  public static final String PreflightReportTestTiming = "testTiming";
  public static final String PreflightReportSamples = "samples";
  public static final String PreflightReportStats = "stats";
  public static final String PreflightReportIsTurnRequired = "isTurnRequired";
  public static final String PreflightReportCallQuality = "callQuality";
  public static final String PreflightReportWarnings = "warnings";
  public static final String PreflightReportWarningsCleared = "warningsCleared";
  public static final String PreflightReportSelectedIceCandidatePairStats = "selectedIceCandidatePairStats";

  // Error codes
  public static final String ErrorCodeInvalidStateError = "InvalidStateError";
  public static final String ErrorCodeInvalidArgumentError = "InvalidArgumentError";
}
