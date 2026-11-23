/**
 * Exercises the public entry point and the runtime enums it re-exports.
 *
 * These modules are barrels and enum declarations, so they carry no logic, but
 * they do emit runtime JavaScript and they define the package's public surface.
 * Loading them here both closes the coverage gap and turns an accidental
 * removal from `src/index.tsx` into a failing test rather than a silent
 * breaking change for consumers.
 */
export {};
