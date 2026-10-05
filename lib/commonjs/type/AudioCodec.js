"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AudioCodecType = void 0;

var _constants = require("../constants");

/**
 * Available audio codecs.
 *
 * @public
 */
let AudioCodecType;
/**
 * Configuration to use the Opus audio codec.
 *
 * @public
 */

exports.AudioCodecType = AudioCodecType;

(function (AudioCodecType) {
  AudioCodecType["Opus"] = "opus";
  AudioCodecType["PCMU"] = "pcmu";
})(AudioCodecType || (exports.AudioCodecType = AudioCodecType = {}));
//# sourceMappingURL=AudioCodec.js.map