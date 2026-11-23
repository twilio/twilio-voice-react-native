function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { TwilioError } from './TwilioError';
/**
 * Error describing that an SDK function is invoked with an invalid argument.
 *
 * @public
 */

export class InvalidArgumentError extends TwilioError {
  constructor(message) {
    super(message);

    _defineProperty(this, "description", 'Invalid argument error.');

    _defineProperty(this, "explanation", 'The SDK has encountered a situation where invalid arguments were passed.');

    Object.setPrototypeOf(this, InvalidArgumentError.prototype);
    this.name = InvalidArgumentError.name;
  }

}
//# sourceMappingURL=InvalidArgumentError.js.map