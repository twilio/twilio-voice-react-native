import { createNativeCallMessageInfo } from '../__mocks__/CallMessage';
import { CallMessage } from '../CallMessage';
import { NativeEventEmitter } from '../common';
import type { NativeEventEmitter as MockNativeEventEmitterType } from '../__mocks__/common';

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
        content: callMessage['_content'],
        // eslint-disable-next-line dot-notation
        contentType: callMessage['_contentType'],
        // eslint-disable-next-line dot-notation
        messageType: callMessage['_messageType'],
        // eslint-disable-next-line dot-notation
        voiceEventSid: callMessage['_voiceEventSid'],
      }).toEqual(createNativeCallMessageInfo());
    });

    const content = { key1: 'hello world' };
    const contentType = 'application/json';
    const messageType = 'user-defined-message';

    it('throws an error if "content" is undefined', () => {
      expect(
        () => new CallMessage({ content: undefined, contentType, messageType })
      ).toThrowError('"content" is empty');
    });

    it('throws an error if "content" is null', () => {
      expect(
        () => new CallMessage({ content: null, contentType, messageType })
      ).toThrowError('"content" is empty');
    });

    it('throws an error if "contentType" is not a valid string', () => {
      expect(
        () =>
          new CallMessage({
            content,
            contentType: 10 as any,
            messageType,
          })
      ).toThrowError('"contentType" must be of type "string"');
    });

    it('throws an error if "messageType" is not a valid string', () => {
      expect(
        () =>
          new CallMessage({
            content,
            contentType,
            messageType: 10 as any,
          })
      ).toThrowError('"messageType" must be of type "string"');
    });
  });

  describe('.getContent()', () => {
    it('returns the content value', () => {
      const content = new CallMessage(
        createNativeCallMessageInfo()
      ).getContent();
      expect(content).toEqual(createNativeCallMessageInfo().content);
    });
  });

  describe('.getContentType()', () => {
    it('returns the contentType value', () => {
      const contentType = new CallMessage(
        createNativeCallMessageInfo()
      ).getContentType();
      expect(typeof contentType).toBe('string');
      expect(contentType).toBe(createNativeCallMessageInfo().contentType);
    });
  });

  describe('.getMessageType()', () => {
    it('returns the messageType value', () => {
      const messageType = new CallMessage(
        createNativeCallMessageInfo()
      ).getMessageType();
      expect(typeof messageType).toBe('string');
      expect(messageType).toBe(createNativeCallMessageInfo().messageType);
    });
  });

  describe('.getSid()', () => {
    it('returns the voiceEventSid value', () => {
      const voiceEventSid = new CallMessage(
        createNativeCallMessageInfo()
      ).getSid();
      expect(typeof voiceEventSid).toBe('string');
      expect(voiceEventSid).toBe(createNativeCallMessageInfo().voiceEventSid);
    });
  });
});
