const AccessToken = require('twilio').jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;
const config = require('./config.json');

const outgoingApplicationSid = config.prod.twimlAppSid;
const accountSid = config.prod.accountSid;
const apiKeySid = config.prod.apiKeySid;
const apiKeySecret = config.prod.apiKeySecret;
const pushCredentialSid = config.prod.pushCredentialSid;

export function generateAccessToken(identity: string) {
  const accessToken = new AccessToken(
    accountSid,
    apiKeySid,
    apiKeySecret,
    {
      identity,
    }
  );

  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid,
    pushCredentialSid,
  });

  accessToken.addGrant(voiceGrant);
  console.log(accessToken.toJwt());

  return accessToken.toJwt();
}
