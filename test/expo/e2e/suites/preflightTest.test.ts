import { device, element, by } from 'detox';
import { expect as jestExpect } from 'expect';
import { pollValidateLog, getRegExpMatch } from '../common/logParser';
import type { PreflightTest } from '../../../../src/PreflightTest';

const expectNonEmptyString = (str: any) => {
  jestExpect(typeof str).toEqual('string');
  jestExpect(str.length > 0).toEqual(true);
};

const expectIceCandidateStats = (stats: any) => {
  expectNonEmptyString(stats.candidateType);
  jestExpect(typeof stats.deleted).toEqual('boolean');
  expectNonEmptyString(stats.ip);
  jestExpect(typeof stats.networkCost).toEqual('number');
  jestExpect(typeof stats.networkId).toEqual('number');
  expectNonEmptyString(stats.networkType);
  jestExpect(typeof stats.port).toEqual('number');
  jestExpect(typeof stats.priority).toEqual('number');
  expectNonEmptyString(stats.protocol);
  jestExpect(typeof stats.relatedAddress).toEqual('string');
  jestExpect(typeof stats.relatedPort).toEqual('number');
  jestExpect(typeof stats.tcpType).toEqual('string');
  expectNonEmptyString(stats.transportId);
  jestExpect(typeof stats.url).toEqual('string');
};

const expectTimeMeasurement = (timing: PreflightTest.TimeMeasurement) => {
  jestExpect(typeof timing).toEqual('object');
  jestExpect(typeof timing.duration).toEqual('number');
  jestExpect(typeof timing.end).toEqual('number');
  jestExpect(typeof timing.start).toEqual('number');
};

const expectSample = (sample: PreflightTest.RTCSample) => {
  jestExpect(typeof sample.audioInputLevel).toEqual('number');
  jestExpect(typeof sample.audioOutputLevel).toEqual('number');
  jestExpect(typeof sample.bytesReceived).toEqual('number');
  jestExpect(typeof sample.bytesSent).toEqual('number');
  jestExpect(typeof sample.codec).toEqual('string');
  jestExpect(typeof sample.jitter).toEqual('number');
  jestExpect(typeof sample.mos).toEqual('number');
  jestExpect(typeof sample.packetsLost).toEqual('number');
  jestExpect(typeof sample.packetsLostFraction).toEqual('number');
  jestExpect(typeof sample.packetsReceived).toEqual('number');
  jestExpect(typeof sample.rtt).toEqual('number');
  jestExpect(typeof sample.timestamp).toEqual('number');
};

const expectStats = (stats: PreflightTest.Stats) => {
  jestExpect(typeof stats).toEqual('object');
  jestExpect(typeof stats.average).toEqual('number');
  jestExpect(typeof stats.max).toEqual('number');
  jestExpect(typeof stats.min).toEqual('number');
};

const expectWarning = (warning: PreflightTest.Warning) => {
  jestExpect(typeof warning).toEqual('object');
  expectNonEmptyString(warning.name);
  expectNonEmptyString(warning.threshold);
  jestExpect(typeof warning.timestamp).toEqual('number');
  expectNonEmptyString(warning.values);
};

const expectWarningCleared = (warningCleared: PreflightTest.WarningCleared) => {
  jestExpect(typeof warningCleared).toEqual('object');
  expectNonEmptyString(warningCleared.name);
  jestExpect(typeof warningCleared.timestamp).toEqual('number');
};

const expectCallQuality = (callQuality: PreflightTest.CallQuality) => {
  jestExpect(
    (['degraded', 'excellent', 'fair', 'good', 'great'] as any)
      .includes(callQuality)
  ).toEqual(true);
};

const expectReport = (report: any) => {
  expectCallQuality(report.callQuality);

  jestExpect(typeof report.callSid).toEqual('string');
  jestExpect(report.callSid.match(/^CA.*$/)).toBeTruthy();

  expectNonEmptyString(report.edge);

  jestExpect(Array.isArray(report.iceCandidateStats)).toEqual(true);
  jestExpect(report.iceCandidateStats.length > 0).toEqual(true);
  for (const iceCandidate of report.iceCandidateStats) {
    expectIceCandidateStats(iceCandidate);
  }

  jestExpect(typeof report.isTurnRequired).toEqual('boolean');

  expectTimeMeasurement(report.networkTiming.ice);
  expectTimeMeasurement(report.networkTiming.peerConnection);
  expectTimeMeasurement(report.networkTiming.signaling);

  jestExpect(Array.isArray(report.samples)).toEqual(true);
  jestExpect(report.samples.length > 0).toEqual(true);
  for (const sample of report.samples) {
    expectSample(sample);
  }

  expectNonEmptyString(report.selectedEdge);

  jestExpect(typeof report.selectedIceCandidatePairStats).toEqual('object');
  expectIceCandidateStats(report.selectedIceCandidatePairStats.localCandidate);
  expectIceCandidateStats(report.selectedIceCandidatePairStats.remoteCandidate);

  jestExpect(typeof report.stats).toEqual('object');
  expectStats(report.stats.jitter);
  expectStats(report.stats.mos);
  expectStats(report.stats.rtt);

  expectTimeMeasurement(report.testTiming);

  jestExpect(Array.isArray(report.warnings)).toEqual(true);
  for (const warning of report.warnings) {
    expectWarning(warning);
  }

  jestExpect(Array.isArray(report.warningsCleared)).toEqual(true);
  for (const warningCleared of report.warningsCleared) {
    expectWarningCleared(warningCleared);
  }
};

const emptyRtcStats = {
  candidateType: '',
  deleted: false,
  ip: '',
  isRemote: false,
  networkCost: 0,
  networkId: 0,
  networkType: '',
  port: 0,
  priority: 0,
  protocol: '',
  relatedAddress: '',
  relatedPort: 0,
  tcpType: '',
  transportId: '',
  url: '',
};

const emptyStats = {
  average: 0,
  max: 0,
  min: 0,
};

const emptyTimeMeasurement = {
  duration: 0,
  end: 0,
  start: 0,
};

const emptyReport = {
  callSid: '',
  callQuality: null,
  edge: '',
  iceCandidateStats: [],
  isTurnRequired: null,
  stats: {
    jitter: emptyStats,
    mos: emptyStats,
    rtt: emptyStats,
  },
  networkTiming: {
    signaling: emptyTimeMeasurement,
    peerConnection: emptyTimeMeasurement,
    ice: emptyTimeMeasurement,
  },
  testTiming: emptyTimeMeasurement,
  samples: [],
  selectedEdge: '',
  selectedIceCandidatePairStats: {
    localCandidate: emptyRtcStats,
    remoteCandidate: emptyRtcStats,
  },
  warnings: [],
  warningsCleared: [],
};

const emptySample = {
  audioInputLevel: 0,
  audioOutputLevel: 0,
  bytesReceived: 0,
  bytesSent: 0,
  codec: '',
  jitter: 0,
  mos: 0,
  packetsLost: 0,
  packetsLostFraction: 0,
  packetsReceived: 0,
  packetsSent: 0,
  rtt: 0,
  timestamp: 0,
};

describe('preflightTest', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  if (device.getPlatform() === 'ios') {
    it('should pass the dummy test', () => {
      // by default jest does not pass a test suite if there are no tests
    });
  }

  if (device.getPlatform() === 'android') {
    describe('events', () => {
      describe('successful flow', () => {
        beforeAll(async () => {
          await device.reloadReactNative();
          await element(by.text('PREFLIGHT TEST SUITE')).tap();
          await element(by.text('TOGGLE LOG FORMAT')).tap();

          await element(by.text('START PREFLIGHT')).tap();

          const didConnect = await pollValidateLog((logs) => logs.some((log) =>
            Boolean(log.content.match(/^preflight test connected/))
          ));
          jestExpect(didConnect).toEqual(true);

          await element(by.text('GETSTATE')).tap();

          const didComplete = await pollValidateLog((logs) => logs.some((log) =>
            Boolean(log.content.match(/^preflight test completed/))
          ));

          jestExpect(didComplete).toEqual(true);
        });

        it('should have received the connected event first', async () => {
          const didReceiveConnectedEventFirst = await pollValidateLog((logs) => {
            if (logs.length === 0) { return false; }

            const { content } = logs[0];
            const m = content.match(/^preflight test connected$/);
            if (m === null) { return false; }

            return true;
          });

          jestExpect(didReceiveConnectedEventFirst).toEqual(true);
        });

        it('should have received connected when invoking getState', async () => {
          const isStateConnected = await pollValidateLog((logs) => {
            const getStateLogs = logs.reduce((reduction, { content }) => {
              const m = content.match(/^preflight test getState "(.*)"$/);
              if (m) {
                return [...reduction, m];
              } else {
                return reduction;
              }
            }, [] as RegExpMatchArray[]);

            if (getStateLogs.length !== 1) { return false; }

            const getStateLog = getStateLogs[0];
            const state = getStateLog[1];
            if (state !== 'connected') { return false; }

            return true;
          });

          jestExpect(isStateConnected).toEqual(true);
        });

        it('should have received samples', async () => {
          const wasSampleReceieved = await pollValidateLog((logs) => {
            const sampleEvents =
              logs.filter((log) => log.content.match(/^preflight test sample/));

            for (const sampleEvent of sampleEvents) {
              const sampleRegExp = /^preflight test sample "(.*)"$/;

              const sampleMatch = sampleEvent.content.match(sampleRegExp);
              jestExpect(sampleMatch).not.toEqual(null);

              const sampleStr = sampleMatch![1];
              expectNonEmptyString(sampleStr);

              const sample = JSON.parse(sampleStr!);
              expectSample(sample);
            }

            return true;
          });

          jestExpect(wasSampleReceieved).toEqual(true);
        });

        it('should have received quality warnings', async () => {
          const wasQualityWarningsReceived = await pollValidateLog((logs) => {
            const qualityWarningEvents =
              logs.filter((log) => log.content.match(/^preflight test quality warnings/));

            for (const qualityWarningEvent of qualityWarningEvents) {
              const qualityWarningRegExp = /^preflight test quality warnings "(.*)"$/;

              const qualityWarningMatch = qualityWarningEvent.content.match(qualityWarningRegExp);
              jestExpect(qualityWarningMatch).not.toEqual(null);

              const qualityWarningStr = qualityWarningMatch![1];
              expectNonEmptyString(qualityWarningStr);

              const { currentWarnings, previousWarnings } = JSON.parse(qualityWarningStr!);
              jestExpect(Array.isArray(currentWarnings)).toEqual(true);
              jestExpect(Array.isArray(previousWarnings)).toEqual(true);

              currentWarnings.forEach(expectNonEmptyString);
              previousWarnings.forEach(expectNonEmptyString);
            }

            return true;
          });

          jestExpect(wasQualityWarningsReceived).toEqual(true);
        });

        it('should have received the completed event last', async () => {
          const didReceiveCompletedEventLast = await pollValidateLog((logs) => {
            if (logs.length === 0) { return false; }

            const { content } = logs[logs.length - 1];
            const m = content.match(/^preflight test completed/);
            if (m === null) { return false; }

            return true;
          });

          jestExpect(didReceiveCompletedEventLast).toEqual(true);
        });
      });

      describe('failure flow', () => {
        beforeEach(async () => {
          await device.reloadReactNative();
          await element(by.text('PREFLIGHT TEST SUITE')).tap();
          await element(by.text('TOGGLE LOG FORMAT')).tap();
        });

        it('should disconnect an ongoing preflightTest and get a failure error', async () => {
          await element(by.text('START PREFLIGHT')).tap();

          await new Promise((r) => setTimeout(r, 5000));

          const connectedEventRegExp = /^(preflight test connected)$/;
          const connectedEvent = await getRegExpMatch(connectedEventRegExp);
          jestExpect(connectedEvent).toEqual('preflight test connected');

          await element(by.text('STOP PREFLIGHT')).tap();

          const stoppedEventRegExp = /^(preflight test stopped)$/;
          const stoppedEvent = await getRegExpMatch(stoppedEventRegExp);
          jestExpect(stoppedEvent).toEqual('preflight test stopped');

          const failedEventRegExp = /^preflight test failed "(.*)"$/;
          const failedEvent = await getRegExpMatch(failedEventRegExp);
          jestExpect(typeof failedEvent).toEqual('string');

          const failureError = JSON.parse(failedEvent!);
          jestExpect(failureError).toEqual({
            causes: [
              'The incoming call was cancelled because it was not answered in ' +
                'time or it was accepted/rejected by another application ' +
                'instance registered with the same identity.',
            ],
            description: 'Call cancelled',
            explanation: 'Unable to answer because the call has ended',
            solutions: [],
            code: 31008,
            name: 'CallCancelledError',
          });
        });

        it('should fail if trying to start a preflight test with an invalid token', async () => {
          await element(by.text('INVALID PREFLIGHT')).tap();

          await pollValidateLog((logs) => {
            if (logs.length === 0) { return false; }

            for (const { content } of logs) {
              const match = content.match(/^preflight test failed "(.*)"$/);
              jestExpect(match).not.toBeNull();

              const group = match![1];
              expectNonEmptyString(group);

              const failureError = JSON.parse(group!);
              jestExpect(failureError).toEqual({
                causes: [],
                description: 'Invalid access token',
                explanation: 'Twilio was unable to validate your Access Token',
                solutions: [],
                code: 20101,
                name: 'AccessTokenInvalid',
              });
            }

            return true;
          });
        });

        it('should fail if trying to start multiple preflightTests', async () => {
          await element(by.text('START PREFLIGHT')).tap();

          await new Promise((r) => setTimeout(r, 5000));

          const connectedEventRegExp = /^(preflight test connected)$/;
          const connectedEvent = await getRegExpMatch(connectedEventRegExp);
          jestExpect(connectedEvent).toEqual('preflight test connected');

          await element(by.text('START PREFLIGHT')).tap();

          const errorEventRegExp = /^preflight test error "(.*)"$/;
          const errorEventStr = await getRegExpMatch(errorEventRegExp);
          jestExpect(typeof errorEventStr).toEqual('string');

          const { error, message } = JSON.parse(errorEventStr!);
          jestExpect(error).toEqual({
            causes: [],
            description: 'Invalid state error.',
            explanation: 'The SDK has entered an invalid state.',
            solutions: [],
            name: 'InvalidStateError',
          });
          jestExpect(message).toEqual(
            'Cannot start a PreflightTest while one exists in-progress.'
          );

          await element(by.text('STOP PREFLIGHT')).tap();

          await new Promise((r) => setTimeout(r, 5000));
        });
      });
    });

    describe('public methods', () => {
      describe('stopped preflightTest', () => {
        let startTime: number;
        let endTime: number;

        beforeAll(async () => {
          await device.reloadReactNative();
          await element(by.text('PREFLIGHT TEST SUITE')).tap();
          await element(by.text('TOGGLE LOG FORMAT')).tap();

          startTime = Date.now();

          await element(by.text('START PREFLIGHT')).tap();

          await new Promise((r) => setTimeout(r, 5000));

          const connectedEventRegExp = /^(preflight test connected)$/;
          const connectedEvent = await getRegExpMatch(connectedEventRegExp);
          jestExpect(connectedEvent).toEqual('preflight test connected');

          endTime = Date.now();

          await element(by.text('STOP PREFLIGHT')).tap();

          const stoppedEventRegExp = /^(preflight test stopped)$/;
          const stoppedEvent = await getRegExpMatch(stoppedEventRegExp);
          jestExpect(stoppedEvent).toEqual('preflight test stopped');

          const failedEventRegExp = /^preflight test failed "(.*)"$/;
          const failedEvent = await getRegExpMatch(failedEventRegExp);
          jestExpect(typeof failedEvent).toEqual('string');
        });

        it('should get a failed state', async () => {
          await element(by.text('GETSTATE')).tap();

          const isStateFailed = await pollValidateLog((logs) => {
            const getStateLogs = logs.reduce((reduction, { content }) => {
              const m = content.match(/^preflight test getState "(.*)"$/);
              if (m) {
                return [...reduction, m];
              } else {
                return reduction;
              }
            }, [] as RegExpMatchArray[]);

            if (getStateLogs.length !== 1) {
              return false;
            }

            const getStateLog = getStateLogs[0];
            const state = getStateLog[1];
            if (state !== 'failed') {
              return false;
            }

            return true;
          });

          jestExpect(isStateFailed).toEqual(true);
        });

        it('should get a valid sample', async () => {
          await element(by.text('GETLATESTSAMPLE')).tap();

          const getSampleRegExp = /^preflight test getLatestSample "(.*)"$/;
          const getSampleStr = await getRegExpMatch(getSampleRegExp);
          jestExpect(typeof getSampleStr).toEqual('string');

          const sample = JSON.parse(getSampleStr!);
          expectSample(sample);
        });

        it('should get an empty report', async () => {
          await element(by.text('GETREPORT')).tap();

          const getReportRegExp = /^preflight test getReport "(.*)"$/;
          const getReportStr = await getRegExpMatch(getReportRegExp);
          jestExpect(typeof getReportStr).toEqual('string');

          const report = JSON.parse(getReportStr!);
          jestExpect(report).toEqual(emptyReport);
        });

        it('should get a valid start time', async () => {
          await element(by.text('GETSTARTTIME')).tap();

          const getStartTimeRegExp = /^preflight test getStartTime "(.*)"$/;
          const getStartTimeStr = await getRegExpMatch(getStartTimeRegExp);
          jestExpect(typeof getStartTimeStr).toEqual('string');

          const getStartTime = Number(getStartTimeStr);
          jestExpect(getStartTime).not.toBeNaN();

          const timeGap = Math.abs(startTime - getStartTime);
          jestExpect(timeGap).toBeGreaterThan(0);
          jestExpect(timeGap).toBeLessThan(10000);
        });

        it('should get a valid end time', async () => {
          await element(by.text('GETENDTIME')).tap();

          const getEndTimeRegExp = /^preflight test getEndTime "(.*)"$/;
          const getEndTimeStr = await getRegExpMatch(getEndTimeRegExp);
          jestExpect(typeof getEndTimeStr).toEqual('string');

          const getEndTime = Number(getEndTimeStr);
          jestExpect(getEndTime).not.toBeNaN();

          const timeGap = Math.abs(endTime - getEndTime);
          jestExpect(timeGap).toBeGreaterThan(0);
          jestExpect(timeGap).toBeLessThan(10000);
        });

        it('should get a valid callsid', async () => {
          await element(by.text('GETCALLSID')).tap();

          const getCallSidRegExp = /^preflight test getCallSid "(CA.*)"$/;
          const getCallSid = await getRegExpMatch(getCallSidRegExp);
          expectNonEmptyString(getCallSid);
        });
      });

      describe('invalid token preflightTest', () => {
        let startTime: number;

        beforeAll(async () => {
          await device.reloadReactNative();
          await element(by.text('PREFLIGHT TEST SUITE')).tap();
          await element(by.text('TOGGLE LOG FORMAT')).tap();

          startTime = Date.now();

          await element(by.text('INVALID PREFLIGHT')).tap();

          await new Promise((r) => setTimeout(r, 5000));

          const failedEventRegExp = /^preflight test failed "(.*)"$/;
          const failedEvent = await getRegExpMatch(failedEventRegExp);
          jestExpect(typeof failedEvent).toEqual('string');
        });

        it('should get a failed state', async () => {
          await element(by.text('GETSTATE')).tap();

          const isStateFailed = await pollValidateLog((logs) => {
            const getStateLogs = logs.reduce((reduction, { content }) => {
              const m = content.match(/^preflight test getState "(.*)"$/);
              if (m) {
                return [...reduction, m];
              } else {
                return reduction;
              }
            }, [] as RegExpMatchArray[]);

            if (getStateLogs.length !== 1) {
              return false;
            }

            const getStateLog = getStateLogs[0];
            const state = getStateLog[1];
            if (state !== 'failed') {
              return false;
            }

            return true;
          });

          jestExpect(isStateFailed).toEqual(true);
        });

        it('should get a valid empty sample', async () => {
          await element(by.text('GETLATESTSAMPLE')).tap();

          const getSampleRegExp = /^preflight test getLatestSample "(.*)"$/;
          const getSampleStr = await getRegExpMatch(getSampleRegExp);
          jestExpect(typeof getSampleStr).toEqual('string');

          const sample = JSON.parse(getSampleStr!);
          jestExpect(sample).toEqual(emptySample);
        });

        it('should get an empty report', async () => {
          await element(by.text('GETREPORT')).tap();

          const getReportRegExp = /^preflight test getReport "(.*)"$/;
          const getReportStr = await getRegExpMatch(getReportRegExp);
          jestExpect(typeof getReportStr).toEqual('string');

          const report = JSON.parse(getReportStr!);
          jestExpect(report).toEqual(emptyReport);
        });

        it('should get a valid start time', async () => {
          await element(by.text('GETSTARTTIME')).tap();

          const getStartTimeRegExp = /^preflight test getStartTime "(.*)"$/;
          const getStartTimeStr = await getRegExpMatch(getStartTimeRegExp);
          jestExpect(typeof getStartTimeStr).toEqual('string');

          const getStartTime = Number(getStartTimeStr);
          jestExpect(getStartTime).not.toBeNaN();

          const timeGap = Math.abs(startTime - getStartTime);
          jestExpect(timeGap).toBeGreaterThan(0);
          jestExpect(timeGap).toBeLessThan(10000);
        });

        it('should get a zero end time', async () => {
          await element(by.text('GETENDTIME')).tap();

          const getEndTimeRegExp = /^preflight test getEndTime "(.*)"$/;
          const getEndTimeStr = await getRegExpMatch(getEndTimeRegExp);
          jestExpect(typeof getEndTimeStr).toEqual('string');

          const getEndTime = Number(getEndTimeStr);
          jestExpect(getEndTime).toEqual(0);
        });

        it('should get an empty callsid', async () => {
          await element(by.text('GETCALLSID')).tap();

          const getCallSidRegExp = /^preflight test getCallSid "(.*)"$/;
          const getCallSid = await getRegExpMatch(getCallSidRegExp);
          jestExpect(typeof getCallSid).toEqual('string');
          jestExpect(getCallSid).toHaveLength(0);
        });
      });

      describe('completed preflightTest', () => {
        let startTime: number;
        let endTime: number;

        beforeAll(async () => {
          await device.reloadReactNative();
          await element(by.text('PREFLIGHT TEST SUITE')).tap();
          await element(by.text('TOGGLE LOG FORMAT')).tap();

          startTime = Date.now();

          await element(by.text('START PREFLIGHT')).tap();

          await new Promise((r) => setTimeout(r, 5000));

          const connectedEventRegExp = /^(preflight test connected)$/;
          const connectedEvent = await getRegExpMatch(connectedEventRegExp);
          jestExpect(connectedEvent).toEqual('preflight test connected');

          const didComplete = await pollValidateLog((logs) => logs.some((log) =>
            Boolean(log.content.match(/^preflight test completed/))
          ));
          jestExpect(didComplete).toEqual(true);

          const completedEventRegExp = /^preflight test completed "(.*)"$/;
          const completedEvent = await getRegExpMatch(completedEventRegExp);
          jestExpect(typeof completedEvent).toEqual('string');

          endTime = Date.now();
        });

        it('should get a valid start time', async () => {
          await element(by.text('GETSTARTTIME')).tap();

          const getStartTimeRegExp = /^preflight test getStartTime "(.*)"$/;
          const getStartTimeStr = await getRegExpMatch(getStartTimeRegExp);
          jestExpect(typeof getStartTimeStr).toEqual('string');

          const getStartTime = Number(getStartTimeStr);
          jestExpect(getStartTime).not.toBeNaN();

          const timeGap = Math.abs(startTime - getStartTime);
          jestExpect(timeGap).toBeGreaterThan(0);
          jestExpect(timeGap).toBeLessThan(10000);
        });

        it('should get a valid end time', async () => {
          await element(by.text('GETENDTIME')).tap();

          const getEndTimeRegExp = /^preflight test getEndTime "(.*)"$/;
          const getEndTimeStr = await getRegExpMatch(getEndTimeRegExp);
          jestExpect(typeof getEndTimeStr).toEqual('string');

          const getEndTime = Number(getEndTimeStr);
          jestExpect(getEndTime).not.toBeNaN();

          const timeGap = Math.abs(endTime - getEndTime);
          jestExpect(timeGap).toBeGreaterThan(0);
          jestExpect(timeGap).toBeLessThan(10000);
        });

        it('should get a valid callsid', async () => {
          await element(by.text('GETCALLSID')).tap();

          const getCallSidRegExp = /^preflight test getCallSid "(CA.*)"$/;
          const getCallSid = await getRegExpMatch(getCallSidRegExp);
          expectNonEmptyString(getCallSid);
        });

        it('should get completed state', async () => {
          await element(by.text('GETSTATE')).tap();

          const getStateRegExp = /^preflight test getState "(.*)"$/;
          const getState = await getRegExpMatch(getStateRegExp);
          jestExpect(getState).toEqual('completed');
        });

        it('should get a valid sample', async () => {
          await element(by.text('GETLATESTSAMPLE')).tap();

          const getSampleRegExp = /^preflight test getLatestSample "(.*)"$/;
          const getSampleStr = await getRegExpMatch(getSampleRegExp);
          jestExpect(typeof getSampleStr).toEqual('string');

          const sample = JSON.parse(getSampleStr!);
          expectSample(sample);
        });

        it('should get a valid report', async () => {
          await element(by.text('GETREPORT')).tap();

          const getReportRegExp = /^preflight test getReport "(.*)"$/;
          const getReportStr = await getRegExpMatch(getReportRegExp);
          jestExpect(typeof getReportStr).toEqual('string');

          const report = JSON.parse(getReportStr!);
          expectReport(report);
        });
      });
    });
  }
});
