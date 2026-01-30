import { expect as jestExpect } from 'expect';

export class RecordValidator {
  private _record: Record<any, any>;
  private _validators: Array<Function> = [];
  private _validatedKeys: Array<string> = [];

  constructor(record: Record<any, any>) {
    this._record = record;
  }

  expect(
    key: string,
    expectedValueType: 'boolean' | 'number' | 'string' | 'object' | 'array'
  ) {
    this._validators.push(() => {
      const value = this._record[key];
      const actualValueType = typeof value;

      if (expectedValueType === 'array') {
        jestExpect(actualValueType).toStrictEqual('object');
        jestExpect(Array.isArray(value)).toStrictEqual(true);
      } else {
        jestExpect(actualValueType).toStrictEqual(expectedValueType);
      }

      this._validatedKeys.push(key);
    });

    return this;
  }

  exhaustive() {
    this.run();

    const validatedKeys = this._validatedKeys.sort();
    const allKeys = Object.keys(this._record).sort();

    jestExpect(validatedKeys).toStrictEqual(allKeys);
  }

  run() {
    this._validators.forEach((validator) => {
      validator();
    });
  }
}

const iceCandidatePairStatValidator = (iceCandidatePairStat: any) => {
  new RecordValidator(iceCandidatePairStat)
    .expect('writeable', 'boolean')
    .expect('transportId', 'string')
    .expect('state', 'string')
    .expect('responsesSent', 'number')
    .expect('responsesReceived', 'number')
    .expect('activeCandidatePair', 'boolean')
    .expect('requestsReceived', 'number')
    .expect('readable', 'boolean')
    .expect('remoteCandidateIp', 'string')
    .expect('localCandidateIp', 'string')
    .expect('totalRoundTripTime', 'number')
    .expect('bytesSent', 'number')
    .expect('remoteCandidateId', 'string')
    .expect('localCandidateId', 'string')
    .expect('currentRoundTripTime', 'number')
    .expect('retransmissionsReceived', 'number')
    .expect('priority', 'number')
    .expect('consentResponsesReceived', 'number')
    .expect('consentRequestsSent', 'number')
    .expect('nominated', 'boolean')
    .expect('retransmissionsSent', 'number')
    .expect('consentRequestsReceived', 'number')
    .expect('bytesReceived', 'number')
    .expect('consentResponsesSent', 'number')
    .expect('availableIncomingBitrate', 'number')
    .expect('availableOutgoingBitrate', 'number')
    .expect('requestsSent', 'number')
    .expect('relayProtocol', 'string')
    .exhaustive();
};

const remoteAudioTrackStatValidator = (remoteAudioTrackStat: any) => {
  new RecordValidator(remoteAudioTrackStat)
    .expect('jitter', 'number')
    .expect('audioLevel', 'number')
    .expect('packetsReceived', 'number')
    .expect('bytesReceived', 'number')
    .expect('timestamp', 'number')
    .expect('packetsLost', 'number')
    .expect('trackId', 'string')
    .expect('mos', 'number')
    .expect('ssrc', 'string')
    .expect('codec', 'string')
    .exhaustive();
};

const iceCandidateStatValidator = (iceCandidateStat: any) => {
  new RecordValidator(iceCandidateStat)
    .expect('url', 'string')
    .expect('transportId', 'string')
    .expect('priority', 'number')
    .expect('protocol', 'string')
    .expect('ip', 'string')
    .expect('candidateType', 'string')
    .expect('isRemote', 'boolean')
    .expect('deleted', 'boolean')
    .expect('port', 'number')
    .exhaustive();
};

const localAudioTrackStatValidator = (localAudioTrackStat: any) => {
  new RecordValidator(localAudioTrackStat)
    .expect('jitter', 'number')
    .expect('audioLevel', 'number')
    .expect('roundTripTime', 'number')
    .expect('bytesSent', 'number')
    .expect('timestamp', 'number')
    .expect('packetsLost', 'number')
    .expect('trackId', 'string')
    .expect('packetsSent', 'number')
    .expect('ssrc', 'string')
    .expect('codec', 'string')
    .exhaustive();
};

const rtcStatValidator = (rtcStat: any) => {
  new RecordValidator(rtcStat)
    .expect('iceCandidatePairStats', 'array')
    .expect('remoteAudioTrackStats', 'array')
    .expect('iceCandidateStats', 'array')
    .expect('localAudioTrackStats', 'array')
    .expect('peerConnectionId', 'string')
    .exhaustive();
};

export const validateRtcStats = (rtcStats: any) => {
  jestExpect(Array.isArray(rtcStats)).toBeTruthy();

  for (const rtcStat of rtcStats) {
    rtcStatValidator(rtcStat);

    const {
      iceCandidatePairStats,
      remoteAudioTrackStats,
      iceCandidateStats,
      localAudioTrackStats,
    } = rtcStat;

    iceCandidatePairStats.forEach((iceCandidatePairStatValidator));
    remoteAudioTrackStats.forEach(remoteAudioTrackStatValidator);
    iceCandidateStats.forEach(iceCandidateStatValidator);
    localAudioTrackStats.forEach(localAudioTrackStatValidator);
  }
};
