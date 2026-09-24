/**
 * Copyright © 2022 Twilio, Inc. All rights reserved. Licensed under the Twilio
 * license.
 *
 * See LICENSE in the project root for license information.
 */
import * as ReactNative from 'react-native';
import type { TwilioVoiceReactNative as TwilioVoiceReactNativeType } from './type/NativeModule';
import { getExpoVersion } from './utility/expoVersion';
export declare const NativeModule: TwilioVoiceReactNativeType;
export declare const NativeEventEmitter: ReactNative.NativeEventEmitter;
export declare const Platform: ReactNative.Platform;
export declare const setTimeout: ((callback: (...args: any[]) => void, ms?: number, ...args: any[]) => NodeJS.Timeout) & typeof globalThis.setTimeout;
export { getExpoVersion };
/**
 * Record the host application's Expo SDK version with the native layer, once
 * per process.
 *
 * Never rejects. Failing to record the version is a telemetry concern and must
 * never prevent a call, registration or preflight test. The native call is made
 * inside an async function so that a synchronous throw -- an unresolved binding
 * on the native module, for instance -- is turned into a rejection this catches
 * rather than propagating out of the caller.
 *
 * @returns a promise that resolves once the attempt has finished, successfully
 * or not.
 */
export declare function recordExpoVersion(): Promise<void>;
