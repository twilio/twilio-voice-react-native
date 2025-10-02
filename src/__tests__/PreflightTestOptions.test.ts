import { InvalidArgumentError } from '../error/InvalidArgumentError';
import { validatePreflightOptions } from '../utility/preflightTestOptions';
import type { PreflightTest } from '../PreflightTest';
import { IceTransportPolicy } from '../type/Ice';
import { AudioCodecType } from '../type/AudioCodec';

const validOptions: PreflightTest.Options = {
  iceTransportPolicy: IceTransportPolicy.All,
  iceServers: [{ username: 'foo', password: 'bar', serverUrl: 'bazz' }],
  preferredAudioCodecs: [
    { type: AudioCodecType.Opus, maxAverageBitrate: 128000 },
  ],
};

describe('preflight test option validation', () => {
  const failureCases = [
    [
      'invalid string ice transport policy',
      { iceTransportPolicy: 'foobar' },
      'If "iceTransportPolicy" is present, it must be a string of value ' +
        '"relay" or "all".',
    ],
    [
      'non-string ice transport policy',
      { iceTransportPolicy: 10 },
      'If "iceTransportPolicy" is present, it must be a string of value ' +
        '"relay" or "all".',
    ],
    [
      'non-object ice server',
      { iceServers: [10] },
      '"iceServer" must be a non-null object.',
    ],
    [
      'null ice server',
      { iceServers: [null] },
      '"iceServer" must be a non-null object.',
    ],
    [
      'non-string ice server username',
      { iceServers: [{ username: 10 }] },
      'If "username" is present in "iceServer", it must be a string.',
    ],
    [
      'non-string ice server password',
      { iceServers: [{ password: 10 }] },
      'If "password" is present in "iceServer", it must be a string.',
    ],
    [
      'non-string ice server serverUrl',
      { iceServers: [{ serverUrl: 10 }] },
      'If "serverUrl" is present in "iceServer", it must be a string.',
    ],
    [
      'incomplete ice server',
      { iceServers: [{ username: 'foo', password: 'bar' }] },
      'Ice server must have type: { serverUrl: string } | { username: ' +
        'string; password: string; serverUrl: string }',
    ],
    [
      'non-array ice servers',
      { iceServers: 10 },
      'If "iceServers" are present, it must be an array of valid IceServer ' +
        'objects.',
    ],
    [
      'non-object audio codec',
      { preferredAudioCodecs: ['foobar'] },
      'If "audioCodec" is present, it must be an object.',
    ],
    [
      'non-string audio codec type',
      { preferredAudioCodecs: [{ type: 10 }] },
      'The type of "audioCodec.type" must be a string valued one of ' +
        '["opus", "pcmu"].',
    ],
    [
      'non-string audio codec type',
      { preferredAudioCodecs: [{ type: 'foobar' }] },
      'The type of "audioCodec.type" must be a string valued one of ' +
        '["opus", "pcmu"].',
    ],
    [
      'non-number max average bitrate',
      { preferredAudioCodecs: [{ type: 'opus', maxAverageBitrate: 'foobar' }] },
      'The type of "audioCodec.maxAverageBitrate" must be a number.',
    ],
    [
      'non-array preferredAudioCodecs',
      { preferredAudioCodecs: 10 },
      'If "preferredAudioCodecs" is present, it must be an array of valid ' +
        '"audioCodec" objects.',
    ],
  ] as [string, any, string][];

  failureCases.forEach(([testCaseTitle, testCaseOption, errorMessage]) => {
    describe('failure case', () => {
      it(`should throw when passed ${testCaseTitle}`, () => {
        expect.assertions(3);

        const result = validatePreflightOptions({
          ...validOptions,
          ...testCaseOption,
        });

        expect(result.status).toEqual('error');
        if (result.status !== 'error')
          throw new Error('result did not have status error');

        expect(result.error).toBeInstanceOf(InvalidArgumentError);
        expect(result.error.message).toMatch(errorMessage);
      });
    });
  });

  const successCases = [
    [
      'when ice servers are not passed',
      {
        iceTransportPolicy: validOptions.iceTransportPolicy,
        preferredAudioCodecs: validOptions.preferredAudioCodecs,
      },
    ],
    [
      'when username and password is not passed',
      {
        iceServers: [{ serverUrl: 'bazz' }],
        iceTransportPolicy: validOptions.iceTransportPolicy,
        preferredAudioCodecs: validOptions.preferredAudioCodecs,
      },
    ],
    [
      'when username and password are passed',
      {
        iceServers: [{ username: 'foo', password: 'bar', serverUrl: 'bazz' }],
        iceTransportPolicy: validOptions.iceTransportPolicy,
        preferredAudioCodecs: validOptions.preferredAudioCodecs,
      },
    ],
    [
      'when ice transport policy is not passed',
      {
        iceServers: validOptions.iceServers,
        preferredAudioCodecs: validOptions.preferredAudioCodecs,
      },
    ],
    [
      'when preferred audio codecs are not passed',
      {
        iceServers: validOptions.iceServers,
        iceTransportPolicy: validOptions.iceTransportPolicy,
      },
    ],
    [
      'when type is not passed',
      {
        iceServers: validOptions.iceServers,
        iceTransportPolicy: validOptions.iceTransportPolicy,
        preferredAudioCodecs: [{ maxAverageBitrate: 128000 }],
      },
    ],
    [
      'when max average bitrate is not passed',
      {
        iceServers: validOptions.iceServers,
        iceTransportPolicy: validOptions.iceTransportPolicy,
        preferredAudioCodecs: [{ type: 'opus' }],
      },
    ],
  ] as [string, any][];

  successCases.forEach(([testTitle, testOptions]) => {
    describe('success case', () => {
      it(testTitle, () => {
        expect.assertions(2);

        const result = validatePreflightOptions(testOptions);

        expect(result.status).toEqual('ok');
        if (result.status !== 'ok')
          throw new Error('result did not have status ok');

        expect(typeof result.preflightTestOptions).toEqual('object');
      });
    });
  });
});
