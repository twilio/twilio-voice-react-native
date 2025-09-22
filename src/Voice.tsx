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
import type { TwilioError } from './error/TwilioError';
import { UnsupportedPlatformError } from './error/UnsupportedPlatformError';
import { constructTwilioError } from './error/utility';
import type { NativeAudioDeviceInfo } from './type/AudioDevice';
import type { NativeCallInfo } from './type/Call';
import type { NativeCallInviteInfo } from './type/CallInvite';
import type { CallKit } from './type/CallKit';
import type { CustomParameters, Uuid } from './type/common';
import type { NativeVoiceEvent, NativeVoiceEventType } from './type/Voice';

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
export declare interface Voice {
  /**
   * ------------
   * Emit Typings
   * ------------
   */

  /** @internal */
  emit(
    voiceEvent: Voice.Event.AudioDevicesUpdated,
    audioDevices: AudioDevice[],
    selectedDevice?: AudioDevice
  ): boolean;

  /** @internal */
  emit(voiceEvent: Voice.Event.CallInvite, callInvite: CallInvite): boolean;

  /** @internal */
  emit(voiceEvent: Voice.Event.Error, error: TwilioError): boolean;

  /** @internal */
  emit(voiceEvent: Voice.Event.Registered): boolean;

  /** @internal */
  emit(voiceEvent: Voice.Event.Unregistered): boolean;

  /** @internal */
  emit(voiceEvent: Voice.Event, ...args: any[]): boolean;

  /**
   * ----------------
   * Listener Typings
   * ----------------
   */

  /**
   * Audio devices updated event. Raised when the list of audio devices changes.
   *
   * @example
   * ```typescript
   * voice.addListener(Voice.Event.AudioDevicesUpdated, () => {
   *   // the list of available audio devices has changed and/or the selected
   *   // audio device has been changed
   * });
   * ```
   *
   * @param audioDevicesUpdatedEvent - The raised event string.
   * @param listener - A listener function that will be invoked when the event
   * is raised.
   * @returns - The call object.
   */
  addListener(
    audioDevicesUpdatedEvent: Voice.Event.AudioDevicesUpdated,
    listener: Voice.Listener.AudioDevicesUpdated
  ): this;
  /** {@inheritDoc (Voice:interface).(addListener:1)} */
  on(
    audioDevicesUpdatedEvent: Voice.Event.AudioDevicesUpdated,
    listener: Voice.Listener.AudioDevicesUpdated
  ): this;

  /**
   * Call invite event. Raised when an incoming call invite is received.
   *
   * @example
   * ```typescript
   * voice.addListener(Voice.Event.CallInvite, (callInvite: CallInvite) => {
   *   // handle the incoming call invite
   * });
   * ```
   *
   * @param callInviteEvent - The raised event string.
   * @param listener - A listener function that will be invoked when the event
   * is raised.
   * @returns - The call object.
   */
  addListener(
    callInviteEvent: Voice.Event.CallInvite,
    listener: Voice.Listener.CallInvite
  ): this;
  /** {@inheritDoc (Voice:interface).(addListener:2)} */
  on(
    callInviteEvent: Voice.Event.CallInvite,
    listener: Voice.Listener.CallInvite
  ): this;

  /**
   * Error event. Raised when the SDK encounters an error.
   *
   * @example
   * ```typescript
   * voice.addListener(Voice.Event.Error, (error: TwilioError.GenericError) => {
   *   // handle a generic Voice SDK error
   * });
   * ```
   *
   * @param errorEvent - The raised event string.
   * @param listener - A listener function that will be invoked when the event
   * is raised.
   * @returns - The call object.
   */
  addListener(
    errorEvent: Voice.Event.Error,
    listener: Voice.Listener.Error
  ): this;
  /** {@inheritDoc (Voice:interface).(addListener:3)} */
  on(errorEvent: Voice.Event.Error, listener: Voice.Listener.Error): this;

  /**
   * Registered event. Raised when the SDK is registered for incoming calls.
   *
   * @example
   * ```typescript
   * voice.addListener(Voice.Event.Registered, () => {
   *   // handle successful registration for incoming calls
   * });
   * ```
   *
   * @param registeredEvent - The raised event string.
   * @param listener - A listener function that will be invoked when the event
   * is raised.
   * @returns - The call object.
   */
  addListener(
    registeredEvent: Voice.Event.Registered,
    listener: Voice.Listener.Registered
  ): this;
  /** {@inheritDoc (Voice:interface).(addListener:4)} */
  on(
    registeredEvent: Voice.Event.Registered,
    listener: Voice.Listener.Registered
  ): this;

  /**
   * Unregistered event. Raised when the SDK is unregistered for incoming calls.
   *
   * @example
   * ```typescript
   * voice.addListener(Voice.Event.Unregistered, () => {
   *   // handle successful unregistration for incoming calls
   * });
   * ```
   *
   * @param unregisteredEvent - The raised event string.
   * @param listener - A listener function that will be invoked when the event
   * is raised.
   * @returns - The call object.
   */
  addListener(
    unregisteredEvent: Voice.Event.Unregistered,
    listener: Voice.Listener.Unregistered
  ): this;
  /** {@inheritDoc (Voice:interface).(addListener:5)} */
  on(
    unregisteredEvent: Voice.Event.Unregistered,
    listener: Voice.Listener.Unregistered
  ): this;

  /**
   * Generic event listener typings.
   * @param voiceEvent - The raised event string.
   * @param listener - A listener function that will be invoked when the event
   * is raised.
   * @returns - The call object.
   */
  addListener(voiceEvent: Voice.Event, listener: Voice.Listener.Generic): this;
  /** {@inheritDoc (Voice:interface).(addListener:6)} */
  on(voiceEvent: Voice.Event, listener: Voice.Listener.Generic): this;
}

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
  private _nativeEventHandler: Record<
    NativeVoiceEventType,
    (voiceEvent: NativeVoiceEvent) => void
  >;

  /**
   * Main entry-point of the Voice SDK. Provides access to the entire
   * feature-set of the library.
   */
  constructor() {
    super();

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
      [Constants.VoiceEventAudioDevicesUpdated]:
        this._handleAudioDevicesUpdated,
    };

    NativeEventEmitter.addListener(
      Constants.ScopeVoice,
      this._handleNativeEvent
    );
  }

  /**
   * Connect for devices on Android platforms.
   */
  private async _connect_android(
    token: string,
    params: CustomParameters,
    notificationDisplayName: string | undefined
  ) {
    const connectResult = await NativeModule.voice_connect_android(
      token,
      params,
      notificationDisplayName
    )
      .then((callInfo) => {
        return { type: 'ok', callInfo } as const;
      })
      .catch((error) => {
        const code = error.userInfo.code;
        const message = error.userInfo.message;
        return { type: 'err', message, code } as const;
      });

    if (connectResult.type === 'err') {
      throw constructTwilioError(connectResult.message, connectResult.code);
    }

    return new Call(connectResult.callInfo);
  }

  /**
   * Connect for devices on iOS platforms.
   */
  private async _connect_ios(
    token: string,
    params: CustomParameters,
    contactHandle: string
  ) {
    const parsedContactHandle =
      contactHandle === '' ? 'Default Contact' : contactHandle;
    const callInfo = await NativeModule.voice_connect_ios(
      token,
      params,
      parsedContactHandle
    );
    return new Call(callInfo);
  }

  /**
   * Intermediary event handler for `Voice`-level events. Ensures that the type
   * of the incoming event is expected and invokes the proper event listener.
   * @param nativeVoiceEvent - A `Voice` event directly from the native layer.
   */
  private _handleNativeEvent = (nativeVoiceEvent: NativeVoiceEvent) => {
    const { type } = nativeVoiceEvent;

    const handler = this._nativeEventHandler[type];
    if (typeof handler === 'undefined') {
      throw new Error(
        `Unknown voice event type received from the native layer: "${type}".`
      );
    }

    handler(nativeVoiceEvent);
  };

  /**
   * Call invite handler. Creates a {@link (CallInvite:class)} from the info
   * raised by the native layer and emits it.
   * @param nativeVoiceEvent - A `Voice` event directly from the native layer.
   */
  private _handleCallInvite = (nativeVoiceEvent: NativeVoiceEvent) => {
    if (
      nativeVoiceEvent.type !== Constants.VoiceEventTypeValueIncomingCallInvite
    ) {
      throw new Error(
        'Incorrect "voice#callInvite" handler called for type ' +
          `"${nativeVoiceEvent.type}".`
      );
    }

    const { callInvite: callInviteInfo } = nativeVoiceEvent;

    const callInvite = new CallInvite(callInviteInfo, CallInvite.State.Pending);

    this.emit(Voice.Event.CallInvite, callInvite);
  };

  /**
   * Error event handler. Creates an error from the namespace
   * {@link TwilioErrors} from the info raised by the native layer and emits it.
   * @param nativeVoiceEvent - A `Voice` event directly from the native layer.
   */
  private _handleError = (nativeVoiceEvent: NativeVoiceEvent) => {
    if (nativeVoiceEvent.type !== Constants.VoiceEventError) {
      throw new Error(
        'Incorrect "voice#error" handler called for type ' +
          `"${nativeVoiceEvent.type}".`
      );
    }

    const {
      error: { code, message },
    } = nativeVoiceEvent;
    const error = constructTwilioError(message, code);
    this.emit(Voice.Event.Error, error);
  };

  /**
   * Registered event handler. Emits a
   * {@link (Voice:namespace).Event.Registered} event.
   */
  private _handleRegistered = (nativeVoiceEvent: NativeVoiceEvent) => {
    if (nativeVoiceEvent.type !== Constants.VoiceEventRegistered) {
      throw new Error(
        'Incorrect "voice#error" handler called for type ' +
          `"${nativeVoiceEvent.type}".`
      );
    }

    this.emit(Voice.Event.Registered);
  };

  /**
   * Unregistered event handler. Emits a
   * {@link (Voice:namespace).Event.Unregistered} event.
   */
  private _handleUnregistered = (nativeVoiceEvent: NativeVoiceEvent) => {
    if (nativeVoiceEvent.type !== Constants.VoiceEventUnregistered) {
      throw new Error(
        'Incorrect "voice#error" handler called for type ' +
          `"${nativeVoiceEvent.type}".`
      );
    }

    this.emit(Voice.Event.Unregistered);
  };

  /**
   * Audio devices updated event handler. Generates a new list of
   * {@link (AudioDevice:class) | AudioDevice objects} and emits it.
   * @param nativeVoiceEvent - A `Voice` event directly from the native layer.
   */
  private _handleAudioDevicesUpdated = (nativeVoiceEvent: NativeVoiceEvent) => {
    if (nativeVoiceEvent.type !== Constants.VoiceEventAudioDevicesUpdated) {
      throw new Error(
        'Incorrect "voice#audioDevicesUpdated" handler called for type ' +
          `"${nativeVoiceEvent.type}".`
      );
    }

    const {
      audioDevices: audioDeviceInfos,
      selectedDevice: selectedDeviceInfo,
    } = nativeVoiceEvent;

    const audioDevices = audioDeviceInfos.map(
      (audioDeviceInfo: NativeAudioDeviceInfo) =>
        new AudioDevice(audioDeviceInfo)
    );

    const selectedDevice =
      typeof selectedDeviceInfo !== 'undefined' && selectedDeviceInfo !== null
        ? new AudioDevice(selectedDeviceInfo)
        : undefined;

    this.emit(Voice.Event.AudioDevicesUpdated, audioDevices, selectedDevice);
  };

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
  async connect(
    token: string,
    {
      contactHandle = 'Default Contact',
      notificationDisplayName = undefined,
      params = {},
    }: Voice.ConnectOptions = {}
  ): Promise<Call> {
    if (typeof token !== 'string') {
      throw new InvalidArgumentError(
        'Argument "token" must be of type "string".'
      );
    }

    if (typeof contactHandle !== 'string') {
      throw new InvalidArgumentError(
        'Optional argument "contactHandle" must be undefined or of type' +
          ' "string".'
      );
    }

    if (typeof params !== 'object') {
      throw new InvalidArgumentError(
        'Optional argument "params" must be undefined or of type "object".'
      );
    }

    for (const [key, value] of Object.entries(params)) {
      if (typeof value !== 'string') {
        throw new InvalidArgumentError(
          `Voice.ConnectOptions.params["${key}"] must be of type string`
        );
      }
    }

    switch (Platform.OS) {
      case 'ios':
        return this._connect_ios(token, params, contactHandle);
      case 'android':
        return this._connect_android(token, params, notificationDisplayName);
      default:
        throw new UnsupportedPlatformError(
          `Unsupported platform "${Platform.OS}". Expected "android" or "ios".`
        );
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
  getVersion(): Promise<string> {
    return NativeModule.voice_getVersion();
  }

  /**
   * Get the Device token from the native layer.
   * @returns a Promise that resolves with a string representing the Device
   * token.
   */
  getDeviceToken(): Promise<string> {
    return NativeModule.voice_getDeviceToken();
  }

  /**
   * Get a list of existing calls, ongoing and pending. This will not return any
   * call that has finished.
   * @returns
   * A `Promise` that
   *  - Resolves with a mapping of `Uuid`s to {@link (Call:class)}s.
   */
  async getCalls(): Promise<ReadonlyMap<Uuid, Call>> {
    const callInfos = await NativeModule.voice_getCalls();
    const callsMap = new Map<Uuid, Call>(
      callInfos.map((callInfo: NativeCallInfo) => [
        callInfo.uuid,
        new Call(callInfo),
      ])
    );
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
  async getCallInvites(): Promise<ReadonlyMap<Uuid, CallInvite>> {
    const callInviteInfos = await NativeModule.voice_getCallInvites();
    const callInvitesMap = new Map<Uuid, CallInvite>(
      callInviteInfos.map((callInviteInfo: NativeCallInviteInfo) => [
        callInviteInfo.uuid,
        new CallInvite(callInviteInfo, CallInvite.State.Pending),
      ])
    );
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
  async handleFirebaseMessage(remoteMessage: Record<string, string>) {
    switch (Platform.OS) {
      case 'android':
        break;
      default:
        throw new UnsupportedPlatformError(
          `Unsupported platform "${Platform.OS}". This method is only supported on Android.`
        );
    }

    return await NativeModule.voice_handleEvent(remoteMessage);
  }

  /**
   * Register this device for incoming calls.
   * @param token - A Twilio Access Token.
   * @returns
   * A `Promise` that
   *  - Resolves when the device has been registered.
   */
  register(token: string): Promise<void> {
    return NativeModule.voice_register(token);
  }

  /**
   * Unregister this device for incoming calls.
   * @param token - A Twilio Access Token.
   * @returns
   * A `Promise` that
   *  - Resolves when the device has been unregistered.
   */
  unregister(token: string): Promise<void> {
    return NativeModule.voice_unregister(token);
  }

  /**
   * Get audio device information from the native layer.
   * @returns
   * A `Promise` that
   *  - Resolves with a list of the native device's audio devices and the
   *    currently selected device.
   */
  async getAudioDevices(): Promise<{
    audioDevices: AudioDevice[];
    selectedDevice?: AudioDevice;
  }> {
    const {
      audioDevices: audioDeviceInfos,
      selectedDevice: selectedDeviceInfo,
    } = await NativeModule.voice_getAudioDevices();

    const audioDevices = audioDeviceInfos.map(
      (audioDeviceInfo: NativeAudioDeviceInfo) =>
        new AudioDevice(audioDeviceInfo)
    );

    const selectedDevice =
      typeof selectedDeviceInfo !== 'undefined'
        ? new AudioDevice(selectedDeviceInfo)
        : undefined;

    return selectedDevice ? { audioDevices, selectedDevice } : { audioDevices };
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
  showAvRoutePickerView(): Promise<void> {
    return NativeModule.voice_showNativeAvRoutePicker();
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
  async initializePushRegistry(): Promise<void> {
    switch (Platform.OS) {
      case 'ios':
        return NativeModule.voice_initializePushRegistry();
      default:
        throw new UnsupportedPlatformError(
          `Unsupported platform "${Platform.OS}". This method is only supported on iOS.`
        );
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
  async setCallKitConfiguration(
    configuration: CallKit.ConfigurationOptions
  ): Promise<void> {
    switch (Platform.OS) {
      case 'ios':
        return NativeModule.voice_setCallKitConfiguration(configuration);
      default:
        throw new UnsupportedPlatformError(
          `Unsupported platform "${Platform.OS}". This method is only supported on iOS.`
        );
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
  async setIncomingCallContactHandleTemplate(template?: string): Promise<void> {
    await NativeModule.voice_setIncomingCallContactHandleTemplate(template);
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
export namespace Voice {
  /**
   * Options to pass to the {@link (Voice:class).connect} method.
   */
  export type ConnectOptions = {
    /**
     * Custom parameters to send to the TwiML Application.
     */
    params?: Record<string, string>;
    /**
     * A CallKit display name that will show in the call history as the contact
     * handle.
     *
     * @remarks
     * Unsupported platforms:
     * - Android
     */
    contactHandle?: string;
    /**
     * The display name that will show in the Android notifications. Passing an
     * empty string will be considered the same as if `undefined` were passed.
     *
     * @remarks
     * Unsupported platforms:
     * - iOS
     */
    notificationDisplayName?: string;
  };

  /**
   * Enumeration of all event strings emitted by {@link (Voice:class)} objects.
   */
  export enum Event {
    /**
     * Raised when there is a change in available audio devices.
     *
     * @remarks
     *
     * See {@link (Voice:interface).(addListener:1)
     * | Voice.addListener(AudioDevicesUpdated)}.
     */
    'AudioDevicesUpdated' = 'audioDevicesUpdated',

    /**
     * Raised when there is an incoming call invite.
     *
     * @remarks
     *
     * See {@link (Voice:interface).(addListener:2)
     * | Voice.addListener(CallInvite)}.
     */
    'CallInvite' = 'callInvite',

    /**
     * Raised when the SDK encounters an error.
     *
     * @remarks
     *
     * See {@link (Voice:interface).(addListener:3)
     * | Voice.addListener(Error)}.
     */
    'Error' = 'error',

    /**
     * Raised when the SDK is registered for incoming calls.
     *
     * @remarks
     *
     * See {@link (Voice:interface).(addListener:4)
     * | Voice.addListener(Registered)}.
     */
    'Registered' = 'registered',

    /**
     * Raised when the SDK is unregistered for incoming calls.
     *
     * @remarks
     *
     * See {@link (Voice:interface).(addListener:5)
     * | Voice.addListener(Unregistered)}.
     */
    'Unregistered' = 'unregistered',
  }

  /**
   * Listener types for all events emitted by a {@link (Voice:class)
   * | Voice object.}
   */
  export namespace Listener {
    /**
     * Audio devices updated event listener. This should be the function
     * signature of an event listener bound to the
     * {@link (Voice:namespace).Event.AudioDevicesUpdated} event.
     *
     * @remarks
     *
     * See {@link (Voice:interface).(addListener:1)}.
     */
    export type AudioDevicesUpdated = (
      audioDevices: AudioDevice[],
      selectedDevice?: AudioDevice
    ) => void;

    /**
     * Call invite event listener. This should be the function signature of an
     * event listener bound to the
     * {@link (Voice:namespace).Event.CallInvite} event.
     *
     * @remarks
     *
     * See {@link (Voice:interface).(addListener:2)}.
     */
    export type CallInvite = (callInvite: CallInvite) => void;

    /**
     * Error event listener. This should be the function signature of an event
     * listener bound to the
     * {@link (Voice:namespace).Event.Error} event.
     *
     * @remarks
     *
     * See {@link (Voice:interface).(addListener:3)}.
     *
     * See {@link TwilioErrors} for all error classes.
     */
    export type Error = (error: TwilioError) => void;

    /**
     * Registered event listener. This should be the function signature of an
     * event listener bound to the
     * {@link (Voice:namespace).Event.Registered} event.
     *
     * @remarks
     *
     * See {@link (Voice:interface).(addListener:4)}.
     */
    export type Registered = () => void;

    /**
     * Unregistered event listener. This should be the function signature of an
     * event listener bound to the
     * {@link (Voice:namespace).Event.Unregistered} event.
     *
     * @remarks
     *
     * See {@link (Voice:interface).(addListener:5)}.
     */
    export type Unregistered = () => void;

    /**
     * Generic event listener. This should be the function signature of any
     * event listener bound to any voice event.
     *
     * @remarks
     *
     * See {@link (Voice:interface).(addListener:6)}.
     */
    export type Generic = (...args: any[]) => void;
  }
}
