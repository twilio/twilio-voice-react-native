/**
 * Copyright © 2022 Twilio, Inc. All rights reserved. Licensed under the Twilio
 * license.
 *
 * See LICENSE in the project root for license information.
 */
/// <reference types="node" />
import * as ReactNative from 'react-native';
import type { TwilioVoiceReactNative as TwilioVoiceReactNativeType } from './type/NativeModule';
export declare const NativeModule: TwilioVoiceReactNativeType;
export declare const NativeEventEmitter: ReactNative.NativeEventEmitter;
export declare const Platform: ReactNative.Platform;
export declare const setTimeout: ((callback: (...args: any[]) => void, ms?: number | undefined, ...args: any[]) => NodeJS.Timeout) & typeof globalThis.setTimeout;
