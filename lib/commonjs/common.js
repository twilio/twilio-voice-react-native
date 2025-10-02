"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setTimeout = exports.Platform = exports.NativeEventEmitter = exports.NativeModule = void 0;

var ReactNative = _interopRequireWildcard(require("react-native"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/**
 * Copyright © 2022 Twilio, Inc. All rights reserved. Licensed under the Twilio
 * license.
 *
 * See LICENSE in the project root for license information.
 */
const NativeModule = ReactNative.NativeModules.TwilioVoiceReactNative;
exports.NativeModule = NativeModule;
const NativeEventEmitter = new ReactNative.NativeEventEmitter(NativeModule);
exports.NativeEventEmitter = NativeEventEmitter;
const Platform = ReactNative.Platform;
exports.Platform = Platform;
const setTimeout = global.setTimeout;
exports.setTimeout = setTimeout;
//# sourceMappingURL=common.js.map