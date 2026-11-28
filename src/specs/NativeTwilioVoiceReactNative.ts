/**
 * Copyright (c) 2026 Twilio, Inc. All rights reserved. Licensed under the Twilio
 * license.
 *
 * See LICENSE in the project root for license information.
 */

import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
import type {
  EventEmitter,
  UnsafeObject,
} from 'react-native/Libraries/Types/CodegenTypes';

/**
 * Target contract: methods resolve with a value or reject, with no envelope.
 * The native modules still resolve envelopes until they adopt this spec.
 */
export interface Spec extends TurboModule {
  readonly onVoiceEvent: EventEmitter<UnsafeObject>;
  readonly onCallEvent: EventEmitter<UnsafeObject>;
  readonly onCallInviteEvent: EventEmitter<UnsafeObject>;
  readonly onCallMessageEvent: EventEmitter<UnsafeObject>;
  readonly onPreflightTestEvent: EventEmitter<UnsafeObject>;

  call_disconnect(uuid: string): Promise<void>;
  call_getStats(uuid: string): Promise<UnsafeObject>;
  call_hold(uuid: string, onHold: boolean): Promise<boolean>;
  call_mute(uuid: string, muted: boolean): Promise<boolean>;
  call_postFeedback(uuid: string, score: string, issue: string): Promise<void>;
  call_sendDigits(uuid: string, digits: string): Promise<void>;
  call_sendMessage(
    uuid: string,
    content: string,
    contentType: string,
    messageType: string
  ): Promise<string>;

  callInvite_accept(
    uuid: string,
    acceptOptions: UnsafeObject
  ): Promise<UnsafeObject>;
  callInvite_reject(uuid: string): Promise<void>;
  callInvite_sendMessage(
    uuid: string,
    content: string,
    contentType: string,
    messageType: string
  ): Promise<string>;
  callInvite_updateCallerHandle(uuid: string, handle: string): Promise<void>;

  voice_connect_android(
    accessToken: string,
    twimlParams: UnsafeObject,
    notificationDisplayName: string | null,
    iceServers: Array<UnsafeObject> | null,
    iceTransportPolicy: string | null
  ): Promise<UnsafeObject>;
  voice_connect_ios(
    accessToken: string,
    params: UnsafeObject,
    contactHandle: string,
    iceServers: Array<UnsafeObject> | null,
    iceTransportPolicy: string | null
  ): Promise<UnsafeObject>;
  voice_initializePushRegistry(): Promise<void>;
  voice_setCallKitConfiguration(configuration: UnsafeObject): Promise<void>;
  voice_setExpoVersion(expoVersion: string | null): Promise<void>;
  voice_setIncomingCallContactHandleTemplate(
    contactHandleTemplate: string | null
  ): Promise<void>;
  voice_getAudioDevices(): Promise<UnsafeObject>;
  voice_getCalls(): Promise<Array<UnsafeObject>>;
  voice_getCallInvites(): Promise<Array<UnsafeObject>>;
  voice_getDeviceToken(): Promise<string>;
  voice_getVersion(): Promise<string>;
  voice_handleEvent(messageData: UnsafeObject): Promise<boolean>;
  voice_register(accessToken: string): Promise<void>;
  voice_selectAudioDevice(uuid: string): Promise<void>;
  voice_showNativeAvRoutePicker(): Promise<void>;
  voice_unregister(accessToken: string): Promise<void>;

  voice_runPreflight(
    accessToken: string,
    options: UnsafeObject
  ): Promise<string>;
  preflightTest_getCallSid(uuid: string): Promise<string>;
  preflightTest_getEndTime(uuid: string): Promise<string>;
  preflightTest_getLatestSample(uuid: string): Promise<string>;
  preflightTest_getReport(uuid: string): Promise<string>;
  preflightTest_getStartTime(uuid: string): Promise<string>;
  preflightTest_getState(uuid: string): Promise<string>;
  preflightTest_stop(uuid: string): Promise<void>;
  preflightTest_flushEvents(): Promise<void>;
}

export default TurboModuleRegistry.get<Spec>('TwilioVoiceReactNative');
