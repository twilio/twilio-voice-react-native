import { TwilioError } from './TwilioError';
/**
 * Error describing that the SDK has entered or is attempting to enter an
 * invalid state.
 *
 * @public
 */
export class InvalidStateError extends TwilioError {
    description = 'Invalid state error.';
    explanation = 'The SDK has entered an invalid state.';
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, InvalidStateError.prototype);
        this.name = InvalidStateError.name;
    }
}
