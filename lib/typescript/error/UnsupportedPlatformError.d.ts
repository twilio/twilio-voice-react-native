import { TwilioError } from './TwilioError';
/**
 * Error describing that the an unsupported platform other than Android
 * or iOS has been detected.
 *
 * @public
 */
export declare class UnsupportedPlatformError extends TwilioError {
    description: string;
    explanation: string;
    constructor(message: string);
}
