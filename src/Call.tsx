/**
 * Copyright © 2022 Twilio, Inc. All rights reserved. Licensed under the Twilio
 * license.
 *
 * See LICENSE in the project root for license information.
 */

import { EventEmitter } from 'eventemitter3';
import type { RTCStats } from './';
import { NativeModule, NativeEventEmitter } from './common';
import { Constants } from './constants';
import type {
  NativeCallEvent,
  NativeCallEventType,
  NativeCallInfo,
  NativeCallFeedbackIssue,
  NativeCallFeedbackScore,
} from './type/Call';
import type { CustomParameters, Uuid } from './type/common';
import type { TwilioError } from './error/TwilioError';
import { InvalidArgumentError } from './error/InvalidArgumentError';
import { constructTwilioError } from './error/utility';
import { CallMessage, validateCallMessage } from './CallMessage/CallMessage';
import { IncomingCallMessage } from './CallMessage/IncomingCallMessage';
import { OutgoingCallMessage } from './CallMessage/OutgoingCallMessage';

/**
 * Defines strict typings for all events emitted by {@link (Call:class)
 * | Call objects}.
 *
 * @remarks
 * Note that the `on` function is an alias for the `addListener` function.
 * They share identical functionality and either may be used interchangeably.
 *
 * - See also the {@link (Call:class) | Call class}.
 * - See also the {@link (Call:namespace) | Call namespace}.
 *
 * @public
 */
export declare interface Call {
  /**
   * ------------
   * Emit Typings
   * ------------
   */

  /** @internal */
  emit(connectedEvent: Call.Event.Connected): boolean;

  /** @internal */
  emit(
    connectFailureEvent: Call.Event.ConnectFailure,
    error: TwilioError
  ): boolean;

  /** @internal */
  emit(reconnectingEvent: Call.Event.Reconnecting, error: TwilioError): boolean;

  /** @internal */
  emit(reconnectedEvent: Call.Event.Reconnected): boolean;

  /** @internal */
  emit(
    disconnectedEvent: Call.Event.Disconnected,
    error?: TwilioError
  ): boolean;

  /** @internal */
  emit(ringingEvent: Call.Event.Ringing): boolean;

  /** @internal */
  emit(
    qualityWarningsChangedEvent: Call.Event.QualityWarningsChanged,
    currentQualityWarnings: Call.QualityWarning[],
    previousQualityWarnings: Call.QualityWarning[]
  ): boolean;

  /** @internal */
  emit(
    messageReceivedEvent: Call.Event.MessageReceived,
    incomingCallMessage: IncomingCallMessage
  ): boolean;

  /**
   * ----------------
   * Listener Typings
   * ----------------
   */

  /**
   * Connected event. Raised when the call has successfully connected.
   *
   * @example
   * ```typescript
   * call.addListener(Call.Event.Connected, () => {
   *   // call has been connected
   * });
   * ```
   *
   * @param connectedEvent - The raised event string.
   * @param listener - A listener function that will be invoked when the event
   * is raised.
   * @returns - The call object.
   */
  addListener(
    connectedEvent: Call.Event.Connected,
    listener: Call.Listener.Connected
  ): this;
  /**
   * {@inheritDoc (Call:interface).(addListener:1)}
   */
  on(
    connectedEvent: Call.Event.Connected,
    listener: Call.Listener.Connected
  ): this;

  /**
   * Connect failure event. Raised when the call has failed to connect.
   *
   * @example
   * ```typescript
   * call.addListener(Call.Event.ConnectFailure, (error) => {
   *   // call was unable to connect, handle error
   * });
   * ```
   *
   * @param connectFailureEvent - The raised event string.
   * @param listener - A listener function that will be invoked when the event
   * is raised.
   * @returns - The call object.
   */
  addListener(
    connectFailureEvent: Call.Event.ConnectFailure,
    listener: Call.Listener.ConnectFailure
  ): this;
  /**
   * {@inheritDoc (Call:interface).(addListener:2)}
   */
  on(
    connectFailureEvent: Call.Event.ConnectFailure,
    listener: Call.Listener.ConnectFailure
  ): this;

  /**
   * Reconnecting event. Raised when the call is reconnecting.
   *
   * @example
   * ```typescript
   * call.addListener(Call.Event.Reconnecting, (error) => {
   *   // call is attempting to reconnect, handle error
   * });
   * ```
   *
   * @param reconnectingEvent - The raised event string.
   * @param listener - A listener function that will be invoked when the event
   * is raised.
   * @returns - The call object.
   */
  addListener(
    reconnectingEvent: Call.Event.Reconnecting,
    listener: Call.Listener.Reconnecting
  ): this;
  /**
   * {@inheritDoc (Call:interface).(addListener:3)}
   */
  on(
    reconnectingEvent: Call.Event.Reconnecting,
    listener: Call.Listener.Reconnecting
  ): this;

  /**
   * Reconnected event. Raised when the call has recovered and reconnected.
   *
   * @example
   * ```typescript
   * call.addListener(Call.Event.Reconnected, () => {
   *   // call has reconnected
   * });
   * ```
   *
   * @param reconnectedEvent - The raised event string.
   * @param listener - A listener function that will be invoked when the event
   * is raised.
   * @returns - The call object.
   */
  addListener(
    reconnectedEvent: Call.Event.Reconnected,
    listener: Call.Listener.Reconnected
  ): this;
  /**
   * {@inheritDoc (Call:interface).(addListener:4)}
   */
  on(
    reconnectedEvent: Call.Event.Reconnected,
    listener: Call.Listener.Reconnected
  ): this;

  /**
   * Disconnected event. Raised when the call has disconnected.
   *
   * @remarks
   * This event can occur in "naturally" disconnected calls and calls
   * disconnected from issues such as network problems. If the SDK has detected
   * an issue that has caused the call to disconnect, then the error parameter
   * will be defined, otherwise it will be undefined.
   *
   * @example
   * ```typescript
   * call.addListener(Call.Event.Disconnected, (error) => {
   *   // call has disconnected
   *   // if a natural disconnect occurred, then error is `undefined`
   *   // if an unnatural disconnect occurred, then error is defined
   * });
   * ```
   *
   * @param disconnectedEvent - The raised event string.
   * @param listener - A listener function that will be invoked when the event
   * is raised.
   * @returns - The call object.
   */
  addListener(
    disconnectedEvent: Call.Event.Disconnected,
    listener: Call.Listener.Disconnected
  ): this;
  /**
   * {@inheritDoc (Call:interface).(addListener:5)}
   */
  on(
    disconnectedEvent: Call.Event.Disconnected,
    listener: Call.Listener.Disconnected
  ): this;

  /**
   * Ringing event. Raised when the call has begun to ring.
   *
   * @example
   * ```typescript
   * call.addListener(Call.Event.Ringing, () => {
   *   // call is ringing
   * });
   * ```
   *
   * @param ringingEvent - The raised event string.
   * @param listener - A listener function that will be invoked when the event
   * is raised.
   * @returns - The call object.
   */
  addListener(
    ringingEvent: Call.Event.Ringing,
    listener: Call.Listener.Ringing
  ): this;
  /**
   * {@inheritDoc (Call:interface).(addListener:6)}
   */
  on(ringingEvent: Call.Event.Ringing, listener: Call.Listener.Ringing): this;

  /**
   * Quality warnings changed event. Raised when a call quality warning is set
   * or unset. All "ongoing" call quality warnings are passed to the invoked
   * listener function.
   *
   * @example
   * ```typescript
   * call.addListener(
   *   Call.Event.QualityWarningsChanged,
   *   (
   *      currentWarnings: Call.QualityWarning[],
   *      previousWarnings: Call.QualityWarning[]
   *   ) => {
   *     // call quality warnings have changed
   *   }
   * );
   * ```
   *
   * @param qualityWarningsChangedEvent - The raised event string.
   * @param listener - A listener function that will be invoked when the event
   * is raised.
   * @returns - The call object.
   */
  addListener(
    qualityWarningsChangedEvent: Call.Event.QualityWarningsChanged,
    listener: Call.Listener.QualityWarningsChanged
  ): this;
  /**
   * {@inheritDoc (Call:interface).(addListener:7)}
   */
  on(
    qualityWarningsChangedEvent: Call.Event.QualityWarningsChanged,
    listener: Call.Listener.QualityWarningsChanged
  ): this;

  /**
   * MessageReceived event. Raised when a {@link IncomingCallMessage} is
   * received.
   *
   * @example
   * ```typescript
   * call.addListener(Call.Event.MessageReceived, (message) => {
   *    // callMessage received
   * })
   * ```
   *
   * @param messageReceivedEvent - The raised event string.
   * @param listener - A listener function that will be invoked when the event
   * is raised.
   * @returns - The callMessage object
   */
  addListener(
    messageReceivedEvent: Call.Event.MessageReceived,
    listener: Call.Listener.MessageReceived
  ): this;
  /** {@inheritDoc (Call:interface).(addListener:8)} */
  on(
    callMessageEvent: Call.Event.MessageReceived,
    listener: Call.Listener.MessageReceived
  ): this;

  /**
   * Generic event listener typings.
   * @param callEvent - The raised event string.
   * @param listener - A listener function that will be invoked when the event
   * is raised.
   * @returns - The call object.
   */
  addListener(callEvent: Call.Event, listener: Call.Listener.Generic): this;
  /**
   * {@inheritDoc (Call:interface).(addListener:9)}
   */
  on(callEvent: Call.Event, listener: Call.Listener.Generic): this;
}

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
export class Call extends EventEmitter {
  /**
   * The `Uuid` of this call. Used to identify calls between the JS and native
   * layer so we can associate events and native functionality between the
   * layers.
   */
  private _uuid: Uuid;
  /**
   * Call custom parameters.
   */
  private _customParameters: CustomParameters;
  /**
   * Call `from` parameter.
   */
  private _from?: string;
  /**
   * Initial `connected` timestamp. Milliseconds since epoch.
   */
  private _initialConnectedTimestamp?: Date;
  /**
   * A boolean representing if the call is currently muted.
   */
  private _isMuted?: boolean;
  /**
   * A boolean representing if the call is currently on hold.
   */
  private _isOnHold?: boolean;
  /**
   * A string representing the SID of this call.
   */
  private _sid?: string;
  /**
   * The current state of the call.
   *
   * @remarks
   * See {@link (Call:namespace).State}.
   */
  private _state: Call.State;
  /**
   * Call `to` parameter.
   */
  private _to?: string;

  /**
   * Handlers for native call events. Set upon construction so we can
   * dynamically bind events to handlers.
   *
   * @privateRemarks
   * This is done by the constructor so this mapping isn't made every time the
   * {@link (Call:class)._handleNativeEvent} function is invoked.
   */
  private _nativeEventHandler: Record<
    NativeCallEventType,
    (callEvent: NativeCallEvent) => void
  >;

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
    state,
    to,
    isMuted,
    isOnHold,
    initialConnectedTimestamp,
  }: NativeCallInfo) {
    super();

    this._uuid = uuid;
    this._customParameters = { ...customParameters };
    this._from = from;
    this._sid = sid;
    this._state = typeof state === 'string' ? state : Call.State.Connecting;
    this._to = to;
    this._isMuted = isMuted;
    this._isOnHold = isOnHold;
    this._initialConnectedTimestamp = initialConnectedTimestamp
      ? new Date(initialConnectedTimestamp)
      : undefined;

    this._nativeEventHandler = {
      /**
       * Call State
       */
      [Constants.CallEventConnected]: this._handleConnectedEvent,
      [Constants.CallEventConnectFailure]: this._handleConnectFailureEvent,
      [Constants.CallEventDisconnected]: this._handleDisconnectedEvent,
      [Constants.CallEventReconnected]: this._handleReconnectedEvent,
      [Constants.CallEventReconnecting]: this._handleReconnectingEvent,
      [Constants.CallEventRinging]: this._handleRingingEvent,

      /**
       * Call Quality
       */
      [Constants.CallEventQualityWarningsChanged]:
        this._handleQualityWarningsChangedEvent,

      /**
       * Call Message
       */
      [Constants.CallEventMessageReceived]: this._handleMessageReceivedEvent,
    };

    NativeEventEmitter.addListener(
      Constants.ScopeCall,
      this._handleNativeEvent
    );
  }

  /**
   * This intermediate native call event handler acts as a "gate", only
   * executing the actual call event handler (such as `Connected`) if this call
   * object matches the `Uuid` of the call that had an event raised.
   * @param nativeCallEvent - A call event directly from the native layer.
   */
  private _handleNativeEvent = (nativeCallEvent: NativeCallEvent) => {
    const { type, call: callInfo } = nativeCallEvent;

    const handler = this._nativeEventHandler[type];
    if (typeof handler === 'undefined') {
      throw new Error(
        `Unknown call event type received from the native layer: "${type}".`
      );
    }

    if (callInfo.uuid === this._uuid) {
      handler(nativeCallEvent);
    }
  };

  /**
   * Helper function to update the state of the call when a call event occurs
   * that necessitates an update, i.e. upon a
   * {@link (Call:namespace).Event.Connected | Connected event} we want to
   * update the state of the call to also reflect the
   * {@link (Call:namespace).State.Connected | Connected state}.
   * @param nativeCallEvent - The native call event.
   */
  private _update({
    type,
    call: { from, initialConnectedTimestamp, sid, to },
  }: NativeCallEvent) {
    const newState = eventTypeStateMap[type];
    if (typeof newState === 'string') {
      this._state = newState;
    }
    this._from = from;
    this._initialConnectedTimestamp = initialConnectedTimestamp
      ? new Date(initialConnectedTimestamp)
      : undefined;
    this._sid = sid;
    this._to = to;
  }

  /**
   * Handler for the the {@link (Call:namespace).Event.Connected} event.
   * @param nativeCallEvent - The native call event.
   */
  private _handleConnectedEvent = (nativeCallEvent: NativeCallEvent) => {
    if (nativeCallEvent.type !== Constants.CallEventConnected) {
      throw new Error(
        'Incorrect "call#connected" handler called for type ' +
          `"${nativeCallEvent.type}".`
      );
    }

    this._update(nativeCallEvent);

    this.emit(Call.Event.Connected);
  };

  /**
   * Handler for the the {@link (Call:namespace).Event.ConnectFailure} event.
   * @param nativeCallEvent - The native call event.
   */
  private _handleConnectFailureEvent = (nativeCallEvent: NativeCallEvent) => {
    if (nativeCallEvent.type !== Constants.CallEventConnectFailure) {
      throw new Error(
        'Incorrect "call#connectFailure" handler called for type ' +
          `"${nativeCallEvent.type}".`
      );
    }

    this._update(nativeCallEvent);

    const { message, code } = nativeCallEvent.error;
    const error = constructTwilioError(message, code);
    this.emit(Call.Event.ConnectFailure, error);
  };

  /**
   * Handler for the the {@link (Call:namespace).Event.Disconnected} event.
   * @param nativeCallEvent - The native call event.
   */
  private _handleDisconnectedEvent = (nativeCallEvent: NativeCallEvent) => {
    if (nativeCallEvent.type !== Constants.CallEventDisconnected) {
      throw new Error(
        'Incorrect "call#disconnected" handler called for type ' +
          `"${nativeCallEvent.type}".`
      );
    }

    this._update(nativeCallEvent);

    if (nativeCallEvent.error) {
      const { message, code } = nativeCallEvent.error;
      const error = constructTwilioError(message, code);
      this.emit(Call.Event.Disconnected, error);
    } else {
      this.emit(Call.Event.Disconnected);
    }
  };

  /**
   * Handler for the the {@link (Call:namespace).Event.Reconnecting} event.
   * @param nativeCallEvent - The native call event.
   */
  private _handleReconnectingEvent = (nativeCallEvent: NativeCallEvent) => {
    if (nativeCallEvent.type !== Constants.CallEventReconnecting) {
      throw new Error(
        'Incorrect "call#reconnecting" handler called for type ' +
          `"${nativeCallEvent.type}".`
      );
    }

    this._update(nativeCallEvent);

    const { message, code } = nativeCallEvent.error;
    const error = constructTwilioError(message, code);
    this.emit(Call.Event.Reconnecting, error);
  };

  /**
   * Handler for the the {@link (Call:namespace).Event.Reconnected} event.
   * @param nativeCallEvent - The native call event.
   */
  private _handleReconnectedEvent = (nativeCallEvent: NativeCallEvent) => {
    if (nativeCallEvent.type !== Constants.CallEventReconnected) {
      throw new Error(
        'Incorrect "call#reconnected" handler called for type ' +
          `"${nativeCallEvent.type}".`
      );
    }

    this._update(nativeCallEvent);

    this.emit(Call.Event.Reconnected);
  };

  /**
   * Handler for the the {@link (Call:namespace).Event.Ringing} event.
   * @param nativeCallEvent - The native call event.
   */
  private _handleRingingEvent = (nativeCallEvent: NativeCallEvent) => {
    if (nativeCallEvent.type !== Constants.CallEventRinging) {
      throw new Error(
        'Incorrect "call#ringing" handler called for type ' +
          `"${nativeCallEvent.type}".`
      );
    }

    this._update(nativeCallEvent);

    this.emit(Call.Event.Ringing);
  };

  /**
   * Handler for the the {@link (Call:namespace).Event.QualityWarningsChanged}
   * event.
   * @param nativeCallEvent - The native call event.
   */
  private _handleQualityWarningsChangedEvent = (
    nativeCallEvent: NativeCallEvent
  ) => {
    if (nativeCallEvent.type !== Constants.CallEventQualityWarningsChanged) {
      throw new Error(
        'Incorrect "call#qualityWarnings" handler called for type ' +
          `"${nativeCallEvent.type}".`
      );
    }

    this._update(nativeCallEvent);

    const currentWarnings = nativeCallEvent[Constants.CallEventCurrentWarnings];
    const previousWarnings =
      nativeCallEvent[Constants.CallEventPreviousWarnings];

    this.emit(
      Call.Event.QualityWarningsChanged,
      currentWarnings as Call.QualityWarning[],
      previousWarnings as Call.QualityWarning[]
    );
  };

  /**
   * Handler for the {@link (Call:namespace).Event.MessageReceived} event.
   * @param nativeCallEvent - The native call event.
   */
  private _handleMessageReceivedEvent = (nativeCallEvent: NativeCallEvent) => {
    if (nativeCallEvent.type !== Constants.CallEventMessageReceived) {
      throw new Error(
        'Incorrect "call#Received" handler called for type' +
          `"${nativeCallEvent.type}`
      );
    }

    this._update(nativeCallEvent);

    const { callMessage: callMessageInfo } = nativeCallEvent;

    const incomingCallMessage = new IncomingCallMessage(callMessageInfo);

    this.emit(Call.Event.MessageReceived, incomingCallMessage);
  };

  /**
   * Disconnect this side of the call.
   * @returns
   *  A `Promise` that
   *    - Resolves when the call has disconnected.
   *    - Rejects if the native layer cannot disconnect the call.
   */
  disconnect(): Promise<void> {
    return NativeModule.call_disconnect(this._uuid);
  }

  /**
   * Get the mute status of this side of the call.
   * @returns
   *  - A boolean representing the muted status of the call.
   *  - `undefined` if the call state has not yet been received from the native
   *    layer.
   */
  isMuted(): boolean | undefined {
    return this._isMuted;
  }

  /**
   * Get the hold status of this side of the call.
   * @returns
   *  - A boolean representing the hold status of the call.
   *  - `undefined` if the call state has not yet been received from the native
   *    layer.
   */
  isOnHold(): boolean | undefined {
    return this._isOnHold;
  }

  /**
   * Return a `Record` of custom parameters given to this call.
   * @returns
   *   - A `Record` of custom parameters.
   */
  getCustomParameters(): CustomParameters {
    return this._customParameters;
  }

  /**
   * Get the value of the `from` parameter given to this call.
   * @returns
   *  - A `String` representing the `from` parameter.
   *  - `undefined` if the call information has not yet been received from the
   *    native layer.
   */
  getFrom(): string | undefined {
    return this._from;
  }

  /**
   * Get the timestamp (milliseconds since epoch) of the call connected event.
   * @returns
   *  - A `number` representing the timestamp.
   *  - `undefined` if the call has not yet connected.
   */
  getInitialConnectedTimestamp(): Date | undefined {
    return this._initialConnectedTimestamp;
  }

  /**
   * Get the call `SID`.
   * @returns
   *  - A `String` representing the `SID` of the call.
   *  - `undefined` if the call information has not yet been received from the
   *    native layer.
   */
  getSid(): string | undefined {
    return this._sid;
  }

  /**
   * Get the state of the call object, such as {@link (Call:namespace).State.Connected} or
   * {@link (Call:namespace).State.Disconnected}.
   * @returns
   *  - A {@link (Call:namespace).State}.
   */
  getState(): Call.State {
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
  getStats(): Promise<RTCStats.StatsReport> {
    return NativeModule.call_getStats(this._uuid);
  }

  /**
   * Get the value of the `to` parameter given to this call.
   * @returns
   *  - A `String` representing the `to` parameter.
   *  - `undefined` if the call information has not yet been received from the
   *    native layer.
   */
  getTo(): string | undefined {
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
  async hold(hold: boolean): Promise<boolean> {
    this._isOnHold = await NativeModule.call_hold(this._uuid, hold);
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
  async mute(mute: boolean): Promise<boolean> {
    this._isMuted = await NativeModule.call_mute(this._uuid, mute);
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
  sendDigits(digits: string): Promise<void> {
    return NativeModule.call_sendDigits(this._uuid, digits);
  }

  /**
   * Send a CallMessage.
   *
   * @example
   * To send a user-defined-message
   * ```typescript
   * const outgoingCallMessage: OutgoingCallMessage = await call.sendMessage({
   *   content: { key1: 'This is a messsage from the parent call' },
   *   contentType: 'application/json',
   *   messageType: 'user-defined-message'
   * });
   *
   * outgoingCallMessage.addListener(OutgoingCallMessage.Event.Failure, (error) => {
   *   // outgoingCallMessage failed, handle error
   * });
   *
   * outgoingCallMessage.addListener(OutgoingCallMessage.Event.Sent, () => {
   *   // outgoingCallMessage sent
   * });
   * ```
   *
   * @param message - The call message to send.
   *
   * @returns
   *  A `Promise` that
   *    - Resolves with the OutgoingCallMessage object.
   *    - Rejects when the message is unable to be sent.
   */
  async sendMessage(message: CallMessage): Promise<OutgoingCallMessage> {
    const { content, contentType, messageType } = validateCallMessage(message);

    const voiceEventSid = await NativeModule.call_sendMessage(
      this._uuid,
      content,
      contentType,
      messageType
    );

    const outgoingCallMessage = new OutgoingCallMessage({
      content,
      contentType,
      messageType,
      voiceEventSid,
    });

    return outgoingCallMessage;
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
  async postFeedback(score: Call.Score, issue: Call.Issue): Promise<void> {
    if (!validScores.includes(score)) {
      throw new InvalidArgumentError(
        '"score" parameter invalid. Must be a member of the `Call.Score` enum.'
      );
    }

    if (!Object.values(Call.Issue).includes(issue)) {
      throw new InvalidArgumentError(
        '"issue" parameter invalid. Must be a member of the `Call.Issue` enum.'
      );
    }

    const nativeScore = scoreMap[score];
    const nativeIssue = issueMap[issue];

    return NativeModule.call_postFeedback(this._uuid, nativeScore, nativeIssue);
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
export namespace Call {
  /**
   * Enumeration of all event strings emitted by {@link (Call:class)} objects.
   */
  export enum Event {
    /**
     * Event string for the `Connected` event.
     * See {@link (Call:interface).(addListener:1)}.
     */
    'Connected' = 'connected',

    /**
     * Event string for the `ConnectedFailure` event.
     * See {@link (Call:interface).(addListener:2)}.
     */
    'ConnectFailure' = 'connectFailure',

    /**
     * Event string for the `Reconnecting` event.
     * See {@link (Call:interface).(addListener:3)}.
     */
    'Reconnecting' = 'reconnecting',

    /**
     * Event string for the `Reconnected` event.
     * See {@link (Call:interface).(addListener:4)}.
     */
    'Reconnected' = 'reconnected',

    /**
     * Event string for the `Disconnected` event.
     * See {@link (Call:interface).(addListener:5)}.
     */
    'Disconnected' = 'disconnected',

    /**
     * Event string for the `Ringing` event.
     * See {@link (Call:interface).(addListener:6)}.
     */
    'Ringing' = 'ringing',

    /**
     * Event string for the `QualityWarningsChanged` event.
     * See {@link (Call:interface).(addListener:7)}.
     */
    'QualityWarningsChanged' = 'qualityWarningsChanged',

    /**
     * Event string for the `MessageReceived` event.
     * See {@link (Call:interface).(addListener:8)}
     */
    'MessageReceived' = 'messageReceived',
  }

  /**
   * An enumeration of all possible {@link (Call:class) | Call object} states.
   */
  export enum State {
    /**
     * Call `Connected` state.
     *
     * Occurs when the `Connected` and `Reconnected` event is raised.
     *
     * @remarks
     *
     * See {@link (Call:interface).(addListener:1)}.
     *
     * See {@link (Call:interface).(addListener:4)}.
     */
    'Connected' = Constants.CallStateConnected,

    /**
     * Call `Connecting` state.
     *
     * The default state of an outgoing call.
     */
    'Connecting' = Constants.CallStateConnecting,

    /**
     * Call `Disconnected` state.
     *
     * Occurs when the `Disconnected` or `ConnectFailure` event is raised.
     *
     * @remarks
     *
     * See {@link (Call:interface).(addListener:5)}.
     *
     * See {@link (Call:interface).(addListener:2)}.
     */
    'Disconnected' = Constants.CallStateDisconnected,

    /**
     * Call `Reconnecting` state.
     *
     * Occurs when the `Reconnecting` event is raised.
     *
     * @remarks
     *
     * See {@link (Call:interface).(addListener:3)}.
     */
    'Reconnecting' = Constants.CallStateReconnecting,

    /**
     * Call `Ringing` state. Occurs when the `Ringing` event is raised.
     *
     * @remarks
     *
     * See {@link (Call:interface).(addListener:6)}.
     */
    'Ringing' = Constants.CallStateRinging,
  }

  /**
   * An enumeration of all call quality-warning types.
   */
  export enum QualityWarning {
    /**
     * Raised when the call detects constant audio input, such as silence.
     */
    'ConstantAudioInputLevel' = 'constant-audio-input-level',
    /**
     * Raised when the network encounters high jitter.
     */
    'HighJitter' = 'high-jitter',
    /**
     * Raised when the network encounters high packet loss.
     */
    'HighPacketLoss' = 'high-packet-loss',
    /**
     * Raised when the network encounters high packet round-trip-time.
     */
    'HighRtt' = 'high-rtt',
    /**
     * Raised when the call detects a low mean-opinion-score or MOS.
     */
    'LowMos' = 'low-mos',
  }

  /**
   * An enumeration of all scores that could be used to rate the experience of
   * a call or issues encountered during the call.
   */
  export enum Score {
    /**
     * An issue was not encountered or there is no desire to report said issue.
     */
    'NotReported' = 0,
    /**
     * An issue had severity approximately 1/5.
     */
    'One' = 1,
    /**
     * An issue had severity approximately 2/5.
     */
    'Two' = 2,
    /**
     * An issue had severity approximately 3/5.
     */
    'Three' = 3,
    /**
     * An issue had severity approximately 4/5.
     */
    'Four' = 4,
    /**
     * An issue had severity approximately 5/5.
     */
    'Five' = 5,
  }

  /**
   * An enumeration of call issues that can be reported.
   */
  export enum Issue {
    /**
     * No issue is reported.
     */
    'NotReported' = 'not-reported',
    /**
     * The call was dropped unexpectedly.
     */
    'DroppedCall' = 'dropped-call',
    /**
     * The call encountered significant audio latency.
     */
    'AudioLatency' = 'audio-latency',
    /**
     * One party of the call could not hear the other callee.
     */
    'OneWayAudio' = 'one-way-audio',
    /**
     * Call audio was choppy.
     */
    'ChoppyAudio' = 'choppy-audio',
    /**
     * Call audio had significant noise.
     */
    'NoisyCall' = 'noisy-call',
    /**
     * Call audio had significant echo.
     */
    'Echo' = 'echo',
  }

  /**
   * Listener types for all events emitted by a
   * {@link (Call:class) | Call object.}
   */
  export namespace Listener {
    /**
     * Connected event listener. This should be the function signature of any
     * event listener bound to the {@link (Call:namespace).Event.Connected}
     * event.
     *
     * @remarks
     * See {@link (Call:interface).(addListener:1)}.
     */
    export type Connected = () => void;

    /**
     * Connect failure event listener. This should be the function signature of
     * any event listener bound to the
     * {@link (Call:namespace).Event.ConnectFailure} event.
     *
     * @remarks
     * See {@link (Call:interface).(addListener:2)}.
     *
     * See {@link TwilioErrors} for all error classes.
     */
    export type ConnectFailure = (error: TwilioError) => void;

    /**
     * Reconnecting event listener. This should be the function signature of any
     * event listener bound to the {@link (Call:namespace).Event.Reconnecting}
     * event.
     *
     * @remarks
     * See {@link (Call:interface).(addListener:3)}.
     *
     * See {@link TwilioErrors} for all error classes.
     */
    export type Reconnecting = (error: TwilioError) => void;

    /**
     * Reconnected event listener. This should be the function signature of any
     * event listener bound to the {@link (Call:namespace).Event.Reconnected}
     * event.
     *
     * @remarks
     * See {@link (Call:interface).(addListener:4)}.
     */
    export type Reconnected = () => void;

    /**
     * Disconnected event listener. This should be the function signature of any
     * event listener bound to the {@link (Call:namespace).Event.Disconnected}
     * event.
     *
     * @remarks
     * See {@link (Call:interface).(addListener:5)}.
     *
     * See {@link TwilioErrors} for all error classes.
     */
    export type Disconnected = (error?: TwilioError) => void;

    /**
     * Ringing event listener. This should be the function signature of any
     * event listener bound to the {@link (Call:namespace).Event.Ringing} event.
     *
     * @remarks
     * See {@link (Call:interface).(addListener:6)}.
     */
    export type Ringing = () => void;

    /**
     * Quality warnings changed event listener. This should be the function
     * signature of any event listener bound to the
     * {@link (Call:namespace).Event.QualityWarningsChanged} event.
     *
     * @remarks
     * See {@link (Call:interface).(addListener:7)}.
     */
    export type QualityWarningsChanged = (
      currentQualityWarnings: Call.QualityWarning[],
      previousQualityWarnings: Call.QualityWarning[]
    ) => void;

    /**
     * CallMessage received event listener. This should be the function signature of
     * any event listener bound to the {@link (Call:namespace).Event.MessageReceived} event.
     *
     * @remarks
     * See {@link (Call:interface).(addListener:8)}.
     */
    export type MessageReceived = (
      incomingCallMessage: IncomingCallMessage
    ) => void;

    /**
     * Generic event listener. This should be the function signature of any
     * event listener bound to any call event.
     *
     * @remarks
     * See {@link (Call:interface).(addListener:9)}.
     */
    export type Generic = (...args: any[]) => void;
  }
}

/**
 * Mapping of {@link (Call:namespace).Event | Call events} to
 * {@link (Call:namespace).State | Call states}.
 *
 * @remarks
 * Note that this mapping is not a 1:1 bijection. Not every event coming from
 * the native layer has a relevant state, and some events share a state.
 * Therefore, this `Record` needs to be marked as `Partial` and
 * undefined-checking logic is needed when using this mapping.
 *
 * @internal
 */
const eventTypeStateMap: Partial<Record<NativeCallEventType, Call.State>> = {
  [Constants.CallEventConnected]: Call.State.Connected,
  [Constants.CallEventConnectFailure]: Call.State.Disconnected,
  [Constants.CallEventDisconnected]: Call.State.Disconnected,
  [Constants.CallEventReconnecting]: Call.State.Reconnecting,
  [Constants.CallEventReconnected]: Call.State.Connected,
  [Constants.CallEventRinging]: Call.State.Ringing,
};

/**
 * Array of valid call scores.
 *
 * @internal
 */
const validScores = [
  Call.Score.NotReported,
  Call.Score.One,
  Call.Score.Two,
  Call.Score.Three,
  Call.Score.Four,
  Call.Score.Five,
];

/**
 * Mapping of the {@link (Call:namespace).Score | Call score} enum to
 * cross-platform common constants.
 *
 * @internal
 */
const scoreMap: Record<Call.Score, NativeCallFeedbackScore> = {
  [Call.Score.NotReported]: Constants.CallFeedbackScoreNotReported,
  [Call.Score.One]: Constants.CallFeedbackScoreOne,
  [Call.Score.Two]: Constants.CallFeedbackScoreTwo,
  [Call.Score.Three]: Constants.CallFeedbackScoreThree,
  [Call.Score.Four]: Constants.CallFeedbackScoreFour,
  [Call.Score.Five]: Constants.CallFeedbackScoreFive,
};

/**
 * Mapping of the {@link (Call:namespace).Issue | Call issue} enum to
 * cross-platform common constants.
 *
 * @internal
 */
const issueMap: Record<Call.Issue, NativeCallFeedbackIssue> = {
  [Call.Issue.AudioLatency]: Constants.CallFeedbackIssueAudioLatency,
  [Call.Issue.ChoppyAudio]: Constants.CallFeedbackIssueChoppyAudio,
  [Call.Issue.DroppedCall]: Constants.CallFeedbackIssueDroppedCall,
  [Call.Issue.Echo]: Constants.CallFeedbackIssueEcho,
  [Call.Issue.NoisyCall]: Constants.CallFeedbackIssueNoisyCall,
  [Call.Issue.NotReported]: Constants.CallFeedbackIssueNotReported,
  [Call.Issue.OneWayAudio]: Constants.CallFeedbackIssueOneWayAudio,
};
