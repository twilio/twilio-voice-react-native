/**
 * Copyright (c) Twilio Inc. All rights reserved. Licensed under the Twilio
 * license.
 *
 * See LICENSE in the project root for license information.
 */

import { NativeEventEmitter } from 'react-native';
import { Call } from './Call';
import { TwilioVoiceReactNative } from './common';
import type { NativeCallInviteInfo } from './type/CallInvite';
import type { CustomParameters, Uuid } from './type/common';
import { InvalidStateError } from './error/InvalidStateError';

/**
 * Provides access to information about a call invite, including the call
 * parameters, and exposes functionality to accept or decline a call.
 *
 * @remarks
 *
 * Note that when a `CallInvite` is acted upon (i.e. when {@link (CallInvite:class).accept} or
 * {@link (CallInvite:class).reject} is invoked), then the `CallInvite` is "settled".
 *
 * The state of the `CallInvite` is changed from {@link (CallInvite:namespace).State.Pending} to
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
export class CallInvite {
  /**
   * --------------
   * Native Members
   * --------------
   */

  /**
   * The ReactNative `NativeEventEmitter`. Used to receive `CallInvite` events
   * from the native layer.
   */
  private _nativeEventEmitter: NativeEventEmitter;
  /**
   * The ReactNative `NativeModule`. Used to invoke native call functionality
   * from the JS layer.
   */
  private _nativeModule: typeof TwilioVoiceReactNative;

  /**
   * ------------
   * Data Members
   * ------------
   */

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
   * @param options - Mocking options for testing.
   *
   * @internal
   */
  constructor(
    { uuid, callSid, customParameters, from, to }: NativeCallInviteInfo,
    options: Partial<CallInvite.Options> = {}
  ) {
    this._nativeModule = options.nativeModule || TwilioVoiceReactNative;
    this._nativeEventEmitter =
      options.nativeEventEmitter || new NativeEventEmitter(this._nativeModule);

    this._uuid = uuid;
    this._callSid = callSid;
    this._customParameters = { ...customParameters };
    this._from = from;
    this._to = to;

    this._state = CallInvite.State.Pending;
  }

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

    const callInfo = await this._nativeModule.callInvite_accept(
      this._uuid,
      options
    );

    const call = new Call(callInfo, {
      nativeEventEmitter: this._nativeEventEmitter,
      nativeModule: this._nativeModule,
    });

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
          `expected state "${CallInvite.State.Pending}"`
      );
    }

    await this._nativeModule.callInvite_reject(this._uuid);
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
    return this._nativeModule.callInvite_isValid(this._uuid);
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
   * Get the `to` parameter of the call associated with this `CallInvite`
   * class.
   * @returns - A `string` representing the `to` parameter.
   */
  getTo(): string {
    return this._to;
  }
}

/**
 * Provides enumerations and types used by a
 * {@link (CallInvite:class) | CallInvite object}.
 *
 * @remarks
 *  - See the {@link (CallInvite:class) | CallInvite class}.
 *
 * @public
 */
export namespace CallInvite {
  /**
   * Options to pass to the native layer when accepting the call.
   */
  export interface AcceptOptions {}

  /**
   * Mock options.
   *
   * @internal
   */
  export interface Options {
    nativeEventEmitter: NativeEventEmitter;
    nativeModule: typeof TwilioVoiceReactNative;
  }

  /**
   * An enumeration of {@link (CallInvite:class)} states.
   */
  export enum State {
    Pending = 'pending',
    Accepted = 'accepted',
    Rejected = 'rejected',
  }
}
