//
//  TwilioVoiceReactNativeConstants.h
//  TwilioVoiceReactNative
//
//  Copyright © 2022 Twilio, Inc. All rights reserved.
//

/* This file is auto-generated. Do not edit! */

// React Native Voice SDK
static NSString * const kTwilioVoiceReactNativeReactNativeVoiceSDK = @"react-native";
static NSString * const kTwilioVoiceReactNativeReactNativeVoiceSDKVer = @"1.7.0";

// Scope names
static NSString * const kTwilioVoiceReactNativeScopeVoice = @"scopeVoice";
static NSString * const kTwilioVoiceReactNativeScopeCall = @"scopeCall";
static NSString * const kTwilioVoiceReactNativeScopeCallMessage = @"scopeCallMessage";
static NSString * const kTwilioVoiceReactNativeScopeCallInvite = @"scopeCallInvite";
static NSString * const kTwilioVoiceReactNativeScopePreflightTest = @"scopePreflightTest";

// Voice events
// Common
static NSString * const kTwilioVoiceReactNativeVoiceEventError = @"voiceEventError";
static NSString * const kTwilioVoiceReactNativeVoiceEventType = @"type";

// Error
static NSString * const kTwilioVoiceReactNativeVoiceErrorKeyError = @"error";
static NSString * const kTwilioVoiceReactNativeVoiceErrorKeyCode = @"code";
static NSString * const kTwilioVoiceReactNativeVoiceErrorKeyMessage = @"message";

// Registration
static NSString * const kTwilioVoiceReactNativeVoiceEventRegistered = @"voiceEventRegistered";
static NSString * const kTwilioVoiceReactNativeVoiceEventUnregistered = @"voiceEventUnregistered";

// Call Info
static NSString * const kTwilioVoiceReactNativeCallInfoUuid = @"uuid";
static NSString * const kTwilioVoiceReactNativeCallInfoSid = @"sid";
static NSString * const kTwilioVoiceReactNativeCallInfoFrom = @"from";
static NSString * const kTwilioVoiceReactNativeCallInfoTo = @"to";
static NSString * const kTwilioVoiceReactNativeCallInfoIsMuted = @"isMuted";
static NSString * const kTwilioVoiceReactNativeCallInfoIsOnHold = @"isOnHold";
static NSString * const kTwilioVoiceReactNativeCallInfoState = @"state";
static NSString * const kTwilioVoiceReactNativeCallInfoInitialConnectedTimestamp = @"initialConnectedTimestamp";

// Call States
static NSString * const kTwilioVoiceReactNativeCallStateConnected = @"connected";
static NSString * const kTwilioVoiceReactNativeCallStateConnecting = @"connecting";
static NSString * const kTwilioVoiceReactNativeCallStateDisconnected = @"disconnected";
static NSString * const kTwilioVoiceReactNativeCallStateReconnecting = @"reconnecting";
static NSString * const kTwilioVoiceReactNativeCallStateRinging = @"ringing";

// Call Options
static NSString * const kTwilioVoiceReactNativeAudioCodecKeyType = @"type";

static NSString * const kTwilioVoiceReactNativeAudioCodecTypeValueOpus = @"opus";
static NSString * const kTwilioVoiceReactNativeAudioCodecOpusKeyMaxAverageBitrate = @"maxAverageBitrate";

static NSString * const kTwilioVoiceReactNativeAudioCodecTypeValuePCMU = @"pcmu";

static NSString * const kTwilioVoiceReactNativeIceTransportPolicyValueAll = @"all";
static NSString * const kTwilioVoiceReactNativeIceTransportPolicyValueRelay = @"relay";

static NSString * const kTwilioVoiceReactNativeIceServerKeyPassword = @"password";
static NSString * const kTwilioVoiceReactNativeIceServerKeyServerUrl = @"serverUrl";
static NSString * const kTwilioVoiceReactNativeIceServerKeyUsername = @"username";

static NSString * const kTwilioVoiceReactNativeCallOptionsKeyIceTransportPolicy = @"iceTransportPolicy";
static NSString * const kTwilioVoiceReactNativeCallOptionsKeyIceServers = @"iceServers";
static NSString * const kTwilioVoiceReactNativeCallOptionsKeyPreferredAudioCodecs = @"preferredAudioCodecs";

// Call Invite Info
static NSString * const kTwilioVoiceReactNativeCallInviteInfoUuid = @"uuid";
static NSString * const kTwilioVoiceReactNativeCallInviteInfoCallSid = @"callSid";
static NSString * const kTwilioVoiceReactNativeCallInviteInfoFrom = @"from";
static NSString * const kTwilioVoiceReactNativeCallInviteInfoTo = @"to";
static NSString * const kTwilioVoiceReactNativeCallInviteInfoCustomParameters = @"customParameters";

// Cancelled Call Invite Info
static NSString * const kTwilioVoiceReactNativeCancelledCallInviteInfoUuid = @"uuid";
static NSString * const kTwilioVoiceReactNativeCancelledCallInviteInfoCallSid = @"callSid";
static NSString * const kTwilioVoiceReactNativeCancelledCallInviteInfoFrom = @"from";
static NSString * const kTwilioVoiceReactNativeCancelledCallInviteInfoTo = @"to";
static NSString * const kTwilioVoiceReactNativeCancelledCallInviteInfoCustomParameters = @"customParameters";

// Incoming Call Invite event
static NSString * const kTwilioVoiceReactNativeVoiceEventTypeValueIncomingCallInvite = @"voiceEventTypeValueIncomingCallInvite";

// Call Message
static NSString * const kTwilioVoiceReactNativeVoiceEventSid = @"voiceEventSid";
static NSString * const kTwilioVoiceReactNativeCallMessage = @"callMessage";
static NSString * const kTwilioVoiceReactNativeCallMessageContent = @"content";
static NSString * const kTwilioVoiceReactNativeCallMessageContentType = @"contentType";
static NSString * const kTwilioVoiceReactNativeCallMessageMessageType = @"messageType";
static NSString * const kTwilioVoiceReactNativeJSEventKeyCallMessageInfo = @"callMessage";

// Audio Devices Updated Event
static NSString * const kTwilioVoiceReactNativeVoiceEventAudioDevicesUpdated = @"voiceEventAudioDevicesUpdated";

// Audio Device
static NSString * const kTwilioVoiceReactNativeAudioDeviceKeyUuid = @"uuid";
static NSString * const kTwilioVoiceReactNativeAudioDeviceKeyName = @"name";
static NSString * const kTwilioVoiceReactNativeAudioDeviceKeyType = @"type";
static NSString * const kTwilioVoiceReactNativeAudioDeviceKeyAudioDevices = @"audioDevices";
static NSString * const kTwilioVoiceReactNativeAudioDeviceKeySelectedDevice = @"selectedDevice";
static NSString * const kTwilioVoiceReactNativeAudioDeviceKeyEarpiece = @"earpiece";
static NSString * const kTwilioVoiceReactNativeAudioDeviceKeySpeaker = @"speaker";
static NSString * const kTwilioVoiceReactNativeAudioDeviceKeyBluetooth = @"bluetooth";

// CallInvite events
static NSString * const kTwilioVoiceReactNativeCallInviteEventKeyType = @"type";
static NSString * const kTwilioVoiceReactNativeCallInviteEventTypeValueAccepted = @"callInviteEventTypeValueCallInviteAccepted";
static NSString * const kTwilioVoiceReactNativeCallInviteEventTypeValueNotificationTapped = @"callInviteEventTypeValueCallInviteNotificationTapped";
static NSString * const kTwilioVoiceReactNativeCallInviteEventTypeValueRejected = @"callInviteEventTypeValueCallInviteRejected";
static NSString * const kTwilioVoiceReactNativeCallInviteEventTypeValueCancelled = @"callInviteEventTypeValueCallInviteCancelled";
static NSString * const kTwilioVoiceReactNativeCallInviteEventKeyCallSid = @"callSid";

// Call events
// State
static NSString * const kTwilioVoiceReactNativeCallEventConnected = @"callEventConnected";
static NSString * const kTwilioVoiceReactNativeCallEventConnectFailure = @"callEventConnectFailure";
static NSString * const kTwilioVoiceReactNativeCallEventDisconnected = @"callEventDisconnected";
static NSString * const kTwilioVoiceReactNativeCallEventReconnecting = @"callEventReconnecting";
static NSString * const kTwilioVoiceReactNativeCallEventReconnected = @"callEventReconnected";
static NSString * const kTwilioVoiceReactNativeCallEventRinging = @"callEventRinging";

// Quality warnings
static NSString * const kTwilioVoiceReactNativeCallEventQualityWarningsChanged = @"callEventQualityWarningsChanged";
static NSString * const kTwilioVoiceReactNativeCallEventCurrentWarnings = @"callEventCurrentWarnings";
static NSString * const kTwilioVoiceReactNativeCallEventPreviousWarnings = @"callEventPreviousWarnings";

// Call message events
static NSString * const kTwilioVoiceReactNativeCallEventMessageFailure = @"callEventMessageFailure";
static NSString * const kTwilioVoiceReactNativeCallEventMessageReceived = @"callEventMessageReceived";
static NSString * const kTwilioVoiceReactNativeCallEventMessageSent = @"callEventMessageSent";

// Call feedback score
static NSString * const kTwilioVoiceReactNativeCallFeedbackScoreNotReported = @"callFeedbackScoreNotReported";
static NSString * const kTwilioVoiceReactNativeCallFeedbackScoreOne = @"callFeedbackScoreOne";
static NSString * const kTwilioVoiceReactNativeCallFeedbackScoreTwo = @"callFeedbackScoreTwo";
static NSString * const kTwilioVoiceReactNativeCallFeedbackScoreThree = @"callFeedbackScoreThree";
static NSString * const kTwilioVoiceReactNativeCallFeedbackScoreFour = @"callFeedbackScoreFour";
static NSString * const kTwilioVoiceReactNativeCallFeedbackScoreFive = @"callFeedbackScoreFive";

// Call feedback issue
static NSString * const kTwilioVoiceReactNativeCallFeedbackIssueNotReported = @"callFeedbackIssueNotReported";
static NSString * const kTwilioVoiceReactNativeCallFeedbackIssueDroppedCall = @"callFeedbackIssueDroppedCall";
static NSString * const kTwilioVoiceReactNativeCallFeedbackIssueAudioLatency = @"callFeedbackIssueAudioLatency";
static NSString * const kTwilioVoiceReactNativeCallFeedbackIssueOneWayAudio = @"callFeedbackIssueOneWayAudio";
static NSString * const kTwilioVoiceReactNativeCallFeedbackIssueChoppyAudio = @"callFeedbackIssueChoppyAudio";
static NSString * const kTwilioVoiceReactNativeCallFeedbackIssueNoisyCall = @"callFeedbackIssueNoisyCall";
static NSString * const kTwilioVoiceReactNativeCallFeedbackIssueEcho = @"callFeedbackIssueEcho";

// StatsReport
static NSString * const kTwilioVoiceReactNativePeerConnectionId = @"peerConnectionId";
static NSString * const kTwilioVoiceReactNativeLocalAudioTrackStats = @"localAudioTrackStats";
static NSString * const kTwilioVoiceReactNativeRemoteAudioTrackStats = @"remoteAudioTrackStats";
static NSString * const kTwilioVoiceReactNativeIceCandidatePairStats = @"iceCandidatePairStats";
static NSString * const kTwilioVoiceReactNativeIceCandidateStats = @"iceCandidateStats";
static NSString * const kTwilioVoiceReactNativeCodec = @"codec";
static NSString * const kTwilioVoiceReactNativePacketsLost = @"packetsLost";
static NSString * const kTwilioVoiceReactNativeSsrc = @"ssrc";
static NSString * const kTwilioVoiceReactNativeTrackId = @"trackId";
static NSString * const kTwilioVoiceReactNativeTimestamp = @"timestamp";
static NSString * const kTwilioVoiceReactNativeBytesSent = @"bytesSent";
static NSString * const kTwilioVoiceReactNativePacketsSent = @"packetsSent";
static NSString * const kTwilioVoiceReactNativeRoundTripTime = @"roundTripTime";
static NSString * const kTwilioVoiceReactNativeAudioLevel = @"audioLevel";
static NSString * const kTwilioVoiceReactNativeJitter = @"jitter";
static NSString * const kTwilioVoiceReactNativeBytesReceived = @"bytesReceived";
static NSString * const kTwilioVoiceReactNativeMos = @"mos";
static NSString * const kTwilioVoiceReactNativeTransportId = @"transportId";
static NSString * const kTwilioVoiceReactNativeLocalCandidateId = @"localCandidateId";
static NSString * const kTwilioVoiceReactNativeRemoteCandidateId = @"remoteCandidateId";
static NSString * const kTwilioVoiceReactNativeState = @"state";
static NSString * const kTwilioVoiceReactNativeLocalCandidateIp = @"localCandidateIp";
static NSString * const kTwilioVoiceReactNativeRemoteCandidateIp = @"remoteCandidateIp";
static NSString * const kTwilioVoiceReactNativeNominated = @"nominated";
static NSString * const kTwilioVoiceReactNativeWriteable = @"writeable";
static NSString * const kTwilioVoiceReactNativeReadable = @"readable";
static NSString * const kTwilioVoiceReactNativeTotalRoundTripTime = @"totalRoundTripTime";
static NSString * const kTwilioVoiceReactNativeCurrentRoundTripTime = @"currentRoundTripTime";
static NSString * const kTwilioVoiceReactNativeAvailableOutgoingBitrate = @"availableOutgoingBitrate";
static NSString * const kTwilioVoiceReactNativeAvailableIncomingBitrate = @"availableIncomingBitrate";
static NSString * const kTwilioVoiceReactNativeRequestsReceived = @"requestsReceived";
static NSString * const kTwilioVoiceReactNativeRequestsSent = @"requestsSent";
static NSString * const kTwilioVoiceReactNativeResponsesReceived = @"responsesReceived";
static NSString * const kTwilioVoiceReactNativeResponsesSent = @"responsesSent";
static NSString * const kTwilioVoiceReactNativeRetransmissionsReceived = @"retransmissionsReceived";
static NSString * const kTwilioVoiceReactNativeRetransmissionsSent = @"retransmissionsSent";
static NSString * const kTwilioVoiceReactNativeConsentRequestsReceived = @"consentRequestsReceived";
static NSString * const kTwilioVoiceReactNativeConsentRequestsSent = @"consentRequestsSent";
static NSString * const kTwilioVoiceReactNativeConsentResponsesReceived = @"consentResponsesReceived";
static NSString * const kTwilioVoiceReactNativeConsentResponsesSent = @"consentResponsesSent";
static NSString * const kTwilioVoiceReactNativeActiveCandidatePair = @"activeCandidatePair";
static NSString * const kTwilioVoiceReactNativeRelayProtocol = @"relayProtocol";
static NSString * const kTwilioVoiceReactNativeIsRemote = @"isRemote";
static NSString * const kTwilioVoiceReactNativeIp = @"ip";
static NSString * const kTwilioVoiceReactNativePort = @"port";
static NSString * const kTwilioVoiceReactNativeProtocol = @"protocol";
static NSString * const kTwilioVoiceReactNativeCandidateType = @"candidateType";
static NSString * const kTwilioVoiceReactNativePriority = @"priority";
static NSString * const kTwilioVoiceReactNativeUrl = @"url";
static NSString * const kTwilioVoiceReactNativeDeleted = @"deleted";
static NSString * const kTwilioVoiceReactNativePacketsReceived = @"packetsReceived";

// IceCandidatePairState
static NSString * const kTwilioVoiceReactNativeStateFailed = @"stateFailed";
static NSString * const kTwilioVoiceReactNativeStateFrozen = @"stateFrozen";
static NSString * const kTwilioVoiceReactNativeStateInProgress = @"stateInProgress";
static NSString * const kTwilioVoiceReactNativeStateSucceeded = @"stateSucceeded";
static NSString * const kTwilioVoiceReactNativeStateWaiting = @"stateWaiting";
static NSString * const kTwilioVoiceReactNativeStateUnknown = @"stateUnknown";

// iOS CallKit configuration
static NSString * const kTwilioVoiceReactNativeCallKitMaximumCallsPerCallGroup = @"callKitMaximumCallsPerCallGroup";
static NSString * const kTwilioVoiceReactNativeCallKitMaximumCallGroups = @"callKitMaximumCallGroups";
static NSString * const kTwilioVoiceReactNativeCallKitIncludesCallsInRecents = @"callKitIncludesCallsInRecents";
static NSString * const kTwilioVoiceReactNativeCallKitSupportedHandleTypes = @"callKitSupportedHandleTypes";
static NSString * const kTwilioVoiceReactNativeCallKitIconTemplateImageData = @"callKitIconTemplateImageData";
static NSString * const kTwilioVoiceReactNativeCallKitRingtoneSound = @"callKitRingtoneSound";

// PreflightTest events
static NSString * const kTwilioVoiceReactNativePreflightTestEventKeyType = @"preflightTestEventKeyType";
static NSString * const kTwilioVoiceReactNativePreflightTestEventKeyUuid = @"preflightTestEventKeyUuid";

static NSString * const kTwilioVoiceReactNativePreflightTestEventTypeValueConnected = @"preflightTestEventTypeValueConnected";

static NSString * const kTwilioVoiceReactNativePreflightTestEventTypeValueCompleted = @"preflightTestEventTypeValueCompleted";
static NSString * const kTwilioVoiceReactNativePreflightTestCompletedEventKeyReport = @"preflightTestCompletedEventKeyReport";

static NSString * const kTwilioVoiceReactNativePreflightTestEventTypeValueFailed = @"preflightTestEventTypeValueFailed";
static NSString * const kTwilioVoiceReactNativePreflightTestFailedEventKeyError = @"preflightTestFailedEventKeyError";

static NSString * const kTwilioVoiceReactNativePreflightTestEventTypeValueSample = @"preflightTestEventTypeValueSample";
static NSString * const kTwilioVoiceReactNativePreflightTestSampleEventKeySample = @"preflightTestSampleEventKeySample";

static NSString * const kTwilioVoiceReactNativePreflightTestEventTypeValueQualityWarning = @"preflightTestEventTypeValueQualityWarning";
static NSString * const kTwilioVoiceReactNativePreflightTestQualityWarningEventKeyCurrentWarnings = @"preflightTestQualityWarningEventKeyCurrentWarnings";
static NSString * const kTwilioVoiceReactNativePreflightTestQualityWarningEventKeyPreviousWarnings = @"preflightTestQualityWarningEventKeyPreviousWarnings";

// PreflightTest state
static NSString * const kTwilioVoiceReactNativePreflightTestStateConnecting = @"connecting";
static NSString * const kTwilioVoiceReactNativePreflightTestStateConnected = @"connected";
static NSString * const kTwilioVoiceReactNativePreflightTestStateCompleted = @"completed";
static NSString * const kTwilioVoiceReactNativePreflightTestStateFailed = @"failed";

// PreflightStats
static NSString * const kTwilioVoiceReactNativePreflightStatsAverage = @"average";
static NSString * const kTwilioVoiceReactNativePreflightStatsMin = @"min";
static NSString * const kTwilioVoiceReactNativePreflightStatsMax = @"max";

// PreflightRTCStats
static NSString * const kTwilioVoiceReactNativePreflightRTCStatsJitter = @"jitter";
static NSString * const kTwilioVoiceReactNativePreflightRTCStatsMos = @"mos";
static NSString * const kTwilioVoiceReactNativePreflightRTCStatsRtt = @"rtt";

// PreflightTimeMeasurement
static NSString * const kTwilioVoiceReactNativePreflightTimeMeasurementStart = @"start";
static NSString * const kTwilioVoiceReactNativePreflightTimeMeasurementEnd = @"end";
static NSString * const kTwilioVoiceReactNativePreflightTimeMeasurementDuration = @"duration";

// PreflightNetworkTiming
static NSString * const kTwilioVoiceReactNativePreflightNetworkTimingSignaling = @"signaling";
static NSString * const kTwilioVoiceReactNativePreflightNetworkTimingPeerConnection = @"peerConnection";
static NSString * const kTwilioVoiceReactNativePreflightNetworkTimingIce = @"ice";

// PreflightWarning
static NSString * const kTwilioVoiceReactNativePreflightWarningName = @"name";
static NSString * const kTwilioVoiceReactNativePreflightWarningThreshold = @"threshold";
static NSString * const kTwilioVoiceReactNativePreflightWarningValues = @"values";
static NSString * const kTwilioVoiceReactNativePreflightWarningTimestamp = @"timestamp";

// PreflightWarningCleared
static NSString * const kTwilioVoiceReactNativePreflightWarningClearedName = @"name";
static NSString * const kTwilioVoiceReactNativePreflightWarningClearedTimestamp = @"timestamp";

// PreflightRTCIceCandidateStats
static NSString * const kTwilioVoiceReactNativePreflightRTCIceCandidateStatsTransportId = @"transportId";
static NSString * const kTwilioVoiceReactNativePreflightRTCIceCandidateStatsIsRemote = @"isRemote";
static NSString * const kTwilioVoiceReactNativePreflightRTCIceCandidateStatsIp = @"ip";
static NSString * const kTwilioVoiceReactNativePreflightRTCIceCandidateStatsPort = @"port";
static NSString * const kTwilioVoiceReactNativePreflightRTCIceCandidateStatsProtocol = @"protocol";
static NSString * const kTwilioVoiceReactNativePreflightRTCIceCandidateStatsCandidateType = @"candidateType";
static NSString * const kTwilioVoiceReactNativePreflightRTCIceCandidateStatsPriority = @"priority";
static NSString * const kTwilioVoiceReactNativePreflightRTCIceCandidateStatsUrl = @"url";
static NSString * const kTwilioVoiceReactNativePreflightRTCIceCandidateStatsDeleted = @"deleted";
static NSString * const kTwilioVoiceReactNativePreflightRTCIceCandidateStatsNetworkCost = @"networkCost";
static NSString * const kTwilioVoiceReactNativePreflightRTCIceCandidateStatsNetworkId = @"networkId";
static NSString * const kTwilioVoiceReactNativePreflightRTCIceCandidateStatsNetworkType = @"networkType";
static NSString * const kTwilioVoiceReactNativePreflightRTCIceCandidateStatsRelatedAddress = @"relatedAddress";
static NSString * const kTwilioVoiceReactNativePreflightRTCIceCandidateStatsRelatedPort = @"relatedPort";
static NSString * const kTwilioVoiceReactNativePreflightRTCIceCandidateStatsTcpType = @"tcpType";

// PreflightRTCSelectedIceCandidatePairStats
static NSString * const kTwilioVoiceReactNativePreflightRTCSelectedIceCandidatePairStatsLocalCandidate = @"localCandidate";
static NSString * const kTwilioVoiceReactNativePreflightRTCSelectedIceCandidatePairStatsRemoteCandidate = @"remoteCandidate";

// PreflightRTCSample
static NSString * const kTwilioVoiceReactNativePreflightRTCSampleCodec = @"codec";
static NSString * const kTwilioVoiceReactNativePreflightRTCSampleAudioInputLevel = @"audioInputLevel";
static NSString * const kTwilioVoiceReactNativePreflightRTCSampleAudioOutputLevel = @"audioOutputLevel";
static NSString * const kTwilioVoiceReactNativePreflightRTCSampleBytesReceived = @"bytesReceived";
static NSString * const kTwilioVoiceReactNativePreflightRTCSampleBytesSent = @"bytesSent";
static NSString * const kTwilioVoiceReactNativePreflightRTCSamplePacketsReceived = @"packetsReceived";
static NSString * const kTwilioVoiceReactNativePreflightRTCSamplePacketsSent = @"packetsSent";
static NSString * const kTwilioVoiceReactNativePreflightRTCSamplePacketsLost = @"packetsLost";
static NSString * const kTwilioVoiceReactNativePreflightRTCSamplePacketsLostFraction = @"packetsLostFraction";
static NSString * const kTwilioVoiceReactNativePreflightRTCSampleJitter = @"jitter";
static NSString * const kTwilioVoiceReactNativePreflightRTCSampleMos = @"mos";
static NSString * const kTwilioVoiceReactNativePreflightRTCSampleRtt = @"rtt";
static NSString * const kTwilioVoiceReactNativePreflightRTCSampleTimestamp = @"timestamp";

// PreflightCallQuality
static NSString * const kTwilioVoiceReactNativePreflightCallQualityExcellent = @"excellent";
static NSString * const kTwilioVoiceReactNativePreflightCallQualityGreat = @"great";
static NSString * const kTwilioVoiceReactNativePreflightCallQualityGood = @"good";
static NSString * const kTwilioVoiceReactNativePreflightCallQualityFair = @"fair";
static NSString * const kTwilioVoiceReactNativePreflightCallQualityDegraded = @"degraded";
static NSString * const kTwilioVoiceReactNativePreflightCallQualityNull = @"null";

// PreflightReport
static NSString * const kTwilioVoiceReactNativePreflightReportCallSid = @"callSid";
static NSString * const kTwilioVoiceReactNativePreflightReportEdge = @"edge";
static NSString * const kTwilioVoiceReactNativePreflightReportSelectedEdge = @"selectedEdge";
static NSString * const kTwilioVoiceReactNativePreflightReportIceCandidateStats = @"iceCandidateStats";
static NSString * const kTwilioVoiceReactNativePreflightReportNetworkTiming = @"networkTiming";
static NSString * const kTwilioVoiceReactNativePreflightReportTestTiming = @"testTiming";
static NSString * const kTwilioVoiceReactNativePreflightReportSamples = @"samples";
static NSString * const kTwilioVoiceReactNativePreflightReportStats = @"stats";
static NSString * const kTwilioVoiceReactNativePreflightReportIsTurnRequired = @"isTurnRequired";
static NSString * const kTwilioVoiceReactNativePreflightReportCallQuality = @"callQuality";
static NSString * const kTwilioVoiceReactNativePreflightReportWarnings = @"warnings";
static NSString * const kTwilioVoiceReactNativePreflightReportWarningsCleared = @"warningsCleared";
static NSString * const kTwilioVoiceReactNativePreflightReportSelectedIceCandidatePairStats = @"selectedIceCandidatePairStats";

// Error codes
static NSString * const kTwilioVoiceReactNativeErrorCodeInvalidStateError = @"InvalidStateError";
static NSString * const kTwilioVoiceReactNativeErrorCodeInvalidArgumentError = @"InvalidArgumentError";
