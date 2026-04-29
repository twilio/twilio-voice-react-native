"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.settleNativePromise = void 0;

var _constants = require("../constants");

var _InvalidArgumentError = require("../error/InvalidArgumentError");

var _InvalidStateError = require("../error/InvalidStateError");

var _UnexpectedNativeError = require("../error/UnexpectedNativeError");

var _utility = require("../error/utility");

const settleNativePromise = async nativePromise => {
  const nativePromiseResult = await nativePromise;

  if (nativePromiseResult.promiseKeyStatus === _constants.Constants.PromiseStatusValueRejectedWithCode) {
    throw (0, _utility.constructTwilioError)(nativePromiseResult.promiseKeyErrorMessage, nativePromiseResult.promiseKeyErrorCode);
  }

  if (nativePromiseResult.promiseKeyStatus === _constants.Constants.PromiseStatusValueRejectedWithName) {
    const {
      promiseKeyErrorMessage: message
    } = nativePromiseResult;

    switch (nativePromiseResult.promiseKeyErrorName) {
      case _constants.Constants.ErrorCodeInvalidArgumentError:
        throw new _InvalidArgumentError.InvalidArgumentError(message);

      case _constants.Constants.ErrorCodeInvalidStateError:
        throw new _InvalidStateError.InvalidStateError(message);

      default:
        throw new _UnexpectedNativeError.UnexpectedNativeError(message);
    }
  }

  return nativePromiseResult.promiseKeyValue;
};

exports.settleNativePromise = settleNativePromise;
//# sourceMappingURL=nativePromise.js.map