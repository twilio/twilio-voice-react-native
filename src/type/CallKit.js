/**
 * @public
 * CallKit related types.
 */
export var CallKit;
(function (CallKit) {
    /**
     * @public
     * Enumeration of all supported handle types by iOS CallKit.
     */
    let HandleType;
    (function (HandleType) {
        /**
         * Generic handle.
         */
        HandleType[HandleType["Generic"] = 0] = "Generic";
        /**
         * Phone number handle.
         */
        HandleType[HandleType["PhoneNumber"] = 1] = "PhoneNumber";
        /**
         * Email address handle.
         */
        HandleType[HandleType["EmailAddress"] = 2] = "EmailAddress";
    })(HandleType = CallKit.HandleType || (CallKit.HandleType = {}));
})(CallKit || (CallKit = {}));
