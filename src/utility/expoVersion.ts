export function getExpoVersion(): string | undefined {
  const expoManifest = global.expo?.modules?.ExponentConstants?.manifest;

  if (!expoManifest) return undefined;

  try {
    const manifest =
      typeof expoManifest === 'string'
        ? JSON.parse(expoManifest)
        : expoManifest;
    return manifest?.sdkVersion;
  } catch {
    return undefined;
  }
}
