import { createNativeCallMessageInfo } from '../../__mocks__/CallMessage';
import { IncomingCallMessage } from '../../CallMessage/IncomingCallMessage';
import { NativeEventEmitter } from '../../common';
import type { NativeEventEmitter as MockNativeEventEmitterType } from '../../__mocks__/common';

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

describe('IncomingCallMessage class', () => {
  describe('constructor', () => {
    it('uses the passed CallMessage info', () => {
      const incomingCallMessage = new IncomingCallMessage(
        createNativeCallMessageInfo()
      );

      const callMessageInfo = createNativeCallMessageInfo();

      // eslint-disable-next-line dot-notation
      expect(incomingCallMessage['_content']).toStrictEqual(
        JSON.stringify(callMessageInfo.content)
      );

      // eslint-disable-next-line dot-notation
      expect(incomingCallMessage['_contentType']).toStrictEqual(
        callMessageInfo.contentType
      );

      // eslint-disable-next-line dot-notation
      expect(incomingCallMessage['_messageType']).toStrictEqual(
        callMessageInfo.messageType
      );

      // eslint-disable-next-line dot-notation
      expect(incomingCallMessage['_voiceEventSid']).toStrictEqual(
        callMessageInfo.voiceEventSid
      );
    });

    const content = { key1: 'hello world' };
    const contentType = 'application/json';
    const messageType = 'user-defined-message';

    it('throws an error if "content" is undefined', () => {
      expect(
        () =>
          new IncomingCallMessage({
            content: undefined,
            contentType,
            messageType,
          })
      ).toThrowError('"content" must be defined and not "null".');
    });

    it('throws an error if "content" is null', () => {
      expect(
        () =>
          new IncomingCallMessage({ content: null, contentType, messageType })
      ).toThrowError('"content" must be defined and not "null".');
    });

    it('throws an error if "contentType" is not a valid string', () => {
      expect(
        () =>
          new IncomingCallMessage({
            content,
            contentType: 10 as any,
            messageType,
          })
      ).toThrowError(
        'If "contentType" is present, it must be of type "string".'
      );
    });

    it('throws an error if "messageType" is not a valid string', () => {
      expect(
        () =>
          new IncomingCallMessage({
            content,
            contentType,
            messageType: 10 as any,
          })
      ).toThrowError('"messageType" must be of type "string"');
    });

    it('defaults the content type to "applicaton/json"', () => {
      const message = new IncomingCallMessage({
        content: { foo: 'bar' },
        messageType: 'user-defined-message',
      } as any);
      expect(message.getContentType()).toStrictEqual('application/json');
    });
  });

  describe('.getContent()', () => {
    it('returns the content value', () => {
      const content = new IncomingCallMessage(
        createNativeCallMessageInfo()
      ).getContent();
      expect(content).toEqual(
        JSON.stringify(createNativeCallMessageInfo().content)
      );
    });
  });

  describe('.getContentType()', () => {
    it('returns the contentType value', () => {
      const contentType = new IncomingCallMessage(
        createNativeCallMessageInfo()
      ).getContentType();
      expect(typeof contentType).toBe('string');
      expect(contentType).toBe(createNativeCallMessageInfo().contentType);
    });
  });

  describe('.getMessageType()', () => {
    it('returns the messageType value', () => {
      const messageType = new IncomingCallMessage(
        createNativeCallMessageInfo()
      ).getMessageType();
      expect(typeof messageType).toBe('string');
      expect(messageType).toBe(createNativeCallMessageInfo().messageType);
    });
  });

  describe('.getSid()', () => {
    it('returns the voiceEventSid value', () => {
      const voiceEventSid = new IncomingCallMessage(
        createNativeCallMessageInfo()
      ).getSid();
      expect(typeof voiceEventSid).toBe('string');
      expect(voiceEventSid).toBe(createNativeCallMessageInfo().voiceEventSid);
    });
  });
});
