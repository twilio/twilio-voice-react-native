/**
 * Copyright © 2022 Twilio, Inc. All rights reserved. Licensed under the Twilio
 * license.
 *
 * See LICENSE in the project root for license information.
 */

import { EventEmitter } from 'eventemitter3';
import { Call } from './Call';
import { NativeModule, NativeEventEmitter } from './common';
import { Constants } from './constants';
import { InvalidStateError } from './error/InvalidStateError';
import type { NativeVoiceEvent } from './type/Voice';
import type {
  NativeCallInviteInfo,
  NativeCallInviteAcceptedEvent,
  NativeCallInviteRejectedEvent,
} from './type/CallInvite';
import type { CustomParameters, Uuid } from './type/common';

/**
 * Call invite event types.
 */
export declare interface CallInvite {
  /**
   * ------------
   * Emit Typings
   * ------------
   */

  /** @internal */
  emit(acceptEvent: CallInvite.Event.Accepted): boolean;

  /** @internal */
  emit(rejectEvent: CallInvite.Event.Rejected): boolean;

  /** @internal */
  emit(event: CallInvite.Event): boolean;

  /**
   * ----------------
   * Listener Typings
   * ----------------
   */

  /**
   * Accepted event. Raised when the call invite has been accepted.
   *
   * @example
   * ```ts
   * voice.on(Voice.Event.CallInvite, (callInvite) => {
   *   callInvite.on(CallInvite.Event.Accepted, () => {
   *     // the call invite was accepted through either the native layer
   *     // or the js layer
   *   });
   * });
   * ```
   *
   * @remarks
   *
   * @param acceptedEvent - The raised event string.
   * @param listener - A listener function that will be invoked when the event
   * is raised.
   * @returns - The call invite object.
   */
  addListener(
    acceptedEvent: CallInvite.Event.Accepted,
    listener: CallInvite.Listener.Accepted
  ): this;

  /**
   * Rejected event. Raised when the call invite has been rejected.
   *
   * @example
   * ```ts
   * voice.on(Voice.Event.CallInvite, (callInvite) => {
   *   callInvite.on(CallInvite.Event.Rejected, () => {
   *     // the call invite was rejected through either the native layer
   *     // or the js layer
   *   });
   * });
   * ```
   *
   * @remarks
   *
   * @param rejectedEvent - The raised event string.
   * @param listener - A listener function that will be invoked when the event
   * is raised.
   * @returns - The call invite object.
   */
  addListener(
    rejectedEvent: CallInvite.Event.Rejected,
    listener: CallInvite.Listener.Rejected
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

    NativeEventEmitter.addListener(
      Constants.ScopeVoice,
      this._handleNativeVoiceEvent
    );
  }

  /**
   * This intermediate native voice event handler acts as a "gate", only
   * executing the actual call invite event handler (such as `Accepted`) if
   * this call invite object matches the `Uuid` of the call invite that had an
   * event raised.
   * @param nativeVoiceEvent - A call event directly from the native layer.
   */
  private _handleNativeVoiceEvent = (nativeVoiceEvent: NativeVoiceEvent) => {
    switch (nativeVoiceEvent.type) {
      case Constants.VoiceEventCallInviteAccepted:
        return this._handleCallInviteAccepted(nativeVoiceEvent);
      case Constants.VoiceEventCallInviteRejected:
        return this._handleCallInviteRejected(nativeVoiceEvent);
    }
  };

  /**
   * Handle when this call invite is accepted.
   */
  private _handleCallInviteAccepted = (
    nativeCallInviteAcceptedEvent: NativeCallInviteAcceptedEvent
  ) => {
    if (nativeCallInviteAcceptedEvent.callInvite.callSid !== this._callSid) {
      return;
    }

    this._state = CallInvite.State.Accepted;
    this.emit(CallInvite.Event.Accepted);
  };

  /**
   * Handle when this call invite is rejected.
   */
  private _handleCallInviteRejected = (
    nativeCallInviteRejectedEvent: NativeCallInviteRejectedEvent
  ) => {
    if (nativeCallInviteRejectedEvent.callInvite.callSid !== this._callSid) {
      return;
    }

    this._state = CallInvite.State.Rejected;
    this.emit(CallInvite.Event.Rejected);
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
    /**
     * State of a call invite when it has not been acted upon.
     */
    Pending = 'pending',

    /**
     * State of a call invite when it has been accepted.
     */
    Accepted = 'accepted',

    /**
     * State of a call invite when it has been rejected.
     */
    Rejected = 'rejected',
  }

  /**
   * Enumeration of all event strings emitted by {@link (CallInvite:class)}
   * objects.
   */
  export enum Event {
    /**
     * Event string for the `Accepted` event.
     * See {@link (CallInvite:interface).(addListener:1)}.
     */
    Accepted = 'accepted',

    /**
     * Event string for the `Rejected` event.
     * See {@link (CallInvite:interface).(addListener:2)}.
     */
    Rejected = 'rejected',
  }

  /**
   * Listener types for all events emitted by a
   * {@link (CallInvite:class) | Call invite object.}
   */
  export namespace Listener {
    /**
     * Accepted event listener. This should be the function signature of any
     * event listener bound to the {@link (CallInvite:namespace).Event.Accepted}
     * event.
     *
     * @remarks
     * See {@link (Call:interface).(addListener:1)}.
     */
    export type Accepted = () => void;

    /**
     * Rejected event listener. This should be the function signature of any
     * event listener bound to the {@link (CallInvite:namespace).Event.Rejected}
     * event.
     *
     * @remarks
     * See {@link (Call:interface).(addListener:2)}.
     */
    export type Rejected = () => void;
  }
}
