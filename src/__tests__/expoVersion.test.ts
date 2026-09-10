import { getExpoVersion } from '../utility/expoVersion';

function setExpoManifest(manifest: any) {
  (global as any).expo = {
    modules: { ExponentConstants: { manifest } },
  } as any;
}

describe('getExpoVersion', () => {
  let originalExpoGlobal: any;

  beforeEach(() => {
    originalExpoGlobal = (global as any).expo;
  });

  afterEach(() => {
    (global as any).expo = originalExpoGlobal;
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

  it('should get the version from an expo-updates manifest', () => {
    setExpoManifest({
      metadata: {},
      extra: { expoClient: { sdkVersion: '52.0.0' } },
    });
    expect(getExpoVersion()).toBe('52.0.0');
  });

  it('should get the version from an expo-updates manifest json string', () => {
    setExpoManifest(
      JSON.stringify({
        metadata: {},
        extra: { expoClient: { sdkVersion: '52.0.0' } },
      })
    );
    expect(getExpoVersion()).toBe('52.0.0');
  });

  it('should stringify a number sdk version nested under extra', () => {
    setExpoManifest({ extra: { expoClient: { sdkVersion: 52 } } });
    expect(getExpoVersion()).toBe('52');
  });

  it('should prefer the top level sdk version over the nested one', () => {
    setExpoManifest({
      sdkVersion: 'top-level',
      extra: { expoClient: { sdkVersion: 'nested' } },
    });
    expect(getExpoVersion()).toBe('top-level');
  });

  it('should fall back to the nested sdk version if the top level one is null', () => {
    setExpoManifest({
      sdkVersion: null,
      extra: { expoClient: { sdkVersion: '52.0.0' } },
    });
    expect(getExpoVersion()).toBe('52.0.0');
  });

  it('should return undefined if neither sdk version is present', () => {
    setExpoManifest({ metadata: {}, extra: { expoClient: {} } });
    expect(getExpoVersion()).toBe(undefined);
  });

  it('should return undefined if the extra member is not an object', () => {
    const invalidValues = [null, 10, 'foobar', false];
    expect.assertions(invalidValues.length);

    for (const val of invalidValues) {
      setExpoManifest({ extra: val });
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
    (global as any).expo = undefined as any;
    expect(getExpoVersion()).toBe(undefined);
  });

  it('should return undefined if the modules member is not in the expo object', () => {
    (global as any).expo = {} as any;
    expect(getExpoVersion()).toBe(undefined);
  });

  it('should return undefined if the ExponentConstants member is not in the modules object', () => {
    (global as any).expo = { modules: {} } as any;
    expect(getExpoVersion()).toBe(undefined);
  });

  it('should return undefined if the manifest member is not in the ExponentConstants object', () => {
    (global as any).expo = { modules: { ExponentConstants: {} } } as any;
    expect(getExpoVersion()).toBe(undefined);
  });
});
