import { getExpoVersion } from '../utility/expoVersion';

function setExpoManifest(manifest: any) {
  global.expo = {
    modules: { ExponentConstants: { manifest } },
  } as any;
}

describe('getExpoVersion', () => {
  it('should get the version from a expo manifest object', () => {
    setExpoManifest({ sdkVersion: 'foobar' });
    expect(getExpoVersion()).toBe('foobar');
  });

  it('should get the version from a expo manifest string', () => {
    setExpoManifest(JSON.stringify({ sdkVersion: 'foobar' }));
    expect(getExpoVersion()).toBe('foobar');
  });

  it('should return undefined if the expo manifest is not a json string', () => {
    setExpoManifest('foobar');
    expect(getExpoVersion()).toBe(undefined);
  });

  it('should return undefined if the expo manifest is null', () => {
    setExpoManifest(null);
    expect(getExpoVersion()).toBe(undefined);
  });

  it('should return undefined if the expo manifest is not an object or a string', () => {
    setExpoManifest(10);
    expect(getExpoVersion()).toBe(undefined);
  });

  it('should return undefined if the json-parsed expo manifest is null', () => {
    setExpoManifest(JSON.stringify(null));
    expect(getExpoVersion()).toBe(undefined);
  });

  it('should return undefined if the json-parsed expo manifest is not an object or a string', () => {
    setExpoManifest(JSON.stringify(10));
    expect(getExpoVersion()).toBe(undefined);
  });
});
