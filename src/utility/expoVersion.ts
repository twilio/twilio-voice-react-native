/**
 * Minimal local declaration of the Expo global. The SDK feature-detects the
 * Expo runtime at runtime and must not depend on `expo-modules-core` types,
 * so that the package type-checks and bundles in bare React Native apps.
 */
declare const global: {
  expo?: {
    modules?: {
      ExponentConstants?: {
        manifest?: string | Record<string, unknown>;
      };
    };
  };
} & typeof globalThis;

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
