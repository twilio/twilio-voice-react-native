export enum Constants {
  // React Native Voice SDK
  'ReactNativeVoiceSDK' = 'react-native',

  // Scope names
  'ScopeVoice' = 'scopeVoice',
  'ScopeCall' = 'scopeCall',

  // Voice events
  // Common
  'VoiceEventError' = 'voiceEventError',
  'VoiceEventType' = 'type',

  // Error
  'VoiceErrorKeyError' = 'error',
  'VoiceErrorKeyCode' = 'code',
  'VoiceErrorKeyMessage' = 'message',

  // Registration
  'VoiceEventRegistered' = 'voiceEventRegistered',
  'VoiceEventUnregistered' = 'voiceEventUnregistered',

  // Call Info
  'CallInfoUuid' = 'uuid',
  'CallInfoSid' = 'sid',
  'CallInfoFrom' = 'from',
  'CallInfoTo' = 'to',
  'CallInfoIsMuted' = 'isMuted',
  'CallInfoIsOnHold' = 'isOnHold',

  // Call Invite Info
  'CallInviteInfoUuid' = 'uuid',
  'CallInviteInfoCallSid' = 'callSid',
  'CallInviteInfoFrom' = 'from',
  'CallInviteInfoTo' = 'to',
  'CallInviteInfoCustomParameters' = 'customParameters',

  // Cancelled Call Invite Info
  'CancelledCallInviteInfoUuid' = 'uuid',
  'CancelledCallInviteInfoCallSid' = 'callSid',
  'CancelledCallInviteInfoFrom' = 'from',
  'CancelledCallInviteInfoTo' = 'to',
  'CancelledCallInviteInfoCustomParameters' = 'customParameters',

  // Call Invite
  'VoiceEventCallInvite' = 'voiceEventCallInvite',
  'VoiceEventCallInviteAccepted' = 'voiceEventCallInviteAccepted',
  'VoiceEventCallInviteRejected' = 'voiceEventCallInviteRejected',
  'VoiceEventCallInviteCancelled' = 'voiceEventCallInviteCancelled',

  // Audio Devices Updated Event
  'VoiceEventAudioDevicesUpdated' = 'voiceEventAudioDevicesUpdated',

  // Audio Device
  'AudioDeviceKeyUuid' = 'uuid',
  'AudioDeviceKeyName' = 'name',
  'AudioDeviceKeyType' = 'type',
  'AudioDeviceKeyAudioDevices' = 'audioDevices',
  'AudioDeviceKeySelectedDevice' = 'selectedDevice',

  // Call events
  // State
  'CallEventConnected' = 'callEventConnected',
  'CallEventConnectFailure' = 'callEventConnectFailure',
  'CallEventDisconnected' = 'callEventDisconnected',
  'CallEventReconnecting' = 'callEventReconnecting',
  'CallEventReconnected' = 'callEventReconnected',
  'CallEventRinging' = 'callEventRinging',

  // Quality warnings
  'CallEventQualityWarningsChanged' = 'callEventQualityWarningsChanged',
  'CallEventCurrentWarnings' = 'callEventCurrentWarnings',
  'CallEventPreviousWarnings' = 'callEventPreviousWarnings',

  // Post feedback
  'Score' = 'score',
  'Issue' = 'issue',

  // StatsReport
  'PeerConnectionId' = 'peerConnectionId',
  'LocalAudioTrackStats' = 'localAudioTrackStats',
  'RemoteAudioTrackStats' = 'remoteAudioTrackStats',
  'IceCandidatePairStats' = 'iceCandidatePairStats',
  'IceCandidateStats' = 'iceCandidateStats',
  'Codec' = 'codec',
  'PacketsLost' = 'packetsLost',
  'Ssrc' = 'ssrc',
  'TrackId' = 'trackId',
  'Timestamp' = 'timestamp',
  'BytesSent' = 'bytesSent',
  'PacketsSent' = 'packetsSent',
  'RoundTripTime' = 'roundTripTime',
  'AudioLevel' = 'audioLevel',
  'Jitter' = 'jitter',
  'BytesReceived' = 'bytesReceived',
  'Mos' = 'mos',
  'TransportId' = 'transportId',
  'LocalCandidateId' = 'localCandidateId',
  'RemoteCandidateId' = 'remoteCandidateId',
  'State' = 'state',
  'LocalCandidateIp' = 'localCandidateIp',
  'RemoteCandidateIp' = 'remoteCandidateIp',
  'Nominated' = 'nominated',
  'Writeable' = 'writeable',
  'Readable' = 'readable',
  'TotalRoundTripTime' = 'totalRoundTripTime',
  'CurrentRoundTripTime' = 'currentRoundTripTime',
  'AvailableOutgoingBitrate' = 'availableOutgoingBitrate',
  'AvailableIncomingBitrate' = 'availableIncomingBitrate',
  'RequestsReceived' = 'requestsReceived',
  'RequestsSent' = 'requestsSent',
  'ResponsesReceived' = 'responsesReceived',
  'ResponsesSent' = 'responsesSent',
  'RetransmissionsReceived' = 'retransmissionsReceived',
  'RetransmissionsSent' = 'retransmissionsSent',
  'ConsentRequestsReceived' = 'consentRequestsReceived',
  'ConsentRequestsSent' = 'consentRequestsSent',
  'ConsentResponsesReceived' = 'consentResponsesReceived',
  'ConsentResponsesSent' = 'consentResponsesSent',
  'ActiveCandidatePair' = 'activeCandidatePair',
  'RelayProtocol' = 'relayProtocol',
  'IsRemote' = 'isRemote',
  'Ip' = 'ip',
  'Port' = 'port',
  'Protocol' = 'protocol',
  'CandidateType' = 'candidateType',
  'Priority' = 'priority',
  'Url' = 'url',
  'Deleted' = 'deleted',
  'PacketsReceived' = 'packetsReceived',

  // IceCandidatePairState
  'StateFailed' = 'stateFailed',
  'StateFrozen' = 'stateFrozen',
  'StateInProgress' = 'stateInProgress',
  'StateSucceeded' = 'stateSucceeded',
  'StateWaiting' = 'stateWaiting',
  'StateUnknown' = 'stateUnknown',

  // iOS CallKit configuration
  'CallKitMaximumCallsPerCallGroup' = 'callKitMaximumCallsPerCallGroup',
  'CallKitMaximumCallGroups' = 'callKitMaximumCallGroups',
  'CallKitIncludesCallsInRecents' = 'callKitIncludesCallsInRecents',
  'CallKitSupportedHandleTypes' = 'callKitSupportedHandleTypes',
  'CallKitIconTemplateImageData' = 'callKitIconTemplateImageData',
  'CallKitRingtoneSound' = 'callKitRingtoneSound',
}
