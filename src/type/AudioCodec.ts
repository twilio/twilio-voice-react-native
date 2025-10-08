import { Constants } from '../constants';

/**
 * Available audio codecs.
 */
export enum AudioCodecType {
  /**
   * Opus audio codec.
   */
  Opus = 'opus',
  /**
   * PCMU audio codec.
   */
  PCMU = 'pcmu',
}

/**
 * Configuration to use the Opus audio codec.
 */
export type OpusAudioCodec = {
  /**
   * The type of the Opus audio codec.
   */
  [Constants.AudioCodecKeyType]: AudioCodecType.Opus;
  /**
   * The max average bitrate for the codec. Value should be in the inclusive
   * range `[6000, 510000]`.
   */
  [Constants.AudioCodecOpusKeyMaxAverageBitrate]?: number;
};

/**
 * Configuration to use the PCMU audio codec.
 */
export type PCMUAudioCodec = {
  /**
   * The type of the PCMU audio codec.
   */
  [Constants.AudioCodecKeyType]: AudioCodecType.PCMU;
};

/**
 * The type of an audio codec.
 */
export type AudioCodec = OpusAudioCodec | PCMUAudioCodec;
