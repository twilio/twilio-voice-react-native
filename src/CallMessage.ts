/**
 * Copyright © 2022 Twilio, Inc. All rights reserved. Licensed under the Twilio
 * license.
 *
 * See LICENSE in the project root for license information.
 */

import { EventEmitter } from 'eventemitter3';
import type { TwilioError } from './error';
import type {
  NativeCallMessageEvent,
  NativeCallMessageEventType,
  NativeCallMessageInfo,
} from './type/CallMessage';
import { Constants } from './constants';
import { NativeEventEmitter } from './common';
import { constructTwilioError } from './error/utility';

/**
 * Defines strict typings for all events emitted by {@link (CallMessage:class)
 * | CallMessage objects}.
 *
 * @remarks
 * Note that the `on` function is an alias for the `addListener` function.
 * They share identical functionality and either may be used interchangeably.
 *
 * - See also the {@link (CallMessage:class) | CallMessage class}.
 * - See also the {@link (CallMessage:namespace) | CallMessage namespace}.
 *
 * @public
 */
export declare interface CallMessage {
  /**
   * ------------
   * Emit Typings
   * ------------
   */

  /** @internal */
  emit(
    callMessageEvent: CallMessage.Event.Failure,
    error: TwilioError
  ): boolean;

  /** @internal */
  emit(
    callMessageEvent: CallMessage.Event.Received,
    callMessageSID: string,
    callMessage: CallMessage
  ): boolean;

  /** @internal */
  emit(
    callMessageEvent: CallMessage.Event.Sent,
    callMessageSID: string
  ): boolean;

  /**
   * ----------------
   * Listener Typings
   * ----------------
   */

  /**
   * Failure event. Raised when callMessage fails.
   *
   * @example
   * ```typescript
   * callMessage.addListener(CallMessage.Event.Failure, () => {
   *    // callMessage failed, handle error
   * });
   * ```
   *
   * @param callMessageEvent - The raised event string.
   * @param listener - A listener function that will be invoked when the event
   * is raised.
   * @returns - The callMessage object.
   */
  addListener(
    callMessageEvent: CallMessage.Event.Failure,
    listener: CallMessage.Listener.Failure
  ): this;
  /** {@inheritDoc (Voice:interface).(addListener:1)} */
  on(
    callMessageEvent: CallMessage.Event.Failure,
    listener: CallMessage.Listener.Failure
  ): this;

  /**
   * Received event. Raised when callMessage is received.
   * @example
   * ```typescript
   * callMessage.addListener(CallMessage.Event.Received, () => {
   *    // callMessage received
   * })
   * ```
   *
   * @param callMessageEvent - The raised event string.
   * @param listener - A listener function that will be invoked when the event
   * is raised.
   * @returns - The callMessage object
   */
  addListener(
    callMessageEvent: CallMessage.Event.Received,
    listener: CallMessage.Listener.Received
  ): this;
  /** {@inheritDoc (Voice:interface).(addListener:2)} */
  on(
    callMessageEvent: CallMessage.Event.Received,
    listener: CallMessage.Listener.Received
  ): this;

  /**
   * Sent event. Raised when callMessage is sent.
   * @example
   * ```typescript
   * callMessage.addListener(CallMessage.Event.Sent, () => {
   *    // callMessage sent
   * })
   * ```
   *
   * @param callMessageEvent - The raised event string.
   * @param listener - A listener function that will be invoked when the event
   * is raised.
   * @returns - The callMessage object
   */
  addListener(
    callMessageEvent: CallMessage.Event.Sent,
    listener: CallMessage.Listener.Sent
  ): this;
  /** {@inheritDoc (Voice:interface).(addListener:3)} */
  on(
    callMessageEvent: CallMessage.Event.Sent,
    listener: CallMessage.Listener.Sent
  ): this;
}

/**
 * Provides access to information about a callMessage, including the call
 * message content, contentType, messageType, and messageSID
 *
 * @remarks
 * Note that the callMessage information is fetched as soon as possible from the
 * native layer, but there is no guarantee that all information is immediately
 * available. Methods such as `CallMessage.getContent` or `CallMessage.getMessageSID`
 * may return `undefined`.
 *
 * As callMessage events are received from the native layer, callMessage information will
 * propagate from the native layer to the JS layer and become available.
 * Therefore, it is good practice to read information from the callMessage after an
 * event occurs, or as events occur.
 *
 * - See the {@link (CallMessage:namespace).Event} enum for events emitted by `CallMessage`
 *   objects.
 * - See the {@link (Call:interface) | Call interface} for overloaded event listening
 *   metods.
 * - See the {@link (Call:namespace) | Call namespace} for types and enumerations
 *   used by this class.
 *
 * @public
 */
export class CallMessage extends EventEmitter {
  /**
   * Content body of the message
   */
  private _content: string;

  /**
   * MIME type for the message
   */
  private _contentType: string;

  /**
   * Message type
   */
  private _messageType: string;

  /**
   * Unique identifier of the message
   */
  private _messageSID: string;

  /**
   * Handlers for native callMessage events. Set upon construction so we can
   * dynamically bind events to handlers.
   *
   * @privateRemarks
   * This is done by the constructor so this mapping isn't made every time the
   * {@link (CallMessage:class)._handleNativeEvent} function is invoked.
   */
  private _nativeEventHandler: Record<
    NativeCallMessageEventType,
    (callEvent: NativeCallMessageEvent) => void
  >;

  /**
   * Constructor for the {@link (CallMessage:class) | CallMessage class}. This should
   * not be invoked by third-party code.
   *
   * @param NativeCallMessageInfo - An object containing all of the data from the
   * native layer necessary to fully describe a callMessage, as well as invoke native
   * functionality for the callMessage.
   *
   * @internal
   */
  constructor({
    callMessageContent,
    callMessageContentType,
    callMessageType,
    callMessageSID,
  }: NativeCallMessageInfo) {
    super();

    this._content = callMessageContent;
    this._contentType = callMessageContentType;
    this._messageType = callMessageType;
    this._messageSID = callMessageSID;

    this._nativeEventHandler = {
      /**
       * Call Message State
       */
      [Constants.CallEventMessageFailure]: this._handleFailureEvent,
      [Constants.CallEventMessageReceived]: this._handleReceivedEvent,
      [Constants.CallEventMessageSent]: this._handleSentEvent,
    };

    NativeEventEmitter.addListener(
      Constants.ScopeCallMessage,
      this._handleNativeEvent
    );
  }

  /**
   * This intermediate native callMessage event handler acts as a "gate".
   * @param nativeCallMessageEvent - A callMessage event directly from the native layer.
   */
  private _handleNativeEvent = (
    nativeCallMessageEvent: NativeCallMessageEvent
  ) => {
    const { type } = nativeCallMessageEvent;

    const handler = this._nativeEventHandler[type];
    if (typeof handler === 'undefined') {
      throw new Error(
        `Unknown callMessage event type received from the native layer: "${type}"`
      );
    }

    handler(nativeCallMessageEvent);
  };

  /**
   * Handler for the {@link (CallMessage:namespace).Event.Failure} event.
   * @param nativeCallMessageEvent - The native callMessage event.
   */
  private _handleFailureEvent = (
    nativeCallMessageEvent: NativeCallMessageEvent
  ) => {
    if (nativeCallMessageEvent.type !== Constants.CallEventMessageFailure) {
      throw new Error(
        'Incorrect "callMessage#Failure" handler called for type' +
          `"${nativeCallMessageEvent.type}`
      );
    }

    const { message, code } = nativeCallMessageEvent.error;
    const error = constructTwilioError(message, code);
    this.emit(CallMessage.Event.Failure, error);
  };

  /**
   * Handler for the {@link (CallMessage:namespace).Event.Received} event.
   * @param nativeCallMessageEvent - The native callMessage event.
   */
  private _handleReceivedEvent = (
    nativeCallMessageEvent: NativeCallMessageEvent
  ) => {
    if (nativeCallMessageEvent.type !== Constants.CallEventMessageReceived) {
      throw new Error(
        'Incorrect "callMessage#Received" handler called for type' +
          `"${nativeCallMessageEvent.type}`
      );
    }

    const { callMessageSID, callMessage: callMessageInfo } =
      nativeCallMessageEvent;

    const callMessage = new CallMessage(callMessageInfo);

    this.emit(CallMessage.Event.Received, callMessageSID, callMessage);
  };

  /**
   * Handler for the {@link (CallMessage:namespace).Event.Sent} event.
   * @param nativeCallMessageEvent - The native callMessage event.
   */
  private _handleSentEvent = (
    nativeCallMessageEvent: NativeCallMessageEvent
  ) => {
    if (nativeCallMessageEvent.type !== Constants.CallEventMessageSent) {
      throw new Error(
        'Incorrect "callMessage#Sent" handler called for type' +
          `"${nativeCallMessageEvent.type}"`
      );
    }

    const { callMessageSID } = nativeCallMessageEvent;

    this.emit(CallMessage.Event.Sent, callMessageSID);
  };

  /**
   * Get the content body of the message.
   * @returns
   * - A string representing the content body of the message.
   * - `undefined` if the callMessage state has not yet been received from the
   *   native layer.
   */
  getContent(): string | undefined {
    return this._content;
  }

  /**
   * Get the MIME type for the message.
   * @returns
   * - A string representing the MIME type for the message.
   * - `undefined` if the callMessage state has not yet been received from the
   *   native layer.
   */
  getContentType(): string | undefined {
    return this._contentType;
  }

  /**
   * Get the message type.
   * @returns
   * - A string representing the message type.
   * - `undefined` if the callMessage state has not yet been received from the
   *   native layer.
   */
  getMessageType(): string | undefined {
    return this._messageType;
  }

  /**
   * Get the message SID.
   * @returns
   * - A string representing the message SID.
   * - `undefined` if the callMessage state has not yet been received from the
   *   native layer.
   */
  getMessageSID(): string | undefined {
    return this._messageSID;
  }
}

/**
 * Namespace for enumerations and types used by
 * {@link (CallMessage:class) | CallMessage objects}.
 *
 * @remarks
 *  - See also the {@link (CallMessage:class) | CallMessage class}.
 *  - See also the {@link (CallMessage:interface) | CallMessage interface}.
 *
 * @public
 */
export namespace CallMessage {
  /**
   * Enumeration of all event strings emitted by {@link (CallMessage:class)} objects.
   */
  export enum Event {
    /**
     * Raised when callMessage fails.
     * See {@link (CallMessage:interface).(addListener:1)}.
     */
    'Failure' = 'failure',
    /**
     * Raised when callMessage is received.
     * See {@link (CallMessage:interface).(addListener:2)}.
     */
    'Received' = 'received',
    /**
     * Raised when callMessage has been sent.
     * See {@link (CallMessage:interface).(addListener:3)}.
     */
    'Sent' = 'sent',
  }

  /**
   * Listener types for all events emitted by a
   * {@link (CallMessage:class) | CallMessage: object}
   */
  export namespace Listener {
    /**
     * Generic event listener. This should be the function signature of any
     * event listener bound to any callMessage event.
     *
     * @remarks
     * See {@link (CallMessage:interface).(addListener:1)}.
     */
    export type Generic = (...args: any[]) => void;

    /**
     * CallMessage failure event listener. This should be the function signature of
     * any event listener bound to the {@link (CallMessage:namespace).Event.Failure} event.
     *
     * @remarks
     * See {@link (CallMessage:interface).(addListener:2)}.
     *
     * See {@link TwilioErrors} for all error classes.
     */
    export type Failure = (error: TwilioError) => void;

    /**
     * CallMessage received event listner. This should be the function signature of
     * any event listener bound to the {@link (CallMessage:namespace).Event.Received} event.
     *
     * @remarks
     * See {@link (CallMessage:interface).(addListener:3)}.
     */
    export type Received = (callMessage: CallMessage) => void;

    /**
     * CallMessage sent event listner. This should be the function signature of
     * any event listener bound to the {@link (CallMessage:namespace).Event.Sent} event.
     *
     * @remarks
     * See {@link (CallMessage:interface).(addListener:4)}.
     */
    export type Sent = () => void;
  }
}
