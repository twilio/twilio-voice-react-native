import { createNativeCallInfo } from '../__mocks__/Call';
import {
  createNativeCallInviteInfo,
  createMockNativeCallInviteEvents,
} from '../__mocks__/CallInvite';
import type { NativeEventEmitter as MockNativeEventEmitterType } from '../__mocks__/common';
import { Call } from '../Call';
import { CallInvite } from '../CallInvite';
import { IncomingCallMessage } from '../CallMessage/IncomingCallMessage';
import { OutgoingCallMessage } from '../CallMessage/OutgoingCallMessage';
import { TwilioError } from '../error/TwilioError';
import { NativeEventEmitter, NativeModule, Platform } from '../common';
import { Constants } from '../constants';
import type { NativeCallInviteEvent } from '../type/CallInvite';

const MockNativeEventEmitter =
  NativeEventEmitter as unknown as typeof MockNativeEventEmitterType;
const MockNativeModule = jest.mocked(NativeModule);
let MockInvalidStateError: jest.Mock;
let MockCall: jest.Mock;
let MockOutgoingCallMessage: jest.Mock;

jest.mock('../common');
jest.mock('../Call', () => ({
  Call: (MockCall = jest.fn()),
}));
jest.mock('../error/InvalidStateError', () => ({
  InvalidStateError: (MockInvalidStateError = jest.fn()),
}));
jest.mock('../CallMessage/OutgoingCallMessage', () => ({
  OutgoingCallMessage: (MockOutgoingCallMessage = jest.fn()),
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

    it('binds to the native event emitter', () => {
      const callInvite = new CallInvite(
        createNativeCallInviteInfo(),
        CallInvite.State.Pending
      );
      expect(MockNativeEventEmitter.addListener.mock.calls).toEqual([
        // eslint-disable-next-line dot-notation
        [Constants.ScopeCallInvite, callInvite['_handleNativeCallInviteEvent']],
      ]);
    });
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

      describe(mockNativeCallInviteEvents.messageReceived.type, () => {
        it('constructs and emits a call message', () => {
          const { spy } = eventTest(
            mockNativeCallInviteEvents.messageReceived,
            CallInvite.Event.MessageReceived
          );
          expect(spy.mock.calls).toHaveLength(1);
          const [[callMessage]] = spy.mock.calls;
          expect(callMessage).toBeInstanceOf(IncomingCallMessage);
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

    describe('when the event is invalid', () => {
      it('should throw an error containing the event type', () => {
        // eslint-disable-next-line no-new
        new CallInvite(createNativeCallInviteInfo(), CallInvite.State.Pending);
        expect(() =>
          MockNativeEventEmitter.emit(Constants.ScopeCallInvite, {
            type: 'foo',
            callSid: 'mock-nativecallinviteinfo-callsid',
          })
        ).toThrowError('Unknown event type "foo" reached call invite.');
      });

      it('should throw if the event is not an object', () => {
        // eslint-disable-next-line no-new
        new CallInvite(createNativeCallInviteInfo(), CallInvite.State.Pending);
        expect(() =>
          MockNativeEventEmitter.emit(Constants.ScopeCallInvite, 'foobar')
        ).toThrowError('Received a "string" native call invite event.');
      });

      it('should throw if the event is null', () => {
        // eslint-disable-next-line no-new
        new CallInvite(createNativeCallInviteInfo(), CallInvite.State.Pending);
        expect(() =>
          MockNativeEventEmitter.emit(Constants.ScopeCallInvite, null)
        ).toThrowError('Received a null native call invite event.');
      });

      it('should throw if the event does not have a callsid', () => {
        // eslint-disable-next-line no-new
        new CallInvite(createNativeCallInviteInfo(), CallInvite.State.Pending);
        expect(() =>
          MockNativeEventEmitter.emit(Constants.ScopeCallInvite, {
            type: 'foo',
          })
        ).toThrowError(
          'Received a native call invite event without a call SID.'
        );
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
      ).accept(acceptOptions);
      expect(MockCall.mock.instances).toHaveLength(1);
      expect(MockCall.mock.calls).toEqual([[createNativeCallInfo()]]);
    });

    it('returns a Promise<Call>', async () => {
      const callPromise = new CallInvite(
        createNativeCallInviteInfo(),
        CallInvite.State.Pending
      ).accept(acceptOptions);
      await expect(callPromise).resolves.toBeInstanceOf(MockCall);
    });

    it('rejects when the native module rejects', async () => {
      const callPromise = new CallInvite(
        createNativeCallInviteInfo(),
        CallInvite.State.Pending
      );

      jest.mocked(NativeModule.callInvite_accept).mockRejectedValueOnce({
        userInfo: {
          code: 31401,
          message: 'Missing permissions.',
        },
      });

      expect.assertions(1);
      await callPromise.accept(acceptOptions).catch((error) => {
        expect(error).toBeInstanceOf(TwilioError);
      });
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

  describe('.isValid()', () => {
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

  describe('.sendMessage()', () => {
    const content = { key1: 'hello world' };
    const contentType = 'application/json';
    const messageType = 'user-defined-message';

    describe('when invoking the native module', () => {
      it('stringifys content that is not a string', async () => {
        await new CallInvite(
          createNativeCallInviteInfo(),
          CallInvite.State.Pending
        ).sendMessage({
          content,
          contentType,
          messageType,
        });

        expect(
          jest.mocked(MockNativeModule.call_sendMessage).mock.calls
        ).toEqual([
          [
            'mock-nativecallinviteinfo-uuid',
            JSON.stringify(content),
            contentType,
            messageType,
          ],
        ]);
      });

      it('does not stringify content that is a string', async () => {
        await new CallInvite(
          createNativeCallInviteInfo(),
          CallInvite.State.Pending
        ).sendMessage({
          content: 'foo',
          contentType,
          messageType,
        });

        expect(
          jest.mocked(MockNativeModule.call_sendMessage).mock.calls
        ).toEqual([
          ['mock-nativecallinviteinfo-uuid', 'foo', contentType, messageType],
        ]);
      });
    });

    it('returns a Promise<OutgoingCallMessage>', async () => {
      const message = {
        content,
        contentType,
        messageType,
      };

      const sendMessagePromise = new CallInvite(
        createNativeCallInviteInfo(),
        CallInvite.State.Pending
      ).sendMessage(message);
      const mockResult: OutgoingCallMessage = new OutgoingCallMessage({
        content,
        contentType,
        messageType,
        voiceEventSid: 'mock-nativemodule-tracking-id',
      });
      const result = await sendMessagePromise;
      expect(JSON.stringify(result)).toEqual(JSON.stringify(mockResult));
    });

    describe('constructs an outgoing call message', () => {
      it('with the raw string content', async () => {
        await new CallInvite(
          createNativeCallInviteInfo(),
          CallInvite.State.Pending
        ).sendMessage({
          content: 'foo',
          messageType: 'user-defined-message',
        });

        const [[processedContent]] = MockOutgoingCallMessage.mock.calls;
        expect(processedContent.content).toStrictEqual('foo');
      });

      it('with the processed content', async () => {
        await new CallInvite(
          createNativeCallInviteInfo(),
          CallInvite.State.Pending
        ).sendMessage({
          content,
          messageType: 'user-defined-message',
        });

        const [[processedContent]] = MockOutgoingCallMessage.mock.calls;
        expect(processedContent.content).toStrictEqual(JSON.stringify(content));
      });
    });
  });

  describe('private methods', () => {
    /**
     * Invalid event tests.
     */
    ['_handleNativeCallInviteEvent', '_handleMessageReceivedEvent'].forEach(
      (privateMethodKey) => {
        describe(`.${privateMethodKey}`, () => {
          it('throws an error for an invalid event', () => {
            const handler = (
              new CallInvite(
                createNativeCallInviteInfo(),
                CallInvite.State.Pending
              ) as any
            )[privateMethodKey];
            expect(typeof handler).toBe('function');
            expect(() => {
              handler({ type: 'not-a-real-event' });
            }).toThrow();
          });
        });
      }
    );
  });

  describe('.updateCallerHandle()', () => {
    it('should resolve on ios platforms', async () => {
      const platformSpy = jest
        .spyOn(Platform, 'OS', 'get')
        .mockReturnValue('ios');
      const nativeMethodSpy = jest.spyOn(
        NativeModule,
        'callInvite_updateCallerHandle'
      );
      await expect(
        new CallInvite(
          createNativeCallInviteInfo(),
          CallInvite.State.Pending
        ).updateCallerHandle('foobar')
      ).resolves.toBeUndefined();
      expect(platformSpy.mock.calls).toEqual([[]]);
      expect(nativeMethodSpy.mock.calls).toEqual([
        ['mock-nativecallinviteinfo-uuid', 'foobar'],
      ]);
    });

    it('should reject on android platforms', async () => {
      const platformSpy = jest
        .spyOn(Platform, 'OS', 'get')
        .mockReturnValue('android');
      const nativeMethodSpy = jest.spyOn(
        NativeModule,
        'callInvite_updateCallerHandle'
      );
      await expect(
        new CallInvite(
          createNativeCallInviteInfo(),
          CallInvite.State.Pending
        ).updateCallerHandle('foobar')
      ).rejects.toThrowError(
        'Unsupported platform "android". This method is only supported on iOS.'
      );
      expect(platformSpy.mock.calls).toEqual([[], []]);
      expect(nativeMethodSpy.mock.calls).toEqual([]);
    });
  });
});

describe('CallInvite namespace', () => {
  describe('exports enumerations', () => {
    it('State', () => {
      expect(CallInvite.State).toBeDefined();
      expect(typeof CallInvite.State).toBe('object');
    });
    it('Event', () => {
      expect(CallInvite.Event).toBeDefined();
      expect(typeof CallInvite.Event).toBe('object');
    });
  });
});
