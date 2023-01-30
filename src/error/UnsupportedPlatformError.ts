import { TwilioError } from './TwilioError';

/**
 * Error describing that the an unsupported platform other than Android
 * or iOS has been detected.
 *
 * @public
 */
export class UnsupportedPlatformError extends TwilioError {
  description: string = 'Unsupported platform error.';
  explanation: string = 'An unsupported platform has been detected.';

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, UnsupportedPlatformError.prototype);
    this.name = UnsupportedPlatformError.name;
  }
}
