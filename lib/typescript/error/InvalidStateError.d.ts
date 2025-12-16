import { TwilioError } from './TwilioError';
/**
 * Error describing that the SDK has entered or is attempting to enter an
 * invalid state.
 *
 * @public
 */
export declare class InvalidStateError extends TwilioError {
    description: string;
    explanation: string;
    constructor(message: string);
}
