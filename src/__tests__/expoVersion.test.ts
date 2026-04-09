import { getExpoVersion } from '../utility/expoVersion';

function setExpoManifest(manifest: any) {
  global.expo = {
    modules: { ExponentConstants: { manifest } },
  } as any;
}

describe('getExpoVersion', () => {
  let originalExpoGlobal: any;

  beforeEach(() => {
    originalExpoGlobal = global.expo;
  });

  afterEach(() => {
    global.expo = originalExpoGlobal;
  });

  it('should get the version if the expo manifest is an object', () => {
    setExpoManifest({ sdkVersion: 'foobar' });
    expect(getExpoVersion()).toBe('foobar');
  });

  it('should get the version if the expo manifest is a valid json string', () => {
    setExpoManifest(JSON.stringify({ sdkVersion: 'foobar' }));
    expect(getExpoVersion()).toBe('foobar');
  });

  it('should stringify a number sdk version', () => {
    setExpoManifest(JSON.stringify({ sdkVersion: 52 }));
    expect(getExpoVersion()).toBe('52');
  });

  it('should return undefined if the sdk version is not a string or a number', () => {
    const invalidValues = [null, {}, false, true, undefined];
    expect.assertions(invalidValues.length);

    for (const val of invalidValues) {
      setExpoManifest(JSON.stringify({ sdkVersion: val }));
      expect(getExpoVersion()).toBe(undefined);
    }
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

  it('should return undefined if the expo object is not in the global scope', () => {
    global.expo = undefined as any;
    expect(getExpoVersion()).toBe(undefined);
  });

  it('should return undefined if the modules member is not in the expo object', () => {
    global.expo = {} as any;
    expect(getExpoVersion()).toBe(undefined);
  });

  it('should return undefined if the ExponentConstants member is not in the modules object', () => {
    global.expo = { modules: {} } as any;
    expect(getExpoVersion()).toBe(undefined);
  });

  it('should return undefined if the manifest member is not in the ExponentConstants object', () => {
    global.expo = { modules: { ExponentConstants: {} } } as any;
    expect(getExpoVersion()).toBe(undefined);
  });
});
