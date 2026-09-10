function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { TwilioError } from './TwilioError';
/**
 * Error describing that the an unsupported platform other than Android
 * or iOS has been detected.
 *
 * @public
 */

export class UnsupportedPlatformError extends TwilioError {
  constructor(message) {
    super(message);

    _defineProperty(this, "description", 'Unsupported platform error.');

    _defineProperty(this, "explanation", 'An unsupported platform has been detected.');

    Object.setPrototypeOf(this, UnsupportedPlatformError.prototype);
    this.name = UnsupportedPlatformError.name;
  }

}
//# sourceMappingURL=UnsupportedPlatformError.js.map