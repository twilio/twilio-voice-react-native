/**
 * Copyright © 2022 Twilio, Inc. All rights reserved. Licensed under the Twilio
 * license.
 *
 * See LICENSE in the project root for license information.
 */
import * as ReactNative from 'react-native';
export const NativeModule = ReactNative.NativeModules.TwilioVoiceReactNative;
export const NativeEventEmitter = new ReactNative.NativeEventEmitter(NativeModule);
//# sourceMappingURL=common.js.map