import { validateCallMessage } from '../../CallMessage/CallMessage';

describe('validateCallMessage', () => {
  it('should return a valid message', () => {
    const result = validateCallMessage({
      content: { foo: 'bar' },
      contentType: 'application/json',
      messageType: 'user-defined-message',
    });
    expect(result).toStrictEqual({
      content: { foo: 'bar' },
      contentType: 'application/json',
      messageType: 'user-defined-message',
    });
  });

  it('should default "contentType" to "application/json"', () => {
    const result = validateCallMessage({
      content: { foo: 'bar' },
      messageType: 'user-defined-message',
    });
    expect(result.contentType).toStrictEqual('application/json');
  });

  it('should throw an error if content is null', () => {
    const invalidMessage = {
      content: null,
      contentType: 'application/json',
      messageType: 'user-defined-message',
    };
    expect(() => validateCallMessage(invalidMessage)).toThrow(
      '"content" must be defined and not "null".'
    );
  });

  it('should throw an error if content is undefined', () => {
    const invalidMessage = {
      content: undefined,
      contentType: 'application/json',
      messageType: 'user-defined-message',
    };
    expect(() => validateCallMessage(invalidMessage)).toThrow(
      '"content" must be defined and not "null".'
    );
  });

  it('should throw an error if the messageType is not a string', () => {
    const invalidMessageTypes = [undefined, 10, null, {}, true];

    const testMessageType = (messageType: any) => {
      const invalidMessage = {
        content: { foo: 'bar' },
        contentType: 'application/json',
        messageType,
      };
      expect(() => validateCallMessage(invalidMessage)).toThrow(
        '"messageType" must be of type "string".'
      );
    };

    invalidMessageTypes.forEach(testMessageType);
  });

  it('should throw an error if the contentType is defined and not a string', () => {
    const invalidContentTypes = [10, null, {}, true];

    const testContentType = (contentType: any) => {
      const invalidMessage = {
        content: { foo: 'bar' },
        contentType,
        messageType: 'user-defined-message',
      };
      expect(() => validateCallMessage(invalidMessage)).toThrow(
        'If "contentType" is present, it must be of type "string".'
      );
    };

    invalidContentTypes.forEach(testContentType);
  });
});
