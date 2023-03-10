"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CallInvite = void 0;

var _Call = require("./Call");

var _common = require("./common");

var _InvalidStateError = require("./error/InvalidStateError");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Provides access to information about a call invite, including the call
 * parameters, and exposes functionality to accept or decline a call.
 *
 * @remarks
 *
 * Note that when a `CallInvite` is acted upon (i.e. when
 * {@link (CallInvite:class).accept} or {@link (CallInvite:class).reject} is
 * invoked), then the `CallInvite` is "settled".
 *
 * The state of the `CallInvite` is changed from
 * {@link (CallInvite:namespace).State.Pending} to
 * {@link (CallInvite:namespace).State.Accepted} or
 * {@link (CallInvite:namespace).State.Rejected} and the `CallInvite` can no
 * longer be acted upon further.
 *
 * Further action after "settling" a `CallInvite` will throw an error.
 *
 *  - See the {@link (CallInvite:namespace) | CallInvite namespace} for
 *    enumerations and types used by this class.
 *
 * @public
 */
class CallInvite {
  /**
   * The current state of the call invite.
   *
   * @remarks
   * See {@link (CallInvite:namespace).State}.
   */

  /**
   * The `Uuid` of this call invite. Used to identify calls between the JS and
   * native layer so we can associate events and native functionality between
   * the layers.
   */

  /**
   * A string representing the SID of this call.
   */

  /**
   * Call custom parameters.
   */

  /**
   * Call `from` parameter.
   */

  /**
   * Call `to` parameter.
   */

  /**
   * These objects should not be instantiated by consumers of the SDK. All
   * instances of the `CallInvite` class should be emitted by the SDK.
   *
   * @param nativeCallInviteInfo - A dataobject containing the native
   * information of a call invite.
   * @param state - Mocking options for testing.
   *
   * @internal
   */
  constructor({
    uuid,
    callSid,
    customParameters,
    from,
    to
  }, state) {
    _defineProperty(this, "_state", void 0);

    _defineProperty(this, "_uuid", void 0);

    _defineProperty(this, "_callSid", void 0);

    _defineProperty(this, "_customParameters", void 0);

    _defineProperty(this, "_from", void 0);

    _defineProperty(this, "_to", void 0);

    this._uuid = uuid;
    this._callSid = callSid;
    this._customParameters = { ...customParameters
    };
    this._from = from;
    this._to = to;
    this._state = state;
  }
  /**
   * Accept a call invite. Sets the state of this call invite to
   * {@link (CallInvite:namespace).State.Accepted}.
   * @param options - Options to pass to the native layer when accepting the
   * call.
   * @returns
   *  - Resolves when a {@link (Call:class) | Call object} associated with this
   *    {@link (CallInvite:class)} has been created.
   */


  async accept(options = {}) {
    if (this._state !== CallInvite.State.Pending) {
      throw new _InvalidStateError.InvalidStateError(`Call in state "${this._state}", ` + `expected state "${CallInvite.State.Pending}".`);
    }

    const callInfo = await _common.NativeModule.callInvite_accept(this._uuid, options);
    const call = new _Call.Call(callInfo);
    return call;
  }
  /**
   * Reject a call invite. Sets the state of this call invite to
   * {@link (CallInvite:namespace).State.Rejected}.
   * @returns
   *  - Resolves when the {@link (CallInvite:class)} has been rejected.
   */


  async reject() {
    if (this._state !== CallInvite.State.Pending) {
      throw new _InvalidStateError.InvalidStateError(`Call in state "${this._state}", ` + `expected state "${CallInvite.State.Pending}".`);
    }

    await _common.NativeModule.callInvite_reject(this._uuid);
  }
  /**
   * Check if a `CallInvite` is valid.
   *
   * @returns
   *  - TODO
   *
   * @alpha
   */


  isValid() {
    return _common.NativeModule.callInvite_isValid(this._uuid);
  }
  /**
   * Get the call SID associated with this `CallInvite` class.
   * @returns - A string representing the call SID.
   */


  getCallSid() {
    return this._callSid;
  }
  /**
   * Get the custom parameters of the call associated with this `CallInvite`
   * class.
   * @returns - A `Record` of custom parameters.
   */


  getCustomParameters() {
    return this._customParameters;
  }
  /**
   * Get the `from` parameter of the call associated with this `CallInvite`
   * class.
   * @returns - A `string` representing the `from` parameter.
   */


  getFrom() {
    return this._from;
  }
  /**
   * Get the `state` of the `CallInvite`.
   * @returns - The `state` of this `CallInvite`.
   */


  getState() {
    return this._state;
  }
  /**
   * Get the `to` parameter of the call associated with this `CallInvite`
   * class.
   * @returns - A `string` representing the `to` parameter.
   */


  getTo() {
    return this._to;
  }

}
/**
 * Provides enumerations and types used by a {@link (CallInvite:class)
 * | CallInvite object}.
 *
 * @remarks
 *  - See also the {@link (CallInvite:class) | CallInvite class}.
 *
 * @public
 */


exports.CallInvite = CallInvite;

(function (_CallInvite) {
  /**
   * Options to pass to the native layer when accepting the call.
   */
  let State;

  (function (State) {
    State["Pending"] = "pending";
    State["Accepted"] = "accepted";
    State["Rejected"] = "rejected";
  })(State || (State = {}));

  _CallInvite.State = State;
})(CallInvite || (exports.CallInvite = CallInvite = {}));
//# sourceMappingURL=CallInvite.js.map