"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Voice = void 0;

var _eventemitter = require("eventemitter3");

var _AudioDevice = require("./AudioDevice");

var _Call = require("./Call");

var _CallInvite = require("./CallInvite");

var _common = require("./common");

var _constants = require("./constants");

var _InvalidArgumentError = require("./error/InvalidArgumentError");

var _UnsupportedPlatformError = require("./error/UnsupportedPlatformError");

var _utility = require("./error/utility");

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
      if (nativeVoiceEvent.type !== _constants.Constants.VoiceEventTypeValueIncomingCallInvite) {
        throw new Error('Incorrect "voice#callInvite" handler called for type ' + `"${nativeVoiceEvent.type}".`);
      }

      const {
        callInvite: callInviteInfo
      } = nativeVoiceEvent;
      const callInvite = new _CallInvite.CallInvite(callInviteInfo, _CallInvite.CallInvite.State.Pending);
      this.emit(Voice.Event.CallInvite, callInvite);
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
      const error = (0, _utility.constructTwilioError)(message, code);
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
      const selectedDevice = typeof selectedDeviceInfo !== 'undefined' && selectedDeviceInfo !== null ? new _AudioDevice.AudioDevice(selectedDeviceInfo) : undefined;
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
      [_constants.Constants.VoiceEventTypeValueIncomingCallInvite]: this._handleCallInvite,

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
   * Connect for devices on Android platforms.
   */


  async _connect_android(token, params) {
    const connectResult = await _common.NativeModule.voice_connect_android(token, params).then(callInfo => {
      return {
        type: 'ok',
        callInfo
      };
    }).catch(error => {
      const code = error.userInfo.code;
      const message = error.userInfo.message;
      return {
        type: 'err',
        message,
        code
      };
    });

    if (connectResult.type === 'err') {
      throw (0, _utility.constructTwilioError)(connectResult.message, connectResult.code);
    }

    return new _Call.Call(connectResult.callInfo);
  }
  /**
   * Connect for devices on iOS platforms.
   */


  async _connect_ios(token, params, contactHandle) {
    const parsedContactHandle = contactHandle === '' ? 'Default Contact' : contactHandle;
    const callInfo = await _common.NativeModule.voice_connect_ios(token, params, parsedContactHandle);
    return new _Call.Call(callInfo);
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
   * The `contactHandle` parameter is only required for iOS apps. Currently the
   * parameter does have any effect on Android apps and can be ignored.
   * `Default Contact` will appear in the iOS call history if the value is empty
   * or not provided.
   *
   * @param token - A Twilio Access Token, usually minted by an
   * authentication-gated endpoint using a Twilio helper library.
   * @param options - Connect options.
   *  See {@link (Voice:namespace).ConnectOptions}.
   *
   * @returns
   * A `Promise` that
   *  - Resolves with a call when the call is created.
   *  - Rejects:
   *    * When a call is not able to be created on the native layer.
   *    * With an {@link TwilioErrors.InvalidArgumentError} when invalid
   *      arguments are passed.
   */
  async connect(token, {
    contactHandle = 'Default Contact',
    params = {}
  } = {}) {
    if (typeof token !== 'string') {
      throw new _InvalidArgumentError.InvalidArgumentError('Argument "token" must be of type "string".');
    }

    if (typeof contactHandle !== 'string') {
      throw new _InvalidArgumentError.InvalidArgumentError('Optional argument "contactHandle" must be undefined or of type' + ' "string".');
    }

    if (typeof params !== 'object') {
      throw new _InvalidArgumentError.InvalidArgumentError('Optional argument "params" must be undefined or of type "object".');
    }

    for (const [key, value] of Object.entries(params)) {
      if (typeof value !== 'string') {
        throw new _InvalidArgumentError.InvalidArgumentError(`Voice.ConnectOptions.params["${key}"] must be of type string`);
      }
    }

    switch (_common.Platform.OS) {
      case 'ios':
        return this._connect_ios(token, params, contactHandle);

      case 'android':
        return this._connect_android(token, params);

      default:
        throw new _UnsupportedPlatformError.UnsupportedPlatformError(`Unsupported platform "${_common.Platform.OS}". Expected "android" or "ios".`);
    }
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
   * Handle Firebase messages from an out-of-band Firebase messaging service.
   *
   * @remarks
   *
   * Note that this method only works on Android platforms, and will only work
   * when the built-in Firebase messaging service as been opted-out.
   *
   * Unsupported platforms:
   * - iOS
   *
   * @returns
   * A `Promise` that
   *  - Resolves with a boolean. This boolean is `true` if the Firebase message
   *    was handled properly, `false` otherwise.
   *  - Rejects if an error occurred when parsing the Firebase message, or if
   *    the app is incorrectly configured. This method will also reject if used
   *    on an unsupported platform.
   */


  async handleFirebaseMessage(remoteMessage) {
    switch (_common.Platform.OS) {
      case 'android':
        break;

      default:
        throw new _UnsupportedPlatformError.UnsupportedPlatformError(`Unsupported platform "${_common.Platform.OS}". This method is only supported on Android.`);
    }

    return await _common.NativeModule.voice_handleEvent(remoteMessage);
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
    const selectedDevice = typeof selectedDeviceInfo !== 'undefined' ? new _AudioDevice.AudioDevice(selectedDeviceInfo) : undefined;
    return selectedDevice ? {
      audioDevices,
      selectedDevice
    } : {
      audioDevices
    };
  }
  /**
   * Show the native AV route picker.
   *
   * @remarks
   * Unsupported platforms:
   * - Android
   *
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
  /**
   * Initialize a Push Registry instance inside the SDK for handling
   * PushKit device token updates and receiving push notifications.
   *
   * @remarks
   * Unsupported platforms:
   * - Android
   *
   * This API is specific to iOS and unavailable in Android.
   * Use this method if the application does not have an iOS PushKit
   * module and wishes to delegate the event handling to the SDK.
   * Call this method upon launching the app to guarantee that incoming
   * call push notifications will be surfaced to the users, especially when
   * the app is not running in the foreground.
   *
   * @returns
   * A `Promise` that
   *  - Resolves when the initialization is done.
   */


  async initializePushRegistry() {
    switch (_common.Platform.OS) {
      case 'ios':
        return _common.NativeModule.voice_initializePushRegistry();

      default:
        throw new _UnsupportedPlatformError.UnsupportedPlatformError(`Unsupported platform "${_common.Platform.OS}". This method is only supported on iOS.`);
    }
  }
  /**
   * Custom iOS CallKit configuration.
   *
   * @param configuration - iOS CallKit configuration options.
   *
   * @remarks
   * Unsupported platforms:
   * - Android
   *
   * See {@link CallKit} for more information.
   *
   * @returns
   * A `Promise` that
   *  - Resolves when the configuration has been applied.
   *  - Rejects if the configuration is unable to be applied.
   */


  async setCallKitConfiguration(configuration) {
    switch (_common.Platform.OS) {
      case 'ios':
        return _common.NativeModule.voice_setCallKitConfiguration(configuration);

      default:
        throw new _UnsupportedPlatformError.UnsupportedPlatformError(`Unsupported platform "${_common.Platform.OS}". This method is only supported on iOS.`);
    }
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
  /**
   * Options to pass to the {@link (Voice:class).connect} method.
   */
  let Event;

  (function (Event) {
    Event["AudioDevicesUpdated"] = "audioDevicesUpdated";
    Event["CallInvite"] = "callInvite";
    Event["Error"] = "error";
    Event["Registered"] = "registered";
    Event["Unregistered"] = "unregistered";
  })(Event || (Event = {}));

  _Voice.Event = Event;
  let Listener;

  (function (_Listener) {})(Listener || (Listener = _Voice.Listener || (_Voice.Listener = {})));
})(Voice || (exports.Voice = Voice = {}));
//# sourceMappingURL=Voice.js.map