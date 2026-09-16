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

/**
 * Read an `sdkVersion` from a parsed manifest, handling both manifest shapes.
 *
 * Classic manifests place `sdkVersion` at the top level. Manifests served by
 * Expo Updates nest the app config under `extra.expoClient`.
 */
function readSdkVersion(manifest) {
  var _manifest$extra, _manifest$extra$expoC;

  const candidates = [manifest === null || manifest === void 0 ? void 0 : manifest.sdkVersion, manifest === null || manifest === void 0 ? void 0 : (_manifest$extra = manifest.extra) === null || _manifest$extra === void 0 ? void 0 : (_manifest$extra$expoC = _manifest$extra.expoClient) === null || _manifest$extra$expoC === void 0 ? void 0 : _manifest$extra$expoC.sdkVersion];

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


export function getExpoVersion() {
  var _global$expo, _global$expo$modules, _global$expo$modules$;

  const expoManifest = (_global$expo = global.expo) === null || _global$expo === void 0 ? void 0 : (_global$expo$modules = _global$expo.modules) === null || _global$expo$modules === void 0 ? void 0 : (_global$expo$modules$ = _global$expo$modules.ExponentConstants) === null || _global$expo$modules$ === void 0 ? void 0 : _global$expo$modules$.manifest;

  if (!expoManifest) {
    return undefined;
  }

  try {
    const manifest = typeof expoManifest === 'string' ? JSON.parse(expoManifest) : expoManifest;

    if (typeof manifest !== 'object' || manifest === null) {
      return undefined;
    }

    return readSdkVersion(manifest);
  } catch {
    return undefined;
  }
}
//# sourceMappingURL=expoVersion.js.map