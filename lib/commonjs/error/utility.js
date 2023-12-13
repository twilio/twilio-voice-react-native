"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.constructTwilioError = constructTwilioError;

var _generated = require("./generated");

var _TwilioError = require("./TwilioError");

var _InvalidArgumentError = require("./InvalidArgumentError");

/**
 * Uses the generated error-code map to create the appropriate error.
 * If the code is "unexpected" such that there is no constructor for that
 * specific code, this function will default to a generic {@link TwilioError}.
 *
 * @param message an error message
 * @param code a Twilio error code, for example `31209`
 *
 * @returns a {@link TwilioError} or appropriate sub-class
 */
function constructTwilioError(message, code) {
  if (typeof message !== 'string') {
    throw new _InvalidArgumentError.InvalidArgumentError('The "message" argument is not of type "string".');
  }

  if (typeof code !== 'number') {
    throw new _InvalidArgumentError.InvalidArgumentError('The "code" argument is not of type "number".');
  }

  const ErrorClass = _generated.errorsByCode.get(code);

  return typeof ErrorClass !== 'undefined' ? new ErrorClass(message) : new _TwilioError.TwilioError(message, code);
}
//# sourceMappingURL=utility.js.map