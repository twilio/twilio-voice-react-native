const {
  classifyVersionTag,
  getIsReleaseCandidate,
  getNpmDistTag,
  runCommand,
} = require('../classify-version-tag');

// Version strings below are real tags from this repo's history, chosen to
// cover every distinct shape that's actually appeared: bare final, bare
// beta/preview, bare rc (including a double-digit rc number), and the
// compound channel+rc form.

// Shapes that must never be guessed at. Guessing would risk publishing a
// prerelease under the `latest` dist-tag.
const UNRECOGNIZED_VERSIONS = [
  ['2.0.0-beta'], // channel with no number
  ['2.0.0-beta2'], // channel number needs a dot
  ['2.0.1-dev'], // dev versions are never released
  ['1.0.0-BETA.1'], // channels are lower-case
  ['1.0.0-beta.1-foo'], // unrecognized trailing segment
  ['1.0.0-rc'], // rc with no number
  ['1.0.0-canary.1'], // a channel we don't publish
  ['1.0.0-constructor.1'], // must not resolve off Object.prototype
  ['v1.6.1'], // tags in this repo are not v-prefixed
  ['not-a-version'],
];

describe('classifyVersionTag', () => {
  it.each([
    ['1.0.0', 'final', false],
    ['1.6.1', 'final', false],
    ['1.7.0', 'final', false],
    ['1.0.0-beta.1', 'beta', false],
    ['1.0.0-beta.2', 'beta', false],
    ['1.0.0-beta.3', 'beta', false],
    ['1.0.0-beta.4', 'beta', false],
    ['1.0.0-beta.4-rc1', 'beta', true],
    ['1.0.0-beta.23-rc2', 'beta', true],
    ['1.0.0-beta.42-rc22', 'beta', true],
    ['1.0.0-preview.1', 'preview', false],
    ['2.0.0-preview.1', 'preview', false],
    ['2.0.0-preview.2', 'preview', false],
    ['1.0.0-rc1', 'final', true],
    ['1.0.0-rc24', 'final', true],
    ['1.7.0-rc4', 'final', true],
    ['2.0.0-rc2', 'final', true],
    ['2.0.0-rc3', 'final', true],
    ['2.0.0-preview.1-rc1', 'preview', true],
    ['2.0.0-preview.10-rc1', 'preview', true],
    ['2.0.0-preview.10-rc11', 'preview', true],
  ])('%s -> channel %s, isReleaseCandidate %s', (version, channel, isRc) => {
    expect(classifyVersionTag(version)).toEqual({
      channel,
      isReleaseCandidate: isRc,
    });
  });

  it.each(UNRECOGNIZED_VERSIONS)('throws for %p', (version) => {
    expect(() => classifyVersionTag(version)).toThrow(
      /Unrecognized version tag/
    );
  });
});

describe('getIsReleaseCandidate', () => {
  it.each([
    ['1.0.0', false],
    ['1.6.1', false],
    ['1.7.0', false],
    ['1.0.0-beta.1', false],
    ['1.0.0-beta.2', false],
    ['1.0.0-beta.4', false],
    ['1.0.0-preview.1', false],
    ['2.0.0-preview.1', false],
    ['2.0.0-preview.2', false],
    ['1.0.0-beta.4-rc1', true],
    ['1.0.0-beta.23-rc2', true],
    ['1.0.0-beta.42-rc22', true],
    ['1.0.0-rc1', true],
    ['1.0.0-rc24', true],
    ['1.7.0-rc4', true],
    ['2.0.0-rc2', true],
    ['2.0.0-rc3', true],
    ['2.0.0-preview.1-rc1', true],
    ['2.0.0-preview.10-rc1', true],
    ['2.0.0-preview.10-rc11', true],
  ])('%s -> %s', (version, expected) => {
    expect(getIsReleaseCandidate(version)).toBe(expected);
  });

  it.each(UNRECOGNIZED_VERSIONS)('throws for %p', (version) => {
    expect(() => getIsReleaseCandidate(version)).toThrow(
      /Unrecognized version tag/
    );
  });
});

describe('getNpmDistTag', () => {
  it.each([
    ['1.0.0', 'latest'],
    ['1.6.1', 'latest'],
    ['1.7.0', 'latest'],
    ['1.0.0-beta.1', 'beta'],
    ['1.0.0-beta.2', 'beta'],
    ['1.0.0-beta.3', 'beta'],
    ['1.0.0-beta.4', 'beta'],
    ['1.0.0-preview.1', 'preview'],
    ['2.0.0-preview.1', 'preview'],
    ['2.0.0-preview.2', 'preview'],
  ])('%s -> %s', (version, expected) => {
    expect(getNpmDistTag(version)).toBe(expected);
  });

  // A release candidate has no dist-tag because it is never published.
  // Returning its channel instead would mean a bare X.Y.Z-rcN reported
  // `latest`, so a lost publish gate would ship a candidate as the default
  // install rather than failing.
  it.each([
    ['1.0.0-rc1'],
    ['1.0.0-rc24'],
    ['1.7.0-rc4'],
    ['2.0.0-rc2'],
    ['2.0.0-rc3'],
    ['1.0.0-beta.4-rc1'],
    ['2.0.0-preview.1-rc1'],
    ['2.0.0-preview.10-rc11'],
  ])('throws for release candidate %p', (version) => {
    expect(() => getNpmDistTag(version)).toThrow(/release candidate/);
  });

  it.each(UNRECOGNIZED_VERSIONS)('throws for %p', (version) => {
    expect(() => getNpmDistTag(version)).toThrow(/Unrecognized version tag/);
  });
});

// runCommand is what the CLI wrapper calls, so these assert the exact strings
// the release workflow reads off stdout.
describe('runCommand', () => {
  it.each([
    ['getNpmDistTag', '1.6.1', 'latest'],
    ['getNpmDistTag', '1.0.0-beta.2', 'beta'],
    ['getNpmDistTag', '2.0.0-preview.1', 'preview'],
    ['getIsReleaseCandidate', '1.6.1', 'false'],
    ['getIsReleaseCandidate', '1.0.0-beta.2', 'false'],
    ['getIsReleaseCandidate', '2.0.0-rc2', 'true'],
    ['getIsReleaseCandidate', '2.0.0-preview.1-rc1', 'true'],
  ])('%s %s -> "%s"', (command, version, expected) => {
    expect(runCommand(command, version)).toBe(expected);
  });

  it('returns a string, so the CLI wrapper needs no formatting', () => {
    expect(typeof runCommand('getIsReleaseCandidate', '1.6.1')).toBe('string');
    expect(typeof runCommand('getNpmDistTag', '1.6.1')).toBe('string');
  });

  it.each([
    ['bogusCommand'],
    ['constructor'], // must not resolve off Object.prototype
    ['toString'],
    ['classifyVersionTag'], // exported, but not a command
    [''],
    [undefined],
  ])('throws for invalid command %p', (command) => {
    expect(() => runCommand(command, '1.6.1')).toThrow(/Invalid command/);
  });

  it.each([[''], [undefined]])(
    'throws for missing version %p',
    (version) => {
      expect(() => runCommand('getNpmDistTag', version)).toThrow(
        /No version value passed/
      );
    }
  );

  it('propagates a release candidate error', () => {
    expect(() => runCommand('getNpmDistTag', '2.0.0-rc2')).toThrow(
      /release candidate/
    );
  });
});
