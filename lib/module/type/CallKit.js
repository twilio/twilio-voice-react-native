/**
 * @public
 * CallKit related types.
 */
export let CallKit;

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
})(CallKit || (CallKit = {}));
//# sourceMappingURL=CallKit.js.map