/**
 * Copyright © 2022 Twilio, Inc. All rights reserved. Licensed under the Twilio
 * license.
 *
 * See LICENSE in the project root for license information.
 */
import { Call } from './Call';
import type { NativeCallInviteInfo } from './type/CallInvite';
import type { CustomParameters } from './type/common';
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
export declare class CallInvite {
    /**
     * The current state of the call invite.
     *
     * @remarks
     * See {@link (CallInvite:namespace).State}.
     */
    private _state;
    /**
     * The `Uuid` of this call invite. Used to identify calls between the JS and
     * native layer so we can associate events and native functionality between
     * the layers.
     */
    private _uuid;
    /**
     * A string representing the SID of this call.
     */
    private _callSid;
    /**
     * Call custom parameters.
     */
    private _customParameters;
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
     * instances of the `CallInvite` class should be emitted by the SDK.
     *
     * @param nativeCallInviteInfo - A dataobject containing the native
     * information of a call invite.
     * @param state - Mocking options for testing.
     *
     * @internal
     */
    constructor({ uuid, callSid, customParameters, from, to }: NativeCallInviteInfo, state: CallInvite.State);
    /**
     * Accept a call invite. Sets the state of this call invite to
     * {@link (CallInvite:namespace).State.Accepted}.
     * @param options - Options to pass to the native layer when accepting the
     * call.
     * @returns
     *  - Resolves when a {@link (Call:class) | Call object} associated with this
     *    {@link (CallInvite:class)} has been created.
     */
    accept(options?: CallInvite.AcceptOptions): Promise<Call>;
    /**
     * Reject a call invite. Sets the state of this call invite to
     * {@link (CallInvite:namespace).State.Rejected}.
     * @returns
     *  - Resolves when the {@link (CallInvite:class)} has been rejected.
     */
    reject(): Promise<void>;
    /**
     * Check if a `CallInvite` is valid.
     *
     * @returns
     *  - TODO
     *
     * @alpha
     */
    isValid(): Promise<boolean>;
    /**
     * Get the call SID associated with this `CallInvite` class.
     * @returns - A string representing the call SID.
     */
    getCallSid(): string;
    /**
     * Get the custom parameters of the call associated with this `CallInvite`
     * class.
     * @returns - A `Record` of custom parameters.
     */
    getCustomParameters(): CustomParameters;
    /**
     * Get the `from` parameter of the call associated with this `CallInvite`
     * class.
     * @returns - A `string` representing the `from` parameter.
     */
    getFrom(): string;
    /**
     * Get the `state` of the `CallInvite`.
     * @returns - The `state` of this `CallInvite`.
     */
    getState(): CallInvite.State;
    /**
     * Get the `to` parameter of the call associated with this `CallInvite`
     * class.
     * @returns - A `string` representing the `to` parameter.
     */
    getTo(): string;
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
export declare namespace CallInvite {
    /**
     * Options to pass to the native layer when accepting the call.
     */
    interface AcceptOptions {
    }
    /**
     * An enumeration of {@link (CallInvite:class)} states.
     */
    enum State {
        Pending = "pending",
        Accepted = "accepted",
        Rejected = "rejected"
    }
}
