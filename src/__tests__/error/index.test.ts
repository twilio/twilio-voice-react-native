import { TwilioError } from '../../error/TwilioError';
import { InvalidArgumentError } from '../../error/InvalidArgumentError';
import { InvalidStateError } from '../../error/InvalidStateError';

describe('TwilioError', () => {
  it('sets an error name', () => {
    const error = new TwilioError('mock-error-message');
    expect(error.name).toBe('TwilioError');
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

[InvalidStateError, InvalidArgumentError].forEach((ErrorConstructor) => {
  describe(ErrorConstructor, () => {
    it('sets an error name', () => {
      const error = new ErrorConstructor('mock-error-message');
      expect(error.name).toBe(ErrorConstructor.name);
    });

    it('properly sets the prototype', () => {
      const error = new ErrorConstructor('mock-error-message');
      expect(error).toBeInstanceOf(ErrorConstructor);
    });
  });
});
