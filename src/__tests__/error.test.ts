import { TwilioError } from '../error/TwilioError';
import { InvalidStateError } from '../error/InvalidStateError';

describe('GenericError', () => {
  it('sets an error name', () => {
    const error = new TwilioError('mock-error-message');
    expect(error.name).toBe('GenericError');
  });

  it.each([[undefined], [0]])('sets a code "%o"', (code) => {
    const error = new TwilioError('mock-error-message', code);
    expect(error.code).toBe(code);
  });

  it('properly sets the prototype', () => {
    const error = new TwilioError('mock-error-message');
    expect(error).toBeInstanceOf(TwilioError);
  });
});

describe('InvalidStateError', () => {
  it('sets an error name', () => {
    const error = new InvalidStateError('mock-error-message');
    expect(error.name).toBe('InvalidStateError');
  });

  it('properly sets the prototype', () => {
    const error = new InvalidStateError('mock-error-message');
    expect(error).toBeInstanceOf(InvalidStateError);
  });
});
