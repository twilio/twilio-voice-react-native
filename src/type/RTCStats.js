/**
 * Types related to WebRTC stats.
 *
 * @public
 */
export var RTCStats;
(function (RTCStats) {
    let IceCandidatePairState;
    (function (IceCandidatePairState) {
        IceCandidatePairState["STATE_FAILED"] = "STATE_FAILED";
        IceCandidatePairState["STATE_FROZEN"] = "STATE_FROZEN";
        IceCandidatePairState["STATE_IN_PROGRESS"] = "STATE_IN_PROGRESS";
        IceCandidatePairState["STATE_SUCCEEDED"] = "STATE_SUCCEEDED";
        IceCandidatePairState["STATE_WAITING"] = "STATE_WAITING";
    })(IceCandidatePairState = RTCStats.IceCandidatePairState || (RTCStats.IceCandidatePairState = {}));
})(RTCStats || (RTCStats = {}));
