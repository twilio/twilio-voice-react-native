"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Voice", {
  enumerable: true,
  get: function () {
    return _Voice.Voice;
  }
});
Object.defineProperty(exports, "AudioDevice", {
  enumerable: true,
  get: function () {
    return _AudioDevice.AudioDevice;
  }
});
Object.defineProperty(exports, "Call", {
  enumerable: true,
  get: function () {
    return _Call.Call;
  }
});
Object.defineProperty(exports, "CallInvite", {
  enumerable: true,
  get: function () {
    return _CallInvite.CallInvite;
  }
});
Object.defineProperty(exports, "CancelledCallInvite", {
  enumerable: true,
  get: function () {
    return _CancelledCallInvite.CancelledCallInvite;
  }
});
Object.defineProperty(exports, "CustomParameters", {
  enumerable: true,
  get: function () {
    return _common.CustomParameters;
  }
});
Object.defineProperty(exports, "CallKit", {
  enumerable: true,
  get: function () {
    return _CallKit.CallKit;
  }
});
Object.defineProperty(exports, "RTCStats", {
  enumerable: true,
  get: function () {
    return _RTCStats.RTCStats;
  }
});
exports.TwilioErrors = void 0;

var _Voice = require("./Voice");

var _AudioDevice = require("./AudioDevice");

var _Call = require("./Call");

var _CallInvite = require("./CallInvite");

var _CancelledCallInvite = require("./CancelledCallInvite");

var _common = require("./type/common");

var _CallKit = require("./type/CallKit");

var _RTCStats = require("./type/RTCStats");

var TwilioErrors = _interopRequireWildcard(require("./error"));

exports.TwilioErrors = TwilioErrors;

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
//# sourceMappingURL=index.js.map