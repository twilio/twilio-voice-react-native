//
//  TwilioVoiceStatsReport.h
//  TwilioVoiceReactNative
//
//  Copyright © 2022 Twilio, Inc. All rights reserved.
//

@import TwilioVoice;

#import "TwilioVoiceReactNativeConstants.h"

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
        kTwilioVoiceReactNativePeerConnectionId: statsReport.peerConnectionId,
        kTwilioVoiceReactNativeLocalAudioTrackStats: [self jsonWithLocalAudioTrackStats:statsReport.localAudioTrackStats],
        kTwilioVoiceReactNativeRemoteAudioTrackStats: [self jsonWithRemoteAudioTrackStats:statsReport.remoteAudioTrackStats],
        kTwilioVoiceReactNativeIceCandidateStats: [self jsonWithIceCandidateStats:statsReport.iceCandidateStats],
        kTwilioVoiceReactNativeIceCandidatePairStats: [self jsonWithIceCandidatePairStats:statsReport.iceCandidatePairStats]
    };
}

+ (NSArray *)jsonWithLocalAudioTrackStats:(NSArray<TVOLocalAudioTrackStats *> *)audioTrackStatsArray {
    NSMutableArray *localAudioTrackStatsReport = [NSMutableArray array];
    
    for (TVOLocalAudioTrackStats *localAudioTrackStats in audioTrackStatsArray) {
        [localAudioTrackStatsReport addObject:@{
            // Base track stats
            kTwilioVoiceReactNativeCodec: localAudioTrackStats.codec,
            kTwilioVoiceReactNativePacketsLost: @(localAudioTrackStats.packetsLost),
            kTwilioVoiceReactNativeSsrc: localAudioTrackStats.ssrc,
            kTwilioVoiceReactNativeTimestamp: @(localAudioTrackStats.timestamp),
            kTwilioVoiceReactNativeTrackId: localAudioTrackStats.trackId,
            
            // Local track stats
            kTwilioVoiceReactNativeBytesSent: @(localAudioTrackStats.bytesSent),
            kTwilioVoiceReactNativePacketsSent: @(localAudioTrackStats.packetsSent),
            kTwilioVoiceReactNativeRoundTripTime: @(localAudioTrackStats.roundTripTime),
            
            // Local audio track stats
            kTwilioVoiceReactNativeAudioLevel: @(localAudioTrackStats.audioLevel),
            kTwilioVoiceReactNativeJitter: @(localAudioTrackStats.jitter)
        }];
    }
    
    return localAudioTrackStatsReport;
}

+ (NSArray *)jsonWithRemoteAudioTrackStats:(NSArray<TVORemoteAudioTrackStats *> *)audioTrackStatsArray {
    NSMutableArray *remoteAudioTrackStatsReport = [NSMutableArray array];

    for (TVORemoteAudioTrackStats *remoteAudioTrackStats in audioTrackStatsArray) {
        [remoteAudioTrackStatsReport addObject:@{
            // Base track stats
            kTwilioVoiceReactNativeCodec: remoteAudioTrackStats.codec,
            kTwilioVoiceReactNativePacketsLost: @(remoteAudioTrackStats.packetsLost),
            kTwilioVoiceReactNativeSsrc: remoteAudioTrackStats.ssrc,
            kTwilioVoiceReactNativeTimestamp: @(remoteAudioTrackStats.timestamp),
            kTwilioVoiceReactNativeTrackId: remoteAudioTrackStats.trackId,
            
            // Remote track stats
            kTwilioVoiceReactNativeBytesReceived: @(remoteAudioTrackStats.bytesReceived),
            kTwilioVoiceReactNativePacketsReceived: @(remoteAudioTrackStats.packetsReceived),
            
            // Remote audio track stats
            kTwilioVoiceReactNativeAudioLevel: @(remoteAudioTrackStats.audioLevel),
            kTwilioVoiceReactNativeJitter: @(remoteAudioTrackStats.jitter),
            kTwilioVoiceReactNativeMos: @(remoteAudioTrackStats.mos)
        }];
    }
    
    return remoteAudioTrackStatsReport;
}

+ (NSArray *)jsonWithIceCandidateStats:(NSArray<TVOIceCandidateStats *> *)iceCandidateStatsArray {
    NSMutableArray *iceCandidateStatsReport = [NSMutableArray array];
    
    for (TVOIceCandidateStats *iceCandidateStats in iceCandidateStatsArray) {
        [iceCandidateStatsReport addObject:@{
            kTwilioVoiceReactNativeCandidateType: iceCandidateStats.candidateType,
            kTwilioVoiceReactNativeDeleted: @(iceCandidateStats.deleted),
            kTwilioVoiceReactNativeIp: iceCandidateStats.ip,
            kTwilioVoiceReactNativeIsRemote: @(iceCandidateStats.isRemote),
            kTwilioVoiceReactNativePort: @(iceCandidateStats.port),
            kTwilioVoiceReactNativePriority: @(iceCandidateStats.priority),
            kTwilioVoiceReactNativeProtocol: iceCandidateStats.protocol,
            kTwilioVoiceReactNativeTransportId: iceCandidateStats.transportId,
            kTwilioVoiceReactNativeUrl: iceCandidateStats.url
        }];
    }

    return iceCandidateStatsReport;
}

+ (NSArray *)jsonWithIceCandidatePairStats:(NSArray<TVOIceCandidatePairStats *> *)iceCandidatePairStatsArray {
    NSMutableArray *iceCandidatePairStatsReport = [NSMutableArray array];
    
    for (TVOIceCandidatePairStats *iceCandidatePairStats in iceCandidatePairStatsArray) {
        [iceCandidatePairStatsReport addObject:@{
            kTwilioVoiceReactNativeActiveCandidatePair: @(iceCandidatePairStats.activeCandidatePair),
            kTwilioVoiceReactNativeAvailableIncomingBitrate: @(iceCandidatePairStats.availableIncomingBitrate),
            kTwilioVoiceReactNativeAvailableOutgoingBitrate: @(iceCandidatePairStats.availableOutgoingBitrate),
            kTwilioVoiceReactNativeBytesReceived: @(iceCandidatePairStats.bytesReceived),
            kTwilioVoiceReactNativeBytesSent: @(iceCandidatePairStats.bytesSent),
            kTwilioVoiceReactNativeConsentRequestsReceived: @(iceCandidatePairStats.consentRequestsReceived),
            kTwilioVoiceReactNativeConsentRequestsSent: @(iceCandidatePairStats.consentRequestsSent),
            kTwilioVoiceReactNativeConsentResponsesReceived: @(iceCandidatePairStats.consentResponsesReceived),
            kTwilioVoiceReactNativeConsentResponsesSent: @(iceCandidatePairStats.consentResponsesSent),
            kTwilioVoiceReactNativeCurrentRoundTripTime: @(iceCandidatePairStats.currentRoundTripTime),
            kTwilioVoiceReactNativeLocalCandidateId: iceCandidatePairStats.localCandidateId,
            kTwilioVoiceReactNativeLocalCandidateIp: iceCandidatePairStats.localCandidateIp,
            kTwilioVoiceReactNativeNominated: @(iceCandidatePairStats.nominated),
            kTwilioVoiceReactNativePriority: @(iceCandidatePairStats.priority),
            kTwilioVoiceReactNativeReadable: @(iceCandidatePairStats.readable),
            kTwilioVoiceReactNativeRelayProtocol: iceCandidatePairStats.relayProtocol,
            kTwilioVoiceReactNativeRemoteCandidateId: iceCandidatePairStats.remoteCandidateId,
            kTwilioVoiceReactNativeRemoteCandidateIp: iceCandidatePairStats.remoteCandidateIp,
            kTwilioVoiceReactNativeRequestsReceived: @(iceCandidatePairStats.requestsReceived),
            kTwilioVoiceReactNativeRequestsSent: @(iceCandidatePairStats.requestsSent),
            kTwilioVoiceReactNativeResponsesReceived: @(iceCandidatePairStats.responsesReceived),
            kTwilioVoiceReactNativeResponsesSent: @(iceCandidatePairStats.responsesSent),
            kTwilioVoiceReactNativeRetransmissionsReceived: @(iceCandidatePairStats.retransmissionsReceived),
            kTwilioVoiceReactNativeRetransmissionsSent: @(iceCandidatePairStats.retransmissionsSent),
            kTwilioVoiceReactNativeState: [self stringWithIceCandidatePairState:iceCandidatePairStats.state],
            kTwilioVoiceReactNativeTotalRoundTripTime: @(iceCandidatePairStats.totalRoundTripTime),
            kTwilioVoiceReactNativeTransportId: iceCandidatePairStats.transportId,
            kTwilioVoiceReactNativeWriteable: @(iceCandidatePairStats.writeable)
        }];
    }

    return iceCandidatePairStatsReport;
}

+ (NSString *)stringWithIceCandidatePairState:(TVOIceCandidatePairState)state {
    switch (state) {
        case TVOIceCandidatePairStateFailed:
            return kTwilioVoiceReactNativeStateFailed;
        case TVOIceCandidatePairStateFrozen:
            return kTwilioVoiceReactNativeStateFrozen;
        case TVOIceCandidatePairStateInProgress:
            return kTwilioVoiceReactNativeStateInProgress;
        case TVOIceCandidatePairStateSucceeded:
            return kTwilioVoiceReactNativeStateSucceeded;
        case TVOIceCandidatePairStateWaiting:
            return kTwilioVoiceReactNativeStateWaiting;
        case TVOIceCandidatePairStateUnknown:
            return kTwilioVoiceReactNativeStateUnknown;
        default:
            return kTwilioVoiceReactNativeStateUnknown;
    }
}

@end
