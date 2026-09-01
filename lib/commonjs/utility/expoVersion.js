"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getExpoVersion = getExpoVersion;

function getExpoVersion() {
  var _global$expo, _global$expo$modules, _global$expo$modules$;

  const expoManifest = (_global$expo = global.expo) === null || _global$expo === void 0 ? void 0 : (_global$expo$modules = _global$expo.modules) === null || _global$expo$modules === void 0 ? void 0 : (_global$expo$modules$ = _global$expo$modules.ExponentConstants) === null || _global$expo$modules$ === void 0 ? void 0 : _global$expo$modules$.manifest;

  if (!expoManifest) {
    return undefined;
  }

  try {
    const manifest = typeof expoManifest === 'string' ? JSON.parse(expoManifest) : expoManifest;
    const sdkVersion = manifest === null || manifest === void 0 ? void 0 : manifest.sdkVersion;

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
//# sourceMappingURL=expoVersion.js.map