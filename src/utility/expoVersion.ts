export function getExpoVersion(): string | undefined {
  const expoManifest = global.expo?.modules?.ExponentConstants?.manifest;

  // NOTE: iOS manifest value is a JS object.
  if (
    typeof expoManifest === 'object' &&
    expoManifest !== null &&
    typeof expoManifest.sdkVersion === 'string'
  ) {
    return expoManifest.sdkVersion;
  }

  // NOTE: Android manifest value is a JSON-encoded string.
  if (typeof expoManifest === 'string') {
    let expoManifestObj: any;
    try {
      expoManifestObj = JSON.parse(expoManifest);
    } catch {
      return;
    }

    if (
      typeof expoManifestObj === 'object' &&
      expoManifestObj !== null &&
      typeof expoManifestObj.sdkVersion === 'string'
    ) {
      return expoManifestObj.sdkVersion;
    }
  }

  return;
}
