import { Constants } from '../constants';

/**
 * Ice transport policy.
 */
export enum IceTransportPolicy {
  /**
   * All Ice transport policy.
   */
  All = 'all',
  /**
   * Relay Ice transport poliicy.
   */
  Relay = 'relay',
}

/**
 * Ice server configuration.
 *
 * @remarks
 * An ice server always describes a server url. Credentials are optional, but
 * when they are present, both the username and the password must be present.
 * These are the only two shapes that the SDK accepts. Any other shape is
 * rejected with an `InvalidArgumentError`.
 */
export type IceServer = Partial<{
  [Constants.IceServerKeyPassword]: string;
  [Constants.IceServerKeyServerUrl]: string;
  [Constants.IceServerKeyUsername]: string;
}>;
