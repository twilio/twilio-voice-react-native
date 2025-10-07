/* eslint-disable dot-notation */
/* eslint-disable no-new */

import type * as CommonMock from '../__mocks__/common';
import { PreflightTest } from '../PreflightTest';
import * as Common from '../common';
import { Constants } from '../constants';
import { InvalidStateError } from '../error/InvalidStateError';
import { TwilioError } from '../error/TwilioError';
import {
  baseMockReport,
  expectedReport,
  makeMockNativePreflightEvent,
  mockSample,
  mockUuid,
} from '../__mock-data__/PreflightTest';

jest.mock('../common');

const MockNativeEventEmitter: CommonMock.MockNativeEventEmitter =
  Common.NativeEventEmitter as any;

beforeEach(() => {
  jest.clearAllMocks();
  MockNativeEventEmitter.reset();
});

describe('PreflightTest', () => {
  describe('constructor', () => {
    describe('android', () => {
      it('does not flush events', () => {
        jest
          .spyOn(Common.Platform, 'OS', 'get')
          .mockReturnValueOnce('android' as any);

        new PreflightTest(mockUuid);

        const mockCalls = jest.mocked(Common.setTimeout).mock.calls;
        expect(mockCalls).toHaveLength(0);
      });
    });

    describe('ios', () => {
      it('flushes events', () => {
        jest
          .spyOn(Common.Platform, 'OS', 'get')
          .mockReturnValueOnce('ios' as any);

        new PreflightTest(mockUuid);

        const mockCalls = jest.mocked(Common.setTimeout).mock.calls;
        expect(mockCalls).toHaveLength(1);

        const mockCall = mockCalls[0];
        expect(mockCall).toHaveLength(1);

        const flushFn = mockCall[0];
        expect(flushFn).toBeInstanceOf(Function);

        expect(
          Common.NativeModule.preflightTest_flushEvents
        ).toHaveBeenCalledTimes(0);

        flushFn();

        expect(
          Common.NativeModule.preflightTest_flushEvents
        ).toHaveBeenCalledTimes(1);
      });
    });

    describe('platform agnostic', () => {
      it('keeps the passed uuid', () => {
        const preflight = new PreflightTest(mockUuid);
        expect(preflight['_uuid']).toEqual(mockUuid);
      });

      it('binds an event listener for the preflightTest scope', () => {
        const preflight = new PreflightTest(mockUuid);

        const mockAddListenerCalls = jest.mocked(
          Common.NativeEventEmitter.addListener
        ).mock.calls;

        const [[scope, listener]] = mockAddListenerCalls;
        expect(scope).toStrictEqual(Constants.ScopePreflightTest);
        expect(listener).toBeInstanceOf(Function);

        expect(listener).toEqual(preflight['_handleNativeEvent']);
      });
    });
  });

  describe('private methods', () => {
    describe('_handleNativeEvent', () => {
      it('throws an error when passed an invalid event type', () => {
        new PreflightTest(mockUuid);

        expect(() => {
          MockNativeEventEmitter.emit(
            Constants.ScopePreflightTest,
            makeMockNativePreflightEvent('invalid')
          );
        }).toThrowError(InvalidStateError);
      });

      it('throws an error when passed an invalid event uuid', () => {
        new PreflightTest(mockUuid);

        expect(() => {
          MockNativeEventEmitter.emit(Constants.ScopePreflightTest, {
            [Constants.PreflightTestEventKeyUuid]: 100,
            [Constants.PreflightTestEventKeyType]:
              Constants.PreflightTestEventTypeValueConnected,
          });
        }).toThrowError(InvalidStateError);
      });

      it('does nothing if passed a different uuid', () => {
        const preflight = new PreflightTest(mockUuid);

        const handlers = [
          '_handleConnectedEvent',
          '_handleCompletedEvent',
          '_handleFailedEvent',
          '_handleQualityWarningEvent',
          '_handleSampleEvent',
        ];

        const spies = handlers.map((h) => jest.spyOn(preflight, h as any));

        MockNativeEventEmitter.emit(Constants.ScopePreflightTest, {
          [Constants.PreflightTestEventKeyUuid]: 'not the mock uuid',
          [Constants.PreflightTestEventKeyType]:
            Constants.PreflightTestEventTypeValueConnected,
        });

        const spyCalls = spies.map((s) => s.mock.calls);

        expect(spyCalls).toEqual([[], [], [], [], []]);
      });

      const privateHandlerTest = (
        privateHandlerMethodKey: any,
        eventType: any,
        expectation: any
      ) => {
        it(`invokes ${privateHandlerMethodKey} for event type ${eventType}`, () => {
          const preflight = new PreflightTest(mockUuid);
          const spy = jest
            .spyOn(preflight, privateHandlerMethodKey)
            .mockImplementation(() => {});

          MockNativeEventEmitter.emit(
            Constants.ScopePreflightTest,
            makeMockNativePreflightEvent(eventType)
          );

          expect(spy.mock.calls).toEqual(expectation);
        });
      };

      privateHandlerTest(
        '_handleConnectedEvent',
        Constants.PreflightTestEventTypeValueConnected,
        [[]]
      );

      privateHandlerTest(
        '_handleCompletedEvent',
        Constants.PreflightTestEventTypeValueCompleted,
        [
          [
            makeMockNativePreflightEvent(
              Constants.PreflightTestEventTypeValueCompleted
            ),
          ],
        ]
      );

      privateHandlerTest(
        '_handleFailedEvent',
        Constants.PreflightTestEventTypeValueFailed,
        [
          [
            makeMockNativePreflightEvent(
              Constants.PreflightTestEventTypeValueFailed
            ),
          ],
        ]
      );

      privateHandlerTest(
        '_handleQualityWarningEvent',
        Constants.PreflightTestEventTypeValueQualityWarning,
        [
          [
            makeMockNativePreflightEvent(
              Constants.PreflightTestEventTypeValueQualityWarning
            ),
          ],
        ]
      );

      privateHandlerTest(
        '_handleSampleEvent',
        Constants.PreflightTestEventTypeValueSample,
        [
          [
            makeMockNativePreflightEvent(
              Constants.PreflightTestEventTypeValueSample
            ),
          ],
        ]
      );
    });

    describe('_handleCompletedEvent', () => {
      it('throws for an invalid event', () => {
        const preflight = new PreflightTest(mockUuid);

        expect(() => {
          preflight['_handleCompletedEvent']({
            [Constants.PreflightTestCompletedEventKeyReport]: 100,
          } as any);
        }).toThrowError(InvalidStateError);
      });

      describe('android', () => {
        beforeEach(() => {
          jest.spyOn(Common.Platform, 'OS', 'get').mockReturnValue('android');
        });

        it('handles a valid event', async () => {
          const preflight = new PreflightTest(mockUuid);

          const reportPromise = new Promise((resolve) => {
            preflight.on(PreflightTest.Event.Completed, (...args: any[]) => {
              resolve(args);
            });
          });

          preflight['_handleCompletedEvent']({
            [Constants.PreflightTestCompletedEventKeyReport]: JSON.stringify({
              ...baseMockReport,
              callQuality: 'Excellent',
              isTurnRequired: false,
            }),
          } as any);

          const report = await reportPromise;

          expect(report).toEqual([expectedReport]);
        });
      });

      describe('ios', () => {
        beforeEach(() => {
          jest.spyOn(Common.Platform, 'OS', 'get').mockReturnValue('ios');
        });

        it('handles a valid event', async () => {
          const preflight = new PreflightTest(mockUuid);

          const reportPromise = new Promise((resolve) => {
            preflight.on(PreflightTest.Event.Completed, (...args: any[]) => {
              resolve(args);
            });
          });

          preflight['_handleCompletedEvent']({
            [Constants.PreflightTestCompletedEventKeyReport]: JSON.stringify({
              ...baseMockReport,
              callQuality: 0,
              isTurnRequired: 'false',
            }),
          } as any);

          const report = await reportPromise;

          expect(report).toEqual([expectedReport]);
        });
      });
    });

    describe('_handleConnectedEvent', () => {
      it('handles a valid event', async () => {
        expect.assertions(1);

        const preflight = new PreflightTest(mockUuid);

        const connectedPromise = new Promise<void>((resolve) => {
          preflight.on(PreflightTest.Event.Connected, (...args: any[]) => {
            expect(args).toEqual([]);
            resolve();
          });
        });

        preflight['_handleConnectedEvent']();

        await connectedPromise;
      });
    });

    describe('_handleFailedEvent', () => {
      it('handles an invalid code', () => {
        const preflight = new PreflightTest(mockUuid);

        expect(() => {
          preflight['_handleFailedEvent']({
            [Constants.PreflightTestFailedEventKeyError]: {
              [Constants.VoiceErrorKeyCode]: 'foo',
              [Constants.VoiceErrorKeyMessage]: 'bar',
            },
          } as any);
        }).toThrowError(InvalidStateError);
      });

      it('handles an invalid message', () => {
        const preflight = new PreflightTest(mockUuid);

        expect(() => {
          preflight['_handleFailedEvent']({
            [Constants.PreflightTestFailedEventKeyError]: {
              [Constants.VoiceErrorKeyMessage]: 100,
              [Constants.VoiceErrorKeyCode]: 100,
            },
          } as any);
        }).toThrowError(InvalidStateError);
      });

      it('handles a valid event', async () => {
        const preflight = new PreflightTest(mockUuid);

        const failedPromise = new Promise<any>((resolve) => {
          preflight.on(PreflightTest.Event.Failed, (...args: any[]) => {
            resolve(args);
          });
        });

        preflight['_handleFailedEvent']({
          [Constants.PreflightTestFailedEventKeyError]: {
            [Constants.VoiceErrorKeyMessage]: 'foobar',
            [Constants.VoiceErrorKeyCode]: 100,
          },
        } as any);

        const returnValues = await failedPromise;
        expect(returnValues).toHaveLength(1);

        const [error] = returnValues;
        expect(error).toBeInstanceOf(TwilioError);
      });
    });

    describe('_handleQualityWarningEvent', () => {
      it('handles a non-array currentWarnings', () => {
        const preflight = new PreflightTest(mockUuid);

        expect(() => {
          preflight['_handleQualityWarningEvent']({
            [Constants.PreflightTestQualityWarningEventKeyCurrentWarnings]:
              'foobar',
          } as any);
        }).toThrowError(InvalidStateError);
      });

      it('handles an invalid currentWarnings array', () => {
        const preflight = new PreflightTest(mockUuid);

        expect(() => {
          preflight['_handleQualityWarningEvent']({
            [Constants.PreflightTestQualityWarningEventKeyCurrentWarnings]: [
              10, 20, 30,
            ],
          } as any);
        }).toThrowError(InvalidStateError);
      });

      it('handles a non-array previousWarnings', () => {
        const preflight = new PreflightTest(mockUuid);

        expect(() => {
          preflight['_handleQualityWarningEvent']({
            [Constants.PreflightTestQualityWarningEventKeyCurrentWarnings]: [
              'foo',
              'bar',
            ],
            [Constants.PreflightTestQualityWarningEventKeyPreviousWarnings]:
              'foobar',
          } as any);
        }).toThrowError(InvalidStateError);
      });

      it('handles an invalid previousWarnings array', () => {
        const preflight = new PreflightTest(mockUuid);

        expect(() => {
          preflight['_handleQualityWarningEvent']({
            [Constants.PreflightTestQualityWarningEventKeyCurrentWarnings]: [
              'foo',
              'bar',
            ],
            [Constants.PreflightTestQualityWarningEventKeyPreviousWarnings]: [
              10, 20, 30,
            ],
          } as any);
        }).toThrowError(InvalidStateError);
      });

      it('handles a valid event', async () => {
        const preflight = new PreflightTest(mockUuid);

        const qualityWarningsPromise = new Promise<any>((resolve) => {
          preflight.on(PreflightTest.Event.QualityWarning, (...args: any[]) => {
            resolve(args);
          });
        });

        preflight['_handleQualityWarningEvent']({
          [Constants.PreflightTestQualityWarningEventKeyCurrentWarnings]: [
            'foo',
            'bar',
          ],
          [Constants.PreflightTestQualityWarningEventKeyPreviousWarnings]: [
            'biff',
            'bazz',
          ],
        } as any);

        const qualityWarnings = await qualityWarningsPromise;
        expect(qualityWarnings).toEqual([
          ['foo', 'bar'],
          ['biff', 'bazz'],
        ]);
      });
    });

    describe('_handleSampleEvent', () => {
      it('handles an invalid event', () => {
        const preflight = new PreflightTest(mockUuid);

        expect(() => {
          preflight['_handleSampleEvent']({
            [Constants.PreflightTestSampleEventKeySample]: 100,
          } as any);
        }).toThrowError(InvalidStateError);
      });

      it('handles a valid event', async () => {
        const preflight = new PreflightTest(mockUuid);

        const samplePromise = new Promise((resolve) => {
          preflight.on(PreflightTest.Event.Sample, (...args: any[]) => {
            resolve(args);
          });
        });

        preflight['_handleSampleEvent']({
          [Constants.PreflightTestSampleEventKeySample]:
            JSON.stringify(mockSample),
        } as any);

        const sample = await samplePromise;

        expect(sample).toEqual([
          { ...mockSample, timestamp: Number(mockSample.timestamp) },
        ]);
      });
    });

    describe('_invokeAndCatchNativeMethod', () => {
      it('passes the uuid to the wrapped method', () => {
        const preflight = new PreflightTest(mockUuid);

        const spy = jest.fn(async () => {});

        preflight['_invokeAndCatchNativeMethod'](spy);

        expect(spy.mock.calls).toEqual([[mockUuid]]);
      });

      it('does not affect the resolved value', async () => {
        const preflight = new PreflightTest(mockUuid);

        const spy = jest.fn(async () => ({ biff: 'bazz' }));

        await expect(
          preflight['_invokeAndCatchNativeMethod'](spy)
        ).resolves.toEqual({
          biff: 'bazz',
        });
      });

      it('handles a valid code and message', async () => {
        const preflight = new PreflightTest(mockUuid);

        const spy = jest.fn(async () => {
          throw {
            code: 100,
            message: 'foobar',
          };
        });

        await expect(
          preflight['_invokeAndCatchNativeMethod'](spy)
        ).rejects.toBeInstanceOf(TwilioError);
      });

      it('handles an invalid state error', async () => {
        const preflight = new PreflightTest(mockUuid);

        const spy = jest.fn(async () => {
          throw {
            code: Constants.ErrorCodeInvalidStateError,
            message: 'foobar',
          };
        });

        await expect(
          preflight['_invokeAndCatchNativeMethod'](spy)
        ).rejects.toBeInstanceOf(InvalidStateError);
      });

      it('handles any other type of error', async () => {
        const preflight = new PreflightTest(mockUuid);

        const spy = jest.fn(async () => {
          throw {
            foo: 'bar',
          };
        });

        await expect(
          preflight['_invokeAndCatchNativeMethod'](spy)
        ).rejects.toEqual({
          foo: 'bar',
        });
      });
    });
  });

  describe('public methods', () => {
    let preflight: PreflightTest;

    beforeEach(() => {
      preflight = new PreflightTest(mockUuid);
    });

    describe('getCallSid', () => {
      it('invokes the native module', async () => {
        const spy = jest
          .spyOn(Common.NativeModule, 'preflightTest_getCallSid')
          .mockResolvedValue('mock-callsid');

        await preflight.getCallSid();

        expect(spy.mock.calls).toEqual([[mockUuid]]);
      });
    });

    describe('getEndTime', () => {
      let spy: jest.SpyInstance;

      beforeEach(() => {
        spy = jest
          .spyOn(Common.NativeModule, 'preflightTest_getEndTime')
          .mockResolvedValue('100');
      });

      it('invokes the native module', async () => {
        await preflight.getEndTime();

        expect(spy.mock.calls).toEqual([[mockUuid]]);
      });

      it('returns a number', async () => {
        const endTime = await preflight.getEndTime();

        expect(endTime).toEqual(100);
      });
    });

    describe('getLatestSample', () => {
      let spy: jest.SpyInstance;

      beforeEach(() => {
        spy = jest
          .spyOn(Common.NativeModule, 'preflightTest_getLatestSample')
          .mockResolvedValue(JSON.stringify(mockSample));
      });

      it('invokes the native module', async () => {
        await preflight.getLatestSample();

        expect(spy.mock.calls).toEqual([[mockUuid]]);
      });

      it('returns a sample', async () => {
        const sample = await preflight.getLatestSample();

        expect(sample).toEqual({
          audioInputLevel: 10,
          audioOutputLevel: 20,
          bytesReceived: 30,
          bytesSent: 40,
          codec: 'mock-codec',
          jitter: 50,
          mos: 60,
          packetsLost: 70,
          packetsLostFraction: 80,
          packetsReceived: 90,
          packetsSent: 100,
          rtt: 110,
          timestamp: 120,
        });
      });
    });

    describe('getReport', () => {
      describe('invalid platform', () => {
        it('throws an error in "parseCallQuality"', async () => {
          jest
            .spyOn(Common.Platform, 'OS', 'get')
            .mockReturnValue('foobar' as any);

          jest
            .spyOn(Common.NativeModule, 'preflightTest_getReport')
            .mockImplementation(async () =>
              JSON.stringify({
                ...baseMockReport,
                callQuality: 'foobar',
              })
            );

          await expect(async () => {
            await preflight.getReport();
          }).rejects.toBeInstanceOf(InvalidStateError);
        });

        it('throws an error in "parseIsTurnRequired"', async () => {
          const mockReturnValues = (function* () {
            yield 'android';
            yield 'foobar';
          })();

          jest
            .spyOn(Common.Platform, 'OS', 'get')
            .mockImplementation(() => mockReturnValues.next().value as any);

          jest
            .spyOn(Common.NativeModule, 'preflightTest_getReport')
            .mockImplementation(async () =>
              JSON.stringify({
                ...baseMockReport,
                callQuality: 'Excellent',
              })
            );

          await expect(async () => {
            await preflight.getReport();
          }).rejects.toBeInstanceOf(InvalidStateError);
        });
      });

      describe('android', () => {
        beforeEach(() => {
          jest.spyOn(Common.Platform, 'OS', 'get').mockReturnValue('android');
        });

        it('invokes the native module', async () => {
          const spy = jest
            .spyOn(Common.NativeModule, 'preflightTest_getReport')
            .mockResolvedValue(
              JSON.stringify({ ...baseMockReport, callQuality: 'Excellent' })
            );

          await preflight.getReport();

          expect(spy.mock.calls).toEqual([[mockUuid]]);
        });

        it('parses a valid native report', async () => {
          jest
            .spyOn(Common.NativeModule, 'preflightTest_getReport')
            .mockResolvedValue(
              JSON.stringify({
                ...baseMockReport,
                callQuality: 'Excellent',
                isTurnRequired: false,
              })
            );

          const report = await preflight.getReport();

          expect(report).toEqual(expectedReport);
        });

        it('handles null native call quality', async () => {
          jest
            .spyOn(Common.NativeModule, 'preflightTest_getReport')
            .mockResolvedValue(
              JSON.stringify({
                ...baseMockReport,
                callQuality: null,
                isTurnRequired: false,
              })
            );

          const report = await preflight.getReport();

          expect(report).toEqual({ ...expectedReport, callQuality: null });
        });

        it('handles undefined native call quality', async () => {
          jest
            .spyOn(Common.NativeModule, 'preflightTest_getReport')
            .mockResolvedValue(
              JSON.stringify({
                ...baseMockReport,
                callQuality: undefined,
                isTurnRequired: false,
              })
            );

          const report = await preflight.getReport();

          expect(report).toEqual({ ...expectedReport, callQuality: null });
        });

        it('throws if the native call quality is an invalid string', async () => {
          jest
            .spyOn(Common.NativeModule, 'preflightTest_getReport')
            .mockResolvedValue(
              JSON.stringify({ ...baseMockReport, callQuality: 'foobar' })
            );

          await expect(async () => {
            await preflight.getReport();
          }).rejects.toBeInstanceOf(InvalidStateError);
        });

        it('throws if the native call quality is not a string', async () => {
          jest
            .spyOn(Common.NativeModule, 'preflightTest_getReport')
            .mockResolvedValue(
              JSON.stringify({ ...baseMockReport, callQuality: 10 })
            );

          await expect(async () => {
            await preflight.getReport();
          }).rejects.toBeInstanceOf(InvalidStateError);
        });

        it('reports an empty warnings array if native warnings is undefined', async () => {
          jest
            .spyOn(Common.NativeModule, 'preflightTest_getReport')
            .mockResolvedValue(
              JSON.stringify({
                ...baseMockReport,
                callQuality: 'Excellent',
                isTurnRequired: false,
                warnings: undefined,
              })
            );

          const report = await preflight.getReport();

          expect(report).toEqual({
            ...expectedReport,
            warnings: [],
          });
        });

        it('reports an empty warnings array if native warnings is null', async () => {
          jest
            .spyOn(Common.NativeModule, 'preflightTest_getReport')
            .mockResolvedValue(
              JSON.stringify({
                ...baseMockReport,
                callQuality: 'Excellent',
                isTurnRequired: false,
                warnings: null,
              })
            );

          const report = await preflight.getReport();

          expect(report).toEqual({
            ...expectedReport,
            warnings: [],
          });
        });

        it('reports an empty warningsCleared array if native warningsCleared is undefined', async () => {
          jest
            .spyOn(Common.NativeModule, 'preflightTest_getReport')
            .mockResolvedValue(
              JSON.stringify({
                ...baseMockReport,
                callQuality: 'Excellent',
                isTurnRequired: false,
                warningsCleared: undefined,
              })
            );

          const report = await preflight.getReport();

          expect(report).toEqual({
            ...expectedReport,
            warningsCleared: [],
          });
        });

        it('reports an empty warningsCleared array if native warningsCleared is null', async () => {
          jest
            .spyOn(Common.NativeModule, 'preflightTest_getReport')
            .mockResolvedValue(
              JSON.stringify({
                ...baseMockReport,
                callQuality: 'Excellent',
                isTurnRequired: false,
                warningsCleared: null,
              })
            );

          const report = await preflight.getReport();

          expect(report).toEqual({
            ...expectedReport,
            warningsCleared: [],
          });
        });

        it('throws if warnings is not an array', async () => {
          jest
            .spyOn(Common.NativeModule, 'preflightTest_getReport')
            .mockResolvedValue(
              JSON.stringify({
                ...baseMockReport,
                callQuality: 'Excellent',
                isTurnRequired: false,
                warnings: 'foobar',
                warningsCleared: undefined,
              })
            );

          expect(async () => {
            await preflight.getReport();
          }).rejects.toBeInstanceOf(InvalidStateError);
        });

        it('throws if warningsCleared is not an array', async () => {
          jest
            .spyOn(Common.NativeModule, 'preflightTest_getReport')
            .mockResolvedValue(
              JSON.stringify({
                ...baseMockReport,
                callQuality: 'Excellent',
                isTurnRequired: false,
                warnings: undefined,
                warningsCleared: 'foobar',
              })
            );

          expect(async () => {
            await preflight.getReport();
          }).rejects.toBeInstanceOf(InvalidStateError);
        });

        it('throws if "isTurnRequired" is not a boolean', async () => {
          jest
            .spyOn(Common.NativeModule, 'preflightTest_getReport')
            .mockResolvedValue(
              JSON.stringify({
                ...baseMockReport,
                isTurnRequired: 10,
                warnings: [],
                warningsCleared: [],
              })
            );

          expect(async () => {
            await preflight.getReport();
          }).rejects.toBeInstanceOf(InvalidStateError);
        });

        it('reports null if "isTurnRequired" is undefined', async () => {
          jest
            .spyOn(Common.NativeModule, 'preflightTest_getReport')
            .mockResolvedValue(
              JSON.stringify({
                ...baseMockReport,
                callQuality: 'Excellent',
                isTurnRequired: undefined,
              })
            );

          const report = await preflight.getReport();

          expect(report).toEqual({
            ...expectedReport,
            isTurnRequired: null,
          });
        });

        it('reports null if "isTurnRequired" is null', async () => {
          jest
            .spyOn(Common.NativeModule, 'preflightTest_getReport')
            .mockResolvedValue(
              JSON.stringify({
                ...baseMockReport,
                callQuality: 'Excellent',
                isTurnRequired: null,
              })
            );

          const report = await preflight.getReport();

          expect(report).toEqual({
            ...expectedReport,
            isTurnRequired: null,
          });
        });
      });

      describe('ios', () => {
        beforeEach(() => {
          jest.spyOn(Common.Platform, 'OS', 'get').mockReturnValue('ios');
        });

        it('invokes the native module', async () => {
          const spy = jest
            .spyOn(Common.NativeModule, 'preflightTest_getReport')
            .mockResolvedValue(
              JSON.stringify({
                ...baseMockReport,
                callQuality: 0,
                isTurnRequired: 'false',
              })
            );

          await preflight.getReport();

          expect(spy.mock.calls).toEqual([[mockUuid]]);
        });

        it('parses a valid native report', async () => {
          jest
            .spyOn(Common.NativeModule, 'preflightTest_getReport')
            .mockResolvedValue(
              JSON.stringify({
                ...baseMockReport,
                callQuality: 0,
                isTurnRequired: 'false',
              })
            );

          const report = await preflight.getReport();

          expect(report).toEqual(expectedReport);
        });

        it('handles null native call quality', async () => {
          jest
            .spyOn(Common.NativeModule, 'preflightTest_getReport')
            .mockResolvedValue(
              JSON.stringify({
                ...baseMockReport,
                callQuality: null,
                isTurnRequired: 'false',
              })
            );

          const report = await preflight.getReport();

          expect(report).toEqual({ ...expectedReport, callQuality: null });
        });

        it('handles undefined native call quality', async () => {
          jest
            .spyOn(Common.NativeModule, 'preflightTest_getReport')
            .mockResolvedValue(
              JSON.stringify({
                ...baseMockReport,
                callQuality: undefined,
                isTurnRequired: 'false',
              })
            );

          const report = await preflight.getReport();

          expect(report).toEqual({ ...expectedReport, callQuality: null });
        });

        it('throws if the native call quality is an invalid number', async () => {
          jest
            .spyOn(Common.NativeModule, 'preflightTest_getReport')
            .mockResolvedValue(
              JSON.stringify({ ...baseMockReport, callQuality: 100 })
            );

          await expect(async () => {
            await preflight.getReport();
          }).rejects.toBeInstanceOf(InvalidStateError);
        });

        it('throws if the native call quality is not a number', async () => {
          jest
            .spyOn(Common.NativeModule, 'preflightTest_getReport')
            .mockResolvedValue(
              JSON.stringify({ ...baseMockReport, callQuality: 'foobar' })
            );

          await expect(async () => {
            await preflight.getReport();
          }).rejects.toBeInstanceOf(InvalidStateError);
        });

        it('throws if the native "isTurnRequired" is not a string', async () => {
          jest
            .spyOn(Common.NativeModule, 'preflightTest_getReport')
            .mockResolvedValue(
              JSON.stringify({
                ...baseMockReport,
                callQuality: 0,
                isTurnRequired: 10,
              })
            );

          await expect(async () => {
            await preflight.getReport();
          }).rejects.toBeInstanceOf(InvalidStateError);
        });

        it('throws if the native "isTurnRequired" is not valid', async () => {
          jest
            .spyOn(Common.NativeModule, 'preflightTest_getReport')
            .mockResolvedValue(
              JSON.stringify({
                ...baseMockReport,
                callQuality: 0,
                isTurnRequired: 'foobar',
              })
            );

          await expect(async () => {
            await preflight.getReport();
          }).rejects.toBeInstanceOf(InvalidStateError);
        });

        it('reports null if "isTurnRequired" is undefined', async () => {
          jest
            .spyOn(Common.NativeModule, 'preflightTest_getReport')
            .mockResolvedValue(
              JSON.stringify({
                ...baseMockReport,
                callQuality: 0,
                isTurnRequired: undefined,
              })
            );

          const report = await preflight.getReport();

          expect(report).toEqual({
            ...expectedReport,
            isTurnRequired: null,
          });
        });

        it('reports null if "isTurnRequired" is null', async () => {
          jest
            .spyOn(Common.NativeModule, 'preflightTest_getReport')
            .mockResolvedValue(
              JSON.stringify({
                ...baseMockReport,
                callQuality: 0,
                isTurnRequired: null,
              })
            );

          const report = await preflight.getReport();

          expect(report).toEqual({
            ...expectedReport,
            isTurnRequired: null,
          });
        });

        it('reports an empty warnings array if native warnings is undefined', async () => {
          jest
            .spyOn(Common.NativeModule, 'preflightTest_getReport')
            .mockResolvedValue(
              JSON.stringify({
                ...baseMockReport,
                callQuality: 0,
                isTurnRequired: 'false',
                warnings: undefined,
              })
            );

          const report = await preflight.getReport();

          expect(report).toEqual({
            ...expectedReport,
            warnings: [],
          });
        });

        it('reports an empty warnings array if native warnings is null', async () => {
          jest
            .spyOn(Common.NativeModule, 'preflightTest_getReport')
            .mockResolvedValue(
              JSON.stringify({
                ...baseMockReport,
                callQuality: 0,
                isTurnRequired: 'false',
                warnings: null,
              })
            );

          const report = await preflight.getReport();

          expect(report).toEqual({
            ...expectedReport,
            warnings: [],
          });
        });

        it('reports an empty warningsCleared array if native warningsCleared is undefined', async () => {
          jest
            .spyOn(Common.NativeModule, 'preflightTest_getReport')
            .mockResolvedValue(
              JSON.stringify({
                ...baseMockReport,
                callQuality: 0,
                isTurnRequired: 'false',
                warningsCleared: undefined,
              })
            );

          const report = await preflight.getReport();

          expect(report).toEqual({
            ...expectedReport,
            warningsCleared: [],
          });
        });

        it('reports an empty warningsCleared array if native warningsCleared is null', async () => {
          jest
            .spyOn(Common.NativeModule, 'preflightTest_getReport')
            .mockResolvedValue(
              JSON.stringify({
                ...baseMockReport,
                callQuality: 0,
                isTurnRequired: 'false',
                warningsCleared: null,
              })
            );

          const report = await preflight.getReport();

          expect(report).toEqual({
            ...expectedReport,
            warningsCleared: [],
          });
        });

        it('throws if warnings is not an array', async () => {
          jest
            .spyOn(Common.NativeModule, 'preflightTest_getReport')
            .mockResolvedValue(
              JSON.stringify({
                ...baseMockReport,
                callQuality: 0,
                isTurnRequired: 'false',
                warnings: 'foobar',
                warningsCleared: undefined,
              })
            );

          expect(async () => {
            await preflight.getReport();
          }).rejects.toBeInstanceOf(InvalidStateError);
        });

        it('throws if warningsCleared is not an array', async () => {
          jest
            .spyOn(Common.NativeModule, 'preflightTest_getReport')
            .mockResolvedValue(
              JSON.stringify({
                ...baseMockReport,
                callQuality: 0,
                isTurnRequired: 'false',
                warnings: undefined,
                warningsCleared: 'foobar',
              })
            );

          expect(async () => {
            await preflight.getReport();
          }).rejects.toBeInstanceOf(InvalidStateError);
        });
      });
    });

    describe('getStartTime', () => {
      it('invokes the native module', async () => {
        const spy = jest
          .spyOn(Common.NativeModule, 'preflightTest_getStartTime')
          .mockImplementation(async () => '10');

        await preflight.getStartTime();

        expect(spy.mock.calls).toEqual([[mockUuid]]);
      });

      it('returns a number', async () => {
        jest
          .spyOn(Common.NativeModule, 'preflightTest_getStartTime')
          .mockImplementation(async () => '10');

        const startTime = await preflight.getStartTime();

        expect(startTime).toEqual(10);
      });
    });

    describe('getState', () => {
      it('invokes the native module', async () => {
        const spy = jest
          .spyOn(Common.NativeModule, 'preflightTest_getState')
          .mockImplementation(async () => 'completed');

        await preflight.getState();

        expect(spy.mock.calls).toEqual([[mockUuid]]);
      });

      it('returns a valid state', async () => {
        jest
          .spyOn(Common.NativeModule, 'preflightTest_getState')
          .mockImplementation(async () => 'completed');

        const state = await preflight.getState();

        expect(state).toEqual(PreflightTest.State.Completed);
      });

      it('throws when the native state is not a string', async () => {
        jest
          .spyOn(Common.NativeModule, 'preflightTest_getState')
          .mockImplementation(async () => 10 as any);

        expect(async () => {
          await preflight.getState();
        }).rejects.toThrowError(InvalidStateError);
      });
    });

    describe('stop', () => {
      it('invokes the native module', async () => {
        const spy = jest
          .spyOn(Common.NativeModule, 'preflightTest_stop')
          .mockImplementation(async () => {});

        await preflight.stop();

        expect(spy.mock.calls).toEqual([[mockUuid]]);
      });

      it('returns undefined', async () => {
        jest
          .spyOn(Common.NativeModule, 'preflightTest_stop')
          .mockImplementation(async () => {});

        const retVal = await preflight.stop();

        expect(retVal).toBeUndefined();
      });
    });
  });
});
