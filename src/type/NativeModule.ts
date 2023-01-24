import type { EventSubscriptionVendor } from 'react-native';
import type { Call } from '../Call';
import type { CallInvite } from '../CallInvite';
import type { NativeAudioDevicesInfo } from './AudioDevice';
import type { NativeCallInfo } from './Call';
import type { NativeCallInviteInfo } from './CallInvite';
import type { Uuid } from './common';
import type { RTCStats } from './RTCStats';

export interface TwilioVoiceReactNative extends EventSubscriptionVendor {
  /**
   * Call bindings.
   */
  call_disconnect(callUuid: Uuid): Promise<void>;
  call_getStats(callUuid: Uuid): Promise<RTCStats.StatsReport>;
  call_hold(callUuid: Uuid, hold: boolean): Promise<boolean>;
  call_isOnHold(callUuid: Uuid): Promise<boolean>;
  call_isMuted(callUuid: Uuid): Promise<boolean>;
  call_mute(callUuid: Uuid, mute: boolean): Promise<boolean>;
  call_postFeedback(
    callUuid: Uuid,
    score: Call.Score,
    issue: Call.Issue
  ): Promise<void>;
  call_sendDigits(callUuid: Uuid, digits: string): Promise<void>;

  /**
   * Call Invite bindings.
   */
  callInvite_accept(
    callInviteUuid: Uuid,
    acceptOptions: CallInvite.AcceptOptions
  ): Promise<NativeCallInfo>;
  callInvite_isValid(callInviteUuid: Uuid): Promise<boolean>;
  callInvite_reject(callInviteUuid: Uuid): Promise<void>;

  /**
   * Voice bindings.
   */
  voice_connect(
    token: string,
    twimlParams: Record<string, any>
  ): Promise<NativeCallInfo>;
  voice_connect_ios(
    token: string,
    twimlParams: Record<string, any>,
    contactHandle: string
  ): Promise<NativeCallInfo>;
  voice_getAudioDevices(): Promise<NativeAudioDevicesInfo>;
  voice_getCalls(): Promise<NativeCallInfo[]>;
  voice_getCallInvites(): Promise<NativeCallInviteInfo[]>;
  voice_getDeviceToken(): Promise<string>;
  voice_getVersion(): Promise<string>;
  voice_register(accessToken: string): Promise<void>;
  voice_selectAudioDevice(audioDeviceUuid: Uuid): Promise<void>;
  voice_showNativeAvRoutePicker(): Promise<void>;
  voice_unregister(accessToken: string): Promise<void>;
}
