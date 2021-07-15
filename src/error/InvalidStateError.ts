import { TwilioError } from './TwilioError';

export class InvalidStateError extends TwilioError {
  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, InvalidStateError.prototype);
    this.name = InvalidStateError.name;
  }
}
