/**
 * Copyright (c) Twilio Inc. All rights reserved. Licensed under the Twilio
 * license.
 *
 * See LICENSE in the project root for license information.
 */

import { NativeModules } from 'react-native';
import type { TwilioVoiceReactNative as TwilioVoiceReactNativeType } from './type/NativeModule';

export const TwilioVoiceReactNative: TwilioVoiceReactNativeType =
  NativeModules.TwilioVoiceReactNative;
