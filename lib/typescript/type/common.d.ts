/**
 * Call custom parameters. If custom parameters are present for a call, then
 * it will have this typing.
 *
 * @remarks
 *  - `Call`s will have a method to access custom parameters, see
 *    {@link (Call:class).getCustomParameters}.
 *  - `CallInvite`s will have a method to access custom parameters for the call
 *    that is associated with the invite, see
 *    {@link (CallInvite:class).getCustomParameters}.
 *
 * @public
 */
export declare type CustomParameters = Record<string, string>;
export declare type Uuid = string;
