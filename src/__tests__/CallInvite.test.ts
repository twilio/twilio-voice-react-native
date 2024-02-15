import { createNativeCallInfo } from '../__mocks__/Call';
import {
  createNativeCallInviteInfo,
  createMockNativeCallInviteEvents,
} from '../__mocks__/CallInvite';
import type { NativeEventEmitter as MockNativeEventEmitterType } from '../__mocks__/common';
import { Call } from '../Call';
import { CallInvite } from '../CallInvite';
import { TwilioError } from '../error/TwilioError';
import { NativeEventEmitter, NativeModule } from '../common';
import { Constants } from '../constants';
import type { NativeCallInviteEvent } from '../type/CallInvite';

const MockNativeEventEmitter =
  NativeEventEmitter as unknown as typeof MockNativeEventEmitterType;
const MockNativeModule = jest.mocked(NativeModule);
let MockInvalidStateError: jest.Mock;
let MockCall: jest.Mock;

jest.mock('../common');
jest.mock('../Call', () => ({
  Call: (MockCall = jest.fn()),
}));
jest.mock('../error/InvalidStateError', () => ({
  InvalidStateError: (MockInvalidStateError = jest.fn()),
}));

beforeEach(() => {
  jest.clearAllMocks();
  MockNativeEventEmitter.removeAllListeners();
});

describe('CallInvite class', () => {
  describe('constructor', () => {
    it('uses the passed CallInvite info', () => {
      const callInvite = new CallInvite(
        createNativeCallInviteInfo(),
        CallInvite.State.Pending
      );
      expect({
        // eslint-disable-next-line dot-notation
        uuid: callInvite['_uuid'],
        // eslint-disable-next-line dot-notation
        callSid: callInvite['_callSid'],
        // eslint-disable-next-line dot-notation
        customParameters: callInvite['_customParameters'],
        // eslint-disable-next-line dot-notation
        from: callInvite['_from'],
        // eslint-disable-next-line dot-notation
        to: callInvite['_to'],
      }).toEqual(createNativeCallInviteInfo());
    });

    it.each(Object.values(CallInvite.State))(
      'uses the passed state "%s"',
      (callInviteState) => {
        const callInvite = new CallInvite(
          createNativeCallInviteInfo(),
          callInviteState
        );
        // eslint-disable-next-line dot-notation
        expect(callInvite['_state']).toEqual(callInviteState);
      }
    );
  });

  describe('when a native call invite event occurs', () => {
    const mockNativeCallInviteEvents = createMockNativeCallInviteEvents();

    describe('when the call sid matches', () => {
      const eventTest = (nativeEvent: NativeCallInviteEvent, event: any) => {
        const callInvite = new CallInvite(
          createNativeCallInviteInfo(),
          CallInvite.State.Pending
        );
        const spy = jest.fn();
        callInvite.on(event, spy);
        MockNativeEventEmitter.emit(Constants.ScopeCallInvite, nativeEvent);
        return { callInvite, spy };
      };

      describe(mockNativeCallInviteEvents.accepted.type, () => {
        it('emits a call', () => {
          const { spy } = eventTest(
            mockNativeCallInviteEvents.accepted,
            CallInvite.Event.Accepted
          );
          expect(spy.mock.calls).toHaveLength(1);
          expect(spy.mock.calls[0]).toHaveLength(1);
          const [[call]] = spy.mock.calls;
          expect(call).toBeInstanceOf(Call);
        });

        it('sets the call invite state to accepted', () => {
          const { callInvite } = eventTest(
            mockNativeCallInviteEvents.accepted,
            CallInvite.Event.Accepted
          );
          expect(callInvite.getState()).toEqual(CallInvite.State.Accepted);
        });
      });

      describe(mockNativeCallInviteEvents.cancelled.type, () => {
        it('re-emits the event', () => {
          const { spy } = eventTest(
            mockNativeCallInviteEvents.cancelled,
            CallInvite.Event.Cancelled
          );
          expect(spy.mock.calls).toEqual([[]]);
        });

        it('emits an error when present', () => {
          const { spy } = eventTest(
            mockNativeCallInviteEvents.cancelledWithError,
            CallInvite.Event.Cancelled
          );
          expect(spy.mock.calls).toHaveLength(1);
          expect(spy.mock.calls[0]).toHaveLength(1);
          const [[error]] = spy.mock.calls;
          expect(error).toBeInstanceOf(TwilioError);
          expect(error.code).toEqual(0);
          expect(error.message).toEqual('mock-error-message');
        });

        it('sets the state to cancelled', () => {
          const { callInvite } = eventTest(
            mockNativeCallInviteEvents.cancelled,
            CallInvite.Event.Cancelled
          );
          expect(callInvite.getState()).toEqual(CallInvite.State.Cancelled);
        });
      });

      describe(mockNativeCallInviteEvents.notificationTapped.type, () => {
        it('re-emits a valid event', () => {
          const { spy } = eventTest(
            mockNativeCallInviteEvents.notificationTapped,
            CallInvite.Event.NotificationTapped
          );
          expect(spy.mock.calls).toEqual([[]]);
        });
      });

      describe(mockNativeCallInviteEvents.rejected.type, () => {
        it('re-emits a valid event', () => {
          const { spy } = eventTest(
            mockNativeCallInviteEvents.rejected,
            CallInvite.Event.Rejected
          );
          expect(spy.mock.calls).toEqual([[]]);
        });

        it('sets the state to rejected', () => {
          const { callInvite } = eventTest(
            mockNativeCallInviteEvents.rejected,
            CallInvite.Event.Rejected
          );
          expect(callInvite.getState()).toEqual(CallInvite.State.Rejected);
        });
      });
    });

    describe('when the call sid does not match', () => {
      it('does nothing', () => {
        const callInvite = new CallInvite(
          createNativeCallInviteInfo(),
          CallInvite.State.Pending
        );
        const spy = jest.fn();
        callInvite.on(CallInvite.Event.Accepted, spy);
        const mockCallSid = 'foobar';
        const nativeEvent = {
          type: Constants.CallInviteEventTypeValueAccepted,
          callSid: mockCallSid,
          callInvite: {
            uuid: 'mock uuid',
            callSid: mockCallSid,
            from: 'mock from',
            to: 'mock to',
          },
        };
        MockNativeEventEmitter.emit(Constants.ScopeCallInvite, nativeEvent);
        expect(spy.mock.calls).toEqual([]);
      });
    });

    describe('when the type is invalid', () => {
      it('should throw an error', () => {
        // eslint-disable-next-line no-new
        new CallInvite(createNativeCallInviteInfo(), CallInvite.State.Pending);
        expect(() =>
          MockNativeEventEmitter.emit(Constants.ScopeCallInvite, {
            type: 'foo',
            callSid: 'mock-nativecallinviteinfo-callsid',
          })
        ).toThrowError('Unknown event type "foo" reached call invite.');
      });
    });
  });

  describe.each([
    [undefined, {}],
    [{}, {}],
    [{ foo: 'bar' }, { foo: 'bar' }],
  ])('.accept(%o)', (acceptOptions, expectation) => {
    it('invokes the native module', async () => {
      await new CallInvite(
        createNativeCallInviteInfo(),
        CallInvite.State.Pending
      ).accept(acceptOptions);
      expect(
        jest.mocked(MockNativeModule.callInvite_accept).mock.calls
      ).toEqual([[createNativeCallInviteInfo().uuid, expectation]]);
    });

    it('constructs a Call using the info from the native module', async () => {
      await new CallInvite(
        createNativeCallInviteInfo(),
        CallInvite.State.Pending
      ).accept();
      expect(MockCall.mock.instances).toHaveLength(1);
      expect(MockCall.mock.calls).toEqual([[createNativeCallInfo()]]);
    });

    it('returns a Promise<Call>', async () => {
      const callPromise = new CallInvite(
        createNativeCallInviteInfo(),
        CallInvite.State.Pending
      ).accept();
      await expect(callPromise).resolves.toBeInstanceOf(MockCall);
    });

    (
      [
        [CallInvite.State.Accepted, false],
        [CallInvite.State.Rejected, false],
        [CallInvite.State.Pending, true],
      ] as const
    ).forEach(([callInviteState, shouldPass]) => {
      const testMessage = `${
        shouldPass ? 'resolves' : 'rejects'
      } when the CallInvite state is "${callInviteState}"`;

      async function shouldResolve() {
        await expect(
          new CallInvite(createNativeCallInviteInfo(), callInviteState).accept(
            acceptOptions
          )
        ).resolves.toBeInstanceOf(MockCall);
      }

      async function shouldReject() {
        const acceptPromise = new CallInvite(
          createNativeCallInviteInfo(),
          callInviteState
        ).accept(acceptOptions);
        await expect(acceptPromise).rejects.toBeInstanceOf(
          MockInvalidStateError
        );
        expect(MockInvalidStateError.mock.instances).toHaveLength(1);
        expect(MockInvalidStateError.mock.calls).toEqual([
          [
            `Call in state "${callInviteState}", ` +
              `expected state "${CallInvite.State.Pending}".`,
          ],
        ]);
      }

      it(testMessage, shouldPass ? shouldResolve : shouldReject);
    });
  });

  describe('.reject()', () => {
    it('invokes the native module', async () => {
      await new CallInvite(
        createNativeCallInviteInfo(),
        CallInvite.State.Pending
      ).reject();
      expect(
        jest.mocked(MockNativeModule.callInvite_reject).mock.calls
      ).toEqual([[createNativeCallInviteInfo().uuid]]);
    });

    (
      [
        [CallInvite.State.Accepted, false],
        [CallInvite.State.Rejected, false],
        [CallInvite.State.Pending, true],
      ] as const
    ).forEach(([callInviteState, shouldPass]) => {
      const testMessage = `${
        shouldPass ? 'resolves' : 'rejects'
      } when the CallInvite state is "${callInviteState}"`;

      async function shouldResolve() {
        await expect(
          new CallInvite(createNativeCallInviteInfo(), callInviteState).reject()
        ).resolves.toBeUndefined();
      }

      async function shouldReject() {
        const rejectPromise = new CallInvite(
          createNativeCallInviteInfo(),
          callInviteState
        ).reject();
        await expect(rejectPromise).rejects.toBeInstanceOf(
          MockInvalidStateError
        );
        expect(MockInvalidStateError.mock.instances).toHaveLength(1);
        expect(MockInvalidStateError.mock.calls).toEqual([
          [
            `Call in state "${callInviteState}", ` +
              `expected state "${CallInvite.State.Pending}".`,
          ],
        ]);
      }

      it(testMessage, shouldPass ? shouldResolve : shouldReject);
    });
  });

  describe('isValid()', () => {
    it('invokes the native module', async () => {
      await new CallInvite(
        createNativeCallInviteInfo(),
        CallInvite.State.Pending
      ).isValid();
      expect(
        jest.mocked(MockNativeModule.callInvite_isValid).mock.calls
      ).toEqual([[createNativeCallInviteInfo().uuid]]);
    });

    it('returns a Promise<boolean>', async () => {
      expect(
        typeof (await new CallInvite(
          createNativeCallInviteInfo(),
          CallInvite.State.Pending
        ).isValid())
      ).toBe('boolean');
    });
  });

  describe('.getCallSid()', () => {
    it('returns the callSid', () => {
      const callSid = new CallInvite(
        createNativeCallInviteInfo(),
        CallInvite.State.Pending
      ).getCallSid();
      expect(typeof callSid).toBe('string');
      expect(callSid).toBe(createNativeCallInviteInfo().callSid);
    });
  });

  describe('.getCustomParameters()', () => {
    it('returns the custom parameters', () => {
      const customParameters = new CallInvite(
        createNativeCallInviteInfo(),
        CallInvite.State.Pending
      ).getCustomParameters();
      expect(typeof customParameters).toBe('object');
      expect(customParameters).toEqual(
        createNativeCallInviteInfo().customParameters
      );
    });
  });

  describe('.getFrom()', () => {
    it('returns the from value', () => {
      const from = new CallInvite(
        createNativeCallInviteInfo(),
        CallInvite.State.Pending
      ).getFrom();
      expect(typeof from).toBe('string');
      expect(from).toBe(createNativeCallInviteInfo().from);
    });
  });

  describe('.getState()', () => {
    it('returns the state', () => {
      const state = new CallInvite(
        createNativeCallInviteInfo(),
        CallInvite.State.Pending
      ).getState();
      expect(typeof state).toBe('string');
      expect(state).toBe(CallInvite.State.Pending);
    });
  });

  describe('.getTo()', () => {
    it('returns the to value', () => {
      const to = new CallInvite(
        createNativeCallInviteInfo(),
        CallInvite.State.Pending
      ).getTo();
      expect(typeof to).toBe('string');
      expect(to).toBe(createNativeCallInviteInfo().to);
    });
  });
});

describe('CallInvite namespace', () => {
  describe('exports enumerations', () => {
    it('State', () => {
      expect(CallInvite.State).toBeDefined();
      expect(typeof CallInvite.State).toBe('object');
    });
  });
});
