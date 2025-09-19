/* eslint-disable dot-notation */
/* eslint-disable no-new */

import type * as CommonMock from '../__mocks__/common';
import { PreflightTest } from '../PreflightTest';
import * as Common from '../common';
import { Constants } from '../constants';
import { mockUuid } from '../__mock-data__/PreflightTest';

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
    it('stub', () => {});
  });

  describe('public methods', () => {
    it('stub', () => {});
  });
});
