import { InvalidArgumentError } from '../error/InvalidArgumentError';
import type { PreflightTest } from '../PreflightTest';
import { AudioCodec, AudioCodecType } from '../type/AudioCodec';
import { IceTransportPolicy, IceServer } from '../type/Ice';

export type InvalidOptions = {
  status: 'error';
  error: InvalidArgumentError;
};

export type ValidOptions<T> = { status: 'ok' } & T;

export type OptionValidation<T> = InvalidOptions | ValidOptions<T>;

export function validateIceTransportPolicy(
  iceTransportPolicy: IceTransportPolicy
): OptionValidation<{ iceTransportPolicy: IceTransportPolicy }> {
  if (
    typeof iceTransportPolicy !== 'string' ||
    !Object.values(IceTransportPolicy).includes(iceTransportPolicy)
  ) {
    return {
      status: 'error',
      error: new InvalidArgumentError(
        'If "iceTransportPolicy" is present, it must be a string of value "relay" or "all".'
      ),
    };
  }

  return {
    status: 'ok',
    iceTransportPolicy,
  };
}

export function validateIceServer(
  iceServer: IceServer
): OptionValidation<{ iceServer: IceServer }> {
  if (typeof iceServer !== 'object') {
    return {
      status: 'error',
      error: new InvalidArgumentError(
        'If "iceServer" is present, it must be an object.'
      ),
    };
  }

  if ('username' in iceServer) {
    const { username } = iceServer;
    if (typeof username !== 'string') {
      return {
        status: 'error',
        error: new InvalidArgumentError(
          'If "username" is present in "iceServer", it must be a string.'
        ),
      };
    }
  }

  if ('password' in iceServer) {
    const { password } = iceServer;
    if (typeof password !== 'string') {
      return {
        status: 'error',
        error: new InvalidArgumentError(
          'If "password" is present in "iceServer", it must be a string.'
        ),
      };
    }
  }

  if ('serverUrl' in iceServer) {
    const { serverUrl } = iceServer;
    if (typeof serverUrl !== 'string') {
      return {
        status: 'error',
        error: new InvalidArgumentError(
          'If "serverUrl" is present in "iceServer", it must be a string.'
        ),
      };
    }
  }

  return {
    status: 'ok',
    iceServer,
  };
}

export function validateIceServers(
  iceServers: IceServer[]
): OptionValidation<{ iceServers: IceServer[] }> {
  if (!Array.isArray(iceServers)) {
    return {
      status: 'error',
      error: new InvalidArgumentError(
        'If "iceServers" are present, it must be an array of valid IceServer objects.'
      ),
    };
  }

  for (const iceServer of iceServers) {
    const validation = validateIceServer(iceServer);
    if (validation.status === 'error') {
      return validation;
    }
  }

  return {
    status: 'ok',
    iceServers,
  };
}

export function validateAudioCodec(
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
          'The type of "audioCodec.type" must be a string valued one of ["opus", "pcmu"].'
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

export function validateAudioCodecs(
  audioCodecs: AudioCodec[]
): OptionValidation<{ audioCodecs: AudioCodec[] }> {
  if (!Array.isArray(audioCodecs)) {
    return {
      status: 'error',
      error: new InvalidArgumentError(
        'If "preferredAudioCodecs" is present, it must be an array of valid "audioCodec" objects.'
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
