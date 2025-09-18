import { Constants } from '../constants';

/**
 * Ice transport policy.
 */
export enum IceTransportPolicy {
  /**
   * All Ice transport policy.
   */
  All = Constants.IceTransportPolicyValueAll,
  /**
   * Relay Ice transport poliicy.
   */
  Relay = Constants.IceTransportPolicyValueRelay,
}

export type IceServer = Partial<{
  [Constants.IceServerKeyPassword]: string;
  [Constants.IceServerKeyServerUrl]: string;
  [Constants.IceServerKeyUsername]: string;
}>;

/**
 * Available audio codecs.
 */
export enum AudioCodecType {
  /**
   * Opus audio codec.
   */
  Opus = Constants.AudioCodecTypeValueOpus,
  /**
   * PCMU audio codec.
   */
  PCMU = Constants.AudioCodecTypeValuePCMU,
}

/**
 * Configuration to use the Opus audio codec.
 */
export type OpusAudioCodec = {
  /**
   * The type of the Opus audio codec.
   */
  [Constants.AudioCodecKeyType]: Constants.AudioCodecTypeValueOpus;
  /**
   * The max average bitrate for the codec.
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
  [Constants.AudioCodecKeyType]: Constants.AudioCodecTypeValuePCMU;
};

/**
 * The type of an audio codec.
 */
export type AudioCodec = OpusAudioCodec | PCMUAudioCodec;
