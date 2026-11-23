import { Constants } from '../constants';
/**
 * Ice transport policy.
 *
 * @public
 */

export let IceTransportPolicy;
/**
 * Ice server configuration.
 *
 * @public
 */

(function (IceTransportPolicy) {
  IceTransportPolicy["All"] = "all";
  IceTransportPolicy["Relay"] = "relay";
})(IceTransportPolicy || (IceTransportPolicy = {}));
//# sourceMappingURL=Ice.js.map