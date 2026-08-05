const { runCommand } = require('../classify-version-tag');

// Versions used in these unit tests are real tags from this repo's history,
// covering every shape that has actually appeared:
//   - `2.0.0` -> final
//   - `1.0.0-beta.4` -> beta/preview
//   - `1.7.0-rc1` -> final rc
//   - `2.0.0-preview.1-rc1` -> compound channel+rc form

// Shapes the pipeline has no publishing rules for. Guessing at any of these
// would risk undefined behavior.
const UNRECOGNIZED_VERSIONS = [
  ['2.0.0-beta'], // channel with no number
  ['2.0.0-beta2'], // channel number needs a dot
  ['2.0.1-dev'], // dev versions are never released
  ['1.0.0-BETA.1'], // channels are lower-case
  ['1.0.0-beta.1-foo'], // unrecognized trailing segment
  ['1.0.0-rc'], // rc with no number
  ['1.0.0-canary.1'], // a channel we don't publish
  ['2.0.0-final.3'], // `final` is implied, never spelled out
  ['1.0.0-constructor.1'], // must not resolve off Object.prototype
  ['v1.6.1'], // tags in this repo are not v-prefixed
  ['1.6'], // has no less than three segments
  ['1.6.1.2'], // has no more than three segments
  ['not-a-version'],
];

describe('runCommand', () => {
  describe('command dispatch', () => {
    it.each([
      ['bogusCommand'],
      ['constructor'], // must not resolve off Object.prototype
      ['toString'],
      ['classifyVersionTag'], // real function, deliberately not a command
      ['getnpmdisttag'], // command names are case-sensitive
      [''],
      [undefined],
    ])('throws for %p', (command) => {
      expect(() => runCommand(command, '1.6.1', 'true')).toThrow(
        /Unexpected command/
      );
    });
  });

  describe('getIsReleaseCandidate', () => {
    it.each([
      ['1.0.0', false],
      ['1.6.1', false],
      ['1.7.0', false],
      ['1.0.0-beta.1', false],
      ['1.0.0-beta.4', false],
      ['1.0.0-preview.1', false],
      ['2.0.0-preview.1', false],
      ['2.0.0-preview.2', false],
      ['1.0.0-rc1', true],
      ['1.0.0-rc24', true],
      ['1.7.0-rc4', true],
      ['2.0.0-rc2', true],
      ['1.0.0-beta.4-rc1', true],
      ['1.0.0-beta.42-rc22', true],
      ['2.0.0-preview.1-rc1', true],
      ['2.0.0-preview.10-rc11', true],
    ])('%s -> %s', (version, expected) => {
      expect(runCommand('getIsReleaseCandidate', version)).toBe(expected);
    });

    it('returns a boolean rather than a string', () => {
      expect(typeof runCommand('getIsReleaseCandidate', '1.6.1')).toBe(
        'boolean'
      );
    });

    it.each([[undefined], ['']])(
      'throws for a missing version %p',
      (version) => {
        expect(() => runCommand('getIsReleaseCandidate', version)).toThrow(
          /Expected version argument/
        );
      }
    );

    it.each(UNRECOGNIZED_VERSIONS)('throws for %p', (version) => {
      expect(() => runCommand('getIsReleaseCandidate', version)).toThrow(
        /Unrecognized version/
      );
    });
  });

  describe('getReleaseChannel', () => {
    it.each([
      ['1.0.0', 'final'],
      ['1.6.1', 'final'],
      ['1.0.0-beta.2', 'beta'],
      ['1.0.0-beta.42', 'beta'],
      ['1.0.0-preview.1', 'preview'],
      ['2.0.0-preview.10', 'preview'],
    ])('%s -> %s', (version, expected) => {
      expect(runCommand('getReleaseChannel', version)).toBe(expected);
    });

    it.each([['2.0.0-rc2'], ['1.0.0-beta.4-rc1'], ['2.0.0-preview.1-rc1']])(
      'throws for the release candidate %p',
      (version) => {
        expect(() => runCommand('getReleaseChannel', version)).toThrow(
          /is a release candidate and has no release channel/
        );
      }
    );

    it.each([[undefined], ['']])(
      'throws for a missing version %p',
      (version) => {
        expect(() => runCommand('getReleaseChannel', version)).toThrow(
          /Expected version argument/
        );
      }
    );

    it.each(UNRECOGNIZED_VERSIONS)('throws for %p', (version) => {
      expect(() => runCommand('getReleaseChannel', version)).toThrow(
        /Unrecognized version/
      );
    });
  });

  describe('getNpmDistTag', () => {
    it.each([
      ['1.0.0', 'latest'],
      ['1.6.1', 'latest'],
      ['1.7.0', 'latest'],
      ['1.0.0-beta.2', 'beta'],
      ['1.0.0-beta.4', 'beta'],
      ['1.0.0-preview.1', 'preview'],
      ['2.0.0-preview.2', 'preview'],
    ])('%s marked latest -> %s', (version, expected) => {
      expect(runCommand('getNpmDistTag', version, 'true')).toBe(expected);
    });

    it.each([
      ['1.6.10', '1.6.x'],
      ['1.6.1', '1.6.x'],
      ['1.0.0', '1.0.x'],
      ['2.10.3', '2.10.x'],
    ])('the backport %s -> %s', (version, expected) => {
      expect(runCommand('getNpmDistTag', version, 'false')).toBe(expected);
    });

    it.each([
      ['1.0.0-beta.2', 'beta'],
      ['2.0.0-preview.1', 'preview'],
    ])('%s is unaffected by the checkbox -> %s', (version, expected) => {
      expect(runCommand('getNpmDistTag', version, 'true')).toBe(expected);
      expect(runCommand('getNpmDistTag', version, 'false')).toBe(expected);
    });

    it.each([['legacy'], ['TRUE'], ['True'], ['1'], ['yes'], ['null']])(
      'throws for the makeLatest value %p',
      (makeLatest) => {
        expect(() => runCommand('getNpmDistTag', '1.8.0', makeLatest)).toThrow(
          /Unexpected value/
        );
      }
    );

    it.each([['1.8.0'], ['1.0.0-beta.2'], ['2.0.0-preview.1']])(
      'throws without a makeLatest value for %p',
      (version) => {
        expect(() => runCommand('getNpmDistTag', version)).toThrow(
          /Expected "version" and "makeLatest" arguments/
        );
        expect(() => runCommand('getNpmDistTag', version, '')).toThrow(
          /Expected "version" and "makeLatest" arguments/
        );
      }
    );

    it.each([[undefined], ['']])(
      'throws for a missing version %p',
      (version) => {
        expect(() => runCommand('getNpmDistTag', version, 'true')).toThrow(
          /Expected "version" and "makeLatest" arguments/
        );
        expect(() => runCommand('getNpmDistTag', version, 'false')).toThrow(
          /Expected "version" and "makeLatest" arguments/
        );
      }
    );

    it.each([
      ['1.0.0-rc1'],
      ['1.7.0-rc4'],
      ['2.0.0-rc2'],
      ['1.0.0-beta.4-rc1'],
      ['2.0.0-preview.1-rc1'],
      ['2.0.0-preview.10-rc11'],
    ])('throws for the release candidate %p', (version) => {
      expect(() => runCommand('getNpmDistTag', version, 'true')).toThrow(
        /is a release candidate and has no npm dist-tag/
      );
      expect(() => runCommand('getNpmDistTag', version, 'false')).toThrow(
        /is a release candidate and has no npm dist-tag/
      );
    });

    it.each(UNRECOGNIZED_VERSIONS)('throws for %p', (version) => {
      expect(() => runCommand('getNpmDistTag', version, 'true')).toThrow(
        /Unrecognized version/
      );
    });
  });
});
