"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UnexpectedNativeError = void 0;

var _TwilioError = require("./TwilioError");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Error describing that the SDK has entered or is attempting to enter an
 * invalid state.
 *
 * @public
 */
class UnexpectedNativeError extends _TwilioError.TwilioError {
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

exports.UnexpectedNativeError = UnexpectedNativeError;
//# sourceMappingURL=UnexpectedNativeError.js.map