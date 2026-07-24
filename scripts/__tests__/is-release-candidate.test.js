const { isReleaseCandidate } = require('../is-release-candidate');

describe('isReleaseCandidate', () => {
  it.each([
    ['1.0.0', false],
    ['1.6.1', false],
    ['1.7.0', false],
    ['1.0.0-beta.1', false],
    ['1.0.0-beta.2', false],
    ['1.0.0-beta.4', false],
    ['1.0.0-beta.4-rc1', true],
    ['1.0.0-beta.23-rc2', true],
    ['1.0.0-beta.42-rc22', true],
    ['1.0.0-preview.1', false],
    ['2.0.0-preview.1', false],
    ['2.0.0-preview.2', false],
    ['1.0.0-rc1', true],
    ['1.0.0-rc24', true],
    ['1.7.0-rc4', true],
    ['2.0.0-rc2', true],
    ['2.0.0-rc3', true],
    ['2.0.0-preview.1-rc1', true],
    ['2.0.0-preview.10-rc1', true],
    ['2.0.0-preview.10-rc11', true],
  ])('%s -> %s', (version, expected) => {
    expect(isReleaseCandidate(version)).toBe(expected);
  });
});
