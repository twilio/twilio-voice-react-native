import { TwilioError } from './TwilioError';
/**
 * Error describing that the an unsupported platform other than Android
 * or iOS has been detected.
 *
 * @public
 */
export class UnsupportedPlatformError extends TwilioError {
    description = 'Unsupported platform error.';
    explanation = 'An unsupported platform has been detected.';
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, UnsupportedPlatformError.prototype);
        this.name = UnsupportedPlatformError.name;
    }
}
