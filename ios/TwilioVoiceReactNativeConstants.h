//
//  TwilioVoiceReactNativeConstants.h
//  TwilioVoiceReactNative
//
//  Copyright © 2022 Twilio, Inc. All rights reserved.
//

/* This file is auto-generated. Do not edit! */

// React Native Voice SDK
static NSString * const kTwilioVoiceReactNativeReactNativeVoiceSDK = @"react-native";

// Scope names
static NSString * const kTwilioVoiceReactNativeScopeVoice = @"scopeVoice";
static NSString * const kTwilioVoiceReactNativeScopeCall = @"scopeCall";

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

// Call Invite
static NSString * const kTwilioVoiceReactNativeVoiceEventCallInvite = @"voiceEventCallInvite";
static NSString * const kTwilioVoiceReactNativeVoiceEventCallInviteAccepted = @"voiceEventCallInviteAccepted";
static NSString * const kTwilioVoiceReactNativeVoiceEventCallInviteRejected = @"voiceEventCallInviteRejected";
static NSString * const kTwilioVoiceReactNativeVoiceEventCallInviteCancelled = @"voiceEventCallInviteCancelled";

// Audio Devices Updated Event
static NSString * const kTwilioVoiceReactNativeVoiceEventAudioDevicesUpdated = @"voiceEventAudioDevicesUpdated";

// Audio Device
static NSString * const kTwilioVoiceReactNativeAudioDeviceKeyUuid = @"uuid";
static NSString * const kTwilioVoiceReactNativeAudioDeviceKeyName = @"name";
static NSString * const kTwilioVoiceReactNativeAudioDeviceKeyType = @"type";
static NSString * const kTwilioVoiceReactNativeAudioDeviceKeyAudioDevices = @"audioDevices";
static NSString * const kTwilioVoiceReactNativeAudioDeviceKeySelectedDevice = @"selectedDevice";

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

// Post feedback
static NSString * const kTwilioVoiceReactNativeScore = @"score";
static NSString * const kTwilioVoiceReactNativeIssue = @"issue";

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
