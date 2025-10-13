// @ts-ignore
import { token } from './e2e-tests-token';

// @ts-ignore
import { token as preflightToken } from './e2e-preflightTest-token';

export function generateAccessToken() {
  return token;
}

export function generatePreflightAccessToken() {
  return preflightToken;
}
