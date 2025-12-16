"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AudioCodecType = void 0;

var _constants = require("../constants");

/**
 * Available audio codecs.
 */
let AudioCodecType;
/**
 * Configuration to use the Opus audio codec.
 */

exports.AudioCodecType = AudioCodecType;

(function (AudioCodecType) {
  AudioCodecType["Opus"] = "opus";
  AudioCodecType["PCMU"] = "pcmu";
})(AudioCodecType || (exports.AudioCodecType = AudioCodecType = {}));
//# sourceMappingURL=AudioCodec.js.map