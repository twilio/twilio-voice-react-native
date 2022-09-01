"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Call = void 0;

var _eventemitter = require("eventemitter3");

var _common = require("./common");

var _constants = require("./constants");

var _GenericError = require("./error/GenericError");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Provides access to information about a call, including the call parameters,
 * and exposes functionality for a call such as disconnecting, muting, and
 * holding.
 *
 * @remarks
 * Note that the call information is fetched as soon as possible from the native
 * layer, but there is no guarantee that all information is immediately
 * available. Methods such as `Call.getFrom()` or `Call.getTo()` may return
 * `undefined`.
 *
 * As call events are received from the native layer, call information will
 * propagate from the native layer to the JS layer and become available.
 * Therefore, it is good practice to read information from the call after an
 * event occurs, or as events occur.
 *
 *  - See the {@link (Call:namespace).Event} enum for events emitted by `Call`
 *    objects.
 *  - See the {@link (Call:interface) | Call interface} for overloaded event
 *    listening methods.
 *  - See the {@link (Call:namespace) | Call namespace} for types and
 *    enumerations used by this class.
 *
 * @public
 */
class Call extends _eventemitter.EventEmitter {
  /**
   * The `Uuid` of this call. Used to identify calls between the JS and native
   * layer so we can associate events and native functionality between the
   * layers.
   */

  /**
   * Call custom parameters.
   */

  /**
   * Call `from` parameter.
   */

  /**
   * A boolean representing if the call is currently muted.
   */

  /**
   * A boolean representing if the call is currently on hold.
   */

  /**
   * A string representing the SID of this call.
   */

  /**
   * The current state of the call.
   *
   * @remarks
   * See {@link (Call:namespace).State}.
   */

  /**
   * Call `to` parameter.
   */

  /**
   * Handlers for native call events. Set upon construction so we can
   * dynamically bind events to handlers.
   *
   * @privateRemarks
   * This is done by the constructor so this mapping isn't made every time the
   * {@link (Call:class)._handleNativeEvent} function is invoked.
   */

  /**
   * Constructor for the {@link (Call:class) | Call class}. This should not be
   * invoked by third-party code. All instances of the
   * {@link (Call:class) | Call class} should be made by the SDK and emitted by
   * {@link (Voice:class) | Voice objects}.
   *
   * @param nativeCallInfo - An object containing all of the data from the
   * native layer necessary to fully describe a call, as well as invoke native
   * functionality for the call.
   *
   * @internal
   */
  constructor({
    uuid,
    customParameters,
    from,
    sid,
    to,
    isMuted,
    isOnHold
  }) {
    super();

    _defineProperty(this, "_uuid", void 0);

    _defineProperty(this, "_customParameters", void 0);

    _defineProperty(this, "_from", void 0);

    _defineProperty(this, "_isMuted", void 0);

    _defineProperty(this, "_isOnHold", void 0);

    _defineProperty(this, "_sid", void 0);

    _defineProperty(this, "_state", Call.State.Connecting);

    _defineProperty(this, "_to", void 0);

    _defineProperty(this, "_nativeEventHandler", void 0);

    _defineProperty(this, "_handleNativeEvent", nativeCallEvent => {
      const {
        type,
        call: callInfo
      } = nativeCallEvent;
      const handler = this._nativeEventHandler[type];

      if (typeof handler === 'undefined') {
        throw new Error(`Unknown call event type received from the native layer: "${type}".`);
      }

      if (callInfo.uuid === this._uuid) {
        handler(nativeCallEvent);
      }
    });

    _defineProperty(this, "_handleConnectedEvent", nativeCallEvent => {
      if (nativeCallEvent.type !== _constants.Constants.CallEventConnected) {
        throw new Error('Incorrect "call#connected" handler called for type ' + `"${nativeCallEvent.type}".`);
      }

      this._update(nativeCallEvent);

      this.emit(Call.Event.Connected);
    });

    _defineProperty(this, "_handleConnectFailureEvent", nativeCallEvent => {
      if (nativeCallEvent.type !== _constants.Constants.CallEventConnectFailure) {
        throw new Error('Incorrect "call#connectFailure" handler called for type ' + `"${nativeCallEvent.type}".`);
      }

      this._update(nativeCallEvent);

      const error = new _GenericError.GenericError(nativeCallEvent.error.message, nativeCallEvent.error.code);
      this.emit(Call.Event.ConnectFailure, error);
    });

    _defineProperty(this, "_handleDisconnectedEvent", nativeCallEvent => {
      if (nativeCallEvent.type !== _constants.Constants.CallEventDisconnected) {
        throw new Error('Incorrect "call#disconnected" handler called for type ' + `"${nativeCallEvent.type}".`);
      }

      this._update(nativeCallEvent);

      if (nativeCallEvent.error) {
        const error = new _GenericError.GenericError(nativeCallEvent.error.message, nativeCallEvent.error.code);
        this.emit(Call.Event.Disconnected, error);
      } else {
        this.emit(Call.Event.Disconnected);
      }
    });

    _defineProperty(this, "_handleReconnectingEvent", nativeCallEvent => {
      if (nativeCallEvent.type !== _constants.Constants.CallEventReconnecting) {
        throw new Error('Incorrect "call#reconnecting" handler called for type ' + `"${nativeCallEvent.type}".`);
      }

      this._update(nativeCallEvent);

      const error = new _GenericError.GenericError(nativeCallEvent.error.message, nativeCallEvent.error.code);
      this.emit(Call.Event.Reconnecting, error);
    });

    _defineProperty(this, "_handleReconnectedEvent", nativeCallEvent => {
      if (nativeCallEvent.type !== _constants.Constants.CallEventReconnected) {
        throw new Error('Incorrect "call#reconnected" handler called for type ' + `"${nativeCallEvent.type}".`);
      }

      this._update(nativeCallEvent);

      this.emit(Call.Event.Reconnected);
    });

    _defineProperty(this, "_handleRingingEvent", nativeCallEvent => {
      if (nativeCallEvent.type !== _constants.Constants.CallEventRinging) {
        throw new Error('Incorrect "call#ringing" handler called for type ' + `"${nativeCallEvent.type}".`);
      }

      this._update(nativeCallEvent);

      this.emit(Call.Event.Ringing);
    });

    _defineProperty(this, "_handleQualityWarningsChangedEvent", nativeCallEvent => {
      if (nativeCallEvent.type !== _constants.Constants.CallEventQualityWarningsChanged) {
        throw new Error('Incorrect "call#qualityWarnings" handler called for type ' + `"${nativeCallEvent.type}".`);
      }

      this._update(nativeCallEvent);

      const {
        currentWarnings,
        previousWarnings
      } = nativeCallEvent;
      this.emit(Call.Event.QualityWarningsChanged, currentWarnings, previousWarnings);
    });

    this._uuid = uuid;
    this._customParameters = { ...customParameters
    };
    this._from = from;
    this._sid = sid;
    this._to = to;
    this._isMuted = isMuted;
    this._isOnHold = isOnHold;
    this._nativeEventHandler = {
      /**
       * Call State
       */
      [_constants.Constants.CallEventConnected]: this._handleConnectedEvent,
      [_constants.Constants.CallEventConnectFailure]: this._handleConnectFailureEvent,
      [_constants.Constants.CallEventDisconnected]: this._handleDisconnectedEvent,
      [_constants.Constants.CallEventReconnected]: this._handleReconnectedEvent,
      [_constants.Constants.CallEventReconnecting]: this._handleReconnectingEvent,
      [_constants.Constants.CallEventRinging]: this._handleRingingEvent,

      /**
       * Call Quality
       */
      [_constants.Constants.CallEventQualityWarningsChanged]: this._handleQualityWarningsChangedEvent
    };

    _common.NativeEventEmitter.addListener(_constants.Constants.ScopeCall, this._handleNativeEvent);
  }
  /**
   * This intermediate native call event handler acts as a "gate", only
   * executing the actual call event handler (such as `Connected`) if this call
   * object matches the `Uuid` of the call that had an event raised.
   * @param nativeCallEvent - A call event directly from the native layer.
   */


  /**
   * Helper function to update the state of the call when a call event occurs
   * that necessitates an update, i.e. upon a
   * {@link (Call:namespace).Event.Connected | Connected event} we want to
   * update the state of the call to also reflect the
   * {@link (Call:namespace).State.Connected | Connected state}.
   * @param nativeCallEvent - The native call event.
   */
  _update({
    type,
    call: {
      from,
      sid,
      to
    }
  }) {
    const newState = Call.EventTypeStateMap[type];

    if (typeof newState === 'string') {
      this._state = newState;
    }

    this._from = from;
    this._sid = sid;
    this._to = to;
  }
  /**
   * Handler for the the {@link (Call:namespace).Event.Connected} event.
   * @param nativeCallEvent - The native call event.
   */


  /**
   * Disconnect this side of the call.
   * @returns
   *  A `Promise` that
   *    - Resolves when the call has disconnected.
   *    - Rejects if the native layer cannot disconnect the call.
   */
  disconnect() {
    return _common.NativeModule.call_disconnect(this._uuid);
  }
  /**
   * Get the mute status of this side of the call.
   * @returns
   *  - A boolean representing the muted status of the call.
   *  - `undefined` if the call state has not yet been received from the native
   *    layer.
   */


  isMuted() {
    return this._isMuted;
  }
  /**
   * Get the hold status of this side of the call.
   * @returns
   *  - A boolean representing the hold status of the call.
   *  - `undefined` if the call state has not yet been received from the native
   *    layer.
   */


  isOnHold() {
    return this._isOnHold;
  }
  /**
   * Return a `Record` of custom parameters given to this call.
   * @returns
   *   - A `Record` of custom parameters.
   */


  getCustomParameters() {
    return this._customParameters;
  }
  /**
   * Get the value of the `from` parameter given to this call.
   * @returns
   *  - A `String` representing the `from` parameter.
   *  - `undefined` if the call information has not yet been received from the
   *    native layer.
   */


  getFrom() {
    return this._from;
  }
  /**
   * Get the call `SID`.
   * @returns
   *  - A `String` representing the `SID` of the call.
   *  - `undefined` if the call information has not yet been received from the
   *    native layer.
   */


  getSid() {
    return this._sid;
  }
  /**
   * Get the state of the call object, such as {@link (Call:namespace).State.Connected} or
   * {@link (Call:namespace).State.Disconnected}.
   * @returns
   *  - A {@link (Call:namespace).State}.
   */


  getState() {
    return this._state;
  }
  /**
   * Gets the `PeerConnection` `WebRTC` stats for the ongoing call.
   * @returns
   *  A `Promise` that
   *    - Resolves with a {@link RTCStats.StatsReport} object representing the
   *      `WebRTC` `PeerConnection` stats of a call.
   *    - Rejects when a {@link RTCStats.StatsReport} cannot be generated for a
   *      call.
   */


  getStats() {
    return _common.NativeModule.call_getStats(this._uuid);
  }
  /**
   * Get the value of the `to` parameter given to this call.
   * @returns
   *  - A `String` representing the `to` parameter.
   *  - `undefined` if the call information has not yet been received from the
   *    native layer.
   */


  getTo() {
    return this._to;
  }
  /**
   * Put this end of the call on hold or not on hold.
   *
   * @example
   * To put a call on hold
   * ```typescript
   * call.hold(true);
   * ```
   * @example
   * To take a call off hold
   * ```typescript
   * call.hold(false);
   * ```
   *
   * @param hold - A `boolean` representing whether or not to put this end of
   *  the call on hold.
   *
   * @returns
   *  A `Promise` that
   *    - Resolves with the hold status when the call is put on hold or not on
   *      hold.
   *    - Rejects when the call is not able to be put on hold or not on hold.
   */


  async hold(hold) {
    this._isOnHold = await _common.NativeModule.call_hold(this._uuid, hold);
    return this._isOnHold;
  }
  /**
   * Mute or unmute this end of the call.
   *
   * @example
   * To mute a call
   * ```typescript
   * call.mute(true);
   * ```
   *
   * @example
   * To unmute a call
   * ```typescript
   * call.mute(false);
   * ```
   *
   * @param mute - A `boolean` representing whether or not to mute this end of
   *  the call.
   *
   * @returns
   *  A `Promise` that
   *    - Resolves with the muted status of the call when the call is muted or
   *      unmuted.
   *    - Rejects when the call is not able to be muted or unmuted.
   */


  async mute(mute) {
    this._isMuted = await _common.NativeModule.call_mute(this._uuid, mute);
    return this._isMuted;
  }
  /**
   * Send DTMF digits.
   *
   * @example
   * To send the `0` dialtone:
   * ```typescript
   * call.sendDigits('0');
   * ```
   *
   * @example
   * To send the `0` and then `1` dialtone:
   * ```typescript
   * call.sendDigits('01');
   * ```
   *
   * @param digits - A sequence of DTMF digits in a string.
   *
   * @returns
   *  A `Promise` that
   *    - Resolves when the DTMF digits have been sent.
   *    - Rejects when DTMF tones are not able to be sent.
   */


  sendDigits(digits) {
    return _common.NativeModule.call_sendDigits(this._uuid, digits);
  }
  /**
   * Post feedback about a call.
   *
   * @example
   * To report that a call had very significant audio latency:
   * ```typescript
   * call.postFeedback(Call.Score.Five, Call.Issue.AudioLatency);
   * ```
   *
   * @param score - A score representing the serverity of the issue being
   * reported.
   * @param issue - The issue being reported.
   * @returns
   *  A `Promise` that
   *    - Resolves when the feedback has been posted.
   *    - Rejects when the feedback is unable to be sent.
   */


  postFeedback(score, issue) {
    return _common.NativeModule.call_postFeedback(this._uuid, score, issue);
  }

}
/**
 * Namespace for enumerations and types used by
 * {@link (Call:class) | Call objects}.
 *
 * @remarks
 *  - See also the {@link (Call:class) | Call class}.
 *  - See also the {@link (Call:interface) | Call interface}.
 *
 * @public
 */


exports.Call = Call;

(function (_Call) {
  let Event;

  (function (Event) {
    Event["Connected"] = "connected";
    Event["ConnectFailure"] = "connectFailure";
    Event["Reconnecting"] = "reconnecting";
    Event["Reconnected"] = "reconnected";
    Event["Disconnected"] = "disconnected";
    Event["Ringing"] = "ringing";
    Event["QualityWarningsChanged"] = "qualityWarningsChanged";
  })(Event || (Event = {}));

  _Call.Event = Event;
  let State;

  (function (State) {
    State["Connected"] = "connected";
    State["Connecting"] = "connecting";
    State["Disconnected"] = "disconnected";
    State["Reconnecting"] = "reconnected";
    State["Ringing"] = "ringing";
  })(State || (State = {}));

  _Call.State = State;
  const EventTypeStateMap = _Call.EventTypeStateMap = {
    [_constants.Constants.CallEventConnected]: Call.State.Connected,
    [_constants.Constants.CallEventConnectFailure]: Call.State.Disconnected,
    [_constants.Constants.CallEventDisconnected]: Call.State.Disconnected,
    [_constants.Constants.CallEventReconnecting]: Call.State.Reconnecting,
    [_constants.Constants.CallEventReconnected]: Call.State.Connected,
    [_constants.Constants.CallEventRinging]: Call.State.Ringing
  };
  let QualityWarning;

  (function (QualityWarning) {
    QualityWarning["ConstantAudioInputLevel"] = "constant-audio-input-level";
    QualityWarning["HighJitter"] = "high-jitter";
    QualityWarning["HighPacketLoss"] = "high-packet-loss";
    QualityWarning["HighRtt"] = "high-rtt";
    QualityWarning["LowMos"] = "low-mos";
  })(QualityWarning || (QualityWarning = {}));

  _Call.QualityWarning = QualityWarning;
  let Score;

  (function (Score) {
    Score[Score["NotReported"] = 0] = "NotReported";
    Score[Score["One"] = 1] = "One";
    Score[Score["Two"] = 2] = "Two";
    Score[Score["Three"] = 3] = "Three";
    Score[Score["Four"] = 4] = "Four";
    Score[Score["Five"] = 5] = "Five";
  })(Score || (Score = {}));

  _Call.Score = Score;
  let Issue;

  (function (Issue) {
    Issue["NotReported"] = "not-reported";
    Issue["DroppedCall"] = "dropped-call";
    Issue["AudioLatency"] = "audio-latency";
    Issue["OneWayAudio"] = "one-way-audio";
    Issue["ChoppyAudio"] = "choppy-audio";
    Issue["NoisyCall"] = "noisy-call";
    Issue["Echo"] = "echo";
  })(Issue || (Issue = {}));

  _Call.Issue = Issue;
  let Listener;

  (function (_Listener) {})(Listener || (Listener = _Call.Listener || (_Call.Listener = {})));
})(Call || (exports.Call = Call = {}));
//# sourceMappingURL=Call.js.map