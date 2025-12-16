function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Copyright © 2022 Twilio, Inc. All rights reserved. Licensed under the Twilio
 * license.
 *
 * See LICENSE in the project root for license information.
 */
import { EventEmitter } from 'eventemitter3';
import { AudioDevice } from './AudioDevice';
import { Call } from './Call';
import { CallInvite } from './CallInvite';
import { NativeEventEmitter, NativeModule, Platform } from './common';
import { Constants } from './constants';
import { InvalidArgumentError } from './error/InvalidArgumentError';
import { UnsupportedPlatformError } from './error/UnsupportedPlatformError';
import { constructTwilioError } from './error/utility';
import { PreflightTest } from './PreflightTest';
import { validatePreflightOptions } from './utility/preflightTestOptions';
import { settleNativePromise } from './utility/nativePromise';
/**
 * Defines strict typings for all events emitted by {@link (Voice:class)
 * | Voice objects}.
 *
 * @remarks
 * Note that the `on` function is an alias for the `addListener` function.
 * They share identical functionality and either may be used interchangeably.
 *
 * - See also the {@link (Voice:class) | Voice class}.
 * - See also the {@link (Voice:namespace) | Voice namespace}.
 *
 * @public
 */

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
export class Voice extends EventEmitter {
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
      if (nativeVoiceEvent.type !== Constants.VoiceEventTypeValueIncomingCallInvite) {
        throw new Error('Incorrect "voice#callInvite" handler called for type ' + `"${nativeVoiceEvent.type}".`);
      }

      const {
        callInvite: callInviteInfo
      } = nativeVoiceEvent;
      const callInvite = new CallInvite(callInviteInfo, CallInvite.State.Pending);
      this.emit(Voice.Event.CallInvite, callInvite);
    });

    _defineProperty(this, "_handleError", nativeVoiceEvent => {
      if (nativeVoiceEvent.type !== Constants.VoiceEventError) {
        throw new Error('Incorrect "voice#error" handler called for type ' + `"${nativeVoiceEvent.type}".`);
      }

      const {
        error: {
          code,
          message
        }
      } = nativeVoiceEvent;
      const error = constructTwilioError(message, code);
      this.emit(Voice.Event.Error, error);
    });

    _defineProperty(this, "_handleRegistered", nativeVoiceEvent => {
      if (nativeVoiceEvent.type !== Constants.VoiceEventRegistered) {
        throw new Error('Incorrect "voice#error" handler called for type ' + `"${nativeVoiceEvent.type}".`);
      }

      this.emit(Voice.Event.Registered);
    });

    _defineProperty(this, "_handleUnregistered", nativeVoiceEvent => {
      if (nativeVoiceEvent.type !== Constants.VoiceEventUnregistered) {
        throw new Error('Incorrect "voice#error" handler called for type ' + `"${nativeVoiceEvent.type}".`);
      }

      this.emit(Voice.Event.Unregistered);
    });

    _defineProperty(this, "_handleAudioDevicesUpdated", nativeVoiceEvent => {
      if (nativeVoiceEvent.type !== Constants.VoiceEventAudioDevicesUpdated) {
        throw new Error('Incorrect "voice#audioDevicesUpdated" handler called for type ' + `"${nativeVoiceEvent.type}".`);
      }

      const {
        audioDevices: audioDeviceInfos,
        selectedDevice: selectedDeviceInfo
      } = nativeVoiceEvent;
      const audioDevices = audioDeviceInfos.map(audioDeviceInfo => new AudioDevice(audioDeviceInfo));
      const selectedDevice = typeof selectedDeviceInfo !== 'undefined' && selectedDeviceInfo !== null ? new AudioDevice(selectedDeviceInfo) : undefined;
      this.emit(Voice.Event.AudioDevicesUpdated, audioDevices, selectedDevice);
    });

    this._nativeEventHandler = {
      /**
       * Common
       */
      [Constants.VoiceEventError]: this._handleError,

      /**
       * Call Invite
       */
      [Constants.VoiceEventTypeValueIncomingCallInvite]: this._handleCallInvite,

      /**
       * Registration
       */
      [Constants.VoiceEventRegistered]: this._handleRegistered,
      [Constants.VoiceEventUnregistered]: this._handleUnregistered,

      /**
       * Audio Devices
       */
      [Constants.VoiceEventAudioDevicesUpdated]: this._handleAudioDevicesUpdated
    };
    NativeEventEmitter.addListener(Constants.ScopeVoice, this._handleNativeEvent);
  }
  /**
   * Connect for devices on Android platforms.
   */


  async _connect_android(token, params, notificationDisplayName) {
    const callInfo = await settleNativePromise(NativeModule.voice_connect_android(token, params, notificationDisplayName));
    return new Call(callInfo);
  }
  /**
   * Connect for devices on iOS platforms.
   */


  async _connect_ios(token, params, contactHandle) {
    const parsedContactHandle = contactHandle === '' ? 'Default Contact' : contactHandle;
    const callInfo = await settleNativePromise(NativeModule.voice_connect_ios(token, params, parsedContactHandle));
    return new Call(callInfo);
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
    notificationDisplayName = undefined,
    params = {}
  } = {}) {
    if (typeof token !== 'string') {
      throw new InvalidArgumentError('Argument "token" must be of type "string".');
    }

    if (typeof contactHandle !== 'string') {
      throw new InvalidArgumentError('Optional argument "contactHandle" must be undefined or of type' + ' "string".');
    }

    if (typeof params !== 'object') {
      throw new InvalidArgumentError('Optional argument "params" must be undefined or of type "object".');
    }

    for (const [key, value] of Object.entries(params)) {
      if (typeof value !== 'string') {
        throw new InvalidArgumentError(`Voice.ConnectOptions.params["${key}"] must be of type string`);
      }
    }

    switch (Platform.OS) {
      case 'ios':
        return this._connect_ios(token, params, contactHandle);

      case 'android':
        return this._connect_android(token, params, notificationDisplayName);

      default:
        throw new UnsupportedPlatformError(`Unsupported platform "${Platform.OS}". Expected "android" or "ios".`);
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


  async getVersion() {
    const version = await settleNativePromise(NativeModule.voice_getVersion());
    return version;
  }
  /**
   * Get the Device token from the native layer.
   * @returns a Promise that resolves with a string representing the Device
   * token.
   */


  async getDeviceToken() {
    const deviceToken = await settleNativePromise(NativeModule.voice_getDeviceToken());
    return deviceToken;
  }
  /**
   * Get a list of existing calls, ongoing and pending. This will not return any
   * call that has finished.
   * @returns
   * A `Promise` that
   *  - Resolves with a mapping of `Uuid`s to {@link (Call:class)}s.
   */


  async getCalls() {
    const callInfos = await settleNativePromise(NativeModule.voice_getCalls());
    const callsMap = new Map(callInfos.map(callInfo => [callInfo.uuid, new Call(callInfo)]));
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
    const callInviteInfos = await settleNativePromise(NativeModule.voice_getCallInvites());
    const callInvitesMap = new Map(callInviteInfos.map(callInviteInfo => [callInviteInfo.uuid, new CallInvite(callInviteInfo, CallInvite.State.Pending)]));
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
    switch (Platform.OS) {
      case 'android':
        const result = await settleNativePromise(NativeModule.voice_handleEvent(remoteMessage));
        return result;

      default:
        throw new UnsupportedPlatformError(`Unsupported platform "${Platform.OS}". ` + 'This method is only supported on Android.');
    }
  }
  /**
   * Register this device for incoming calls.
   * @param token - A Twilio Access Token.
   * @returns
   * A `Promise` that
   *  - Resolves when the device has been registered.
   */


  async register(token) {
    await settleNativePromise(NativeModule.voice_register(token));
  }
  /**
   * Unregister this device for incoming calls.
   * @param token - A Twilio Access Token.
   * @returns
   * A `Promise` that
   *  - Resolves when the device has been unregistered.
   */


  async unregister(token) {
    await settleNativePromise(NativeModule.voice_unregister(token));
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
    } = await settleNativePromise(NativeModule.voice_getAudioDevices());
    const audioDevices = audioDeviceInfos.map(audioDeviceInfo => new AudioDevice(audioDeviceInfo));
    const selectedDevice = typeof selectedDeviceInfo !== 'undefined' ? new AudioDevice(selectedDeviceInfo) : undefined;
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


  async showAvRoutePickerView() {
    switch (Platform.OS) {
      case 'ios':
        await settleNativePromise(NativeModule.voice_showNativeAvRoutePicker());
        return;

      case 'android':
        // NOTE(mhuynh)
        // Consider throwing here instead.
        // VBLOCKS-5784
        return;

      default:
        throw new UnsupportedPlatformError(`Unsupported platform "${Platform.OS}". ` + 'This method is only supported on iOS.');
    }
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
    switch (Platform.OS) {
      case 'ios':
        await settleNativePromise(NativeModule.voice_initializePushRegistry());
        return;

      default:
        throw new UnsupportedPlatformError(`Unsupported platform "${Platform.OS}". ` + 'This method is only supported on iOS.');
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
    switch (Platform.OS) {
      case 'ios':
        await settleNativePromise(NativeModule.voice_setCallKitConfiguration(configuration));
        return;

      default:
        throw new UnsupportedPlatformError(`Unsupported platform "${Platform.OS}". ` + 'This method is only supported on iOS.');
    }
  }
  /**
   * Set the native call contact handle template.
   *
   * This method is used to customize the displayed contact for Android
   * notifications and the contact handle displayed in iOS CallKit UIs.
   *
   * @example
   * ```ts
   * await voice.setIncomingCallContactHandleTemplate('Foo ${DisplayName}');
   * ```
   * If an incoming call is made and there is a Twiml Parameter with key
   * "DisplayName" and value "Bar", then the notification title or CallKit
   * handle will display as "Foo Bar".
   *
   * @example
   * ```ts
   * await voice.setIncomingCallContactHandleTemplate();
   * ```
   * When invoking this method without any parameters, the template will be
   * unset and the default notification and contact handle behavior is restored.
   *
   * @param template - The string to set the notification and contact handle
   * template to. Note that this value is optional, if the method is invoked
   * with an implicit undefined (no parameter) then the template will be unset
   * and the default notification and contact handle behavior will be restored.
   * Empty string values will be considered as the same as passing `undefined`.
   *
   * @returns
   * A `Promise` that
   * - Resolves with `undefined` if the template were set.
   * - Rejects if the template was unable to be set.
   */


  async setIncomingCallContactHandleTemplate(template) {
    await NativeModule.voice_setIncomingCallContactHandleTemplate(template);
  }
  /**
   * Starts a PreflightTest.
   *
   * The PreflightTest allows you to anticipate and troubleshoot end users'
   * connectivity and bandwidth issues before or during Twilio Voice calls.
   *
   * The PreflightTest performs a test call to Twilio and provides a
   * {@link (PreflightTest:namespace).Report} at the end. The report includes
   * information about the end user's network connection (including jitter,
   * packet loss, and round trip time) and connection settings.
   *
   * @example
   * ```typescript
   * import {
   *   AudioCodecType,
   *   IceTransportPolicy,
   *   PreflightTest,
   *   Voice,
   * } from '@twilio/voice-react-native-sdk';
   *
   * const voice = new Voice();
   *
   * const preflightOptions = {
   *   iceServers: [{
   *     username: 'foo',
   *     password: 'bar',
   *     serverUrl: 'biffbazz',
   *   }],
   *   iceTransportPolicy: IceTransportPolicy.All,
   *   preferredAudioCodecs: [{
   *     type: AudioCodecType.Opus,
   *     maxAverageBitrage: 128000,
   *   }],
   * };
   *
   * const token = '...';
   *
   * const preflightTest = await voice.runPreflight(token, preflightOptions);
   *
   * preflightTest.on(PreflightTest.Event.Completed, (report) => {
   *   // handle the completed event and update your application ui to
   *   // show report results and reveal any potential issues
   * });
   *
   * preflightTest.on(PreflightTest.Event.Connected, () => {
   *   // handle the connected event and update your application ui to
   *   // show that the preflight test has started
   * });
   *
   * preflightTest.on(PreflightTest.Event.Failed, (error) => {
   *   // handle the failed event and update your application ui to
   *   // show the error
   * });
   *
   * preflightTest.on(PreflightTest.Event.QualityWarning, (currentWarnings, previousWarnings) => {
   *   // handle the quality warning event and update your application ui
   *   // show the warning or the warning cleared
   * });
   *
   * preflightTest.on(PreflightTest.Event.Sample, (sample) => {
   *   // handle the sample event and update your application ui
   *   // show the progress
   * });
   * ```
   *
   * @returns
   * A Promise that:
   * - Resolves with a {@link (PreflightTest:class)} object.
   * - Rejects with a {@link TwilioErrors} if unable to perform a
   *   {@link (PreflightTest:class)}.
   */


  async runPreflight(accessToken, options = {}) {
    const optionValidationResult = validatePreflightOptions(options);

    if (optionValidationResult.status === 'error') {
      throw optionValidationResult.error;
    }

    const preflightTestUuid = await settleNativePromise(NativeModule.voice_runPreflight(accessToken, options));
    return new PreflightTest(preflightTestUuid);
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
})(Voice || (Voice = {}));
//# sourceMappingURL=Voice.js.map