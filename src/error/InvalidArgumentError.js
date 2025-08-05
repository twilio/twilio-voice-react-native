import { TwilioError } from './TwilioError';
/**
 * Error describing that an SDK function is invoked with an invalid argument.
 *
 * @public
 */
export class InvalidArgumentError extends TwilioError {
    description = 'Invalid argument error.';
    explanation = 'The SDK has encountered a situation where invalid arguments were passed.';
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, InvalidArgumentError.prototype);
        this.name = InvalidArgumentError.name;
    }
}
