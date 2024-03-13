"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InvalidStateError = void 0;

var _TwilioError = require("./TwilioError");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Error describing that the SDK has entered or is attempting to enter an
 * invalid state.
 *
 * @public
 */
class InvalidStateError extends _TwilioError.TwilioError {
  constructor(message) {
    super(message);

    _defineProperty(this, "description", 'Invalid state error.');

    _defineProperty(this, "explanation", 'The SDK has entered an invalid state.');

    Object.setPrototypeOf(this, InvalidStateError.prototype);
    this.name = InvalidStateError.name;
  }

}

exports.InvalidStateError = InvalidStateError;
//# sourceMappingURL=InvalidStateError.js.map