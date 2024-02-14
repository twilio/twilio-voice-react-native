'use strict';

import twilio from 'twilio';
import { parseEnvVar, parseScriptArgument } from './common.mjs';
import { writeFileSync } from 'node:fs';

const { AccessToken } = twilio.jwt;

/**
 * Generate a configured access token using environment variables.
 * @param {string} identity The identity to vend the token with.
 * @throws {Error} Will throw if any required environment variable is missing or
 * if the identity is invalid.
 * @returns {AccessToken}
 */
function generateToken(identity) {
  if (typeof identity !== 'string') {
    throw new Error('Identity not of type "string".');
  }
  if (identity === '') {
    throw new Error('Identity evaluated to the empty string.');
  }

  const accountSid = parseEnvVar('ACCOUNT_SID');
  const apiKeySid = parseEnvVar('API_KEY_SID');
  const apiKeySecret = parseEnvVar('API_KEY_SECRET');
  const outgoingApplicationSid = parseEnvVar('OUTGOING_APPLICATION_SID');
  const pushCredentialSid = parseEnvVar('PUSH_CREDENTIAL_SID');

  const accessToken = new AccessToken(accountSid, apiKeySid, apiKeySecret, {
    identity,
  });

  const voiceGrant = new AccessToken.VoiceGrant({
    incomingAllow: true,
    outgoingApplicationSid,
    pushCredentialSid,
  });

  accessToken.addGrant(voiceGrant);

  return accessToken;
}

/**
 * Wrap an access token string in the necessary template.
 * @param {string} accessToken The access token in JWT form.
 */
function templateAccessToken(accessToken) {
  const TEMPLATE = (token) => `export const token =\n  '${token}';\n`;
  return TEMPLATE(accessToken);
}

/**
 * Main function. Executed on script start.
 */
function main() {
  const { identity, path } = parseScriptArgument();
  const accessToken = generateToken(identity);
  const accessTokenJwt = accessToken.toJwt();
  const templatedAccessTokenJwt = templateAccessToken(accessTokenJwt);
  writeFileSync(path, templatedAccessTokenJwt, {
    flag: 'wx' /** wx prevents overwriting existing files */,
  });
}

main();
