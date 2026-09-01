"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validatePreflightOptions = validatePreflightOptions;
Object.defineProperty(exports, "validateIceServers", {
  enumerable: true,
  get: function () {
    return _IceOptions.validateIceServers;
  }
});
Object.defineProperty(exports, "validateIceTransportPolicy", {
  enumerable: true,
  get: function () {
    return _IceOptions.validateIceTransportPolicy;
  }
});

var _AudioCodec = require("../type/AudioCodec");

var _InvalidArgumentError = require("../error/InvalidArgumentError");

var _IceOptions = require("./IceOptions");

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
    const validation = (0, _IceOptions.validateIceTransportPolicy)(preflightTestOptions.iceTransportPolicy);

    if (validation.status === 'error') {
      return validation;
    }
  }

  if ('iceServers' in preflightTestOptions) {
    const validation = (0, _IceOptions.validateIceServers)(preflightTestOptions.iceServers);

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