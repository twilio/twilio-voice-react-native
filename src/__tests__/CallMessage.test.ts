import { createNativeCallMessageInfo } from '../__mocks__/CallMessage';
import { CallMessage } from '../CallMessage';

jest.mock('../common');

beforeEach(() => {
  jest.clearAllMocks();
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
});
