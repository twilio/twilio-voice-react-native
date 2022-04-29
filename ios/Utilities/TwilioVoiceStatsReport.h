//
//  TwilioVoiceStatsReport.h
//  TwilioVoiceReactNative
//
//  Copyright © 2022 Twilio, Inc. All rights reserved.
//

@import TwilioVoice;

@interface TwilioVoiceStatsReport : NSObject

+ (NSArray *)jsonWithStatsReportsArray:(NSArray<TVOStatsReport *> *)statsReports;

+ (NSDictionary *)jsonWithStatsReport:(TVOStatsReport *)statsReport;
+ (NSArray *)jsonWithLocalAudioTrackStats:(NSArray<TVOLocalAudioTrackStats *> *)audioTrackStatsArray;
+ (NSArray *)jsonWithRemoteAudioTrackStats:(NSArray<TVORemoteAudioTrackStats *> *)audioTrackStatsArray;
+ (NSArray *)jsonWithIceCandidateStats:(NSArray<TVOIceCandidateStats *> *)iceCandidateStatsArray;
+ (NSArray *)jsonWithIceCandidatePairStats:(NSArray<TVOIceCandidatePairStats *> *)iceCandidatePairStatsArray;

@end


@implementation TwilioVoiceStatsReport

+ (NSArray *)jsonWithStatsReportsArray:(NSArray<TVOStatsReport *> *)statsReports {
    NSMutableArray *reportsArray = [NSMutableArray array];
    for (TVOStatsReport *report in statsReports) {
        [reportsArray addObject:[self jsonWithStatsReport:report]];
    }
    return reportsArray;
}

+ (NSDictionary *)jsonWithStatsReport:(TVOStatsReport *)statsReport {
    return @{
        @"peerConnectionId": statsReport.peerConnectionId,
        @"localAudioTrackStats": [self jsonWithLocalAudioTrackStats:statsReport.localAudioTrackStats],
        @"remoteAudioTrackStats": [self jsonWithRemoteAudioTrackStats:statsReport.remoteAudioTrackStats],
        @"iceCandidateStats": [self jsonWithIceCandidateStats:statsReport.iceCandidateStats],
        @"iceCandidatePairStats": [self jsonWithIceCandidatePairStats:statsReport.iceCandidatePairStats]
    };
}

+ (NSArray *)jsonWithLocalAudioTrackStats:(NSArray<TVOLocalAudioTrackStats *> *)audioTrackStatsArray {
    NSMutableArray *localAudioTrackStatsReport = [NSMutableArray array];
    
    for (TVOLocalAudioTrackStats *localAudioTrackStats in audioTrackStatsArray) {
        [localAudioTrackStatsReport addObject:@{
            // Base track stats
            @"codec": localAudioTrackStats.codec,
            @"packetsLost": @(localAudioTrackStats.packetsLost),
            @"ssrc": localAudioTrackStats.ssrc,
            @"timestamp": @(localAudioTrackStats.timestamp),
            @"trackId": localAudioTrackStats.trackId,
            
            // Local track stats
            @"bytesSent": @(localAudioTrackStats.bytesSent),
            @"packetsSent": @(localAudioTrackStats.packetsSent),
            @"roundTripTime": @(localAudioTrackStats.roundTripTime),
            
            // Local audio track stats
            @"audioLevel": @(localAudioTrackStats.audioLevel),
            @"jitter": @(localAudioTrackStats.jitter)
        }];
    }
    
    return localAudioTrackStatsReport;
}

+ (NSArray *)jsonWithRemoteAudioTrackStats:(NSArray<TVORemoteAudioTrackStats *> *)audioTrackStatsArray {
    NSMutableArray *remoteAudioTrackStatsReport = [NSMutableArray array];

    for (TVORemoteAudioTrackStats *remoteAudioTrackStats in audioTrackStatsArray) {
        [remoteAudioTrackStatsReport addObject:@{
            // Base track stats
            @"codec": remoteAudioTrackStats.codec,
            @"packetsLost": @(remoteAudioTrackStats.packetsLost),
            @"ssrc": remoteAudioTrackStats.ssrc,
            @"timestamp": @(remoteAudioTrackStats.timestamp),
            @"trackId": remoteAudioTrackStats.trackId,
            
            // Remote track stats
            @"bytesRecieved": @(remoteAudioTrackStats.bytesReceived),
            @"packetsReceived": @(remoteAudioTrackStats.packetsReceived),
            
            // Remote audio track stats
            @"audioLevel": @(remoteAudioTrackStats.audioLevel),
            @"jitter": @(remoteAudioTrackStats.jitter),
            @"mos": @(remoteAudioTrackStats.mos)
        }];
    }
    
    return remoteAudioTrackStatsReport;
}

+ (NSArray *)jsonWithIceCandidateStats:(NSArray<TVOIceCandidateStats *> *)iceCandidateStatsArray {
    NSMutableArray *iceCandidateStatsReport = [NSMutableArray array];
    
    for (TVOIceCandidateStats *iceCandidateStats in iceCandidateStatsArray) {
        [iceCandidateStatsReport addObject:@{
            @"candidateType": iceCandidateStats.candidateType,
            @"deleted": @(iceCandidateStats.deleted),
            @"ip": iceCandidateStats.ip,
            @"isRemote": @(iceCandidateStats.isRemote),
            @"port": @(iceCandidateStats.port),
            @"priority": @(iceCandidateStats.priority),
            @"protocol": iceCandidateStats.protocol,
            @"transportId": iceCandidateStats.transportId,
            @"url": iceCandidateStats.url
        }];
    }

    return iceCandidateStatsReport;
}

+ (NSArray *)jsonWithIceCandidatePairStats:(NSArray<TVOIceCandidatePairStats *> *)iceCandidatePairStatsArray {
    NSMutableArray *iceCandidatePairStatsReport = [NSMutableArray array];
    
    for (TVOIceCandidatePairStats *iceCandidatePairStats in iceCandidatePairStatsArray) {
        [iceCandidatePairStatsReport addObject:@{
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
        }];
    }

    return iceCandidatePairStatsReport;
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
        case TVOIceCandidatePairStateUnknown:
            return @"STATE_UNKNOWN";
        default:
            return @"STATE_UNKNOWN";
    }
}

@end
