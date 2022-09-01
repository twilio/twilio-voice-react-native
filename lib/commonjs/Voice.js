"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Voice = void 0;

var _eventemitter = require("eventemitter3");

var _AudioDevice = require("./AudioDevice");

var _Call = require("./Call");

var _CallInvite = require("./CallInvite");

var _CancelledCallInvite = require("./CancelledCallInvite");

var _common = require("./common");

var _constants = require("./constants");

var _GenericError = require("./error/GenericError");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Main entry-point of the Voice SDK. Provides access to the entire feature-set
 * of the library.
 *
 * @example
 * Usage:
 * ```
 * const token = '...';
 *
 * const voice = new Voice();
 *
 * voice.on(Voice.Event.CallInvite, (callInvite: CallInvite) => {
 *   callInvite.accept();
 * });
 *
 * voice.register(token);
 * ```
 *
 * @remarks
 *  - See also the {@link (Voice:namespace).Event} enum for events emitted by
 *    `Voice` objects.
 *  - See also the {@link (Voice:interface) | Voice interface} for events
 *    emitted by this class and associated types.
 *  - See also the {@link (Voice:namespace) | Voice namespace} for types and
 *    enumerations used by this class.
 *
 * @public
 */
class Voice extends _eventemitter.EventEmitter {
  /**
   * Handlers for native voice events. Set upon construction so we can
   * dynamically bind events to handlers.
   *
   * @privateRemarks
   * This is done by the constructor so this mapping isn't made every time the
   * {@link (Voice:class)._handleNativeEvent} function is invoked.
   */

  /**
   * Main entry-point of the Voice SDK. Provides access to the entire
   * feature-set of the library.
   */
  constructor() {
    super();

    _defineProperty(this, "_nativeEventHandler", void 0);

    _defineProperty(this, "_handleNativeEvent", nativeVoiceEvent => {
      const {
        type
      } = nativeVoiceEvent;
      const handler = this._nativeEventHandler[type];

      if (typeof handler === 'undefined') {
        throw new Error(`Unknown voice event type received from the native layer: "${type}".`);
      }

      handler(nativeVoiceEvent);
    });

    _defineProperty(this, "_handleCallInvite", nativeVoiceEvent => {
      if (nativeVoiceEvent.type !== _constants.Constants.VoiceEventCallInvite) {
        throw new Error('Incorrect "voice#callInvite" handler called for type ' + `"${nativeVoiceEvent.type}".`);
      }

      const {
        callInvite: callInviteInfo
      } = nativeVoiceEvent;
      const callInvite = new _CallInvite.CallInvite(callInviteInfo, _CallInvite.CallInvite.State.Pending);
      this.emit(Voice.Event.CallInvite, callInvite);
    });

    _defineProperty(this, "_handleCallInviteAccepted", nativeVoiceEvent => {
      if (nativeVoiceEvent.type !== _constants.Constants.VoiceEventCallInviteAccepted) {
        throw new Error('Incorrect "voice#callInviteAccepted" handler called for type ' + `"${nativeVoiceEvent.type}".`);
      }

      const {
        callInvite: callInviteInfo
      } = nativeVoiceEvent;
      const callInvite = new _CallInvite.CallInvite(callInviteInfo, _CallInvite.CallInvite.State.Accepted);
      const callInfo = {
        uuid: callInviteInfo.uuid,
        customParameters: callInviteInfo.customParameters,
        sid: callInviteInfo.callSid,
        from: callInviteInfo.from,
        to: callInviteInfo.to
      };
      const call = new _Call.Call(callInfo);
      this.emit(Voice.Event.CallInviteAccepted, callInvite, call);
    });

    _defineProperty(this, "_handleCallInviteRejected", nativeVoiceEvent => {
      if (nativeVoiceEvent.type !== _constants.Constants.VoiceEventCallInviteRejected) {
        throw new Error('Incorrect "voice#callInviteRejected" handler called for type ' + `"${nativeVoiceEvent.type}".`);
      }

      const {
        callInvite: callInviteInfo
      } = nativeVoiceEvent;
      const callInvite = new _CallInvite.CallInvite(callInviteInfo, _CallInvite.CallInvite.State.Rejected);
      this.emit(Voice.Event.CallInviteRejected, callInvite);
    });

    _defineProperty(this, "_handleCancelledCallInvite", nativeVoiceEvent => {
      if (nativeVoiceEvent.type !== _constants.Constants.VoiceEventCallInviteCancelled) {
        throw new Error('Incorrect "voice#cancelledCallInvite" handler called for type ' + `"${nativeVoiceEvent.type}".`);
      }

      const {
        cancelledCallInvite: cancelledCallInviteInfo,
        error: errorInfo
      } = nativeVoiceEvent;
      const error = new _GenericError.GenericError(errorInfo.message, errorInfo.code);
      const cancelledCallInvite = new _CancelledCallInvite.CancelledCallInvite(cancelledCallInviteInfo);
      this.emit(Voice.Event.CancelledCallInvite, cancelledCallInvite, error);
    });

    _defineProperty(this, "_handleError", nativeVoiceEvent => {
      if (nativeVoiceEvent.type !== _constants.Constants.VoiceEventError) {
        throw new Error('Incorrect "voice#error" handler called for type ' + `"${nativeVoiceEvent.type}".`);
      }

      const {
        error: {
          code,
          message
        }
      } = nativeVoiceEvent;
      const error = new _GenericError.GenericError(message, code);
      this.emit(Voice.Event.Error, error);
    });

    _defineProperty(this, "_handleRegistered", nativeVoiceEvent => {
      if (nativeVoiceEvent.type !== _constants.Constants.VoiceEventRegistered) {
        throw new Error('Incorrect "voice#error" handler called for type ' + `"${nativeVoiceEvent.type}".`);
      }

      this.emit(Voice.Event.Registered);
    });

    _defineProperty(this, "_handleUnregistered", nativeVoiceEvent => {
      if (nativeVoiceEvent.type !== _constants.Constants.VoiceEventUnregistered) {
        throw new Error('Incorrect "voice#error" handler called for type ' + `"${nativeVoiceEvent.type}".`);
      }

      this.emit(Voice.Event.Unregistered);
    });

    _defineProperty(this, "_handleAudioDevicesUpdated", nativeVoiceEvent => {
      if (nativeVoiceEvent.type !== _constants.Constants.VoiceEventAudioDevicesUpdated) {
        throw new Error('Incorrect "voice#audioDevicesUpdated" handler called for type ' + `"${nativeVoiceEvent.type}".`);
      }

      const {
        audioDevices: audioDeviceInfos,
        selectedDevice: selectedDeviceInfo
      } = nativeVoiceEvent;
      const audioDevices = audioDeviceInfos.map(audioDeviceInfo => new _AudioDevice.AudioDevice(audioDeviceInfo));
      const selectedDevice = new _AudioDevice.AudioDevice(selectedDeviceInfo);
      this.emit(Voice.Event.AudioDevicesUpdated, audioDevices, selectedDevice);
    });

    this._nativeEventHandler = {
      /**
       * Common
       */
      [_constants.Constants.VoiceEventError]: this._handleError,

      /**
       * Call Invite
       */
      [_constants.Constants.VoiceEventCallInvite]: this._handleCallInvite,
      [_constants.Constants.VoiceEventCallInviteAccepted]: this._handleCallInviteAccepted,
      [_constants.Constants.VoiceEventCallInviteRejected]: this._handleCallInviteRejected,
      [_constants.Constants.VoiceEventCallInviteCancelled]: this._handleCancelledCallInvite,

      /**
       * Registration
       */
      [_constants.Constants.VoiceEventRegistered]: this._handleRegistered,
      [_constants.Constants.VoiceEventUnregistered]: this._handleUnregistered,

      /**
       * Audio Devices
       */
      [_constants.Constants.VoiceEventAudioDevicesUpdated]: this._handleAudioDevicesUpdated
    };

    _common.NativeEventEmitter.addListener(_constants.Constants.ScopeVoice, this._handleNativeEvent);
  }
  /**
   * Intermediary event handler for `Voice`-level events. Ensures that the type
   * of the incoming event is expected and invokes the proper event listener.
   * @param nativeVoiceEvent - A `Voice` event directly from the native layer.
   */


  /**
   * Create an outgoing call.
   *
   * @remarks
   * Note that the resolution of the returned `Promise` does not imply any call
   * event occurring, such as answered or rejected.
   *
   * @param token - A Twilio Access Token, usually minted by an
   * authentication-gated endpoint using a Twilio helper library.
   * @param params - Custom parameters to send to the TwiML Application.
   *
   * @returns
   * A `Promise` that
   *  - Resolves with a call when the call is created.
   */
  async connect(token, params = {}) {
    const callInfo = await _common.NativeModule.voice_connect(token, params);
    const call = new _Call.Call(callInfo);
    return call;
  }
  /**
   * Get the version of the native SDK. Note that this is not the version of the
   * React Native SDK, this is the version of the mobile SDK that the RN SDK is
   * utilizing.
   * @returns
   * A `Promise` that
   *  - Resolves with a string representing the version of the native SDK.
   */


  getVersion() {
    return _common.NativeModule.voice_getVersion();
  }
  /**
   * Get the Device token from the native layer.
   * @returns a Promise that resolves with a string representing the Device
   * token.
   */


  getDeviceToken() {
    return _common.NativeModule.voice_getDeviceToken();
  }
  /**
   * Get a list of existing calls, ongoing and pending. This will not return any
   * call that has finished.
   * @returns
   * A `Promise` that
   *  - Resolves with a mapping of `Uuid`s to {@link (Call:class)}s.
   */


  async getCalls() {
    const callInfos = await _common.NativeModule.voice_getCalls();
    const callsMap = new Map(callInfos.map(callInfo => [callInfo.uuid, new _Call.Call(callInfo)]));
    return callsMap;
  }
  /**
   * Get a list of pending call invites.
   *
   * @remarks
   * This list will not contain any call invites that have been "settled"
   * (answered or rejected).
   *
   * @returns
   * A `Promise` that
   *  - Resolves with a mapping of `Uuid`s to {@link (CallInvite:class)}s.
   */


  async getCallInvites() {
    const callInviteInfos = await _common.NativeModule.voice_getCallInvites();
    const callInvitesMap = new Map(callInviteInfos.map(callInviteInfo => [callInviteInfo.uuid, new _CallInvite.CallInvite(callInviteInfo, _CallInvite.CallInvite.State.Pending)]));
    return callInvitesMap;
  }
  /**
   * Register this device for incoming calls.
   * @param token - A Twilio Access Token.
   * @returns
   * A `Promise` that
   *  - Resolves when the device has been registered.
   */


  register(token) {
    return _common.NativeModule.voice_register(token);
  }
  /**
   * Unregister this device for incoming calls.
   * @param token - A Twilio Access Token.
   * @returns
   * A `Promise` that
   *  - Resolves when the device has been unregistered.
   */


  unregister(token) {
    return _common.NativeModule.voice_unregister(token);
  }
  /**
   * Get audio device information from the native layer.
   * @returns
   * A `Promise` that
   *  - Resolves with a list of the native device's audio devices and the
   *    currently selected device.
   */


  async getAudioDevices() {
    const {
      audioDevices: audioDeviceInfos,
      selectedDevice: selectedDeviceInfo
    } = await _common.NativeModule.voice_getAudioDevices();
    const audioDevices = audioDeviceInfos.map(audioDeviceInfo => new _AudioDevice.AudioDevice(audioDeviceInfo));
    const selectedDevice = new _AudioDevice.AudioDevice(selectedDeviceInfo);
    return {
      audioDevices,
      selectedDevice
    };
  }
  /**
   * Show the native AV route picker.
   *
   * @remarks
   * This API is specific to iOS and unavailable in Android. If this API is
   * invoked on Android, there will be no operation and the returned `Promise`
   * will immediately resolve with `null`.
   *
   * @returns
   * A `Promise` that
   *  - Resolves when the AV Route Picker View is shown.
   */


  showAvRoutePickerView() {
    return _common.NativeModule.voice_showNativeAvRoutePicker();
  }

}
/**
 * Provides enumerations and types used by {@link (Voice:class)
 * | Voice objects}.
 *
 * @remarks
 * - See also the {@link (Voice:class) | Voice class}.
 * - See also the {@link (Voice:interface) | Voice interface}.
 *
 * @public
 */


exports.Voice = Voice;

(function (_Voice) {
  let Event;

  (function (Event) {
    Event["AudioDevicesUpdated"] = "audioDevicesUpdated";
    Event["CallInvite"] = "callInvite";
    Event["CallInviteAccepted"] = "callInviteAccepted";
    Event["CallInviteRejected"] = "callInviteRejected";
    Event["CancelledCallInvite"] = "cancelledCallInvite";
    Event["Error"] = "error";
    Event["Registered"] = "registered";
    Event["Unregistered"] = "unregistered";
  })(Event || (Event = {}));

  _Voice.Event = Event;
  let Listener;

  (function (_Listener) {})(Listener || (Listener = _Voice.Listener || (_Voice.Listener = {})));
})(Voice || (exports.Voice = Voice = {}));
//# sourceMappingURL=Voice.js.map