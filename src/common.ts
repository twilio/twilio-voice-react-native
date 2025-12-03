/**
 * Copyright © 2022 Twilio, Inc. All rights reserved. Licensed under the Twilio
 * license.
 *
 * See LICENSE in the project root for license information.
 */

import { requireNativeModule } from 'expo-modules-core';
import * as ReactNative from 'react-native';
import { Constants } from './constants';
import type { TwilioVoiceReactNative as TwilioVoiceReactNativeType } from './type/NativeModule';

const expo = () => {
  const NativeModule: TwilioVoiceReactNativeType = requireNativeModule(
    'TwilioVoiceExpoModule'
  );
  const NativeEventEmitter = new ReactNative.NativeEventEmitter();
  return { NativeEventEmitter, NativeModule };
};

const bare = () => {
  const NativeModule: TwilioVoiceReactNativeType =
    ReactNative.NativeModules.TwilioVoiceReactNative;
  const NativeEventEmitter = new ReactNative.NativeEventEmitter(NativeModule);
  return { NativeEventEmitter, NativeModule };
};

export const { NativeEventEmitter, NativeModule } =
  Constants.ReactNativeVoiceSDK === 'react-native' ? bare() : expo();

export const Platform = ReactNative.Platform;

export const setTimeout = global.setTimeout;
