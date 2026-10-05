function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { TwilioError } from './TwilioError';
/**
 * Error describing that the SDK has entered or is attempting to enter an
 * invalid state.
 *
 * @public
 */

export class InvalidStateError extends TwilioError {
  constructor(message) {
    super(message);

    _defineProperty(this, "description", 'Invalid state error.');

    _defineProperty(this, "explanation", 'The SDK has entered an invalid state.');

    Object.setPrototypeOf(this, InvalidStateError.prototype);
    this.name = InvalidStateError.name;
  }

}
//# sourceMappingURL=InvalidStateError.js.map