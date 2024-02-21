import type { NativeCallInviteInfo } from '../type/CallInvite';
import { Constants } from '../constants';
export declare function createNativeCallInviteInfo(): NativeCallInviteInfo;
/**
 * Reusable default native callInvite events.
 */
export declare const mockCallInviteNativeEvents: {
    messageReceived: {
        name: Constants;
        nativeEvent: {
            type: Constants;
            callMessage: import("../type/CallMessage").NativeCallMessageInfo;
        };
    };
};
