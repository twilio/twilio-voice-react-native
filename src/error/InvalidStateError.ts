import { TwilioError } from './TwilioError';

/**
 * Error describing that the SDK has entered or is attempting to enter an
 * invalid state.
 *
 * @public
 */
export class InvalidStateError extends TwilioError {
  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, InvalidStateError.prototype);
    this.name = InvalidStateError.name;
  }
}
