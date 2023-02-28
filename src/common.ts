/**
 * Copyright © 2022 Twilio, Inc. All rights reserved. Licensed under the Twilio
 * license.
 *
 * See LICENSE in the project root for license information.
 */

import * as ReactNative from 'react-native';
import type { TwilioVoiceReactNative as TwilioVoiceReactNativeType } from './type/NativeModule';

export const NativeModule = ReactNative.NativeModules
  .TwilioVoiceReactNative as TwilioVoiceReactNativeType;
export const NativeEventEmitter = new ReactNative.NativeEventEmitter(
  NativeModule
);
export const Platform = ReactNative.Platform;
