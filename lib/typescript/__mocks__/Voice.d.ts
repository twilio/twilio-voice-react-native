import { Constants } from '../constants';
/**
 * Reusable default native call events.
 */
export declare const mockVoiceNativeEvents: {
    audioDevicesUpdated: {
        name: Constants;
        nativeEvent: {
            audioDevices: import("../type/AudioDevice").NativeAudioDeviceInfo[];
            selectedDevice?: import("../type/AudioDevice").NativeAudioDeviceInfo | undefined;
            type: Constants;
        };
    };
    callInvite: {
        name: Constants;
        nativeEvent: {
            type: Constants;
            callInvite: import("../type/CallInvite").NativeCallInviteInfo;
        };
    };
    error: {
        name: Constants;
        nativeEvent: {
            type: Constants;
            error: {
                code: number;
                message: string;
            };
        };
    };
    registered: {
        name: Constants;
        nativeEvent: {
            type: Constants;
        };
    };
    unregistered: {
        name: Constants;
        nativeEvent: {
            type: Constants;
        };
    };
};
