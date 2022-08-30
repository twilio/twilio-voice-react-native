const { jwt: { AccessToken } } = require('twilio');
const fs = require('fs/promises');
const path = require('path');

require('dotenv').config();

const {
  ACCOUNT_SID,
  API_KEY_SID,
  API_KEY_SECRET,
  IDENTITY,
  INCOMING_ALLOWED,
  RN_OUTGOING_APPLICATION_SID,
  PUSH_CREDENTIAL_SID,
} = process.env;

/**
 * Generate a Twilio access token with VoiceGrant in JWT format.
 * @returns - a string representing the JWT.
 */
function generateAccessToken() {
  for (
    const [k, v] of Object.entries({
      ACCOUNT_SID,
      API_KEY_SID,
      API_KEY_SECRET,
      IDENTITY,
      INCOMING_ALLOWED,
      RN_OUTGOING_APPLICATION_SID,
      PUSH_CREDENTIAL_SID,
    })
  ) {
    if (!Boolean(v)) {
      throw new Error(`Missing required environment variable "${k}".`);
    }
  }

  let incomingAllowed;
  if (INCOMING_ALLOWED === 'true') {
    incomingAllowed = true;
  } else if (INCOMING_ALLOWED === 'false') {
    incomingAllowed = false;
  } else {
    throw new Error('INCOMING_ALLOWED must be "true" or "false".');
  }

  const accessToken = new AccessToken(
    ACCOUNT_SID,
    API_KEY_SID,
    API_KEY_SECRET, {
      identity: IDENTITY,
    }
  );

  const voiceGrantOptions = {
    incomingAllowed,
    outgoingApplicationSid: RN_OUTGOING_APPLICATION_SID,
    pushCredentialSid: PUSH_CREDENTIAL_SID,
  };
  const voiceGrant = new AccessToken.VoiceGrant(voiceGrantOptions);

  accessToken.addGrant(voiceGrant);

  return accessToken.toJwt();
}

/**
 * Check if a file exists, and if not, save the access token as a TS source
 * file.
 * @returns
 *  A `Promise` that
 *    - Resolves if successful.
 *    - Rejects if the file already exists, or if unable to write the file.
 */
async function saveAccessToken(accessTokenPath, token) {
  const fileContents = `export const accessToken = '${token}';`;
  const accessTokenFileHandle =
    await fs.open(accessTokenPath, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL);
  await accessTokenFileHandle.write(fileContents);
  await accessTokenFileHandle.close();
}

/**
 * Main function. Generates and saves the access token.
 */
async function main() {
  const accessTokenPath = path.join(
    '.',
    'example',
    'src',
    'e2e-tests-token.ts'
  );
  const accessToken = generateAccessToken();
  await saveAccessToken(accessTokenPath, accessToken);
}

main();
