"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CallInvite = void 0;

var _Call = require("./Call");

var _common = require("./common");

var _InvalidStateError = require("./error/InvalidStateError");

var _CallMessage = require("./CallMessage");

var _OutgoingCallMessage = require("./OutgoingCallMessage");

var _constants = require("./constants");

var _eventemitter = require("eventemitter3");

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
class CallInvite extends _eventemitter.EventEmitter {
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
   * Handlers for native callInvite events. Set upon construction so we can
   * dynamically bind events to handlers.
   *
   * @privateRemarks
   * This is done by the constructor so this mapping isn't made every time the
   * {@link (CallInvite:class)._handleNativeEvent} function is invoked.
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
    super();

    _defineProperty(this, "_state", void 0);

    _defineProperty(this, "_uuid", void 0);

    _defineProperty(this, "_callSid", void 0);

    _defineProperty(this, "_customParameters", void 0);

    _defineProperty(this, "_from", void 0);

    _defineProperty(this, "_to", void 0);

    _defineProperty(this, "_nativeEventHandler", void 0);

    _defineProperty(this, "_handleNativeEvent", nativeCallInviteEvent => {
      const {
        type
      } = nativeCallInviteEvent;
      const handler = this._nativeEventHandler[type];

      if (typeof handler === 'undefined') {
        throw new Error(`Unknown callInvite event type received from the native layer: "${type}".`);
      }

      handler(nativeCallInviteEvent);
    });

    _defineProperty(this, "_handleMessageReceivedEvent", nativeCallInviteEvent => {
      if (nativeCallInviteEvent.type !== _constants.Constants.CallEventMessageReceived) {
        throw new Error('Incorrect "callInvite#Received" handler called for type' + `"${nativeCallInviteEvent.type}`);
      }

      const {
        callMessage: callMessageInfo
      } = nativeCallInviteEvent;
      const callMessage = new _CallMessage.CallMessage(callMessageInfo);
      this.emit(CallInvite.Event.MessageReceived, callMessage);
    });

    this._uuid = uuid;
    this._callSid = callSid;
    this._customParameters = { ...customParameters
    };
    this._from = from;
    this._to = to;
    this._state = state;
    this._nativeEventHandler = {
      /**
       * Call Message
       */
      [_constants.Constants.CallEventMessageReceived]: this._handleMessageReceivedEvent
    };

    _common.NativeEventEmitter.addListener(_constants.Constants.ScopeCallInvite, this._handleNativeEvent);
  }
  /**
   * This intermediate native callInvite event handler acts as a "gate".
   * @param nativeCallInviteEvent - A callInvite event directly from the native layer.
   */


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
  /**
   * Send {@link (CallMessage:class)}.
   *
   * @example
   * To send a user-defined-message
   * ```typescript
   * const message = new CallMessage({
   *    content: { key1: 'This is a messsage from the parent call' },
   *    contentType: CallMessage.ContentType.ApplicationJson,
   *    messageType: CallMessage.MessageType.UserDefinedMessage
   * })
   * const outgoingCallMessage: OutgoingCallMessage = await call.sendMessage(message)
   *
   * outgoingCallMessage.addListener(OutgoingCallMessage.Event.Failure, (error) => {
   *    // outgoingCallMessage failed, handle error
   * });
   *
   * outgoingCallMessage.addListener(OutgoingCallMessage.Event.Sent, () => {
   *    // outgoingCallMessage sent
   * })
   * ```
   *
   * @param content - The message content
   * @param contentType - The MIME type for the message. See {@link (CallMessage:namespace).ContentType}.
   * @param messageType - The message type. See {@link (CallMessage:namespace).MessageType}.
   *
   * @returns
   *  A `Promise` that
   *    - Resolves with the OutgoingCallMessage object.
   *    - Rejects when the message is unable to be sent.
   */


  async sendMessage(message) {
    const content = message.getContent();
    const contentType = message.getContentType();
    const messageType = message.getMessageType();
    const voiceEventSid = await _common.NativeModule.call_sendMessage(this._uuid, JSON.stringify(content), contentType, messageType);
    const outgoingCallMessage = new _OutgoingCallMessage.OutgoingCallMessage({
      content,
      contentType,
      messageType,
      voiceEventSid
    });
    return outgoingCallMessage;
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
  let Event;

  (function (Event) {
    Event["MessageReceived"] = "messageReceived";
  })(Event || (Event = {}));

  _CallInvite.Event = Event;
  let Listener;

  (function (_Listener) {})(Listener || (Listener = _CallInvite.Listener || (_CallInvite.Listener = {})));
})(CallInvite || (exports.CallInvite = CallInvite = {}));
//# sourceMappingURL=CallInvite.js.map