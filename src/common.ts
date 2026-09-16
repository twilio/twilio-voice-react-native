/**
 * Copyright © 2022 Twilio, Inc. All rights reserved. Licensed under the Twilio
 * license.
 *
 * See LICENSE in the project root for license information.
 */

import * as ReactNative from 'react-native';
import { InvalidStateError } from './error/InvalidStateError';
import type { TwilioVoiceReactNative as TwilioVoiceReactNativeType } from './type/NativeModule';
import { getExpoVersion } from './utility/expoVersion';
import { settleNativePromise } from './utility/nativePromise';

const nativeModule = ReactNative.NativeModules.TwilioVoiceReactNative as
  | TwilioVoiceReactNativeType
  | undefined;

/**
 * An unresolved native module has to be reported here, with a cause.
 *
 * Casting it to the present type and carrying on left the first symptom as a
 * bare `TypeError` from the `Voice` constructor, naming a property rather than
 * the reason it was missing. `new NativeEventEmitter(undefined)` does not help
 * either: React Native raises its invariant on iOS but skips the branch for
 * `undefined` on Android, so Android stayed silent until something read off
 * the module.
 */
if (typeof nativeModule === 'undefined') {
  throw new InvalidStateError(
    [
      'The TwilioVoiceReactNative native module could not be found. The',
      'JavaScript for @twilio/voice-react-native-sdk loaded but its native code',
      'did not. Common causes:',
      '',
      '  - The application was not rebuilt after adding this dependency.',
      '    Reloading JavaScript is not enough; the native binary has to be',
      '    rebuilt and reinstalled.',
      '  - On iOS, `pod install` has not been run since adding this dependency.',
      '  - On Expo, the config plugin was added but `expo prebuild` has not been',
      '    run.',
      '  - The application is running in Expo Go, which cannot load this',
      "    library's native code. Use a development build instead.",
    ].join('\n')
  );
}

export const NativeModule = nativeModule;

export const NativeEventEmitter = new ReactNative.NativeEventEmitter(
  NativeModule
);

export const Platform = ReactNative.Platform;

export const setTimeout = global.setTimeout;

export { getExpoVersion };

/**
 * Resolves once the native layer has recorded the host application's Expo SDK
 * version, so that the version is present in the metadata of any insights
 * event the native layer emits afterwards.
 *
 * Memoized rather than per-`Voice`: the version cannot change within a process,
 * and the promise is awaited from {@link (CallInvite:class).accept} as well as
 * from `Voice`, which is reached from an incoming call and so cannot rely on
 * whichever `Voice` instance happened to start it.
 */
let expoVersionPromise: Promise<void> | undefined;

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
export function recordExpoVersion(): Promise<void> {
  if (typeof expoVersionPromise === 'undefined') {
    expoVersionPromise = (async () => {
      await settleNativePromise(
        NativeModule.voice_setExpoVersion(getExpoVersion())
      );
    })().catch(() => undefined);
  }
  return expoVersionPromise;
}
