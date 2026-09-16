import { Constants } from '../constants';
import type { NativeCallMessageInfo } from '../type/CallMessage';
export declare function createNativeCallMessageInfo(): NativeCallMessageInfo;
export declare function createNativeCallMessageInfoSid(voiceEventSid: string): NativeCallMessageInfo;
export declare const mockCallMessageNativeEvents: {
    failure: {
        name: Constants;
        nativeEvent: {
            type: Constants;
            voiceEventSid: string;
            error: {
                code: number;
                message: string;
            };
        };
    };
    sent: {
        name: Constants;
        nativeEvent: {
            type: Constants;
            voiceEventSid: string;
        };
    };
};
