"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validatePreflightOptions = validatePreflightOptions;

var _InvalidArgumentError = require("../error/InvalidArgumentError");

var _AudioCodec = require("../type/AudioCodec");

var _Ice = require("../type/Ice");

function validateIceTransportPolicy(iceTransportPolicy) {
  if (typeof iceTransportPolicy !== 'string' || !Object.values(_Ice.IceTransportPolicy).includes(iceTransportPolicy)) {
    return {
      status: 'error',
      error: new _InvalidArgumentError.InvalidArgumentError('If "iceTransportPolicy" is present, it must be a string of value ' + '"relay" or "all".')
    };
  }

  return {
    status: 'ok',
    iceTransportPolicy
  };
}

function validateIceServer(iceServer) {
  if (typeof iceServer !== 'object' || iceServer === null) {
    return {
      status: 'error',
      error: new _InvalidArgumentError.InvalidArgumentError('"iceServer" must be a non-null object.')
    };
  }

  const hasUsername = ('username' in iceServer);
  const hasPassword = ('password' in iceServer);
  const hasServerUrl = ('serverUrl' in iceServer);

  if (hasUsername) {
    const {
      username
    } = iceServer;

    if (typeof username !== 'string') {
      return {
        status: 'error',
        error: new _InvalidArgumentError.InvalidArgumentError('If "username" is present in "iceServer", it must be a string.')
      };
    }
  }

  if (hasPassword) {
    const {
      password
    } = iceServer;

    if (typeof password !== 'string') {
      return {
        status: 'error',
        error: new _InvalidArgumentError.InvalidArgumentError('If "password" is present in "iceServer", it must be a string.')
      };
    }
  }

  if (hasServerUrl) {
    const {
      serverUrl
    } = iceServer;

    if (typeof serverUrl !== 'string') {
      return {
        status: 'error',
        error: new _InvalidArgumentError.InvalidArgumentError('If "serverUrl" is present in "iceServer", it must be a string.')
      };
    }
  }

  if (hasUsername && hasPassword && hasServerUrl) {
    return {
      status: 'ok',
      iceServer
    };
  }

  if (!hasUsername && !hasPassword && hasServerUrl) {
    return {
      status: 'ok',
      iceServer
    };
  }

  return {
    status: 'error',
    error: new _InvalidArgumentError.InvalidArgumentError('Ice server must have type: { serverUrl: string } | { username: ' + 'string; password: string; serverUrl: string }')
  };
}

function validateIceServers(iceServers) {
  if (!Array.isArray(iceServers)) {
    return {
      status: 'error',
      error: new _InvalidArgumentError.InvalidArgumentError('If "iceServers" are present, it must be an array of valid IceServer ' + 'objects.')
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
    iceServers
  };
}

function validateAudioCodec(audioCodec) {
  if (typeof audioCodec !== 'object') {
    return {
      status: 'error',
      error: new _InvalidArgumentError.InvalidArgumentError('If "audioCodec" is present, it must be an object.')
    };
  }

  if ('type' in audioCodec) {
    const {
      type
    } = audioCodec;

    if (typeof type !== 'string' || !Object.values(_AudioCodec.AudioCodecType).includes(type)) {
      return {
        status: 'error',
        error: new _InvalidArgumentError.InvalidArgumentError('The type of "audioCodec.type" must be a string valued one of ' + '["opus", "pcmu"].')
      };
    }
  }

  if ('maxAverageBitrate' in audioCodec) {
    const {
      maxAverageBitrate
    } = audioCodec;

    if (typeof maxAverageBitrate !== 'number') {
      return {
        status: 'error',
        error: new _InvalidArgumentError.InvalidArgumentError('The type of "audioCodec.maxAverageBitrate" must be a number.')
      };
    }
  }

  return {
    status: 'ok',
    audioCodec
  };
}

function validateAudioCodecs(audioCodecs) {
  if (!Array.isArray(audioCodecs)) {
    return {
      status: 'error',
      error: new _InvalidArgumentError.InvalidArgumentError('If "preferredAudioCodecs" is present, it must be an array of valid ' + '"audioCodec" objects.')
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
    audioCodecs
  };
}

function validatePreflightOptions(preflightTestOptions) {
  if ('iceTransportPolicy' in preflightTestOptions) {
    const validation = validateIceTransportPolicy(preflightTestOptions.iceTransportPolicy);

    if (validation.status === 'error') {
      return validation;
    }
  }

  if ('iceServers' in preflightTestOptions) {
    const validation = validateIceServers(preflightTestOptions.iceServers);

    if (validation.status === 'error') {
      return validation;
    }
  }

  if ('preferredAudioCodecs' in preflightTestOptions) {
    const validation = validateAudioCodecs(preflightTestOptions.preferredAudioCodecs);

    if (validation.status === 'error') {
      return validation;
    }
  }

  return {
    status: 'ok',
    preflightTestOptions
  };
}
//# sourceMappingURL=preflightTestOptions.js.map