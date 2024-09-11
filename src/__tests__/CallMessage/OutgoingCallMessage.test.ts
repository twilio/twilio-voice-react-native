import {
  createNativeCallMessageInfo,
  createNativeCallMessageInfoSid,
  mockCallMessageNativeEvents,
} from '../../__mocks__/CallMessage';
import { OutgoingCallMessage } from '../../CallMessage/OutgoingCallMessage';
import { NativeEventEmitter } from '../../common';
import { Constants } from '../../constants';
import type { NativeEventEmitter as MockNativeEventEmitterType } from '../../__mocks__/common';
import type { NativeCallMessageEventType } from '../../type/CallMessage';

const MockNativeEventEmitter =
  NativeEventEmitter as unknown as typeof MockNativeEventEmitterType;
let MockTwilioError: jest.Mock;
let mockConstructTwilioError: jest.Mock;

jest.mock('../../common');
jest.mock('../../error/utility', () => {
  MockTwilioError = jest.fn();
  mockConstructTwilioError = jest.fn((mesage, code) => {
    return new MockTwilioError(mesage, code);
  });
  return {
    constructTwilioError: mockConstructTwilioError,
  };
});

beforeEach(() => {
  jest.clearAllMocks();
  MockNativeEventEmitter.reset();
});

describe('OutgoingCallMessage class', () => {
  describe('constructor', () => {
    it('uses the passed CallMessage info', () => {
      const outgoingCallMessage = new OutgoingCallMessage(
        createNativeCallMessageInfo()
      );

      const callMessageInfo = createNativeCallMessageInfo();

      // eslint-disable-next-line dot-notation
      expect(outgoingCallMessage['_content']).toStrictEqual(
        JSON.stringify(callMessageInfo.content)
      );

      // eslint-disable-next-line dot-notation
      expect(outgoingCallMessage['_contentType']).toStrictEqual(
        callMessageInfo.contentType
      );

      // eslint-disable-next-line dot-notation
      expect(outgoingCallMessage['_messageType']).toStrictEqual(
        callMessageInfo.messageType
      );

      // eslint-disable-next-line dot-notation
      expect(outgoingCallMessage['_voiceEventSid']).toStrictEqual(
        callMessageInfo.voiceEventSid
      );
    });

    it('contains an entry for every outgoingCallMessage event', () => {
      const outgoingCallMessage = new OutgoingCallMessage(
        createNativeCallMessageInfo()
      );
      /* eslint-disable-next-line dot-notation */
      const nativeEventHandler = outgoingCallMessage['_nativeEventHandler'];
      [
        Constants.CallEventMessageSent,
        Constants.CallEventMessageFailure,
      ].forEach((event: string) => {
        expect(event in nativeEventHandler).toBe(true);
      });
    });

    it('binds to the native event emitter', () => {
      const outgoingCallMessage = new OutgoingCallMessage(
        createNativeCallMessageInfo()
      );
      expect(MockNativeEventEmitter.addListener.mock.calls).toEqual([
        // eslint-disable-next-line dot-notation
        [Constants.ScopeCallMessage, outgoingCallMessage['_handleNativeEvent']],
      ]);
    });
  });

  describe('.getContent()', () => {
    it('returns the outgoingCallMessageContent value', () => {
      const content = new OutgoingCallMessage(
        createNativeCallMessageInfo()
      ).getContent();
      expect(content).toEqual(
        JSON.stringify(createNativeCallMessageInfo().content)
      );
    });
  });

  describe('.getContentType()', () => {
    it('returns the outgoingCallMessageContentType value', () => {
      const contentType = new OutgoingCallMessage(
        createNativeCallMessageInfo()
      ).getContentType();
      expect(typeof contentType).toBe('string');
      expect(contentType).toBe(createNativeCallMessageInfo().contentType);
    });
  });

  describe('.getMessageType()', () => {
    it('returns the outgoingCallMessageType value', () => {
      const messageType = new OutgoingCallMessage(
        createNativeCallMessageInfo()
      ).getMessageType();
      expect(typeof messageType).toBe('string');
      expect(messageType).toBe(createNativeCallMessageInfo().messageType);
    });
  });

  describe('.getSid()', () => {
    it('returns the outgoingVoiceEventSid value', () => {
      const voiceEventSid = new OutgoingCallMessage(
        createNativeCallMessageInfo()
      ).getSid();
      expect(typeof voiceEventSid).toBe('string');
      expect(voiceEventSid).toBe(createNativeCallMessageInfo().voiceEventSid);
    });
  });

  describe('on receiving a valid native event', () => {
    /**
     * Event forwarding tests.
     */

    const listenerCalledWithSent = (listenerMock: jest.Mock) => {
      expect(listenerMock).toHaveBeenCalledTimes(1);
    };

    const listenerCalledWithGenericError = (listenerMock: jest.Mock) => {
      expect(listenerMock).toHaveBeenCalledTimes(1);
      const args = listenerMock.mock.calls[0];
      expect(args).toHaveLength(1);

      const [error] = args;
      expect(error).toBeInstanceOf(MockTwilioError);
    };

    (
      [
        [
          mockCallMessageNativeEvents.failure,
          OutgoingCallMessage.Event.Failure,
          listenerCalledWithGenericError,
          '123',
        ],
        [
          mockCallMessageNativeEvents.sent,
          OutgoingCallMessage.Event.Sent,
          listenerCalledWithSent,
          '456',
        ],
      ] as const
    ).forEach(
      ([
        { name, nativeEvent },
        OutgoingCallMessageEvent,
        assertion,
        voiceEventSid,
      ]) => {
        describe(name, () => {
          it('re-emits the native event', () => {
            const outgoingCallMessage = new OutgoingCallMessage(
              createNativeCallMessageInfoSid(voiceEventSid)
            );
            const listenerMock = jest.fn();
            outgoingCallMessage.on(OutgoingCallMessageEvent, listenerMock);

            MockNativeEventEmitter.emit(
              Constants.ScopeCallMessage,
              nativeEvent
            );

            assertion(listenerMock);
          });

          it('invokes the correct event handler', () => {
            const outgoingCallMessage = new OutgoingCallMessage(
              createNativeCallMessageInfoSid(voiceEventSid)
            );
            const spy = jest.spyOn(
              outgoingCallMessage['_nativeEventHandler'], // eslint-disable-line dot-notation
              nativeEvent.type as NativeCallMessageEventType
            );

            MockNativeEventEmitter.emit(
              Constants.ScopeCallMessage,
              nativeEvent
            );

            expect(spy).toHaveBeenCalledTimes(1);
          });

          it('does not re-emit if voiceEventSid does NOT match', () => {
            const outgoingCallMessage = new OutgoingCallMessage(
              createNativeCallMessageInfoSid('incorrect-sid')
            );
            const listenerMock = jest.fn();
            outgoingCallMessage.on(OutgoingCallMessageEvent, listenerMock);

            MockNativeEventEmitter.emit(
              Constants.ScopeCallMessage,
              nativeEvent
            );

            expect(listenerMock).toHaveBeenCalledTimes(0);
          });
        });
      }
    );
  });

  describe('private methods', () => {
    /**
     * Invalid event tests.
     */
    ['_handleNativeEvent', '_handleFailureEvent', '_handleSentEvent'].forEach(
      (privateMethodKey) => {
        describe(`.${privateMethodKey}`, () => {
          it('throws an error for an invalid event', () => {
            const handler = (
              new OutgoingCallMessage(createNativeCallMessageInfo()) as any
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
});

describe('OutgoingCallMessage namespace', () => {
  describe('exports enumerations', () => {
    it('Event', () => {
      expect(OutgoingCallMessage.Event).toBeDefined();
      expect(typeof OutgoingCallMessage.Event).toBe('object');
    });
  });
});
