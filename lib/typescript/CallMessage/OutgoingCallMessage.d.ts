/**
 * Copyright © 2022 Twilio, Inc. All rights reserved. Licensed under the Twilio
 * license.
 *
 * See LICENSE in the project root for license information.
 */
import type { TwilioError } from '../error';
import type { NativeCallMessageInfo } from '../type/CallMessage';
import { IncomingCallMessage } from './IncomingCallMessage';
/**
 * Defines strict typings for all events emitted by
 * {@link (OutgoingCallMessage:class) | OutgoingCallMessage objects}.
 *
 * @remarks
 * Note that the `on` function is an alias for the `addListener` function.
 * They share identical functionality and either may be used interchangeably.
 *
 * - See also the {@link CallMessage} interface.
 * - See also the {@link IncomingCallMessage} class.
 * - See also the {@link (OutgoingCallMessage:namespace)} namespace.
 *
 * @public
 */
export declare interface OutgoingCallMessage {
    /**
     * ------------
     * Emit Typings
     * ------------
     */
    /** @internal */
    emit(failureEvent: OutgoingCallMessage.Event.Failure, error: TwilioError): boolean;
    /** @internal */
    emit(sentEvent: OutgoingCallMessage.Event.Sent): boolean;
    /**
     * ----------------
     * Listener Typings
     * ----------------
     */
    /**
     * Failure event. Raised when outgoingCallMessage fails to be sent out.
     *
     * @example
     * ```typescript
     * outgoingCallMessage.addListener(OutgoingCallMessage.Event.Failure, (error) => {
     *    // outgoingCallMessage failed, handle error
     * });
     * ```
     *
     * @param failureEvent - The raised event string.
     * @param listener - A listener function that will be invoked when the event
     * is raised.
     * @returns - The callMessage object.
     */
    addListener(failureEvent: OutgoingCallMessage.Event.Failure, listener: OutgoingCallMessage.Listener.Failure): this;
    /** {@inheritDoc (OutgoingCallMessage:interface).(addListener:1)} */
    on(failureEvent: OutgoingCallMessage.Event.Failure, listener: OutgoingCallMessage.Listener.Failure): this;
    /**
     * Sent event. Raised when outgoingCallMessage is sent.
     * @example
     * ```typescript
     * outgoingCallMessage.addListener(OutgoingCallMessage.Event.Sent, () => {
     *    // outgoingCallMessage sent
     * })
     * ```
     *
     * @param sentEvent - The raised event string.
     * @param listener - A listener function that will be invoked when the event
     * is raised.
     * @returns - The callMessage object
     */
    addListener(sentEvent: OutgoingCallMessage.Event.Sent, listener: OutgoingCallMessage.Listener.Sent): this;
    /** {@inheritDoc (OutgoingCallMessage:interface).(addListener:2)} */
    on(sentEvent: OutgoingCallMessage.Event.Sent, listener: OutgoingCallMessage.Listener.Sent): this;
    /**
     * Generic event listener typings.
     * @param outgoingCallMessageEvent - The raised event string.
     * @param listener - A listener function that will be invoked when the event
     * is raised.
     * @returns - The outgoingCallMessage object.
     */
    addListener(outgoingCallMessageEvent: OutgoingCallMessage.Event, listener: OutgoingCallMessage.Listener.Generic): this;
    /**
     * {@inheritDoc (OutgoingCallMessage:interface).(addListener:3)}
     */
    on(outgoingCallMessageEvent: OutgoingCallMessage.Event, listener: OutgoingCallMessage.Listener.Generic): this;
}
/**
 * CallMessage API is in beta.
 *
 * Provides access to information about a outgoingCallMessage, including the call
 * message content, contentType, messageType, and voiceEventSid
 *
 * @remarks
 * Note that the outgoingCallMessage information is fetched as soon as possible from the
 * native layer, but there is no guarantee that all information is immediately
 * available. Methods such as `OutgoingCallMessage.getContent` or `OutgoingCallMessage.getSid`
 * may return `undefined`.
 *
 * As outgoingCallMessage events are received from the native layer, outgoingCallMessage information will
 * propagate from the native layer to the JS layer and become available.
 * Therefore, it is good practice to read information from the outgoingCallMessage after an
 * event occurs, or as events occur.
 *
 * - See the {@link (OutgoingCallMessage:namespace).Event} enum for events emitted by `OutgoingCallMessage`
 *   objects.
 * - See the {@link (OutgoingCallMessage:interface) | OutgoingCallMessage interface} for overloaded event listening
 *   metods.
 * - See the {@link (OutgoingCallMessage:namespace) | OutgoingCallMessage namespace} for types and enumerations
 *   used by this class.
 *
 * @public
 */
export declare class OutgoingCallMessage extends IncomingCallMessage {
    /**
     * Handlers for native OutgoingCallMessage events. Set upon construction so we can
     * dynamically bind events to handlers.
     *
     * @privateRemarks
     * This is done by the constructor so this mapping isn't made every time the
     * {@link (OutgoingCallMessage:class)._handleNativeEvent} function is invoked.
     */
    private _nativeEventHandler;
    constructor({ content, contentType, messageType, voiceEventSid, }: NativeCallMessageInfo);
    /**
     * This intermediate native callMessage event handler acts as a "gate".
     * @param nativeCallMessageEvent - A callMessage event directly from the native layer.
     */
    private _handleNativeEvent;
    /**
     * Handler for the {@link (OutgoingCallMessage:namespace).Event.Failure} event.
     * @param nativeCallMessageEvent - The native callMessage event.
     */
    private _handleFailureEvent;
    /**
     * Handler for the {@link (OutgoingCallMessage:namespace).Event.Sent} event.
     * @param nativeCallMessageEvent - The native callMessage event.
     */
    private _handleSentEvent;
}
/**
 * Namespace for enumerations and types used by
 * {@link (OutgoingCallMessage:class) | OutgoingCallMessage objects}.
 *
 * @remarks
 *  - See also the {@link (OutgoingCallMessage:class) | OutgoingCallMessage class}.
 *  - See also the {@link (OutgoingCallMessage:interface) | OutgoingCallMessage interface}.
 *
 * @public
 */
export declare namespace OutgoingCallMessage {
    /**
     * Enumeration of all event strings emitted by {@link (OutgoingCallMessage:class)} objects.
     */
    enum Event {
        /**
         * Raised when outgoingCallMessage fails.
         * See {@link (OutgoingCallMessage:interface).(addListener:1)}.
         */
        'Failure' = "failure",
        /**
         * Raised when outgoingCallMessage has been sent.
         * See {@link (OutgoingCallMessage:interface).(addListener:2)}.
         */
        'Sent' = "sent"
    }
    /**
     * Listener types for all events emitted by a
     * {@link (OutgoingCallMessage:class) | OutgoingCallMessage: object}
     */
    namespace Listener {
        /**
         * OutgoingCallMessage failure event listener. This should be the function signature of
         * any event listener bound to the {@link (OutgoingCallMessage:namespace).Event.Failure} event.
         *
         * @remarks
         * See {@link (OutgoingCallMessage:interface).(addListener:1)}.
         *
         * See {@link TwilioErrors} for all error classes.
         */
        type Failure = (error: TwilioError) => void;
        /**
         * OutgoingCallMessage sent event listner. This should be the function signature of
         * any event listener bound to the {@link (OutgoingCallMessage:namespace).Event.Sent} event.
         *
         * @remarks
         * See {@link (OutgoingCallMessage:interface).(addListener:2)}.
         */
        type Sent = () => void;
        /**
         * Generic event listener. This should be the function signature of any
         * event listener bound to any OutgoingCallMessage event.
         *
         * @remarks
         * See {@link (OutgoingCallMessage:interface).(addListener:3)}.
         */
        type Generic = (...args: any[]) => void;
    }
}
