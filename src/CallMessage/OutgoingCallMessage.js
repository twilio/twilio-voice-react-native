/**
 * Copyright © 2022 Twilio, Inc. All rights reserved. Licensed under the Twilio
 * license.
 *
 * See LICENSE in the project root for license information.
 */
import { Constants } from '../constants';
import { NativeEventEmitter } from '../common';
import { constructTwilioError } from '../error/utility';
import { IncomingCallMessage } from './IncomingCallMessage';
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
export class OutgoingCallMessage extends IncomingCallMessage {
    /**
     * Handlers for native OutgoingCallMessage events. Set upon construction so we can
     * dynamically bind events to handlers.
     *
     * @privateRemarks
     * This is done by the constructor so this mapping isn't made every time the
     * {@link (OutgoingCallMessage:class)._handleNativeEvent} function is invoked.
     */
    _nativeEventHandler;
    constructor({ content, contentType, messageType, voiceEventSid, }) {
        super({
            content,
            contentType,
            messageType,
            voiceEventSid,
        });
        this._nativeEventHandler = {
            /**
             * Sending Call Message State
             */
            [Constants.CallEventMessageFailure]: this._handleFailureEvent,
            [Constants.CallEventMessageSent]: this._handleSentEvent,
        };
        NativeEventEmitter.addListener(Constants.ScopeCallMessage, this._handleNativeEvent);
    }
    /**
     * This intermediate native callMessage event handler acts as a "gate".
     * @param nativeCallMessageEvent - A callMessage event directly from the native layer.
     */
    _handleNativeEvent = (nativeCallMessageEvent) => {
        const { type } = nativeCallMessageEvent;
        const handler = this._nativeEventHandler[type];
        if (typeof handler === 'undefined') {
            throw new Error(`Unknown callMessage event type received from the native layer: "${type}"`);
        }
        if (this.getSid() === nativeCallMessageEvent.voiceEventSid) {
            handler(nativeCallMessageEvent);
        }
    };
    /**
     * Handler for the {@link (OutgoingCallMessage:namespace).Event.Failure} event.
     * @param nativeCallMessageEvent - The native callMessage event.
     */
    _handleFailureEvent = (nativeCallMessageEvent) => {
        if (nativeCallMessageEvent.type !== Constants.CallEventMessageFailure) {
            throw new Error('Incorrect "outgoingCallMessage#Failure" handler called for type' +
                `"${nativeCallMessageEvent.type}`);
        }
        const { message, code } = nativeCallMessageEvent.error;
        const error = constructTwilioError(message, code);
        this.emit(OutgoingCallMessage.Event.Failure, error);
    };
    /**
     * Handler for the {@link (OutgoingCallMessage:namespace).Event.Sent} event.
     * @param nativeCallMessageEvent - The native callMessage event.
     */
    _handleSentEvent = (nativeCallMessageEvent) => {
        if (nativeCallMessageEvent.type !== Constants.CallEventMessageSent) {
            throw new Error('Incorrect "outgoingCallMessage#Sent" handler called for type' +
                `"${nativeCallMessageEvent.type}"`);
        }
        this.emit(OutgoingCallMessage.Event.Sent);
    };
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
(function (OutgoingCallMessage) {
    /**
     * Enumeration of all event strings emitted by {@link (OutgoingCallMessage:class)} objects.
     */
    let Event;
    (function (Event) {
        /**
         * Raised when outgoingCallMessage fails.
         * See {@link (OutgoingCallMessage:interface).(addListener:1)}.
         */
        Event["Failure"] = "failure";
        /**
         * Raised when outgoingCallMessage has been sent.
         * See {@link (OutgoingCallMessage:interface).(addListener:2)}.
         */
        Event["Sent"] = "sent";
    })(Event = OutgoingCallMessage.Event || (OutgoingCallMessage.Event = {}));
})(OutgoingCallMessage || (OutgoingCallMessage = {}));
