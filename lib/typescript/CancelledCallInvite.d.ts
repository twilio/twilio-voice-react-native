/**
 * Copyright © 2022 Twilio, Inc. All rights reserved. Licensed under the Twilio
 * license.
 *
 * See LICENSE in the project root for license information.
 */
import type { NativeCancelledCallInviteInfo } from './type/CallInvite';
/**
 * Provides access to information about a cancelled call invite, including the
 * call parameters.
 *
 * @public
 */
export declare class CancelledCallInvite {
    /**
     * A string representing the SID of this call.
     */
    private _callSid;
    /**
     * Call `from` parameter.
     */
    private _from;
    /**
     * Call `to` parameter.
     */
    private _to;
    /**
     * These objects should not be instantiated by consumers of the SDK. All
     * instances of the
     * {@link (CancelledCallInvite:class) | CancelledCallInvite class} should be
     * emitted by the SDK.
     *
     * @param nativeCancelledCallInviteInfo - A dataobject containing the native
     * information of a `CancelledCallInvite`.
     *
     * @internal
     */
    constructor({ callSid, from, to }: NativeCancelledCallInviteInfo);
    /**
     * Get the call SID associated with this `CancelledCallInvite`.
     * @returns - A string representing the call SID.
     */
    getCallSid(): string;
    /**
     * Get the `from` parameter of the call associated with this
     * `CancelledCallInvite`.
     * @returns - A `string` representing the `from` parameter.
     */
    getFrom(): string;
    /**
     * Get the `to` parameter of the call associated with this
     * `CancelledCallInvite`.
     * @returns - A `string` representing the `to` parameter.
     */
    getTo(): string;
}
