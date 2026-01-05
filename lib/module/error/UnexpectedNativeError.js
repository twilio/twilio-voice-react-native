function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { TwilioError } from './TwilioError';
/**
 * Error describing that the SDK has entered or is attempting to enter an
 * invalid state.
 *
 * @public
 */

export class UnexpectedNativeError extends TwilioError {
  constructor(message, miscellaneousInfo) {
    super(message);

    _defineProperty(this, "description", 'Unexpected native error.');

    _defineProperty(this, "explanation", 'An unexpected native error has occurred.');

    _defineProperty(this, "miscellaneousInfo", void 0);

    Object.setPrototypeOf(this, UnexpectedNativeError.prototype);
    this.name = UnexpectedNativeError.name;
    this.miscellaneousInfo = miscellaneousInfo;
  }

}
//# sourceMappingURL=UnexpectedNativeError.js.map