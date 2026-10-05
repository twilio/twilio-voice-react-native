"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UnsupportedPlatformError = void 0;

var _TwilioError = require("./TwilioError");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Error describing that the an unsupported platform other than Android
 * or iOS has been detected.
 *
 * @public
 */
class UnsupportedPlatformError extends _TwilioError.TwilioError {
  constructor(message) {
    super(message);

    _defineProperty(this, "description", 'Unsupported platform error.');

    _defineProperty(this, "explanation", 'An unsupported platform has been detected.');

    Object.setPrototypeOf(this, UnsupportedPlatformError.prototype);
    this.name = UnsupportedPlatformError.name;
  }

}

exports.UnsupportedPlatformError = UnsupportedPlatformError;
//# sourceMappingURL=UnsupportedPlatformError.js.map