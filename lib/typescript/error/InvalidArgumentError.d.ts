import { TwilioError } from './TwilioError';
/**
 * Error describing that an SDK function is invoked with an invalid argument.
 *
 * @public
 */
export declare class InvalidArgumentError extends TwilioError {
    description: string;
    explanation: string;
    constructor(message: string);
}
