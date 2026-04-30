import type { NativeCallInfo } from '../type/Call';
import { Constants } from '../constants';
export declare function createNativeCallInfo(): NativeCallInfo;
/**
 * Reusable default native call events.
 */
export declare const mockCallNativeEvents: {
    connected: {
        name: Constants;
        nativeEvent: {
            type: Constants;
            call: NativeCallInfo;
        };
    };
    connectFailure: {
        name: Constants;
        nativeEvent: {
            type: Constants;
            call: NativeCallInfo;
            error: {
                code: number;
                message: string;
            };
        };
    };
    disconnected: {
        name: Constants;
        nativeEvent: {
            type: Constants;
            call: NativeCallInfo;
        };
    };
    disconnectedWithError: {
        name: string;
        nativeEvent: {
            type: Constants;
            call: NativeCallInfo;
            error: {
                code: number;
                message: string;
            };
        };
    };
    reconnected: {
        name: Constants;
        nativeEvent: {
            type: Constants;
            call: NativeCallInfo;
        };
    };
    reconnecting: {
        name: Constants;
        nativeEvent: {
            type: Constants;
            call: NativeCallInfo;
            error: {
                code: number;
                message: string;
            };
        };
    };
    ringing: {
        name: Constants;
        nativeEvent: {
            type: Constants;
            call: NativeCallInfo;
        };
    };
    qualityWarningsChanged: {
        name: Constants;
        nativeEvent: {
            type: Constants;
            call: NativeCallInfo;
            callEventCurrentWarnings: string[];
            callEventPreviousWarnings: string[];
        };
    };
    messageReceived: {
        name: Constants;
        nativeEvent: {
            type: Constants;
            call: NativeCallInfo;
            callMessage: import("../type/CallMessage").NativeCallMessageInfo;
        };
    };
};
