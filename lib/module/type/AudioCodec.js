import { Constants } from '../constants';
/**
 * Available audio codecs.
 *
 * @public
 */

export let AudioCodecType;
/**
 * Configuration to use the Opus audio codec.
 *
 * @public
 */

(function (AudioCodecType) {
  AudioCodecType["Opus"] = "opus";
  AudioCodecType["PCMU"] = "pcmu";
})(AudioCodecType || (AudioCodecType = {}));
//# sourceMappingURL=AudioCodec.js.map