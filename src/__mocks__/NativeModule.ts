import { createDefaultMockNativeAudioDevicesInfo } from './AudioDevice';
import { createDefaultMockNativeCallInfo } from './Call';
import { createDefaultMockNativeCallInviteInfo } from './CallInvite';
import { createDefaultMockStatsReport } from './RTCStats';
import * as Sinon from 'sinon';

export function createDefaultDeviceToken(): string {
  return 'mock-nativemodule-devicetoken';
}

export function createDefaultVersion(): string {
  return 'mock-nativemodule-version';
}

export function createMockNativeModuleClass(
  deviceToken = createDefaultDeviceToken,
  nativeAudioDevicesInfo = createDefaultMockNativeAudioDevicesInfo,
  nativeCallInfo = createDefaultMockNativeCallInfo,
  nativeCallInviteInfo = createDefaultMockNativeCallInviteInfo,
  statsReport = createDefaultMockStatsReport,
  version = createDefaultVersion
) {
  return class MockNativeModule {
    /**
     * Call Mocks
     */
    call_disconnect = Sinon.stub().resolves();
    call_getStats = Sinon.stub().resolves(statsReport());
    call_hold = Sinon.stub().resolves(false);
    call_isMuted = Sinon.stub().resolves(false);
    call_isOnHold = Sinon.stub().resolves(false);
    call_mute = Sinon.stub().resolves(false);
    call_postFeedback = Sinon.stub().resolves();
    call_sendDigits = Sinon.stub().resolves();

    /**
     * Call Invite Mocks
     */
    callInvite_accept = Sinon.stub().resolves(nativeCallInfo());
    callInvite_isValid = Sinon.stub().resolves(false);
    callInvite_reject = Sinon.stub().resolves();

    /**
     * Voice Mocks
     */
    voice_connect = Sinon.stub().resolves(nativeCallInfo());
    voice_getAudioDevices = Sinon.stub().resolves(nativeAudioDevicesInfo());
    voice_getCalls = Sinon.stub().resolves([nativeCallInfo()]);
    voice_getCallInvites = Sinon.stub().resolves([nativeCallInviteInfo()]);
    voice_getDeviceToken = Sinon.stub().resolves(deviceToken);
    voice_getVersion = Sinon.stub().resolves(version());
    voice_register = Sinon.stub().resolves();
    voice_selectAudioDevice = Sinon.stub().resolves();
    voice_showNativeAvRoutePicker = Sinon.stub().resolves();
    voice_unregister = Sinon.stub().resolves();
  };
}
