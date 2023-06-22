package com.twiliovoicereactnative;

public class CommonConstants {
  // React Native Voice SDK
  public static final String ReactNativeVoiceSDK = "react-native";

  // Scope names
  public static final String ScopeVoice = "scopeVoice";
  public static final String ScopeCall = "scopeCall";

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

  // Call Invite
  public static final String VoiceEventCallInvite = "voiceEventCallInvite";
  public static final String VoiceEventCallInviteAccepted = "voiceEventCallInviteAccepted";
  public static final String VoiceEventCallInviteRejected = "voiceEventCallInviteRejected";
  public static final String VoiceEventCallInviteCancelled = "voiceEventCallInviteCancelled";

  // Audio Devices Updated Event
  public static final String VoiceEventAudioDevicesUpdated = "voiceEventAudioDevicesUpdated";

  // Audio Device
  public static final String AudioDeviceKeyUuid = "uuid";
  public static final String AudioDeviceKeyName = "name";
  public static final String AudioDeviceKeyType = "type";
  public static final String AudioDeviceKeyAudioDevices = "audioDevices";
  public static final String AudioDeviceKeySelectedDevice = "selectedDevice";

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

  // Post feedback
  public static final String Score = "score";
  public static final String Issue = "issue";

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
}
