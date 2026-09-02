// The token and ICE server modules are gitignored local secrets, so they will
// not exist in CI. Metro resolves platform-specific files, so these requires
// will find `e2e-tests-token.android.ts` on Android and
// `e2e-tests-token.ios.ts` on iOS.
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

// Deliberately not the SDK's `IceServer`, which is a `Partial` and so types
// every field as possibly undefined. These are always all present.
type IceServerCredentials = {
  serverUrl: string;
  username: string;
  password: string;
};

function readToken(tokenModule: unknown): string {
  const token = (tokenModule as { token?: unknown } | undefined)?.token;
  return typeof token === 'string' ? token : '';
}

export function getToken(): string {
  try {
    // @ts-ignore - the module is a gitignored local secret and may not exist
    return readToken(require('./e2e-tests-token'));
  } catch (error) {
    // Use `info` here so the warning popup doesn't interfere with testing.
    console.info(`No bundled e2e test token: ${String(error)}`);
    return '';
  }
}

// Placeholder returned when no ICE server credentials are bundled. Suites
// compare `serverUrl` against 'TODO' to decide whether to run or skip their
// `valid-*` variants.
export const NO_ICE_SERVER: IceServerCredentials = {
  serverUrl: 'TODO',
  username: 'TODO',
  password: 'TODO',
};

function readIceServer(iceServerModule: unknown): IceServerCredentials {
  const iceServer = (iceServerModule as { iceServer?: unknown } | undefined)
    ?.iceServer as Record<string, unknown> | undefined;

  const { serverUrl, username, password } = iceServer ?? {};

  return typeof serverUrl === 'string' &&
    typeof username === 'string' &&
    typeof password === 'string'
    ? { serverUrl, username, password }
    : NO_ICE_SERVER;
}

// Twilio's Network Traversal Service hands these out. They are account-scoped
// and short-lived, so they must not be committed.
//
// Consider a flippable flag instead of depending on the default bogus
// credentials.
//
// TODO: VBLOCKS-7138
export function getIceServer(): IceServerCredentials {
  try {
    // @ts-ignore - the module is a gitignored local secret and may not exist
    return readIceServer(require('./e2e-tests-ice-server'));
  } catch (error) {
    // Use `info` here so the warning popup doesn't interfere with testing.
    console.info(
      'No bundled ICE server; valid-* variants will be skipped: ' +
        `${String(error)}`
    );
    return NO_ICE_SERVER;
  }
}
