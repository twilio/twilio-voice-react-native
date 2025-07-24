import { Constants } from '../constants';

export enum IceTransportPolicy {
  All = Constants.IceTransportPolicyValueAll,
  Relay = Constants.IceTransportPolicyValueRelay,
}

export type IceServer = Partial<{
  [Constants.IceServerKeyPassword]: string;
  [Constants.IceServerKeyServerUrl]: string;
  [Constants.IceServerKeyUsername]: string;
}>;

export type OpusAudioCodec = {
  [Constants.AudioCodecKeyType]: Constants.AudioCodecTypeValueOpus;
  [Constants.AudioCodecOpusKeyMaxAverageBitrate]?: number;
};

export type PCMUAudioCodec = {
  [Constants.AudioCodecKeyType]: Constants.AudioCodecTypeValuePCMU;
};

export type AudioCodec =
  | OpusAudioCodec
  | PCMUAudioCodec;
