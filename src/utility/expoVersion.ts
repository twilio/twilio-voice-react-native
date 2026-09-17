/**
 * Copyright © 2022 Twilio, Inc. All rights reserved. Licensed under the Twilio
 * license.
 *
 * See LICENSE in the project root for license information.
 */

/**
 * Shape of the Expo global this module feature-detects.
 *
 * Declared locally on purpose. A runtime feature-detect for an optional
 * framework must not depend on that framework's ambient type declarations,
 * which are only present when `expo-modules-core` is a dependency.
 */
declare const global: {
  expo?: {
    modules?: {
      ExponentConstants?: {
        manifest?: string | Record<string, any>;
      };
    };
  };
};

/**
 * Read an `sdkVersion` from a parsed manifest, handling both manifest shapes.
 *
 * Classic manifests place `sdkVersion` at the top level. Manifests served by
 * Expo Updates nest the app config under `extra.expoClient`.
 */
function readSdkVersion(manifest: Record<string, any>): string | undefined {
  const candidates = [
    manifest?.sdkVersion,
    manifest?.extra?.expoClient?.sdkVersion,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string') {
      return candidate;
    }

    if (typeof candidate === 'number') {
      return String(candidate);
    }
  }

  return undefined;
}

/**
 * Get the Expo SDK version of the host application, if it is an Expo
 * application.
 *
 * @returns the Expo SDK version, or `undefined` when the application is not an
 * Expo application or the version cannot be determined.
 */
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

    if (typeof manifest !== 'object' || manifest === null) {
      return undefined;
    }

    return readSdkVersion(manifest);
  } catch {
    return undefined;
  }
}
