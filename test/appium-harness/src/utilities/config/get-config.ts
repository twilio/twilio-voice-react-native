// The config module is a gitignored local convenience file, so it will not
// exist in CI.
//
// A `require` written directly inside a try/catch is treated by Metro as an
// optional dependency: rather than failing the bundle when the module is
// missing, it throws at runtime, which we swallow here. That lets the app boot
// with an empty suite id so one can be supplied through the UI (i.e. by Appium
// in CI).
//
// The require must appear literally within the try block below. Moving the
// require into a shared helper, or behind a callback, loses the optional
// treatment and the bundle will fail to build again.

function readDefaultTestSuiteId(configModule: unknown): string {
  const defaultTestSuiteId = (
    configModule as { defaultTestSuiteId?: unknown } | undefined
  )?.defaultTestSuiteId;
  return typeof defaultTestSuiteId === 'string' ? defaultTestSuiteId : '';
}

// Not typed as `TEST_SUITE_ID`. The value comes from an untracked local file,
// so it is validated by the same lookup that validates a suite id typed into
// the UI.
export function getDefaultTestSuiteId(): string {
  try {
    // @ts-ignore - the module is a gitignored local file and may not exist
    return readDefaultTestSuiteId(require('./e2e-tests-default-suite-id'));
  } catch (error) {
    // Use `info` here so the warning popup doesn't interfere with testing.
    console.info(`No bundled default test suite id: ${String(error)}`);
    return '';
  }
}
