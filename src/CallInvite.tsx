/**
 * Copyright © 2022 Twilio, Inc. All rights reserved. Licensed under the Twilio
 * license.
 *
 * See LICENSE in the project root for license information.
 */

import { Call } from './Call';
import { NativeEventEmitter, NativeModule } from './common';
import { InvalidStateError } from './error/InvalidStateError';
import type {
  NativeCallInviteInfo,
  NativeCallInviteEvents,
  NativeCallInviteEventType,
} from './type/CallInvite';
import type { CustomParameters, Uuid } from './type/common';
import { CallMessage } from './CallMessage';
import { OutgoingCallMessage } from './OutgoingCallMessage';
import { Constants } from './constants';
import { EventEmitter } from 'eventemitter3';

/**
 * Defines strict typings for all events emitted by {@link (CallInvite:class)
 * | CallInvite objects}.
 *
 * @remarks
 * Note that the `on` function is an alias for the `addListener` function.
 * They share identical functionality and either may be used interchangeably.
 *
 * - See also the {@link (CallInvite:class) | CallInvite class}.
 * - See also the {@link (CallInvite:namespace) | CallInvite namespace}.
 *
 * @public
 */
export declare interface CallInvite {
  /**
   * ------------
   * Emit Typings
   * ------------
   */

  /** @internal */
  emit(
    messageReceivedEvent: CallInvite.Event.MessageReceived,
    callMessageSID: string,
    callMessage: CallMessage
  ): boolean;

  /** @internal */
  emit(callInviteEvent: CallInvite.Event, ...args: any[]): boolean;

  /**
   * ----------------
   * Listener Typings
   * ----------------
   */

  /**
   * MessageReceived event. Raised when callMessage is received.
   * @example
   * ```typescript
   * callInvite.addListener(CallInvite.Event.MessageReceived, () => {
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
    messageReceivedEvent: CallInvite.Event.MessageReceived,
    listener: CallInvite.Listener.MessageReceived
  ): this;
  /** {@inheritDoc (CallInvite:interface).(addListener:1)} */
  on(
    callMessageEvent: CallInvite.Event.MessageReceived,
    listener: CallInvite.Listener.MessageReceived
  ): this;

  /**
   * Generic event listener typings.
   * @param callInviteEvent - The raised event string.
   * @param listener - A listener function that will be invoked when the event
   * is raised.
   * @returns - The call object.
   */
  addListener(
    callInviteEvent: CallInvite.Event,
    listener: CallInvite.Listener.Generic
  ): this;
  /**
   * {@inheritDoc (CallInvite:interface).(addListener:2)}
   */
  on(
    callInviteEvent: CallInvite.Event,
    listener: CallInvite.Listener.Generic
  ): this;
}

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
export class CallInvite extends EventEmitter {
  /**
   * The current state of the call invite.
   *
   * @remarks
   * See {@link (CallInvite:namespace).State}.
   */
  private _state: CallInvite.State;
  /**
   * The `Uuid` of this call invite. Used to identify calls between the JS and
   * native layer so we can associate events and native functionality between
   * the layers.
   */
  private _uuid: Uuid;
  /**
   * A string representing the SID of this call.
   */
  private _callSid: string;
  /**
   * Call custom parameters.
   */
  private _customParameters: CustomParameters;
  /**
   * Call `from` parameter.
   */
  private _from: string;
  /**
   * Call `to` parameter.
   */
  private _to: string;

  /**
   * Handlers for native callInvite events. Set upon construction so we can
   * dynamically bind events to handlers.
   *
   * @privateRemarks
   * This is done by the constructor so this mapping isn't made every time the
   * {@link (CallInvite:class)._handleNativeEvent} function is invoked.
   */
  private _nativeEventHandler: Record<
    NativeCallInviteEventType,
    (callInviteEvent: NativeCallInviteEvents) => void
  >;

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
  constructor(
    { uuid, callSid, customParameters, from, to }: NativeCallInviteInfo,
    state: CallInvite.State
  ) {
    super();

    this._uuid = uuid;
    this._callSid = callSid;
    this._customParameters = { ...customParameters };
    this._from = from;
    this._to = to;

    this._state = state;

    this._nativeEventHandler = {
      /**
       * Call Message
       */
      [Constants.CallEventMessageReceived]: this._handleMessageReceivedEvent,
    };

    NativeEventEmitter.addListener(
      Constants.ScopeCallInvite,
      this._handleNativeEvent
    );
  }

  /**
   * This intermediate native callInvite event handler acts as a "gate".
   * @param nativeCallInviteEvent - A callInvite event directly from the native layer.
   */
  private _handleNativeEvent = (
    nativeCallInviteEvent: NativeCallInviteEvents
  ) => {
    const { type } = nativeCallInviteEvent;

    const handler = this._nativeEventHandler[type];
    if (typeof handler === 'undefined') {
      throw new Error(
        `Unknown callInvite event type received from the native layer: "${type}".`
      );
    }

    handler(nativeCallInviteEvent);
  };

  /**
   * Handler for the {@link (CallInvite:namespace).Event.MessageReceived} event.
   * @param nativeCallEvent - The native call event.
   */
  private _handleMessageReceivedEvent = (
    nativeCallInviteEvent: NativeCallInviteEvents
  ) => {
    if (nativeCallInviteEvent.type !== Constants.CallEventMessageReceived) {
      throw new Error(
        'Incorrect "callInvite#Received" handler called for type' +
          `"${nativeCallInviteEvent.type}`
      );
    }

    const { callMessageSID, callMessage: callMessageInfo } =
      nativeCallInviteEvent;

    const callMessage = new CallMessage(callMessageInfo);

    this.emit(CallInvite.Event.MessageReceived, callMessageSID, callMessage);
  };

  /**
   * Accept a call invite. Sets the state of this call invite to
   * {@link (CallInvite:namespace).State.Accepted}.
   * @param options - Options to pass to the native layer when accepting the
   * call.
   * @returns
   *  - Resolves when a {@link (Call:class) | Call object} associated with this
   *    {@link (CallInvite:class)} has been created.
   */
  async accept(options: CallInvite.AcceptOptions = {}): Promise<Call> {
    if (this._state !== CallInvite.State.Pending) {
      throw new InvalidStateError(
        `Call in state "${this._state}", ` +
          `expected state "${CallInvite.State.Pending}".`
      );
    }

    const callInfo = await NativeModule.callInvite_accept(this._uuid, options);

    const call = new Call(callInfo);

    return call;
  }

  /**
   * Reject a call invite. Sets the state of this call invite to
   * {@link (CallInvite:namespace).State.Rejected}.
   * @returns
   *  - Resolves when the {@link (CallInvite:class)} has been rejected.
   */
  async reject(): Promise<void> {
    if (this._state !== CallInvite.State.Pending) {
      throw new InvalidStateError(
        `Call in state "${this._state}", ` +
          `expected state "${CallInvite.State.Pending}".`
      );
    }

    await NativeModule.callInvite_reject(this._uuid);
  }

  /**
   * Check if a `CallInvite` is valid.
   *
   * @returns
   *  - TODO
   *
   * @alpha
   */
  isValid(): Promise<boolean> {
    return NativeModule.callInvite_isValid(this._uuid);
  }

  /**
   * Get the call SID associated with this `CallInvite` class.
   * @returns - A string representing the call SID.
   */
  getCallSid(): string {
    return this._callSid;
  }

  /**
   * Get the custom parameters of the call associated with this `CallInvite`
   * class.
   * @returns - A `Record` of custom parameters.
   */
  getCustomParameters(): CustomParameters {
    return this._customParameters;
  }

  /**
   * Get the `from` parameter of the call associated with this `CallInvite`
   * class.
   * @returns - A `string` representing the `from` parameter.
   */
  getFrom(): string {
    return this._from;
  }

  /**
   * Get the `state` of the `CallInvite`.
   * @returns - The `state` of this `CallInvite`.
   */
  getState(): CallInvite.State {
    return this._state;
  }

  /**
   * Get the `to` parameter of the call associated with this `CallInvite`
   * class.
   * @returns - A `string` representing the `to` parameter.
   */
  getTo(): string {
    return this._to;
  }

  /**
   * Send Call Message.
   *
   * @example
   * To send a user-defined-message
   * ```typescript
   * const callMessage = {
   *    content: 'This is a messsage from the parent call',
   *    messageType: 'user-defined-message',
   *    contentType: 'application/json'
   * }
   * const sendingCallInviteMessage: OutgoingCallMessage = callInvite.sendMessage(callMessage)
   *
   * sendingCallInviteMessage.addListener(OutgoingCallMessage.Event.Failure, () => {
   *    // outgoingCallMessage failed, handle error
   * });
   *
   * sendingCallInviteMessage.addListener(OutgoingCallMessage.Event.Sent, () => {
   *    // outgoingCallMessage sent
   * })
   * ```
   *
   * @param content - The message content
   * @param contentType - The MIME type for the message
   * @param messageType - The message type
   *
   * @returns
   *  A `Promise` that
   *    - Resolves with the OutgoingCallMessage object.
   *    - Rejects when the message is unable to be sent.
   */
  async sendMessage(
    content: string,
    contentType: string,
    messageType: string
  ): Promise<OutgoingCallMessage> {
    const callMessageSID = await NativeModule.call_sendMessage(
      this._uuid,
      content,
      contentType,
      messageType
    );

    const outgoingCallMessage = new OutgoingCallMessage({
      callMessageContent: content,
      callMessageContentType: contentType,
      callMessageType: messageType,
      callMessageSID,
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
export namespace CallInvite {
  /**
   * Options to pass to the native layer when accepting the call.
   */
  export interface AcceptOptions {}

  /**
   * An enumeration of {@link (CallInvite:class)} states.
   */
  export enum State {
    Pending = 'pending',
    Accepted = 'accepted',
    Rejected = 'rejected',
  }

  /**
   * Enumeration of all event strings emitted by {@link (CallInvite:class)} objects.
   */
  export enum Event {
    /**
     * Event string for the `MessageReceived` event.
     * See {@link (CallInvite:interface).(addListener:1)}
     */
    'MessageReceived' = 'messageReceived',
  }

  /**
   * Listener types for all events emitted by a
   * {@link (CallInvite:class) | Call object.}
   */
  export namespace Listener {
    /**
     * Generic event listener. This should be the function signature of any
     * event listener bound to any call invite event.
     *
     * @remarks
     * See {@link (CallInvite:interface).(addListener:1)}.
     */
    export type Generic = (...args: any[]) => void;

    /**
     * CallInviteMessage received event listener. This should be the function signature of
     * any event listener bound to the {@link (CallInvite:namespace).Event.MessageReceived} event.
     *
     * @remarks
     * See {@link (CallInvite:interface).(addListener:2)}.
     */
    export type MessageReceived = (callMessage: CallMessage) => void;
  }
}
