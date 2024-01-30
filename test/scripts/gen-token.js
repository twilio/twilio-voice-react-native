'use strict';

const twilio = require('twilio');

const { AccessToken } = twilio.jwt;

/**
 * Attempt to parse an environment variable from the process.
 * @param {string} envVarKey The name of the environment variable.
 * @throws {Error} Will throw if the environment variable is missing.
 * @returns {string}
 */
function parseEnvVar(envVarKey) {
  const envVarValue = process.env[envVarKey];
  if (typeof envVarKey === 'undefined') {
    throw new Error(`Environment variable with key "${envVarKey}" is missing.`);
  }
  if (envVarValue === '') {
    throw new Error(
      `Environment variable with key "${envVarKey}" evaluated to the empty string.`
    );
  }
  return envVarValue;
}

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
 * Parse the script arguments.
 * @throws {Error} Will throw if the script was not executed with the correct
 * number of arguments or if an argument is invalid.
 */
function parseScriptArgument() {
  if (process.argv.length !== 3) {
    throw new Error('Incorrect number of arguments.');
  }

  const identity = process.argv[2];
  if (identity === '') {
    throw new Error('Identity evaluated to empty string.');
  }

  return { identity };
}

/**
 * Wrap an access token string in the necessary template.
 * @param {string} accessToken The access token in JWT form.
 */
function templateAccessToken(accessToken) {
  const TEMPLATE = (token) => `export const token =\n  '${token}';`;
  return TEMPLATE(accessToken);
}

/**
 * Main function. Executed on script start.
 */
function main() {
  const { identity } = parseScriptArgument();
  const accessToken = generateToken(identity);
  const accessTokenJwt = accessToken.toJwt();
  const templatedAccessTokenJwt = templateAccessToken(accessTokenJwt);
  console.log(templatedAccessTokenJwt);
}

main();
