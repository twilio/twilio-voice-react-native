import {
  createNativeCallMessageInfo,
  mockCallMessageNativeEvents,
} from '../__mocks__/CallMessage';
import { CallMessage, SendingCallMessage } from '../CallMessage';
import { NativeEventEmitter } from '../common';
import { Constants } from '../constants';
import type { NativeEventEmitter as MockNativeEventEmitterType } from '../__mocks__/common';
import type { NativeCallMessageEventType } from '../type/CallMessage';

const MockNativeEventEmitter =
  NativeEventEmitter as unknown as typeof MockNativeEventEmitterType;
let MockTwilioError: jest.Mock;
let mockConstructTwilioError: jest.Mock;

jest.mock('../common');
jest.mock('../error/utility', () => {
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

describe('CallMessage class', () => {
  describe('constructor', () => {
    it('uses the passed CallMessage info', () => {
      const callMessage = new CallMessage(createNativeCallMessageInfo());
      expect({
        // eslint-disable-next-line dot-notation
        callMessageContent: callMessage['_content'],
        // eslint-disable-next-line dot-notation
        callMessageContentType: callMessage['_contentType'],
        // eslint-disable-next-line dot-notation
        callMessageType: callMessage['_messageType'],
        // eslint-disable-next-line dot-notation
        callMessageSID: callMessage['_messageSID'],
      }).toEqual(createNativeCallMessageInfo());
    });
  });

  describe('.getContent()', () => {
    it('returns the callMessageContent value', () => {
      const content = new CallMessage(
        createNativeCallMessageInfo()
      ).getContent();
      expect(typeof content).toBe('string');
      expect(content).toBe(createNativeCallMessageInfo().callMessageContent);
    });
  });

  describe('.getContentType()', () => {
    it('returns the callMessageContentType value', () => {
      const contentType = new CallMessage(
        createNativeCallMessageInfo()
      ).getContentType();
      expect(typeof contentType).toBe('string');
      expect(contentType).toBe(
        createNativeCallMessageInfo().callMessageContentType
      );
    });
  });

  describe('.getMessageType()', () => {
    it('returns the callMessageType value', () => {
      const messageType = new CallMessage(
        createNativeCallMessageInfo()
      ).getMessageType();
      expect(typeof messageType).toBe('string');
      expect(messageType).toBe(createNativeCallMessageInfo().callMessageType);
    });
  });

  describe('.getMessageSID()', () => {
    it('returns the callMessageSID value', () => {
      const messageSID = new CallMessage(
        createNativeCallMessageInfo()
      ).getMessageSID();
      expect(typeof messageSID).toBe('string');
      expect(messageSID).toBe(createNativeCallMessageInfo().callMessageSID);
    });
  });

  describe('on receiving a valid native event', () => {
    /**
     * Event forwarding tests.
     */

    const listenerCalledWithSent = (listenerMock: jest.Mock) => {
      expect(listenerMock).toHaveBeenCalledTimes(1);
      const args = listenerMock.mock.calls[0];
      expect(args).toHaveLength(1);

      const [callMessageSID] = args;
      expect(callMessageSID).toEqual('mock-nativecallmessageinfo-messageSID');
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
          SendingCallMessage.Event.Failure,
          listenerCalledWithGenericError,
        ],
        [
          mockCallMessageNativeEvents.sent,
          SendingCallMessage.Event.Sent,
          listenerCalledWithSent,
        ],
      ] as const
    ).forEach(([{ name, nativeEvent }, SendingCallMessageEvent, assertion]) => {
      describe(name, () => {
        it('re-emits the native event', () => {
          const sendingCallMessage = new SendingCallMessage(
            createNativeCallMessageInfo()
          );
          const listenerMock = jest.fn();
          //@ts-ignore
          sendingCallMessage.on(SendingCallMessageEvent, listenerMock);

          MockNativeEventEmitter.emit(Constants.ScopeCallMessage, nativeEvent);

          assertion(listenerMock);
        });

        it('invokes the correct event handler', () => {
          const callMessage = new SendingCallMessage(
            createNativeCallMessageInfo()
          );
          const spy = jest.spyOn(
            callMessage['_nativeEventHandler'], // eslint-disable-line dot-notation
            nativeEvent.type as NativeCallMessageEventType
          );

          MockNativeEventEmitter.emit(Constants.ScopeCallMessage, nativeEvent);

          expect(spy).toHaveBeenCalledTimes(1);
        });
      });
    });
  });
});
