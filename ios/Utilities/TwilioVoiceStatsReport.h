//
//  TwilioVoiceStatsReport.h
//  TwilioVoiceReactNative
//
//  Copyright © 2022 Twilio, Inc. All rights reserved.
//

@import TwilioVoice;

@interface TwilioVoiceStatsReport : NSObject

+ (NSDictionary *)jsonWithStatsReport:(TVOStatsReport *)statsReport;
+ (NSDictionary *)jsonWithLocalAudioTrackStats:(TVOLocalAudioTrackStats *)audioTrackStats;
+ (NSDictionary *)jsonWithRemoteAudioTrackStats:(TVORemoteAudioTrackStats *)audioTrackStats;
+ (NSDictionary *)jsonWithIceCandidateStats:(TVOIceCandidateStats *)iceCandidateStats;
+ (NSDictionary *)jsonWithIceCandidatePairStats:(TVOIceCandidatePairStats *)iceCandidatePairStats;

@end


@implementation TwilioVoiceStatsReport

+ (NSDictionary *)jsonWithStatsReport:(TVOStatsReport *)statsReport {
    return @{
        @"peerConnectionId": statsReport.peerConnectionId,
        @"localAudioTrackStats": [self jsonWithLocalAudioTrackStats:statsReport.localAudioTrackStats[0]],
        @"remoteAudioTrackStats": [self jsonWithRemoteAudioTrackStats:statsReport.remoteAudioTrackStats[0]],
        @"iceCandidateStats": [self jsonWithIceCandidateStats:statsReport.iceCandidateStats[0]],
        @"iceCandidatePairStats": [self jsonWithIceCandidatePairStats:statsReport.iceCandidatePairStats[0]]
    };
}

+ (NSDictionary *)jsonWithLocalAudioTrackStats:(TVOLocalAudioTrackStats *)audioTrackStats {
    return @{
        // Base track stats
        @"codec": audioTrackStats.codec,
        @"packetsLost": @(audioTrackStats.packetsLost),
        @"ssrc": audioTrackStats.ssrc,
        @"timestamp": @(audioTrackStats.timestamp),
        @"trackId": audioTrackStats.trackId,
        
        // Local track stats
        @"bytesSent": @(audioTrackStats.bytesSent),
        @"packetsSent": @(audioTrackStats.packetsSent),
        @"roundTripTime": @(audioTrackStats.roundTripTime),
        
        // Local audio track stats
        @"audioLevel": @(audioTrackStats.audioLevel),
        @"jitter": @(audioTrackStats.jitter)
    };
}

+ (NSDictionary *)jsonWithRemoteAudioTrackStats:(TVORemoteAudioTrackStats *)audioTrackStats {
    return @{
        // Base track stats
        @"codec": audioTrackStats.codec,
        @"packetsLost": @(audioTrackStats.packetsLost),
        @"ssrc": audioTrackStats.ssrc,
        @"timestamp": @(audioTrackStats.timestamp),
        @"trackId": audioTrackStats.trackId,
        
        // Remote track stats
        @"bytesRecieved": @(audioTrackStats.bytesReceived),
        @"packetsReceived": @(audioTrackStats.packetsReceived),
        
        // Remote audio track stats
        @"audioLevel": @(audioTrackStats.audioLevel),
        @"jitter": @(audioTrackStats.jitter),
        @"mos": @(audioTrackStats.mos)
    };
}

+ (NSDictionary *)jsonWithIceCandidateStats:(TVOIceCandidateStats *)iceCandidateStats {
    return @{
        @"candidateType": iceCandidateStats.candidateType,
        @"deleted": @(iceCandidateStats.deleted),
        @"ip": iceCandidateStats.ip,
        @"isRemote": @(iceCandidateStats.isRemote),
        @"port": @(iceCandidateStats.port),
        @"priority": @(iceCandidateStats.priority),
        @"protocol": iceCandidateStats.protocol,
        @"transportId": iceCandidateStats.transportId,
        @"url": iceCandidateStats.url
    };
}

+ (NSDictionary *)jsonWithIceCandidatePairStats:(TVOIceCandidatePairStats *)iceCandidatePairStats {
    return @{
        @"activeCandidatePair": @(iceCandidatePairStats.activeCandidatePair),
        @"availableIncomingBitrate": @(iceCandidatePairStats.availableIncomingBitrate),
        @"availableOutgoingBitrate": @(iceCandidatePairStats.availableOutgoingBitrate),
        @"bytesReceived": @(iceCandidatePairStats.bytesReceived),
        @"bytesSent": @(iceCandidatePairStats.bytesSent),
        @"consentRequestsReceived": @(iceCandidatePairStats.consentRequestsReceived),
        @"consentRequestsSent": @(iceCandidatePairStats.consentRequestsSent),
        @"consentResponsesReceived": @(iceCandidatePairStats.consentResponsesReceived),
        @"consentResponsesSent": @(iceCandidatePairStats.consentResponsesSent),
        @"currentRoundTripTime": @(iceCandidatePairStats.currentRoundTripTime),
        @"localCandidateId": iceCandidatePairStats.localCandidateId,
        @"localCandidateIp": iceCandidatePairStats.localCandidateIp,
        @"nominated": @(iceCandidatePairStats.nominated),
        @"priority": @(iceCandidatePairStats.priority),
        @"readable": @(iceCandidatePairStats.readable),
        @"relayProtocol": iceCandidatePairStats.relayProtocol,
        @"remoteCandidateId": iceCandidatePairStats.remoteCandidateId,
        @"remoteCandidateIp": iceCandidatePairStats.remoteCandidateIp,
        @"requestsReceieved": @(iceCandidatePairStats.requestsReceived),
        @"requestsSent": @(iceCandidatePairStats.requestsSent),
        @"responsesRecieved": @(iceCandidatePairStats.responsesReceived),
        @"responsesSent": @(iceCandidatePairStats.responsesSent),
        @"retransmissionsReceived": @(iceCandidatePairStats.retransmissionsReceived),
        @"retransmissionsSent": @(iceCandidatePairStats.retransmissionsSent),
        @"state": [self stringWithIceCandidatePairState:iceCandidatePairStats.state],
        @"totalRoundTripTime": @(iceCandidatePairStats.totalRoundTripTime),
        @"transportId": iceCandidatePairStats.transportId,
        @"writeable": @(iceCandidatePairStats.writable)
    };
}

+ (NSString *)stringWithIceCandidatePairState:(TVOIceCandidatePairState)state {
    switch (state) {
        case TVOIceCandidatePairStateFailed:
            return @"STATE_FAILED";
        case TVOIceCandidatePairStateFrozen:
            return @"STATE_FROZEN";
        case TVOIceCandidatePairStateInProgress:
            return @"STATE_IN_PROGRESS";
        case TVOIceCandidatePairStateSucceeded:
            return @"STATE_SUCCEEDED";
        case TVOIceCandidatePairStateWaiting:
            return @"STATE_WAITING";
        case TVOIceCandidatePairStateCancelled:
            return @"STATE_CANCELLED";
        case TVOIceCandidatePairStateUnknown:
            return @"STATE_UNKNOWN";
        default:
            return @"STATE_UNKNOWN";
    }
}

@end
