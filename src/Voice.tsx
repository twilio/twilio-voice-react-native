/**
 * Copyright (c) Twilio Inc. All rights reserved. Licensed under the Twilio
 * license.
 *
 * See LICENSE in the project root for license information.
 */

import { EventEmitter } from 'eventemitter3';
import { AudioDevice } from './AudioDevice';
import { Call } from './Call';
import { CallInvite } from './CallInvite';
import { CancelledCallInvite } from './CancelledCallInvite';
import { NativeEventEmitter, NativeModule } from './common';
import { Constants } from './constants';
import { GenericError } from './error/GenericError';
import type { NativeAudioDeviceInfo } from './type/AudioDevice';
import type { NativeCallInfo } from './type/Call';
import type { NativeCallInviteInfo } from './type/CallInvite';
import type { Uuid } from './type/common';
import type { NativeVoiceEvent, NativeVoiceEventType } from './type/Voice';

/**
 * Defines strict typings for all events emitted by {@link (Voice:class)
 * | Voice objects}.
 *
 * @remarks
 * Note that the `on` function is an alias for the `addEventListener` function.
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
  emit(voiceEvent: Voice.Event, listener: (...args: any[]) => void): boolean;

  /** @internal */
  emit(
    voiceEvent: Voice.Event.AudioDevicesUpdated,
    audioDevices: AudioDevice[],
    selectedDevice: AudioDevice
  ): boolean;

  /** @internal */
  emit(voiceEvent: Voice.Event.CallInvite, callInvite: CallInvite): boolean;

  /** @internal */
  emit(
    voiceEvent: Voice.Event.CallInviteAccepted,
    callInvite: CallInvite,
    call: Call
  ): boolean;

  /** @internal */
  emit(
    voiceEvent: Voice.Event.CallInviteRejected,
    callInvite: CallInvite
  ): boolean;

  /** @internal */
  emit(
    voiceEvent: Voice.Event.CancelledCallInvite,
    cancelledCallInvite: CancelledCallInvite,
    error?: GenericError
  ): boolean;

  /** @internal */
  emit(voiceEvent: Voice.Event.Error, error: GenericError): boolean;

  /** @internal */
  emit(voiceEvent: Voice.Event.Registered): boolean;

  /** @internal */
  emit(voiceEvent: Voice.Event.Unregistered): boolean;

  /**
   * ----------------
   * Listener Typings
   * ----------------
   */

  /**
   * Generic event listener typings.
   * @param voiceEvent - The raised event string.
   * @param listener - A listener function that will be invoked when the event
   * is raised.
   * @returns - The call object.
   */
  addEventListener(
    voiceEvent: Voice.Event,
    listener: Voice.Listener.Generic
  ): this;
  /** {@inheritDoc (Voice:interface).(addEventListener:1)} */
  on(voiceEvent: Voice.Event, listener: Voice.Listener.Generic): this;

  /**
   * Audio devices updated event. Raised when the list of audio devices changes.
   *
   * @example
   * ```typescript
   * voice.addEventListener(Voice.Event.AudioDevicesUpdated, () => {
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
  addEventListener(
    audioDevicesUpdatedEvent: Voice.Event.AudioDevicesUpdated,
    listener: Voice.Listener.AudioDevicesUpdated
  ): this;
  /** {@inheritDoc (Voice:interface).(addEventListener:2)} */
  on(
    audioDevicesUpdatedEvent: Voice.Event.AudioDevicesUpdated,
    listener: Voice.Listener.AudioDevicesUpdated
  ): this;

  /**
   * Call invite event. Raised when an incoming call invite is received.
   *
   * @example
   * ```typescript
   * voice.addEventListener(Voice.Event.CallInvite, (callInvite: CallInvite) => {
   *   // handle the incoming call invite
   * });
   * ```
   *
   * @param callInviteEvent - The raised event string.
   * @param listener - A listener function that will be invoked when the event
   * is raised.
   * @returns - The call object.
   */
  addEventListener(
    callInviteEvent: Voice.Event.CallInvite,
    listener: Voice.Listener.CallInvite
  ): this;
  /** {@inheritDoc (Voice:interface).(addEventListener:3)} */
  on(
    callInviteEvent: Voice.Event.CallInvite,
    listener: Voice.Listener.CallInvite
  ): this;

  /**
   * Call invite accepted event. Raised when a pending incoming call invite has
   * been accepted.
   *
   * @remarks
   * This event is raised when call invites are accepted outside of the SDK,
   * i.e. through the native iOS or Android UI.
   *
   * @example
   * ```typescript
   * voice.addEventListener(Voice.Event.CallInviteAccepted, (callInvite: CallInvite, call: Call) => {
   *   // handle the incoming call invite and the call associated with it
   * });
   * ```
   *
   * @param callInviteAcceptedEvent - The raised event string.
   * @param listener - A listener function that will be invoked when the event
   * is raised.
   * @returns - The call object.
   */
  addEventListener(
    callInviteAcceptedEvent: Voice.Event.CallInviteAccepted,
    listener: Voice.Listener.CallInviteAccepted
  ): this;
  /** {@inheritDoc (Voice:interface).(addEventListener:4)} */
  on(
    callInviteAcceptedEvent: Voice.Event.CallInviteAccepted,
    listener: Voice.Listener.CallInviteAccepted
  ): this;

  /**
   * Call invite rejected event. Raised when a pending incoming call invite has
   * been rejected.
   *
   * @remarks
   * This event is raised when call invites are rejected outside of the SDK,
   * i.e. through the native iOS or Android UI.
   *
   * @example
   * ```typescript
   * voice.addEventListener(Voice.Event.CallInviteRejected, (callInvite: CallInvite) => {
   *   // handle the rejection of the incoming call invite
   * });
   * ```
   *
   * @param callInviteRejectedEvent - The raised event string.
   * @param listener - A listener function that will be invoked when the event
   * is raised.
   * @returns - The call object.
   */
  addEventListener(
    callInviteRejectedEvent: Voice.Event.CallInviteRejected,
    listener: Voice.Listener.CallInviteRejected
  ): this;
  /** {@inheritDoc (Voice:interface).(addEventListener:5)} */
  on(
    callInviteRejectedEvent: Voice.Event.CallInviteRejected,
    listener: Voice.Listener.CallInviteRejected
  ): this;

  /**
   * Cancelled call invite event. Raised when a pending incoming call invite has
   * been cancelled and is no longer valid.
   *
   * @example
   * ```typescript
   * voice.addEventListener(Voice.Event.CancelledCallInvite, (cancelledCallInvite: CancelledCallInvite) => {
   *   // handle the cancellation of the incoming call invite
   * });
   * ```
   *
   * @param cancelledCallInviteEvent - The raised event string.
   * @param listener - A listener function that will be invoked when the event
   * is raised.
   * @returns - The call object.
   */
  addEventListener(
    cancelledCallInviteEvent: Voice.Event.CancelledCallInvite,
    listener: Voice.Listener.CancelledCallInvite
  ): this;
  /** {@inheritDoc (Voice:interface).(addEventListener:6)} */
  on(
    cancelledCallInviteEvent: Voice.Event.CancelledCallInvite,
    listener: Voice.Listener.CancelledCallInvite
  ): this;

  /**
   * Error event. Raised when the SDK encounters an error.
   *
   * @example
   * ```typescript
   * voice.addEventListener(Voice.Event.Error, (error: TwilioError.GenericError) => {
   *   // handle a generic Voice SDK error
   * });
   * ```
   *
   * @param errorEvent - The raised event string.
   * @param listener - A listener function that will be invoked when the event
   * is raised.
   * @returns - The call object.
   */
  addEventListener(
    errorEvent: Voice.Event.Error,
    listener: Voice.Listener.Error
  ): this;
  /** {@inheritDoc (Voice:interface).(addEventListener:7)} */
  on(errorEvent: Voice.Event.Error, listener: Voice.Listener.Error): this;

  /**
   * Registered event. Raised when the SDK is registered for incoming calls.
   *
   * @example
   * ```typescript
   * voice.addEventListener(Voice.Event.Registered, () => {
   *   // handle successful registration for incoming calls
   * });
   * ```
   *
   * @param registeredEvent - The raised event string.
   * @param listener - A listener function that will be invoked when the event
   * is raised.
   * @returns - The call object.
   */
  addEventListener(
    registeredEvent: Voice.Event.Registered,
    listener: Voice.Listener.Registered
  ): this;
  /** {@inheritDoc (Voice:interface).(addEventListener:8)} */
  on(
    registeredEvent: Voice.Event.Registered,
    listener: Voice.Listener.Registered
  ): this;

  /**
   * Unregistered event. Raised when the SDK is unregistered for incoming calls.
   *
   * @example
   * ```typescript
   * voice.addEventListener(Voice.Event.Unregistered, () => {
   *   // handle successful unregistration for incoming calls
   * });
   * ```
   *
   * @param unregisteredEvent - The raised event string.
   * @param listener - A listener function that will be invoked when the event
   * is raised.
   * @returns - The call object.
   */
  addEventListener(
    unregisteredEvent: Voice.Event.Unregistered,
    listener: Voice.Listener.Unregistered
  ): this;
  /** {@inheritDoc (Voice:interface).(addEventListener:9)} */
  on(
    unregisteredEvent: Voice.Event.Unregistered,
    listener: Voice.Listener.Unregistered
  ): this;
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
      [Constants.VoiceEventCallInvite]: this._handleCallInvite,
      [Constants.VoiceEventCallInviteAccepted]: this._handleCallInviteAccepted,
      [Constants.VoiceEventCallInviteRejected]: this._handleCallInviteRejected,
      [Constants.VoiceEventCallInviteCancelled]:
        this._handleCancelledCallInvite,

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
    if (nativeVoiceEvent.type !== Constants.VoiceEventCallInvite) {
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
   * Call invite accepted handler. Creates a {@link (CallInvite:class)} and a
   * {@link (Call:class)} from the info raised by the native layer and emits it.
   * @param nativeVoiceEvent - A `Voice` event directly from the native layer.
   */
  private _handleCallInviteAccepted = (nativeVoiceEvent: NativeVoiceEvent) => {
    if (nativeVoiceEvent.type !== Constants.VoiceEventCallInviteAccepted) {
      throw new Error(
        'Incorrect "voice#callInviteAccepted" handler called for type ' +
          `"${nativeVoiceEvent.type}".`
      );
    }

    const { callInvite: callInviteInfo } = nativeVoiceEvent;

    const callInvite = new CallInvite(
      callInviteInfo,
      CallInvite.State.Accepted
    );

    const callInfo = {
      uuid: callInviteInfo.uuid,
      customParameters: callInviteInfo.customParameters,
      sid: callInviteInfo.callSid,
      from: callInviteInfo.from,
      to: callInviteInfo.to,
    };

    const call = new Call(callInfo);

    this.emit(Voice.Event.CallInviteAccepted, callInvite, call);
  };

  /**
   * Call invite rejected handler. Creates a {@link (CallInvite:class)} from the
   * info raised by the native layer and emits it.
   * @param nativeVoiceEvent - A `Voice` event directly from the native layer.
   */
  private _handleCallInviteRejected = (nativeVoiceEvent: NativeVoiceEvent) => {
    if (nativeVoiceEvent.type !== Constants.VoiceEventCallInviteRejected) {
      throw new Error(
        'Incorrect "voice#callInviteRejected" handler called for type ' +
          `"${nativeVoiceEvent.type}".`
      );
    }

    const { callInvite: callInviteInfo } = nativeVoiceEvent;

    const callInvite = new CallInvite(
      callInviteInfo,
      CallInvite.State.Rejected
    );

    this.emit(Voice.Event.CallInviteRejected, callInvite);
  };

  /**
   * Call invite cancelled handler. Creates a
   * {@link (CancelledCallInvite:class)} from the info raised by the native
   * layer and emits it.
   * @param nativeVoiceEvent - A `Voice` event directly from the native layer.
   */
  private _handleCancelledCallInvite = (nativeVoiceEvent: NativeVoiceEvent) => {
    if (nativeVoiceEvent.type !== Constants.VoiceEventCallInviteCancelled) {
      throw new Error(
        'Incorrect "voice#cancelledCallInvite" handler called for type ' +
          `"${nativeVoiceEvent.type}".`
      );
    }

    const { cancelledCallInvite: cancelledCallInviteInfo, error: errorInfo } =
      nativeVoiceEvent;

    const error = new GenericError(errorInfo.message, errorInfo.code);

    const cancelledCallInvite = new CancelledCallInvite(
      cancelledCallInviteInfo
    );

    this.emit(Voice.Event.CancelledCallInvite, cancelledCallInvite, error);
  };

  /**
   * Error event handler. Creates a {@link TwilioErrors.GenericError} from the
   * info raised by the native layer and emits it.
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

    const error = new GenericError(message, code);

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

    const selectedDevice = new AudioDevice(selectedDeviceInfo);

    this.emit(Voice.Event.AudioDevicesUpdated, audioDevices, selectedDevice);
  };

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
  async connect(
    token: string,
    params: Record<string, any> = {}
  ): Promise<Call> {
    const callInfo = await NativeModule.voice_connect(token, params);

    const call = new Call(callInfo);

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
    selectedDevice: AudioDevice | null;
  }> {
    const {
      audioDevices: audioDeviceInfos,
      selectedDevice: selectedDeviceInfo,
    } = await NativeModule.voice_getAudioDevices();

    const audioDevices = audioDeviceInfos.map(
      (audioDeviceInfo: NativeAudioDeviceInfo) =>
        new AudioDevice(audioDeviceInfo)
    );

    const selectedDevice = new AudioDevice(selectedDeviceInfo);

    return { audioDevices, selectedDevice };
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
  showAvRoutePickerView(): Promise<void> {
    return NativeModule.voice_showNativeAvRoutePicker();
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
   * Enumeration of all event strings emitted by {@link (Voice:class)} objects.
   */
  export enum Event {
    /**
     * Raised when there is a change in available audio devices.
     * See {@link (Voice:interface).(addEventListener:2)
     * | Voice.addEventListener(AudioDevicesUpdated)}.
     */
    'AudioDevicesUpdated' = 'audioDevicesUpdated',
    /**
     * Raised when there is an incoming call invite.
     * See {@link (Voice:interface).(addEventListener:3)
     * | Voice.addEventListener(CallInvite)}.
     */
    'CallInvite' = 'callInvite',
    /**
     * Raised when an incoming call invite has been accepted.
     * This event can be raised either through the SDK or outside of the SDK
     * (i.e. through native UI/UX such as push notifications).
     * See {@link (Voice:interface).(addEventListener:4)
     * | Voice.addEventListener(CallInviteAccepted)}.
     */
    'CallInviteAccepted' = 'callInviteAccepted',
    /**
     * Raised when an incoming call invite has been rejected.
     * This event can be raised either through the SDK or outside of the SDK
     * (i.e. through native UI/UX such as push notifications).
     * See {@link (Voice:interface).(addEventListener:5)
     * | Voice.addEventListener(CallInviteRejected)}.
     */
    'CallInviteRejected' = 'callInviteRejected',
    /**
     * Raised when an incoming call invite has been cancelled, thus invalidating
     * the associated call invite.
     * See {@link (Voice:interface).(addEventListener:6)
     * | Voice.addEventListener(CancelledCallInvite)}.
     */
    'CancelledCallInvite' = 'cancelledCallInvite',
    /**
     * Raised when the SDK encounters an error.
     * See {@link (Voice:interface).(addEventListener:7)
     * | Voice.addEventListener(Error)}.
     */
    'Error' = 'error',
    /**
     * Raised when the SDK is registered for incoming calls.
     * See {@link (Voice:interface).(addEventListener:8)
     * | Voice.addEventListener(Registered)}.
     */
    'Registered' = 'registered',
    /**
     * Raised when the SDK is unregistered for incoming calls.
     * See {@link (Voice:interface).(addEventListener:9)
     * | Voice.addEventListener(Unregistered)}.
     */
    'Unregistered' = 'unregistered',
  }

  /**
   * Listener types for all events emitted by a {@link (Voice:class)
   * | Voice object.}
   */
  export namespace Listener {
    /**
     * Generic event listener. This should be the function signature of any
     * event listener bound to any voice event.
     *
     * @remarks
     * See {@link (Voice:interface).(addEventListener:1)}.
     */
    export type Generic = (...args: any[]) => void;

    /**
     * Audio devices updated event listener. This should be the function
     * signature of an event listener bound to the
     * {@link (Voice:namespace).Event.AudioDevicesUpdated} event.
     *
     * @remarks
     * See {@link (Voice:interface).(addEventListener:2)}.
     */
    export type AudioDevicesUpdated = (
      audioDevices: AudioDevice[],
      selectedDevice: AudioDevice | null
    ) => void;

    /**
     * Call invite event listener. This should be the function signature of an
     * event listener bound to the
     * {@link (Voice:namespace).Event.CallInvite} event.
     *
     * @remarks
     * See {@link (Voice:interface).(addEventListener:3)}.
     */
    export type CallInvite = (callInvite: CallInvite) => void;

    /**
     * Call invite accepted event listener. This should be the function
     * signature of an event listener bound to the
     * {@link (Voice:namespace).Event.CallInviteAccepted} event.
     *
     * @remarks
     * See {@link (Voice:interface).(addEventListener:4)}.
     */
    export type CallInviteAccepted = (
      callInvite: CallInvite,
      call: Call
    ) => void;

    /**
     * Call invite rejected event listener. This should be the function
     * signature of an event listener bound to the
     * {@link (Voice:namespace).Event.CallInviteRejected} event.
     *
     * @remarks
     * See {@link (Voice:interface).(addEventListener:5)}.
     */
    export type CallInviteRejected = (callInvite: CallInvite) => void;

    /**
     * Call invite cancelled event listener. This should be the function
     * signature of an event listener bound to the
     * {@link (Voice:namespace).Event.CancelledCallInvite} event.
     *
     * @remarks
     * See {@link (Voice:interface).(addEventListener:6)}.
     */
    export type CancelledCallInvite = (
      cancelledCallInvite: CancelledCallInvite,
      error?: GenericError
    ) => void;

    /**
     * Error event listener. This should be the function signature of an event
     * listener bound to the
     * {@link (Voice:namespace).Event.Error} event.
     *
     * @remarks
     * See {@link (Voice:interface).(addEventListener:7)}.
     */
    export type Error = (error: GenericError) => void;

    /**
     * Registered event listener. This should be the function signature of an
     * event listener bound to the
     * {@link (Voice:namespace).Event.Registered} event.
     *
     * @remarks
     * See {@link (Voice:interface).(addEventListener:7)}.
     */
    export type Registered = () => void;

    /**
     * Unregistered event listener. This should be the function signature of an
     * event listener bound to the
     * {@link (Voice:namespace).Event.Unregistered} event.
     *
     * @remarks
     * See {@link (Voice:interface).(addEventListener:8)}.
     */
    export type Unregistered = () => void;
  }
}
