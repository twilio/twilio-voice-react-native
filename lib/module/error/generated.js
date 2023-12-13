function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * This is a generated file. Any modifications here will be overwritten.
 * See scripts/errors.js.
 */
import { TwilioError } from './TwilioError';
/**
 * @public
 * Authorization errors.
 */

export let AuthorizationErrors;
/**
 * @public
 * Forbidden errors.
 */

(function (_AuthorizationErrors) {
  class AccessTokenInvalid extends TwilioError {
    /**
     * Not applicable.
     */

    /**
     * Invalid access token
     */

    /**
     * Twilio was unable to validate your Access Token
     */

    /**
     * AccessTokenInvalid
     */

    /**
     * Not applicable.
     */
    constructor(message) {
      super(message, 20101);

      _defineProperty(this, "causes", []);

      _defineProperty(this, "description", 'Invalid access token');

      _defineProperty(this, "explanation", 'Twilio was unable to validate your Access Token');

      _defineProperty(this, "name", 'AccessTokenInvalid');

      _defineProperty(this, "solutions", []);

      Object.setPrototypeOf(this, AuthorizationErrors.AccessTokenInvalid.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _AuthorizationErrors.AccessTokenInvalid = AccessTokenInvalid;

  class AccessTokenHeaderInvalid extends TwilioError {
    /**
     * Not applicable.
     */

    /**
     * Invalid access token header
     */

    /**
     * The header of the Access Token provided to the Twilio API was invalid
     */

    /**
     * AccessTokenHeaderInvalid
     */

    /**
     * Not applicable.
     */
    constructor(message) {
      super(message, 20102);

      _defineProperty(this, "causes", []);

      _defineProperty(this, "description", 'Invalid access token header');

      _defineProperty(this, "explanation", 'The header of the Access Token provided to the Twilio API was invalid');

      _defineProperty(this, "name", 'AccessTokenHeaderInvalid');

      _defineProperty(this, "solutions", []);

      Object.setPrototypeOf(this, AuthorizationErrors.AccessTokenHeaderInvalid.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _AuthorizationErrors.AccessTokenHeaderInvalid = AccessTokenHeaderInvalid;

  class AccessTokenIssuerInvalid extends TwilioError {
    /**
     * Not applicable.
     */

    /**
     * Invalid access token issuer/subject
     */

    /**
     * The issuer or subject of the Access Token provided to the Twilio API was invalid
     */

    /**
     * AccessTokenIssuerInvalid
     */

    /**
     * Not applicable.
     */
    constructor(message) {
      super(message, 20103);

      _defineProperty(this, "causes", []);

      _defineProperty(this, "description", 'Invalid access token issuer/subject');

      _defineProperty(this, "explanation", 'The issuer or subject of the Access Token provided to the Twilio API was invalid');

      _defineProperty(this, "name", 'AccessTokenIssuerInvalid');

      _defineProperty(this, "solutions", []);

      Object.setPrototypeOf(this, AuthorizationErrors.AccessTokenIssuerInvalid.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _AuthorizationErrors.AccessTokenIssuerInvalid = AccessTokenIssuerInvalid;

  class AccessTokenExpired extends TwilioError {
    /**
     * Not applicable.
     */

    /**
     * Access token expired or expiration date invalid
     */

    /**
     * The Access Token provided to the Twilio API has expired, the expiration time specified in the token was invalid, or the expiration time specified was too far in the future
     */

    /**
     * AccessTokenExpired
     */

    /**
     * Not applicable.
     */
    constructor(message) {
      super(message, 20104);

      _defineProperty(this, "causes", []);

      _defineProperty(this, "description", 'Access token expired or expiration date invalid');

      _defineProperty(this, "explanation", 'The Access Token provided to the Twilio API has expired, the expiration time specified in the token was invalid, or the expiration time specified was too far in the future');

      _defineProperty(this, "name", 'AccessTokenExpired');

      _defineProperty(this, "solutions", []);

      Object.setPrototypeOf(this, AuthorizationErrors.AccessTokenExpired.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _AuthorizationErrors.AccessTokenExpired = AccessTokenExpired;

  class AccessTokenNotYetValid extends TwilioError {
    /**
     * Not applicable.
     */

    /**
     * Access token not yet valid
     */

    /**
     * The Access Token provided to the Twilio API is not yet valid
     */

    /**
     * AccessTokenNotYetValid
     */

    /**
     * Not applicable.
     */
    constructor(message) {
      super(message, 20105);

      _defineProperty(this, "causes", []);

      _defineProperty(this, "description", 'Access token not yet valid');

      _defineProperty(this, "explanation", 'The Access Token provided to the Twilio API is not yet valid');

      _defineProperty(this, "name", 'AccessTokenNotYetValid');

      _defineProperty(this, "solutions", []);

      Object.setPrototypeOf(this, AuthorizationErrors.AccessTokenNotYetValid.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _AuthorizationErrors.AccessTokenNotYetValid = AccessTokenNotYetValid;

  class AccessTokenGrantsInvalid extends TwilioError {
    /**
     * Not applicable.
     */

    /**
     * Invalid access token grants
     */

    /**
     * The Access Token signature and issuer were valid, but the grants specified in the token were invalid, unparseable, or did not authorize the action being requested
     */

    /**
     * AccessTokenGrantsInvalid
     */

    /**
     * Not applicable.
     */
    constructor(message) {
      super(message, 20106);

      _defineProperty(this, "causes", []);

      _defineProperty(this, "description", 'Invalid access token grants');

      _defineProperty(this, "explanation", 'The Access Token signature and issuer were valid, but the grants specified in the token were invalid, unparseable, or did not authorize the action being requested');

      _defineProperty(this, "name", 'AccessTokenGrantsInvalid');

      _defineProperty(this, "solutions", []);

      Object.setPrototypeOf(this, AuthorizationErrors.AccessTokenGrantsInvalid.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _AuthorizationErrors.AccessTokenGrantsInvalid = AccessTokenGrantsInvalid;

  class AccessTokenSignatureInvalid extends TwilioError {
    /**
     * Not applicable.
     */

    /**
     * Invalid access token signature
     */

    /**
     * The signature for the Access Token provided was invalid.
     */

    /**
     * AccessTokenSignatureInvalid
     */

    /**
     * Not applicable.
     */
    constructor(message) {
      super(message, 20107);

      _defineProperty(this, "causes", []);

      _defineProperty(this, "description", 'Invalid access token signature');

      _defineProperty(this, "explanation", 'The signature for the Access Token provided was invalid.');

      _defineProperty(this, "name", 'AccessTokenSignatureInvalid');

      _defineProperty(this, "solutions", []);

      Object.setPrototypeOf(this, AuthorizationErrors.AccessTokenSignatureInvalid.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _AuthorizationErrors.AccessTokenSignatureInvalid = AccessTokenSignatureInvalid;

  class AuthenticationFailed extends TwilioError {
    /**
     * Not applicable.
     */

    /**
     * Authentication Failed
     */

    /**
     * The Authentication with the provided JWT failed
     */

    /**
     * AuthenticationFailed
     */

    /**
     * Not applicable.
     */
    constructor(message) {
      super(message, 20151);

      _defineProperty(this, "causes", []);

      _defineProperty(this, "description", 'Authentication Failed');

      _defineProperty(this, "explanation", 'The Authentication with the provided JWT failed');

      _defineProperty(this, "name", 'AuthenticationFailed');

      _defineProperty(this, "solutions", []);

      Object.setPrototypeOf(this, AuthorizationErrors.AuthenticationFailed.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _AuthorizationErrors.AuthenticationFailed = AuthenticationFailed;

  class ExpirationTimeExceedsMaxTimeAllowed extends TwilioError {
    /**
     * Not applicable.
     */

    /**
     * Expiration Time Exceeds Maximum Time Allowed
     */

    /**
     * The expiration time provided when creating the JWT exceeds the maximum duration allowed
     */

    /**
     * ExpirationTimeExceedsMaxTimeAllowed
     */

    /**
     * Not applicable.
     */
    constructor(message) {
      super(message, 20157);

      _defineProperty(this, "causes", []);

      _defineProperty(this, "description", 'Expiration Time Exceeds Maximum Time Allowed');

      _defineProperty(this, "explanation", 'The expiration time provided when creating the JWT exceeds the maximum duration allowed');

      _defineProperty(this, "name", 'ExpirationTimeExceedsMaxTimeAllowed');

      _defineProperty(this, "solutions", []);

      Object.setPrototypeOf(this, AuthorizationErrors.ExpirationTimeExceedsMaxTimeAllowed.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _AuthorizationErrors.ExpirationTimeExceedsMaxTimeAllowed = ExpirationTimeExceedsMaxTimeAllowed;

  class AuthorizationError extends TwilioError {
    /**
     * Not applicable.
     */

    /**
     * Authorization error
     */

    /**
     * The request requires user authentication. The server understood the request, but is refusing to fulfill it.
     */

    /**
     * AuthorizationError
     */

    /**
     * Not applicable.
     */
    constructor(message) {
      super(message, 31201);

      _defineProperty(this, "causes", []);

      _defineProperty(this, "description", 'Authorization error');

      _defineProperty(this, "explanation", 'The request requires user authentication. The server understood the request, but is refusing to fulfill it.');

      _defineProperty(this, "name", 'AuthorizationError');

      _defineProperty(this, "solutions", []);

      Object.setPrototypeOf(this, AuthorizationErrors.AuthorizationError.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _AuthorizationErrors.AuthorizationError = AuthorizationError;

  class RateExceededError extends TwilioError {
    /**
     * Message payload size limit exceeded.
     * Rate limit exceeded.
     */

    /**
     * Rate exceeded authorized limit.
     */

    /**
     * The request performed exceeds the authorized limit.
     */

    /**
     * RateExceededError
     */

    /**
     * Ensure the message payload does not exceed size limits.
     * Ensure message send rate does not exceed authorized limits.
     */
    constructor(message) {
      super(message, 31206);

      _defineProperty(this, "causes", ['Message payload size limit exceeded.', 'Rate limit exceeded.']);

      _defineProperty(this, "description", 'Rate exceeded authorized limit.');

      _defineProperty(this, "explanation", 'The request performed exceeds the authorized limit.');

      _defineProperty(this, "name", 'RateExceededError');

      _defineProperty(this, "solutions", ['Ensure the message payload does not exceed size limits.', 'Ensure message send rate does not exceed authorized limits.']);

      Object.setPrototypeOf(this, AuthorizationErrors.RateExceededError.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _AuthorizationErrors.RateExceededError = RateExceededError;

  class AccessTokenRejected extends TwilioError {
    /**
     * Not applicable.
     */

    /**
     * Token authentication is rejected by authentication service
     */

    /**
     * The authentication service has rejected the provided Access Token. To check whether the Access Token is structurally correct, you can use the tools available at https://jwt.io. For the details of Twilio's specific Access Token implementation including the grant format, check https://www.twilio.com/docs/iam/access-tokens.
     */

    /**
     * AccessTokenRejected
     */

    /**
     * Not applicable.
     */
    constructor(message) {
      super(message, 51007);

      _defineProperty(this, "causes", []);

      _defineProperty(this, "description", 'Token authentication is rejected by authentication service');

      _defineProperty(this, "explanation", 'The authentication service has rejected the provided Access Token. To check whether the Access Token is structurally correct, you can use the tools available at https://jwt.io. For the details of Twilio\'s specific Access Token implementation including the grant format, check https://www.twilio.com/docs/iam/access-tokens.');

      _defineProperty(this, "name", 'AccessTokenRejected');

      _defineProperty(this, "solutions", []);

      Object.setPrototypeOf(this, AuthorizationErrors.AccessTokenRejected.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _AuthorizationErrors.AccessTokenRejected = AccessTokenRejected;
})(AuthorizationErrors || (AuthorizationErrors = {}));

export let ForbiddenErrors;
/**
 * @public
 * Client errors.
 */

(function (_ForbiddenErrors) {
  class Forbidden extends TwilioError {
    /**
     * Not applicable.
     */

    /**
     * 403 Forbidden
     */

    /**
     * The account lacks permission to access the Twilio API. Typically this means the account has been suspended or closed. For assistance, please contact support
     */

    /**
     * Forbidden
     */

    /**
     * Not applicable.
     */
    constructor(message) {
      super(message, 20403);

      _defineProperty(this, "causes", []);

      _defineProperty(this, "description", '403 Forbidden');

      _defineProperty(this, "explanation", 'The account lacks permission to access the Twilio API. Typically this means the account has been suspended or closed. For assistance, please contact support');

      _defineProperty(this, "name", 'Forbidden');

      _defineProperty(this, "solutions", []);

      Object.setPrototypeOf(this, ForbiddenErrors.Forbidden.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _ForbiddenErrors.Forbidden = Forbidden;
})(ForbiddenErrors || (ForbiddenErrors = {}));

export let ClientErrors;
/**
 * @public
 * Server errors.
 */

(function (_ClientErrors) {
  class BadRequest extends TwilioError {
    /**
     * Not applicable.
     */

    /**
     * Bad Request (HTTP/SIP)
     */

    /**
     * The request could not be understood due to malformed syntax.
     */

    /**
     * BadRequest
     */

    /**
     * Not applicable.
     */
    constructor(message) {
      super(message, 31400);

      _defineProperty(this, "causes", []);

      _defineProperty(this, "description", 'Bad Request (HTTP/SIP)');

      _defineProperty(this, "explanation", 'The request could not be understood due to malformed syntax.');

      _defineProperty(this, "name", 'BadRequest');

      _defineProperty(this, "solutions", []);

      Object.setPrototypeOf(this, ClientErrors.BadRequest.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _ClientErrors.BadRequest = BadRequest;

  class Forbidden extends TwilioError {
    /**
     * Not applicable.
     */

    /**
     * Forbidden (HTTP/SIP)
     */

    /**
     * The server understood the request, but is refusing to fulfill it.
     */

    /**
     * Forbidden
     */

    /**
     * Not applicable.
     */
    constructor(message) {
      super(message, 31403);

      _defineProperty(this, "causes", []);

      _defineProperty(this, "description", 'Forbidden (HTTP/SIP)');

      _defineProperty(this, "explanation", 'The server understood the request, but is refusing to fulfill it.');

      _defineProperty(this, "name", 'Forbidden');

      _defineProperty(this, "solutions", []);

      Object.setPrototypeOf(this, ClientErrors.Forbidden.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _ClientErrors.Forbidden = Forbidden;

  class NotFound extends TwilioError {
    /**
     * The outbound call was made to an invalid phone number.
     * The TwiML application sid is missing a Voice URL.
     */

    /**
     * Not Found (HTTP/SIP)
     */

    /**
     * The server has not found anything matching the request.
     */

    /**
     * NotFound
     */

    /**
     * Ensure the phone number dialed is valid.
     * Ensure the TwiML application is configured correctly with a Voice URL link.
     */
    constructor(message) {
      super(message, 31404);

      _defineProperty(this, "causes", ['The outbound call was made to an invalid phone number.', 'The TwiML application sid is missing a Voice URL.']);

      _defineProperty(this, "description", 'Not Found (HTTP/SIP)');

      _defineProperty(this, "explanation", 'The server has not found anything matching the request.');

      _defineProperty(this, "name", 'NotFound');

      _defineProperty(this, "solutions", ['Ensure the phone number dialed is valid.', 'Ensure the TwiML application is configured correctly with a Voice URL link.']);

      Object.setPrototypeOf(this, ClientErrors.NotFound.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _ClientErrors.NotFound = NotFound;

  class RequestTimeout extends TwilioError {
    /**
     * Not applicable.
     */

    /**
     * Request Timeout (HTTP/SIP)
     */

    /**
     * A request timeout occurred.
     */

    /**
     * RequestTimeout
     */

    /**
     * Not applicable.
     */
    constructor(message) {
      super(message, 31408);

      _defineProperty(this, "causes", []);

      _defineProperty(this, "description", 'Request Timeout (HTTP/SIP)');

      _defineProperty(this, "explanation", 'A request timeout occurred.');

      _defineProperty(this, "name", 'RequestTimeout');

      _defineProperty(this, "solutions", []);

      Object.setPrototypeOf(this, ClientErrors.RequestTimeout.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _ClientErrors.RequestTimeout = RequestTimeout;

  class Conflict extends TwilioError {
    /**
     * Not applicable.
     */

    /**
     * Conflict (HTTP)
     */

    /**
     * The request could not be processed because of a conflict in the current state of the resource. Another request may be in progress.
     */

    /**
     * Conflict
     */

    /**
     * Not applicable.
     */
    constructor(message) {
      super(message, 31409);

      _defineProperty(this, "causes", []);

      _defineProperty(this, "description", 'Conflict (HTTP)');

      _defineProperty(this, "explanation", 'The request could not be processed because of a conflict in the current state of the resource. Another request may be in progress.');

      _defineProperty(this, "name", 'Conflict');

      _defineProperty(this, "solutions", []);

      Object.setPrototypeOf(this, ClientErrors.Conflict.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _ClientErrors.Conflict = Conflict;

  class UpgradeRequired extends TwilioError {
    /**
     * Not applicable.
     */

    /**
     * Upgrade Required (HTTP)
     */

    /**
     * This error is raised when an HTTP 426 response is received. The reason for this is most likely because of an incompatible TLS version. To mitigate this, you may need to upgrade the OS or download a more recent version of the SDK.
     */

    /**
     * UpgradeRequired
     */

    /**
     * Not applicable.
     */
    constructor(message) {
      super(message, 31426);

      _defineProperty(this, "causes", []);

      _defineProperty(this, "description", 'Upgrade Required (HTTP)');

      _defineProperty(this, "explanation", 'This error is raised when an HTTP 426 response is received. The reason for this is most likely because of an incompatible TLS version. To mitigate this, you may need to upgrade the OS or download a more recent version of the SDK.');

      _defineProperty(this, "name", 'UpgradeRequired');

      _defineProperty(this, "solutions", []);

      Object.setPrototypeOf(this, ClientErrors.UpgradeRequired.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _ClientErrors.UpgradeRequired = UpgradeRequired;

  class TooManyRequests extends TwilioError {
    /**
     * Not applicable.
     */

    /**
     * Too Many Requests (HTTP)
     */

    /**
     * Too many requests were sent in a given amount of time.
     */

    /**
     * TooManyRequests
     */

    /**
     * Not applicable.
     */
    constructor(message) {
      super(message, 31429);

      _defineProperty(this, "causes", []);

      _defineProperty(this, "description", 'Too Many Requests (HTTP)');

      _defineProperty(this, "explanation", 'Too many requests were sent in a given amount of time.');

      _defineProperty(this, "name", 'TooManyRequests');

      _defineProperty(this, "solutions", []);

      Object.setPrototypeOf(this, ClientErrors.TooManyRequests.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _ClientErrors.TooManyRequests = TooManyRequests;

  class TemporarilyUnavailable extends TwilioError {
    /**
     * Not applicable.
     */

    /**
     * Temporarily Unavailable (SIP)
     */

    /**
     * The callee is currently unavailable.
     */

    /**
     * TemporarilyUnavailable
     */

    /**
     * Not applicable.
     */
    constructor(message) {
      super(message, 31480);

      _defineProperty(this, "causes", []);

      _defineProperty(this, "description", 'Temporarily Unavailable (SIP)');

      _defineProperty(this, "explanation", 'The callee is currently unavailable.');

      _defineProperty(this, "name", 'TemporarilyUnavailable');

      _defineProperty(this, "solutions", []);

      Object.setPrototypeOf(this, ClientErrors.TemporarilyUnavailable.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _ClientErrors.TemporarilyUnavailable = TemporarilyUnavailable;

  class CallTransactionDoesNotExist extends TwilioError {
    /**
     * Not applicable.
     */

    /**
     * Call/Transaction Does Not Exist (SIP)
     */

    /**
     * The call no longer exists.
     */

    /**
     * CallTransactionDoesNotExist
     */

    /**
     * Not applicable.
     */
    constructor(message) {
      super(message, 31481);

      _defineProperty(this, "causes", []);

      _defineProperty(this, "description", 'Call/Transaction Does Not Exist (SIP)');

      _defineProperty(this, "explanation", 'The call no longer exists.');

      _defineProperty(this, "name", 'CallTransactionDoesNotExist');

      _defineProperty(this, "solutions", []);

      Object.setPrototypeOf(this, ClientErrors.CallTransactionDoesNotExist.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _ClientErrors.CallTransactionDoesNotExist = CallTransactionDoesNotExist;

  class AddressIncomplete extends TwilioError {
    /**
     * The outbound call was made with a phone number that has an invalid format.
     */

    /**
     * Address Incomplete (SIP)
     */

    /**
     * The provided phone number is malformed.
     */

    /**
     * AddressIncomplete
     */

    /**
     * Ensure the phone number dialed is formatted correctly.
     */
    constructor(message) {
      super(message, 31484);

      _defineProperty(this, "causes", ['The outbound call was made with a phone number that has an invalid format.']);

      _defineProperty(this, "description", 'Address Incomplete (SIP)');

      _defineProperty(this, "explanation", 'The provided phone number is malformed.');

      _defineProperty(this, "name", 'AddressIncomplete');

      _defineProperty(this, "solutions", ['Ensure the phone number dialed is formatted correctly.']);

      Object.setPrototypeOf(this, ClientErrors.AddressIncomplete.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _ClientErrors.AddressIncomplete = AddressIncomplete;

  class BusyHere extends TwilioError {
    /**
     * Not applicable.
     */

    /**
     * Busy Here (SIP)
     */

    /**
     * The callee is busy.
     */

    /**
     * BusyHere
     */

    /**
     * Not applicable.
     */
    constructor(message) {
      super(message, 31486);

      _defineProperty(this, "causes", []);

      _defineProperty(this, "description", 'Busy Here (SIP)');

      _defineProperty(this, "explanation", 'The callee is busy.');

      _defineProperty(this, "name", 'BusyHere');

      _defineProperty(this, "solutions", []);

      Object.setPrototypeOf(this, ClientErrors.BusyHere.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _ClientErrors.BusyHere = BusyHere;

  class RequestTerminated extends TwilioError {
    /**
     * Not applicable.
     */

    /**
     * Request Terminated (SIP)
     */

    /**
     * The request has terminated as a result of a bye or cancel.
     */

    /**
     * RequestTerminated
     */

    /**
     * Not applicable.
     */
    constructor(message) {
      super(message, 31487);

      _defineProperty(this, "causes", []);

      _defineProperty(this, "description", 'Request Terminated (SIP)');

      _defineProperty(this, "explanation", 'The request has terminated as a result of a bye or cancel.');

      _defineProperty(this, "name", 'RequestTerminated');

      _defineProperty(this, "solutions", []);

      Object.setPrototypeOf(this, ClientErrors.RequestTerminated.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _ClientErrors.RequestTerminated = RequestTerminated;
})(ClientErrors || (ClientErrors = {}));

export let ServerErrors;
/**
 * @public
 * SIPServer errors.
 */

(function (_ServerErrors) {
  class InternalServerError extends TwilioError {
    /**
     * Not applicable.
     */

    /**
     * Internal Server Error (HTTP/SIP)
     */

    /**
     * The server could not fulfill the request due to some unexpected condition.
     */

    /**
     * InternalServerError
     */

    /**
     * Not applicable.
     */
    constructor(message) {
      super(message, 31500);

      _defineProperty(this, "causes", []);

      _defineProperty(this, "description", 'Internal Server Error (HTTP/SIP)');

      _defineProperty(this, "explanation", 'The server could not fulfill the request due to some unexpected condition.');

      _defineProperty(this, "name", 'InternalServerError');

      _defineProperty(this, "solutions", []);

      Object.setPrototypeOf(this, ServerErrors.InternalServerError.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _ServerErrors.InternalServerError = InternalServerError;

  class BadGateway extends TwilioError {
    /**
     * Not applicable.
     */

    /**
     * Bad Gateway (HTTP/SIP)
     */

    /**
     * The server is acting as a gateway or proxy, and received an invalid response from a downstream server while attempting to fulfill the request.
     */

    /**
     * BadGateway
     */

    /**
     * Not applicable.
     */
    constructor(message) {
      super(message, 31502);

      _defineProperty(this, "causes", []);

      _defineProperty(this, "description", 'Bad Gateway (HTTP/SIP)');

      _defineProperty(this, "explanation", 'The server is acting as a gateway or proxy, and received an invalid response from a downstream server while attempting to fulfill the request.');

      _defineProperty(this, "name", 'BadGateway');

      _defineProperty(this, "solutions", []);

      Object.setPrototypeOf(this, ServerErrors.BadGateway.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _ServerErrors.BadGateway = BadGateway;

  class ServiceUnavailable extends TwilioError {
    /**
     * Not applicable.
     */

    /**
     * Service Unavailable (HTTP/SIP)
     */

    /**
     * The server is currently unable to handle the request due to a temporary overloading or maintenance of the server. This error can also be caused by the Application SID provided in the access token pointing to an inaccessible URL.
     */

    /**
     * ServiceUnavailable
     */

    /**
     * Not applicable.
     */
    constructor(message) {
      super(message, 31503);

      _defineProperty(this, "causes", []);

      _defineProperty(this, "description", 'Service Unavailable (HTTP/SIP)');

      _defineProperty(this, "explanation", 'The server is currently unable to handle the request due to a temporary overloading or maintenance of the server. This error can also be caused by the Application SID provided in the access token pointing to an inaccessible URL.');

      _defineProperty(this, "name", 'ServiceUnavailable');

      _defineProperty(this, "solutions", []);

      Object.setPrototypeOf(this, ServerErrors.ServiceUnavailable.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _ServerErrors.ServiceUnavailable = ServiceUnavailable;

  class GatewayTimeout extends TwilioError {
    /**
     * Not applicable.
     */

    /**
     * Gateway Timeout (HTTP/SIP)
     */

    /**
     * The server, while acting as a gateway or proxy, did not receive a timely response from an upstream server.
     */

    /**
     * GatewayTimeout
     */

    /**
     * Not applicable.
     */
    constructor(message) {
      super(message, 31504);

      _defineProperty(this, "causes", []);

      _defineProperty(this, "description", 'Gateway Timeout (HTTP/SIP)');

      _defineProperty(this, "explanation", 'The server, while acting as a gateway or proxy, did not receive a timely response from an upstream server.');

      _defineProperty(this, "name", 'GatewayTimeout');

      _defineProperty(this, "solutions", []);

      Object.setPrototypeOf(this, ServerErrors.GatewayTimeout.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _ServerErrors.GatewayTimeout = GatewayTimeout;

  class DNSResolutionError extends TwilioError {
    /**
     * Not applicable.
     */

    /**
     * DNS Resolution Error (HTTP/SIP)
     */

    /**
     * Could not connect to the server.
     */

    /**
     * DNSResolutionError
     */

    /**
     * Not applicable.
     */
    constructor(message) {
      super(message, 31530);

      _defineProperty(this, "causes", []);

      _defineProperty(this, "description", 'DNS Resolution Error (HTTP/SIP)');

      _defineProperty(this, "explanation", 'Could not connect to the server.');

      _defineProperty(this, "name", 'DNSResolutionError');

      _defineProperty(this, "solutions", []);

      Object.setPrototypeOf(this, ServerErrors.DNSResolutionError.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _ServerErrors.DNSResolutionError = DNSResolutionError;
})(ServerErrors || (ServerErrors = {}));

export let SIPServerErrors;
/**
 * @public
 * TwiML errors.
 */

(function (_SIPServerErrors) {
  class BusyEverywhere extends TwilioError {
    /**
     * Not applicable.
     */

    /**
     * Busy Everywhere (SIP)
     */

    /**
     * All possible destinations are busy.
     */

    /**
     * BusyEverywhere
     */

    /**
     * Not applicable.
     */
    constructor(message) {
      super(message, 31600);

      _defineProperty(this, "causes", []);

      _defineProperty(this, "description", 'Busy Everywhere (SIP)');

      _defineProperty(this, "explanation", 'All possible destinations are busy.');

      _defineProperty(this, "name", 'BusyEverywhere');

      _defineProperty(this, "solutions", []);

      Object.setPrototypeOf(this, SIPServerErrors.BusyEverywhere.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _SIPServerErrors.BusyEverywhere = BusyEverywhere;

  class Decline extends TwilioError {
    /**
     * Not applicable.
     */

    /**
     * Decline (SIP)
     */

    /**
     * The callee does not wish to participate in the call.
     */

    /**
     * Decline
     */

    /**
     * Not applicable.
     */
    constructor(message) {
      super(message, 31603);

      _defineProperty(this, "causes", []);

      _defineProperty(this, "description", 'Decline (SIP)');

      _defineProperty(this, "explanation", 'The callee does not wish to participate in the call.');

      _defineProperty(this, "name", 'Decline');

      _defineProperty(this, "solutions", []);

      Object.setPrototypeOf(this, SIPServerErrors.Decline.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _SIPServerErrors.Decline = Decline;

  class DoesNotExistAnywhere extends TwilioError {
    /**
     * Not applicable.
     */

    /**
     * Does Not Exist Anywhere (SIP)
     */

    /**
     * The requested callee does not exist anywhere.
     */

    /**
     * DoesNotExistAnywhere
     */

    /**
     * Not applicable.
     */
    constructor(message) {
      super(message, 31604);

      _defineProperty(this, "causes", []);

      _defineProperty(this, "description", 'Does Not Exist Anywhere (SIP)');

      _defineProperty(this, "explanation", 'The requested callee does not exist anywhere.');

      _defineProperty(this, "name", 'DoesNotExistAnywhere');

      _defineProperty(this, "solutions", []);

      Object.setPrototypeOf(this, SIPServerErrors.DoesNotExistAnywhere.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _SIPServerErrors.DoesNotExistAnywhere = DoesNotExistAnywhere;
})(SIPServerErrors || (SIPServerErrors = {}));

export let TwiMLErrors;
/**
 * @public
 * General errors.
 */

(function (_TwiMLErrors) {
  class InvalidApplicationSid extends TwilioError {
    /**
     * Not applicable.
     */

    /**
     * Invalid ApplicationSid
     */

    /**
     * You attempted to initiate an outbound phone call with an invalid ApplicationSid. The application may not exist anymore or may not be available within your account
     */

    /**
     * InvalidApplicationSid
     */

    /**
     * Not applicable.
     */
    constructor(message) {
      super(message, 21218);

      _defineProperty(this, "causes", []);

      _defineProperty(this, "description", 'Invalid ApplicationSid');

      _defineProperty(this, "explanation", 'You attempted to initiate an outbound phone call with an invalid ApplicationSid. The application may not exist anymore or may not be available within your account');

      _defineProperty(this, "name", 'InvalidApplicationSid');

      _defineProperty(this, "solutions", []);

      Object.setPrototypeOf(this, TwiMLErrors.InvalidApplicationSid.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _TwiMLErrors.InvalidApplicationSid = InvalidApplicationSid;
})(TwiMLErrors || (TwiMLErrors = {}));

export let GeneralErrors;
/**
 * @public
 * MalformedRequest errors.
 */

(function (_GeneralErrors) {
  class ConnectionError extends TwilioError {
    /**
     * Not applicable.
     */

    /**
     * Connection error
     */

    /**
     * A connection error occurred during the call
     */

    /**
     * ConnectionError
     */

    /**
     * Not applicable.
     */
    constructor(message) {
      super(message, 31005);

      _defineProperty(this, "causes", []);

      _defineProperty(this, "description", 'Connection error');

      _defineProperty(this, "explanation", 'A connection error occurred during the call');

      _defineProperty(this, "name", 'ConnectionError');

      _defineProperty(this, "solutions", []);

      Object.setPrototypeOf(this, GeneralErrors.ConnectionError.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _GeneralErrors.ConnectionError = ConnectionError;

  class CallCancelledError extends TwilioError {
    /**
     * The incoming call was cancelled because it was not answered in time or it was accepted/rejected by another application instance registered with the same identity.
     */

    /**
     * Call cancelled
     */

    /**
     * Unable to answer because the call has ended
     */

    /**
     * CallCancelledError
     */

    /**
     * Not applicable.
     */
    constructor(message) {
      super(message, 31008);

      _defineProperty(this, "causes", ['The incoming call was cancelled because it was not answered in time or it was accepted/rejected by another application instance registered with the same identity.']);

      _defineProperty(this, "description", 'Call cancelled');

      _defineProperty(this, "explanation", 'Unable to answer because the call has ended');

      _defineProperty(this, "name", 'CallCancelledError');

      _defineProperty(this, "solutions", []);

      Object.setPrototypeOf(this, GeneralErrors.CallCancelledError.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _GeneralErrors.CallCancelledError = CallCancelledError;

  class TransportError extends TwilioError {
    /**
     * Not applicable.
     */

    /**
     * Transport error
     */

    /**
     * No transport available to send or receive messages
     */

    /**
     * TransportError
     */

    /**
     * Not applicable.
     */
    constructor(message) {
      super(message, 31009);

      _defineProperty(this, "causes", []);

      _defineProperty(this, "description", 'Transport error');

      _defineProperty(this, "explanation", 'No transport available to send or receive messages');

      _defineProperty(this, "name", 'TransportError');

      _defineProperty(this, "solutions", []);

      Object.setPrototypeOf(this, GeneralErrors.TransportError.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _GeneralErrors.TransportError = TransportError;
})(GeneralErrors || (GeneralErrors = {}));

export let MalformedRequestErrors;
/**
 * @public
 * Registration errors.
 */

(function (_MalformedRequestErrors) {
  class MalformedRequestError extends TwilioError {
    /**
     * No CallSid in the message object.
     * No VoiceEventSid in the message object.
     * No payload in the message object.
     * Invalid or missing payload in the message object.
     * No message type in the message object.
     */

    /**
     * The request had malformed syntax.
     */

    /**
     * The request could not be understood due to malformed syntax.
     */

    /**
     * MalformedRequestError
     */

    /**
     * Ensure the message object contains a valid CallSid.
     * Ensure the message object contains a valid VoiceEventSid.
     * Ensure the message object has a valid payload.
     * Ensure the message object has a valid message type.
     */
    constructor(message) {
      super(message, 31100);

      _defineProperty(this, "causes", ['No CallSid in the message object.', 'No VoiceEventSid in the message object.', 'No payload in the message object.', 'Invalid or missing payload in the message object.', 'No message type in the message object.']);

      _defineProperty(this, "description", 'The request had malformed syntax.');

      _defineProperty(this, "explanation", 'The request could not be understood due to malformed syntax.');

      _defineProperty(this, "name", 'MalformedRequestError');

      _defineProperty(this, "solutions", ['Ensure the message object contains a valid CallSid.', 'Ensure the message object contains a valid VoiceEventSid.', 'Ensure the message object has a valid payload.', 'Ensure the message object has a valid message type.']);

      Object.setPrototypeOf(this, MalformedRequestErrors.MalformedRequestError.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _MalformedRequestErrors.MalformedRequestError = MalformedRequestError;
})(MalformedRequestErrors || (MalformedRequestErrors = {}));

export let RegistrationErrors;
/**
 * @public
 * Signaling errors.
 */

(function (_RegistrationErrors) {
  class RegistrationError extends TwilioError {
    /**
     * Not applicable.
     */

    /**
     * Registration error
     */

    /**
     * 
     */

    /**
     * RegistrationError
     */

    /**
     * Not applicable.
     */
    constructor(message) {
      super(message, 31301);

      _defineProperty(this, "causes", []);

      _defineProperty(this, "description", 'Registration error');

      _defineProperty(this, "explanation", '');

      _defineProperty(this, "name", 'RegistrationError');

      _defineProperty(this, "solutions", []);

      Object.setPrototypeOf(this, RegistrationErrors.RegistrationError.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _RegistrationErrors.RegistrationError = RegistrationError;

  class UnsupportedCancelMessageError extends TwilioError {
    /**
     * The identity associated with the Twilio Voice SDK is still registered to receive cancel push notification messages.
     */

    /**
     * Unsupported Cancel Message Error
     */

    /**
     * This version of the SDK no longer supports processing cancel push notification messages. You must register via Voice.register(...) on Android or [TwilioVoice registerWithAccessToken:deviceToken:completion:] on iOS with this version of the SDK to stop receiving cancel push notification messages. Cancellations are now handled internally and reported to you on behalf of the SDK.
     */

    /**
     * UnsupportedCancelMessageError
     */

    /**
     * The application must register via Voice.register(...) on Android or [TwilioVoice registerWithAccessToken:deviceToken:completion:] on iOS to stop receiving cancel push notification messages.
     */
    constructor(message) {
      super(message, 31302);

      _defineProperty(this, "causes", ['The identity associated with the Twilio Voice SDK is still registered to receive cancel push notification messages.']);

      _defineProperty(this, "description", 'Unsupported Cancel Message Error');

      _defineProperty(this, "explanation", 'This version of the SDK no longer supports processing cancel push notification messages. You must register via Voice.register(...) on Android or [TwilioVoice registerWithAccessToken:deviceToken:completion:] on iOS with this version of the SDK to stop receiving cancel push notification messages. Cancellations are now handled internally and reported to you on behalf of the SDK.');

      _defineProperty(this, "name", 'UnsupportedCancelMessageError');

      _defineProperty(this, "solutions", ['The application must register via Voice.register(...) on Android or [TwilioVoice registerWithAccessToken:deviceToken:completion:] on iOS to stop receiving cancel push notification messages.']);

      Object.setPrototypeOf(this, RegistrationErrors.UnsupportedCancelMessageError.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _RegistrationErrors.UnsupportedCancelMessageError = UnsupportedCancelMessageError;
})(RegistrationErrors || (RegistrationErrors = {}));

export let SignalingErrors;
/**
 * @public
 * Media errors.
 */

(function (_SignalingErrors) {
  class ConnectionDisconnected extends TwilioError {
    /**
     * The device running your application lost its Internet connection.
     */

    /**
     * Signaling connection disconnected
     */

    /**
     * Raised whenever the signaling connection is unexpectedly disconnected.
     */

    /**
     * ConnectionDisconnected
     */

    /**
     * Ensure the device running your application has access to a stable Internet connection.
     */
    constructor(message) {
      super(message, 53001);

      _defineProperty(this, "causes", ['The device running your application lost its Internet connection.']);

      _defineProperty(this, "description", 'Signaling connection disconnected');

      _defineProperty(this, "explanation", 'Raised whenever the signaling connection is unexpectedly disconnected.');

      _defineProperty(this, "name", 'ConnectionDisconnected');

      _defineProperty(this, "solutions", ['Ensure the device running your application has access to a stable Internet connection.']);

      Object.setPrototypeOf(this, SignalingErrors.ConnectionDisconnected.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _SignalingErrors.ConnectionDisconnected = ConnectionDisconnected;
})(SignalingErrors || (SignalingErrors = {}));

export let MediaErrors;
/**
 * @internal
 */

(function (_MediaErrors) {
  class ClientLocalDescFailed extends TwilioError {
    /**
     * The Client may not be using a supported WebRTC implementation.
     * The Client may not have the necessary resources to create or apply a new media description.
     */

    /**
     * Client is unable to create or apply a local media description
     */

    /**
     * Raised whenever a Client is unable to create or apply a local media description.
     */

    /**
     * ClientLocalDescFailed
     */

    /**
     * If you are experiencing this error using the JavaScript SDK, ensure you are running it with a supported WebRTC implementation.
     */
    constructor(message) {
      super(message, 53400);

      _defineProperty(this, "causes", ['The Client may not be using a supported WebRTC implementation.', 'The Client may not have the necessary resources to create or apply a new media description.']);

      _defineProperty(this, "description", 'Client is unable to create or apply a local media description');

      _defineProperty(this, "explanation", 'Raised whenever a Client is unable to create or apply a local media description.');

      _defineProperty(this, "name", 'ClientLocalDescFailed');

      _defineProperty(this, "solutions", ['If you are experiencing this error using the JavaScript SDK, ensure you are running it with a supported WebRTC implementation.']);

      Object.setPrototypeOf(this, MediaErrors.ClientLocalDescFailed.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _MediaErrors.ClientLocalDescFailed = ClientLocalDescFailed;

  class ServerLocalDescFailed extends TwilioError {
    /**
     * A server-side error has occurred.
     */

    /**
     * Server is unable to create or apply a local media description
     */

    /**
     * Raised whenever the Server is unable to create or apply a local media description.
     */

    /**
     * ServerLocalDescFailed
     */

    /**
     * If the problem persists, try connecting to another region.
     */
    constructor(message) {
      super(message, 53401);

      _defineProperty(this, "causes", ['A server-side error has occurred.']);

      _defineProperty(this, "description", 'Server is unable to create or apply a local media description');

      _defineProperty(this, "explanation", 'Raised whenever the Server is unable to create or apply a local media description.');

      _defineProperty(this, "name", 'ServerLocalDescFailed');

      _defineProperty(this, "solutions", ['If the problem persists, try connecting to another region.']);

      Object.setPrototypeOf(this, MediaErrors.ServerLocalDescFailed.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _MediaErrors.ServerLocalDescFailed = ServerLocalDescFailed;

  class ClientRemoteDescFailed extends TwilioError {
    /**
     * The Client may not be using a supported WebRTC implementation.
     * The Client may be connecting peer-to-peer with another Participant that is not using a supported WebRTC implementation.
     * The Client may not have the necessary resources to apply a new media description.
     */

    /**
     * Client is unable to apply a remote media description
     */

    /**
     * Raised whenever the Client receives a remote media description but is unable to apply it.
     */

    /**
     * ClientRemoteDescFailed
     */

    /**
     * If you are experiencing this error using the JavaScript SDK, ensure you are running it with a supported WebRTC implementation.
     */
    constructor(message) {
      super(message, 53402);

      _defineProperty(this, "causes", ['The Client may not be using a supported WebRTC implementation.', 'The Client may be connecting peer-to-peer with another Participant that is not using a supported WebRTC implementation.', 'The Client may not have the necessary resources to apply a new media description.']);

      _defineProperty(this, "description", 'Client is unable to apply a remote media description');

      _defineProperty(this, "explanation", 'Raised whenever the Client receives a remote media description but is unable to apply it.');

      _defineProperty(this, "name", 'ClientRemoteDescFailed');

      _defineProperty(this, "solutions", ['If you are experiencing this error using the JavaScript SDK, ensure you are running it with a supported WebRTC implementation.']);

      Object.setPrototypeOf(this, MediaErrors.ClientRemoteDescFailed.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _MediaErrors.ClientRemoteDescFailed = ClientRemoteDescFailed;

  class ServerRemoteDescFailed extends TwilioError {
    /**
     * The Client may not be using a supported WebRTC implementation.
     * The Client may not have the necessary resources to apply a new media description.
     * A Server-side error may have caused the Server to generate an invalid media description.
     */

    /**
     * Server is unable to apply a remote media description
     */

    /**
     * Raised whenever the Server receives a remote media description but is unable to apply it.
     */

    /**
     * ServerRemoteDescFailed
     */

    /**
     * If you are experiencing this error using the JavaScript SDK, ensure you are running it with a supported WebRTC implementation.
     * If the problem persists, try connecting to another region.
     */
    constructor(message) {
      super(message, 53403);

      _defineProperty(this, "causes", ['The Client may not be using a supported WebRTC implementation.', 'The Client may not have the necessary resources to apply a new media description.', 'A Server-side error may have caused the Server to generate an invalid media description.']);

      _defineProperty(this, "description", 'Server is unable to apply a remote media description');

      _defineProperty(this, "explanation", 'Raised whenever the Server receives a remote media description but is unable to apply it.');

      _defineProperty(this, "name", 'ServerRemoteDescFailed');

      _defineProperty(this, "solutions", ['If you are experiencing this error using the JavaScript SDK, ensure you are running it with a supported WebRTC implementation.', 'If the problem persists, try connecting to another region.']);

      Object.setPrototypeOf(this, MediaErrors.ServerRemoteDescFailed.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _MediaErrors.ServerRemoteDescFailed = ServerRemoteDescFailed;

  class NoSupportedCodec extends TwilioError {
    /**
     * The C++ SDK was built without the recommended set of codecs.
     * The JavaScript SDK is running in a browser that does not implement the recommended set of codecs.
     */

    /**
     * No supported codec
     */

    /**
     * Raised whenever the intersection of codecs supported by the Client and the Server (or, in peer-to-peer, the Client and another Participant) is empty.
     */

    /**
     * NoSupportedCodec
     */

    /**
     * If you are experiencing this error using the C++ SDK, ensure you build it with the recommended set of codecs.
     * If you are experiencing this error using the JavaScript SDK, ensure you are using a compatible browser.
     */
    constructor(message) {
      super(message, 53404);

      _defineProperty(this, "causes", ['The C++ SDK was built without the recommended set of codecs.', 'The JavaScript SDK is running in a browser that does not implement the recommended set of codecs.']);

      _defineProperty(this, "description", 'No supported codec');

      _defineProperty(this, "explanation", 'Raised whenever the intersection of codecs supported by the Client and the Server (or, in peer-to-peer, the Client and another Participant) is empty.');

      _defineProperty(this, "name", 'NoSupportedCodec');

      _defineProperty(this, "solutions", ['If you are experiencing this error using the C++ SDK, ensure you build it with the recommended set of codecs.', 'If you are experiencing this error using the JavaScript SDK, ensure you are using a compatible browser.']);

      Object.setPrototypeOf(this, MediaErrors.NoSupportedCodec.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _MediaErrors.NoSupportedCodec = NoSupportedCodec;

  class ConnectionError extends TwilioError {
    /**
     * The Client was unable to establish a media connection.
     * A media connection which was active failed liveliness checks.
     */

    /**
     * Media connection failed
     */

    /**
     * Raised by the Client or Server whenever a media connection fails.
     */

    /**
     * ConnectionError
     */

    /**
     * If the problem persists, try connecting to another region.
     * Check your Client's network connectivity.
     * If you've provided custom ICE Servers then ensure that the URLs and credentials are valid.
     */
    constructor(message) {
      super(message, 53405);

      _defineProperty(this, "causes", ['The Client was unable to establish a media connection.', 'A media connection which was active failed liveliness checks.']);

      _defineProperty(this, "description", 'Media connection failed');

      _defineProperty(this, "explanation", 'Raised by the Client or Server whenever a media connection fails.');

      _defineProperty(this, "name", 'ConnectionError');

      _defineProperty(this, "solutions", ['If the problem persists, try connecting to another region.', 'Check your Client\'s network connectivity.', 'If you\'ve provided custom ICE Servers then ensure that the URLs and credentials are valid.']);

      Object.setPrototypeOf(this, MediaErrors.ConnectionError.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _MediaErrors.ConnectionError = ConnectionError;

  class MediaDtlsTransportFailedError extends TwilioError {
    /**
     * One or both of the DTLS peers have an invalid certificate.
     * One or both of the DTLS peers have an outdated version of DTLS.
     * One or both of the DTLS peers lost internet connectivity while performing a DTLS handshake.
     */

    /**
     * The media connection failed due to DTLS handshake failure
     */

    /**
     * There was a problem while negotiating with the remote DTLS peer. Therefore the Client will not be able to establish the media connection.
     */

    /**
     * MediaDtlsTransportFailedError
     */

    /**
     * Ensure that your certificate is valid.
     * Ensure that you have a stable internet connection.
     * Ensure that the browser or the Mobile SDK supports newer versions of DTLS.
     */
    constructor(message) {
      super(message, 53407);

      _defineProperty(this, "causes", ['One or both of the DTLS peers have an invalid certificate.', 'One or both of the DTLS peers have an outdated version of DTLS.', 'One or both of the DTLS peers lost internet connectivity while performing a DTLS handshake.']);

      _defineProperty(this, "description", 'The media connection failed due to DTLS handshake failure');

      _defineProperty(this, "explanation", 'There was a problem while negotiating with the remote DTLS peer. Therefore the Client will not be able to establish the media connection.');

      _defineProperty(this, "name", 'MediaDtlsTransportFailedError');

      _defineProperty(this, "solutions", ['Ensure that your certificate is valid.', 'Ensure that you have a stable internet connection.', 'Ensure that the browser or the Mobile SDK supports newer versions of DTLS.']);

      Object.setPrototypeOf(this, MediaErrors.MediaDtlsTransportFailedError.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }

  }

  _MediaErrors.MediaDtlsTransportFailedError = MediaDtlsTransportFailedError;
})(MediaErrors || (MediaErrors = {}));

export const errorsByCode = new Map([[20101, AuthorizationErrors.AccessTokenInvalid], [20102, AuthorizationErrors.AccessTokenHeaderInvalid], [20103, AuthorizationErrors.AccessTokenIssuerInvalid], [20104, AuthorizationErrors.AccessTokenExpired], [20105, AuthorizationErrors.AccessTokenNotYetValid], [20106, AuthorizationErrors.AccessTokenGrantsInvalid], [20107, AuthorizationErrors.AccessTokenSignatureInvalid], [20151, AuthorizationErrors.AuthenticationFailed], [20157, AuthorizationErrors.ExpirationTimeExceedsMaxTimeAllowed], [20403, ForbiddenErrors.Forbidden], [21218, TwiMLErrors.InvalidApplicationSid], [31005, GeneralErrors.ConnectionError], [31008, GeneralErrors.CallCancelledError], [31009, GeneralErrors.TransportError], [31100, MalformedRequestErrors.MalformedRequestError], [31201, AuthorizationErrors.AuthorizationError], [31206, AuthorizationErrors.RateExceededError], [31301, RegistrationErrors.RegistrationError], [31302, RegistrationErrors.UnsupportedCancelMessageError], [31400, ClientErrors.BadRequest], [31403, ClientErrors.Forbidden], [31404, ClientErrors.NotFound], [31408, ClientErrors.RequestTimeout], [31409, ClientErrors.Conflict], [31426, ClientErrors.UpgradeRequired], [31429, ClientErrors.TooManyRequests], [31480, ClientErrors.TemporarilyUnavailable], [31481, ClientErrors.CallTransactionDoesNotExist], [31484, ClientErrors.AddressIncomplete], [31486, ClientErrors.BusyHere], [31487, ClientErrors.RequestTerminated], [31500, ServerErrors.InternalServerError], [31502, ServerErrors.BadGateway], [31503, ServerErrors.ServiceUnavailable], [31504, ServerErrors.GatewayTimeout], [31530, ServerErrors.DNSResolutionError], [31600, SIPServerErrors.BusyEverywhere], [31603, SIPServerErrors.Decline], [31604, SIPServerErrors.DoesNotExistAnywhere], [51007, AuthorizationErrors.AccessTokenRejected], [53001, SignalingErrors.ConnectionDisconnected], [53400, MediaErrors.ClientLocalDescFailed], [53401, MediaErrors.ServerLocalDescFailed], [53402, MediaErrors.ClientRemoteDescFailed], [53403, MediaErrors.ServerRemoteDescFailed], [53404, MediaErrors.NoSupportedCodec], [53405, MediaErrors.ConnectionError], [53407, MediaErrors.MediaDtlsTransportFailedError]]);
Object.freeze(errorsByCode);
//# sourceMappingURL=generated.js.map