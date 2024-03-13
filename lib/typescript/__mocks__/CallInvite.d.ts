import type { NativeCallInviteInfo, NativeCancelledCallInviteInfo } from '../type/CallInvite';
import { Constants } from '../constants';
export declare function createNativeCallInviteInfo(): NativeCallInviteInfo;
export declare function createNativeCancelledCallInviteInfo(): NativeCancelledCallInviteInfo;
/**
 * Reusable default native callInvite events.
 */
export declare function createMockNativeCallInviteEvents(): {
    readonly accepted: {
        readonly type: Constants.CallInviteEventTypeValueAccepted;
        readonly callSid: "mock-nativecallinviteinfo-callsid";
        readonly callInvite: NativeCallInviteInfo;
    };
    readonly notificationTapped: {
        readonly type: Constants.CallInviteEventTypeValueNotificationTapped;
        readonly callSid: "mock-nativecallinviteinfo-callsid";
        readonly callInvite: NativeCallInviteInfo;
    };
    readonly rejected: {
        readonly type: Constants.CallInviteEventTypeValueRejected;
        readonly callSid: "mock-nativecallinviteinfo-callsid";
        readonly callInvite: NativeCallInviteInfo;
    };
    readonly cancelled: {
        readonly type: Constants.CallInviteEventTypeValueCancelled;
        readonly callSid: "mock-nativecallinviteinfo-callsid";
        readonly cancelledCallInvite: NativeCancelledCallInviteInfo;
    };
    readonly cancelledWithError: {
        readonly type: Constants.CallInviteEventTypeValueCancelled;
        readonly callSid: "mock-nativecallinviteinfo-callsid";
        readonly cancelledCallInvite: NativeCancelledCallInviteInfo;
        readonly error: {
            code: number;
            message: string;
        };
    };
    readonly messageReceived: {
        readonly type: Constants.CallEventMessageReceived;
        readonly callSid: "mock-nativecallinviteinfo-callsid";
        readonly callMessage: import("../type/CallMessage").NativeCallMessageInfo;
    };
};
