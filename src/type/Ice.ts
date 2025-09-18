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
 */
export type IceServer = Partial<{
  [Constants.IceServerKeyPassword]: string;
  [Constants.IceServerKeyServerUrl]: string;
  [Constants.IceServerKeyUsername]: string;
}>;
