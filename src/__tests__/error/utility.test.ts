import { constructTwilioError } from '../../error/utility';

let MockInvalidArgumentError: jest.Mock;
let mockGetErrorsByCode: { get: jest.Mock };
let MockTwilioError: jest.Mock;

jest.mock('../../error/InvalidArgumentError', () => ({
  InvalidArgumentError: (MockInvalidArgumentError = jest.fn()),
}));
jest.mock('../../error/generated', () => ({
  errorsByCode: (mockGetErrorsByCode = { get: jest.fn() }),
}));
jest.mock('../../error/TwilioError', () => ({
  TwilioError: (MockTwilioError = jest.fn()),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockGetErrorsByCode.get.mockReset();
});

describe('constructTwilioError', () => {
  it('should throw if passed an invalid message', () => {
    expect(() => (constructTwilioError as any)(null)).toThrowError(
      MockInvalidArgumentError
    );

    expect(MockInvalidArgumentError.mock.calls).toEqual([
      ['The "message" argument is not of type "string".'],
    ]);
  });

  it('should throw if passed an invalid code', () => {
    expect(() => (constructTwilioError as any)('foobar', null)).toThrowError(
      MockInvalidArgumentError
    );

    expect(MockInvalidArgumentError.mock.calls).toEqual([
      ['The "code" argument is not of type "number".'],
    ]);
  });

  it('should construct a mapped error code', () => {
    const MockError = jest.fn();
    mockGetErrorsByCode.get.mockImplementation(() => MockError);
    const message = 'foobar-error-message';
    const code = 99999;
    const error = constructTwilioError(message, code);
    expect(error).toBeInstanceOf(MockError);
    expect(MockError.mock.calls).toEqual([[message]]);
  });

  it('should construct the default TwilioError', () => {
    mockGetErrorsByCode.get.mockImplementation(() => undefined);
    const message = 'foobar-error-message';
    const code = 99999;
    const error = constructTwilioError(message, code);
    expect(error).toBeInstanceOf(MockTwilioError);
    expect(MockTwilioError.mock.calls).toEqual([[message, code]]);
  });
});
