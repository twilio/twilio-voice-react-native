export function getExpoVersion(): string | undefined {
  const expoManifest = global.expo?.modules?.ExponentConstants?.manifest;

  if (!expoManifest) {
    return undefined;
  }

  try {
    const manifest =
      typeof expoManifest === 'string'
        ? JSON.parse(expoManifest)
        : expoManifest;

    const sdkVersion = manifest?.sdkVersion;

    if (typeof sdkVersion === 'string') {
      return sdkVersion;
    }

    if (typeof sdkVersion === 'number') {
      return String(sdkVersion);
    }

    return undefined;
  } catch {
    return undefined;
  }
}
