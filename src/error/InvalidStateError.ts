import { TwilioError } from './TwilioError';

/**
 * Error describing that the SDK has entered or is attempting to enter an
 * invalid state.
 *
 * @public
 */
export class InvalidStateError extends TwilioError {
  description: string = 'Invalid state error.';
  explanation: string = 'The SDK has entered an invalid state.';

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, InvalidStateError.prototype);
    this.name = InvalidStateError.name;
  }
}
