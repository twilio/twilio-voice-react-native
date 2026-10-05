"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.recordExpoVersion = recordExpoVersion;
Object.defineProperty(exports, "getExpoVersion", {
  enumerable: true,
  get: function () {
    return _expoVersion.getExpoVersion;
  }
});
exports.setTimeout = exports.Platform = exports.NativeEventEmitter = exports.NativeModule = void 0;

var ReactNative = _interopRequireWildcard(require("react-native"));

var _InvalidStateError = require("./error/InvalidStateError");

var _expoVersion = require("./utility/expoVersion");

var _nativePromise = require("./utility/nativePromise");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/**
 * Copyright © 2022 Twilio, Inc. All rights reserved. Licensed under the Twilio
 * license.
 *
 * See LICENSE in the project root for license information.
 */
const nativeModule = ReactNative.NativeModules.TwilioVoiceReactNative;
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
  throw new _InvalidStateError.InvalidStateError(['The TwilioVoiceReactNative native module could not be found. The', 'JavaScript for @twilio/voice-react-native-sdk loaded but its native code', 'did not. Common causes:', '', '  - The application was not rebuilt after adding this dependency.', '    Reloading JavaScript is not enough; the native binary has to be', '    rebuilt and reinstalled.', '  - On iOS, `pod install` has not been run since adding this dependency.', '  - On Expo, the config plugin was added but `expo prebuild` has not been', '    run.', '  - The application is running in Expo Go, which cannot load this', "    library's native code. Use a development build instead."].join('\n'));
}

const NativeModule = nativeModule;
exports.NativeModule = NativeModule;
const NativeEventEmitter = new ReactNative.NativeEventEmitter(NativeModule);
exports.NativeEventEmitter = NativeEventEmitter;
const Platform = ReactNative.Platform;
exports.Platform = Platform;
const setTimeout = global.setTimeout;
exports.setTimeout = setTimeout;

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
let expoVersionPromise;
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

function recordExpoVersion() {
  if (typeof expoVersionPromise === 'undefined') {
    expoVersionPromise = (async () => {
      await (0, _nativePromise.settleNativePromise)(NativeModule.voice_setExpoVersion((0, _expoVersion.getExpoVersion)()));
    })().catch(() => undefined);
  }

  return expoVersionPromise;
}
//# sourceMappingURL=common.js.map