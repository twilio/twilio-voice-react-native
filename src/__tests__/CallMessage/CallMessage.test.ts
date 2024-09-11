import { validateCallMessage } from '../../CallMessage/CallMessage';

describe('validateCallMessage', () => {
  it('should return a valid message', () => {
    const result = validateCallMessage({
      content: { foo: 'bar' },
      contentType: 'application/json',
      messageType: 'user-defined-message',
    });
    expect(result).toStrictEqual({
      content: '{"foo":"bar"}',
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
    expect.assertions(invalidMessageTypes.length);

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

  it('should stringify content that is not a string', () => {
    const nonStringContent = [
      [{ foo: 'bar' }, '{"foo":"bar"}'],
      [10, '10'],
      [true, 'true'],
    ];
    expect.assertions(nonStringContent.length);

    for (const [inputContent, expectedContent] of nonStringContent) {
      const { content: validatedContent } = validateCallMessage({
        content: inputContent,
        messageType: 'foobar',
      });

      expect(validatedContent).toStrictEqual(expectedContent);
    }
  });

  it('should not stringify content that is a string', () => {
    const { content } = validateCallMessage({
      content: 'foobar',
      messageType: 'foobar',
    });
    expect(content).toStrictEqual('foobar');
  });
});
