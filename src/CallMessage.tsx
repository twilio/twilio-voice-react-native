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
   * Failure event. Raised when call message fails.
   * TODO example
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
   * Received event. Raised when call message is received.
   * TODO example
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
   * Sent event. Raised when call message is sent.
   * TODO example
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
 * Provides access to information about a call message
 */
export class CallMessage extends EventEmitter {
  private _content: string;

  private _contentType: string;

  private _messageType: string;

  private _messageSID: string;

  /**
   * Handlers for native call message events. Set upon construction so we can
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

  private _handleNativeEvent = (
    nativeCallMessageEvent: NativeCallMessageEvent
  ) => {
    const { type } = nativeCallMessageEvent;

    const handler = this._nativeEventHandler[type];
    if (typeof handler === 'undefined') {
      throw new Error(
        `Unknown call message event type received from the native layer: "${type}"`
      );
    }

    handler(nativeCallMessageEvent);
  };

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

  getContent(): string | undefined {
    return this._content;
  }

  getContentType(): string | undefined {
    return this._contentType;
  }

  getMessageType(): string | undefined {
    return this._messageType;
  }

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
     * Raised when call message fails.
     * See {@link (CallMessage:interface).(addListener:2)}.
     */
    'Failure' = 'failure',
    /**
     * Raised when call message is received.
     * See {@link (CallMessage:interface).(addListener:3)}.
     */
    'Received' = 'received',
    /**
     * Raised when call message has been sent.
     * See {@link (CallMessage:interface).(addListener:4)}.
     */
    'Sent' = 'sent',
  }

  export namespace Listener {
    /**
     * Generic event listener. This should be the function signature of any
     * event listener bound to any call message event.
     *
     * @remarks
     * See {@link (CallMessage:interface).(addListener:1)}.
     */
    export type Generic = (...args: any[]) => void;

    /**
     * Call message failure event listener. This should be the function signature of
     * any event listener bound to the
     * {@link (CallMessage:namespace).Event.Failure} event.
     *
     * @remarks
     * See {@link (CallMessage:interface).(addListener:2)}.
     *
     * See {@link TwilioErrors} for all error classes.
     */
    export type Failure = (error: TwilioError) => void;

    /**
     * Call message received event listner. This should be the function signature of
     * any event listener bound to the
     * {@link (CallMessage:namespace).Event.Received} event.
     *
     * @remarks
     * See {@link (CallMessage:interface).(addListener:3)}.
     */
    export type Received = (callMessage: CallMessage) => void;

    /**
     * Call message sent event listner. This should be the function signature of
     * any event listener bound to the
     * {@link (CallMessage:namespace).Event.Sent} event.
     *
     * @remarks
     * See {@link (CallMessage:interface).(addListener:4)}.
     */
    export type Sent = () => void;
  }
}
