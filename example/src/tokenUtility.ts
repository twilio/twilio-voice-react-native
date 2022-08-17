var _ = require('lodash');
var jwt = require('jsonwebtoken');

/**
 * @constructor
 * @param {object} options - ...
 * @param {boolean} options.incomingAllow - Whether or not this endpoint is allowed to receive incoming calls as grants.identity
 * @param {string} options.outgoingApplicationSid - application sid to call when placing outgoing call
 * @param {object} options.outgoingApplicationParams - request params to pass to the application
 * @param {string} options.pushCredentialSid - Push Credential Sid to use when registering to receive incoming call notifications
 * @param {string} options.endpointId - Specify an endpoint identifier for this device, which will allow the developer
 *                 to direct calls to a specific endpoint when multiple devices are associated with a single identity
 */
function VoiceGrant(options) {
  options = options || {};
  this.incomingAllow = options.incomingAllow;
  this.outgoingApplicationSid = options.outgoingApplicationSid;
  this.outgoingApplicationParams = options.outgoingApplicationParams;
  this.pushCredentialSid = options.pushCredentialSid;
  this.endpointId = options.endpointId;
}

_.extend(VoiceGrant.prototype, {
  key: 'voice',
  toPayload: function() {
    var grant = {};
    if (this.incomingAllow === true) {
      grant.incoming = { allow: true };
    }

    if (this.outgoingApplicationSid) {
      grant.outgoing = {};
      grant.outgoing.application_sid = this.outgoingApplicationSid;

      if (this.outgoingApplicationParams) {
        grant.outgoing.params = this.outgoingApplicationParams;
      }
    }

    if (this.pushCredentialSid) {
      grant.push_credential_sid = this.pushCredentialSid;
    }
    if (this.endpointId) {
      grant.endpoint_id = this.endpointId;
    }
    return grant;
  }
});

/**
 * @constructor
 * @param {string} accountSid - The account's unique ID to which access is scoped
 * @param {string} keySid - The signing key's unique ID
 * @param {string} secret - The secret to sign the token with
 * @param {object} options - ...
 * @param {number} [options.ttl=3600] - Time to live in seconds
 * @param {string} [options.identity] - The identity of the first person
 * @param {number} [options.nbf] - Time from epoch in seconds for not before value
 * @param {string} [options.region] - The region value associated with this account
 */
function AccessToken(accountSid, keySid, secret, options) {
  if (!accountSid) { throw new Error('accountSid is required'); }
  if (!keySid) { throw new Error('keySid is required'); }
  if (!secret) { throw new Error('secret is required'); }
  options = options || {};

  this.accountSid = accountSid;
  this.keySid = keySid;
  this.secret = secret;
  this.ttl = options.ttl || 3600;
  this.identity = options.identity;
  this.nbf = options.nbf;
  this.region = options.region;
  this.grants = [];
}

// Class level properties
AccessToken.IpMessagingGrant = util.deprecate(IpMessagingGrant, 'IpMessagingGrant is deprecated, use ChatGrant instead.');
AccessToken.ChatGrant = ChatGrant;
AccessToken.VoiceGrant = VoiceGrant;
AccessToken.SyncGrant = SyncGrant;
AccessToken.VideoGrant = VideoGrant;
AccessToken.ConversationsGrant = util.deprecate(ConversationsGrant, 'ConversationsGrant is deprecated, use VideoGrant instead.');
AccessToken.TaskRouterGrant = TaskRouterGrant;
AccessToken.PlaybackGrant = PlaybackGrant;
AccessToken.DEFAULT_ALGORITHM = 'HS256';
AccessToken.ALGORITHMS = [
  'HS256',
  'HS384',
  'HS512'
];

_.extend(AccessToken.prototype, {
  addGrant: function(grant) {
    this.grants.push(grant);
  },

  toJwt: function(algorithm) {
    algorithm = algorithm || AccessToken.DEFAULT_ALGORITHM;
    if (!_.includes(AccessToken.ALGORITHMS, algorithm)) {
      throw new Error('Algorithm not supported. Allowed values are ' + AccessToken.ALGORITHMS.join(', '));
    }

    var grants = {};
    if (_.isInteger(this.identity) || _.isString(this.identity)) { grants.identity = String(this.identity); }

    _.each(this.grants, function(grant) {
      grants[grant.key] = grant.toPayload();
    });

    var now = Math.floor(Date.now() / 1000);
    var payload = {
      jti: this.keySid + '-' + now,
      grants: grants
    };
    if (_.isNumber(this.nbf)) { payload.nbf = this.nbf; }

    var header = {
      cty: 'twilio-fpa;v=1',
      typ: 'JWT'
    };

    if (this.region && _.isString(this.region)) {
      header.twr = this.region;
    }

    return jwt.sign(payload, this.secret, {
      header: header,
      algorithm: algorithm,
      issuer: this.keySid,
      subject: this.accountSid,
      expiresIn: this.ttl
    });
  }
});

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
