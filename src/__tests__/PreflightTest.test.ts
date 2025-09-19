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
    it('stub', () => {});
  });
});
