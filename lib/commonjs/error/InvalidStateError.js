"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InvalidStateError = void 0;

var _GenericError = require("./GenericError");

/**
 * Error describing that the SDK has entered or is attempting to enter an
 * invalid state.
 *
 * @public
 */
class InvalidStateError extends _GenericError.GenericError {
  constructor(message) {
    super(message);
    Object.setPrototypeOf(this, InvalidStateError.prototype);
    this.name = InvalidStateError.name;
  }

}

exports.InvalidStateError = InvalidStateError;
//# sourceMappingURL=InvalidStateError.js.map