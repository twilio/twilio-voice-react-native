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

    /**
     * Embedded manifests carry the SDK version at the top level. Manifests
     * served by expo-updates instead nest the app config under
     * `extra.expoClient`, so the top-level lookup finds nothing for an app
     * running an over-the-air update.
     */
    const sdkVersion =
      manifest?.sdkVersion ?? manifest?.extra?.expoClient?.sdkVersion;

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
