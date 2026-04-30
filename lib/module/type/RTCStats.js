/**
 * Types related to WebRTC stats.
 *
 * @public
 */
export let RTCStats;

(function (_RTCStats) {
  let IceCandidatePairState;

  (function (IceCandidatePairState) {
    IceCandidatePairState["STATE_FAILED"] = "STATE_FAILED";
    IceCandidatePairState["STATE_FROZEN"] = "STATE_FROZEN";
    IceCandidatePairState["STATE_IN_PROGRESS"] = "STATE_IN_PROGRESS";
    IceCandidatePairState["STATE_SUCCEEDED"] = "STATE_SUCCEEDED";
    IceCandidatePairState["STATE_WAITING"] = "STATE_WAITING";
  })(IceCandidatePairState || (IceCandidatePairState = {}));

  _RTCStats.IceCandidatePairState = IceCandidatePairState;
})(RTCStats || (RTCStats = {}));
//# sourceMappingURL=RTCStats.js.map