/**
 * Copyright © 2022 Twilio, Inc. All rights reserved. Licensed under the Twilio
 * license.
 *
 * See LICENSE in the project root for license information.
 */

import { requireNativeModule } from 'expo-modules-core';
import * as ReactNative from 'react-native';
import type { TwilioVoiceReactNative as TwilioVoiceReactNativeType } from './type/NativeModule';

export const Platform = ReactNative.Platform;

export const NativeModule: TwilioVoiceReactNativeType =
  Platform.OS === 'android'
    ? requireNativeModule('TwilioVoiceExpoModule')
    : ReactNative.NativeModules.TwilioVoiceReactNative;

export const NativeEventEmitter =
  Platform.OS === 'android'
    ? new ReactNative.NativeEventEmitter()
    : new ReactNative.NativeEventEmitter(NativeModule);

export const setTimeout = global.setTimeout;
