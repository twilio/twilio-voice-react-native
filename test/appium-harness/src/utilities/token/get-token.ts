// The token modules are gitignored local secrets, so they will not exist in
// CI. Metro resolves platform-specific files, so these requires will find
// `e2e-tests-token.android.ts` on Android and `e2e-tests-token.ios.ts` on iOS.
//
// A `require` written directly inside a try/catch is treated by Metro as an
// optional dependency: rather than failing the bundle when the module is
// missing, it throws at runtime, which we swallow here. That lets the app boot
// with an empty token so one can be supplied through the UI (i.e. by Appium in
// CI).
//
// The requires must appear literally within the try blocks below. Moving them
// into a shared helper, or behind a callback, loses the optional treatment and
// the bundle will fail to build again.

function readToken(tokenModule: unknown): string {
  const token = (tokenModule as { token?: unknown } | undefined)?.token;
  return typeof token === 'string' ? token : '';
}

export function getToken(): string {
  try {
    // @ts-ignore - the module is a gitignored local secret and may not exist
    return readToken(require('./e2e-tests-token'));
  } catch (error) {
    console.warn('No bundled e2e test token; enter one in the app.');
    return '';
  }
}

export function getPreflightTestToken(): string {
  try {
    // @ts-ignore - the module is a gitignored local secret and may not exist
    return readToken(require('./e2e-preflightTest-token'));
  } catch (error) {
    console.warn('No bundled preflight test token; enter one in the app.');
    return '';
  }
}
