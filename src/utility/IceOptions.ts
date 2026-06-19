import { InvalidArgumentError } from '../error/InvalidArgumentError';
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
        'If "iceTransportPolicy" is present, it must be a string of value ' +
          '"relay" or "all".'
      ),
    };
  }

  return { status: 'ok', iceTransportPolicy };
}

function validateIceServer(
  iceServer: IceServer
): OptionValidation<{ iceServer: IceServer }> {
  if (typeof iceServer !== 'object' || iceServer === null) {
    return {
      status: 'error',
      error: new InvalidArgumentError('"iceServer" must be a non-null object.'),
    };
  }

  const hasUsername = 'username' in iceServer;
  const hasPassword = 'password' in iceServer;
  const hasServerUrl = 'serverUrl' in iceServer;

  if (hasUsername) {
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

  if (hasPassword) {
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

  if (hasServerUrl) {
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

  if (hasUsername && hasPassword && hasServerUrl) {
    return {
      status: 'ok',
      iceServer,
    };
  }

  if (!hasUsername && !hasPassword && hasServerUrl) {
    return {
      status: 'ok',
      iceServer,
    };
  }

  return {
    status: 'error',
    error: new InvalidArgumentError(
      'Ice server must have type: { serverUrl: string } | { username: ' +
        'string; password: string; serverUrl: string }'
    ),
  };
}

export function validateIceServers(
  iceServers: IceServer[]
): OptionValidation<{ iceServers: IceServer[] }> {
  if (!Array.isArray(iceServers)) {
    return {
      status: 'error',
      error: new InvalidArgumentError(
        'If "iceServers" are present, it must be an array of valid IceServer ' +
          'objects.'
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
