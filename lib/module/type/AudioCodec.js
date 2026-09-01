import { Constants } from '../constants';
/**
 * Available audio codecs.
 */

export let AudioCodecType;
/**
 * Configuration to use the Opus audio codec.
 */

(function (AudioCodecType) {
  AudioCodecType["Opus"] = "opus";
  AudioCodecType["PCMU"] = "pcmu";
})(AudioCodecType || (AudioCodecType = {}));
//# sourceMappingURL=AudioCodec.js.map