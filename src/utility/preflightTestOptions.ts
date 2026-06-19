import type { PreflightTest } from '../PreflightTest';
import { AudioCodec, AudioCodecType } from '../type/AudioCodec';
import { InvalidArgumentError } from '../error/InvalidArgumentError';
import {
  validateIceServers,
  validateIceTransportPolicy,
} from './IceOptions';
import type { OptionValidation } from './IceOptions';

export type {
  InvalidOptions,
  ValidOptions,
  OptionValidation,
} from './IceOptions';
export { validateIceServers, validateIceTransportPolicy } from './IceOptions';

function validateAudioCodec(
  audioCodec: AudioCodec
): OptionValidation<{ audioCodec: AudioCodec }> {
  if (typeof audioCodec !== 'object') {
    return {
      status: 'error',
      error: new InvalidArgumentError(
        'If "audioCodec" is present, it must be an object.'
      ),
    };
  }

  if ('type' in audioCodec) {
    const { type } = audioCodec;
    if (
      typeof type !== 'string' ||
      !Object.values(AudioCodecType).includes(type)
    ) {
      return {
        status: 'error',
        error: new InvalidArgumentError(
          'The type of "audioCodec.type" must be a string valued one of ' +
            '["opus", "pcmu"].'
        ),
      };
    }
  }

  if ('maxAverageBitrate' in audioCodec) {
    const { maxAverageBitrate } = audioCodec;
    if (typeof maxAverageBitrate !== 'number') {
      return {
        status: 'error',
        error: new InvalidArgumentError(
          'The type of "audioCodec.maxAverageBitrate" must be a number.'
        ),
      };
    }
  }

  return {
    status: 'ok',
    audioCodec,
  };
}

function validateAudioCodecs(
  audioCodecs: AudioCodec[]
): OptionValidation<{ audioCodecs: AudioCodec[] }> {
  if (!Array.isArray(audioCodecs)) {
    return {
      status: 'error',
      error: new InvalidArgumentError(
        'If "preferredAudioCodecs" is present, it must be an array of valid ' +
          '"audioCodec" objects.'
      ),
    };
  }

  for (const audioCodec of audioCodecs) {
    const validation = validateAudioCodec(audioCodec);
    if (validation.status === 'error') {
      return validation;
    }
  }

  return {
    status: 'ok',
    audioCodecs,
  };
}

export function validatePreflightOptions(
  preflightTestOptions: PreflightTest.Options
): OptionValidation<{ preflightTestOptions: PreflightTest.Options }> {
  if ('iceTransportPolicy' in preflightTestOptions) {
    const validation = validateIceTransportPolicy(
      preflightTestOptions.iceTransportPolicy!
    );
    if (validation.status === 'error') {
      return validation;
    }
  }

  if ('iceServers' in preflightTestOptions) {
    const validation = validateIceServers(preflightTestOptions.iceServers!);
    if (validation.status === 'error') {
      return validation;
    }
  }

  if ('preferredAudioCodecs' in preflightTestOptions) {
    const validation = validateAudioCodecs(
      preflightTestOptions.preferredAudioCodecs!
    );
    if (validation.status === 'error') {
      return validation;
    }
  }

  return {
    status: 'ok',
    preflightTestOptions,
  };
}
