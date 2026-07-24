const { getNpmDistTag } = require('../npm-dist-tag');

describe('getNpmDistTag', () => {
  it.each([
    ['1.0.0', 'latest'],
    ['1.6.1', 'latest'],
    ['1.7.0', 'latest'],
    ['1.0.0-beta.1', 'beta'],
    ['1.0.0-beta.2', 'beta'],
    ['1.0.0-beta.4', 'beta'],
    ['1.0.0-beta.4-rc1', 'rc'],
    ['1.0.0-beta.23-rc2', 'rc'],
    ['1.0.0-beta.42-rc22', 'rc'],
    ['1.0.0-preview.1', 'preview'],
    ['2.0.0-preview.1', 'preview'],
    ['2.0.0-preview.2', 'preview'],
    ['1.0.0-rc1', 'rc'],
    ['1.0.0-rc24', 'rc'],
    ['1.7.0-rc4', 'rc'],
    ['2.0.0-rc2', 'rc'],
    ['2.0.0-rc3', 'rc'],
    ['2.0.0-preview.1-rc1', 'rc'],
    ['2.0.0-preview.10-rc1', 'rc'],
    ['2.0.0-preview.10-rc11', 'rc'],
  ])('%s -> %s', (version, expected) => {
    expect(getNpmDistTag(version)).toBe(expected);
  });
});
