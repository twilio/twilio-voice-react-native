"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CallKit = void 0;

/**
 * @public
 * CallKit related types.
 */
let CallKit;
exports.CallKit = CallKit;

(function (_CallKit) {
  /**
   * @public
   * iOS CallKit configuration options.
   */
  let HandleType;

  (function (HandleType) {
    HandleType[HandleType["Generic"] = 0] = "Generic";
    HandleType[HandleType["PhoneNumber"] = 1] = "PhoneNumber";
    HandleType[HandleType["EmailAddress"] = 2] = "EmailAddress";
  })(HandleType || (HandleType = {}));

  _CallKit.HandleType = HandleType;
})(CallKit || (exports.CallKit = CallKit = {}));
//# sourceMappingURL=CallKit.js.map