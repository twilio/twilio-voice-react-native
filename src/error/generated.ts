/**
 * This is a generated file. Any modifications here will be overwritten.
 * See scripts/errors.js.
 */
import { TwilioError } from './TwilioError';

/**
 * @public
 * Authorization errors.
 */
export namespace AuthorizationErrors {
  /**
   * @public
   * AuthorizationErrors.AccessTokenInvalid error.
   * Error code `20101`.
   */
  export class AccessTokenInvalid extends TwilioError {
    /**
     * Not applicable.
     */
    causes: string[] = [];
    /**
     * Invalid access token
     */
    description: string = 'Invalid access token';
    /**
     * Twilio was unable to validate your Access Token
     */
    explanation: string = 'Twilio was unable to validate your Access Token';
    /**
     * AccessTokenInvalid
     */
    name: string = 'AccessTokenInvalid';
    /**
     * Not applicable.
     */
    solutions: string[] = [];

    constructor(message: string) {
      super(message, 20101);
      Object.setPrototypeOf(this, AuthorizationErrors.AccessTokenInvalid.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * AuthorizationErrors.AccessTokenHeaderInvalid error.
   * Error code `20102`.
   */
  export class AccessTokenHeaderInvalid extends TwilioError {
    /**
     * Not applicable.
     */
    causes: string[] = [];
    /**
     * Invalid access token header
     */
    description: string = 'Invalid access token header';
    /**
     * The header of the Access Token provided to the Twilio API was invalid
     */
    explanation: string = 'The header of the Access Token provided to the Twilio API was invalid';
    /**
     * AccessTokenHeaderInvalid
     */
    name: string = 'AccessTokenHeaderInvalid';
    /**
     * Not applicable.
     */
    solutions: string[] = [];

    constructor(message: string) {
      super(message, 20102);
      Object.setPrototypeOf(this, AuthorizationErrors.AccessTokenHeaderInvalid.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * AuthorizationErrors.AccessTokenIssuerInvalid error.
   * Error code `20103`.
   */
  export class AccessTokenIssuerInvalid extends TwilioError {
    /**
     * Not applicable.
     */
    causes: string[] = [];
    /**
     * Invalid access token issuer/subject
     */
    description: string = 'Invalid access token issuer/subject';
    /**
     * The issuer or subject of the Access Token provided to the Twilio API was invalid
     */
    explanation: string = 'The issuer or subject of the Access Token provided to the Twilio API was invalid';
    /**
     * AccessTokenIssuerInvalid
     */
    name: string = 'AccessTokenIssuerInvalid';
    /**
     * Not applicable.
     */
    solutions: string[] = [];

    constructor(message: string) {
      super(message, 20103);
      Object.setPrototypeOf(this, AuthorizationErrors.AccessTokenIssuerInvalid.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * AuthorizationErrors.AccessTokenExpired error.
   * Error code `20104`.
   */
  export class AccessTokenExpired extends TwilioError {
    /**
     * Not applicable.
     */
    causes: string[] = [];
    /**
     * Access token expired or expiration date invalid
     */
    description: string = 'Access token expired or expiration date invalid';
    /**
     * The Access Token provided to the Twilio API has expired, the expiration time specified in the token was invalid, or the expiration time specified was too far in the future
     */
    explanation: string = 'The Access Token provided to the Twilio API has expired, the expiration time specified in the token was invalid, or the expiration time specified was too far in the future';
    /**
     * AccessTokenExpired
     */
    name: string = 'AccessTokenExpired';
    /**
     * Not applicable.
     */
    solutions: string[] = [];

    constructor(message: string) {
      super(message, 20104);
      Object.setPrototypeOf(this, AuthorizationErrors.AccessTokenExpired.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * AuthorizationErrors.AccessTokenNotYetValid error.
   * Error code `20105`.
   */
  export class AccessTokenNotYetValid extends TwilioError {
    /**
     * Not applicable.
     */
    causes: string[] = [];
    /**
     * Access token not yet valid
     */
    description: string = 'Access token not yet valid';
    /**
     * The Access Token provided to the Twilio API is not yet valid
     */
    explanation: string = 'The Access Token provided to the Twilio API is not yet valid';
    /**
     * AccessTokenNotYetValid
     */
    name: string = 'AccessTokenNotYetValid';
    /**
     * Not applicable.
     */
    solutions: string[] = [];

    constructor(message: string) {
      super(message, 20105);
      Object.setPrototypeOf(this, AuthorizationErrors.AccessTokenNotYetValid.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * AuthorizationErrors.AccessTokenGrantsInvalid error.
   * Error code `20106`.
   */
  export class AccessTokenGrantsInvalid extends TwilioError {
    /**
     * Not applicable.
     */
    causes: string[] = [];
    /**
     * Invalid access token grants
     */
    description: string = 'Invalid access token grants';
    /**
     * The Access Token signature and issuer were valid, but the grants specified in the token were invalid, unparseable, or did not authorize the action being requested
     */
    explanation: string = 'The Access Token signature and issuer were valid, but the grants specified in the token were invalid, unparseable, or did not authorize the action being requested';
    /**
     * AccessTokenGrantsInvalid
     */
    name: string = 'AccessTokenGrantsInvalid';
    /**
     * Not applicable.
     */
    solutions: string[] = [];

    constructor(message: string) {
      super(message, 20106);
      Object.setPrototypeOf(this, AuthorizationErrors.AccessTokenGrantsInvalid.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * AuthorizationErrors.AccessTokenSignatureInvalid error.
   * Error code `20107`.
   */
  export class AccessTokenSignatureInvalid extends TwilioError {
    /**
     * Not applicable.
     */
    causes: string[] = [];
    /**
     * Invalid access token signature
     */
    description: string = 'Invalid access token signature';
    /**
     * The signature for the Access Token provided was invalid.
     */
    explanation: string = 'The signature for the Access Token provided was invalid.';
    /**
     * AccessTokenSignatureInvalid
     */
    name: string = 'AccessTokenSignatureInvalid';
    /**
     * Not applicable.
     */
    solutions: string[] = [];

    constructor(message: string) {
      super(message, 20107);
      Object.setPrototypeOf(this, AuthorizationErrors.AccessTokenSignatureInvalid.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * AuthorizationErrors.AuthenticationFailed error.
   * Error code `20151`.
   */
  export class AuthenticationFailed extends TwilioError {
    /**
     * Not applicable.
     */
    causes: string[] = [];
    /**
     * Authentication Failed
     */
    description: string = 'Authentication Failed';
    /**
     * The Authentication with the provided JWT failed
     */
    explanation: string = 'The Authentication with the provided JWT failed';
    /**
     * AuthenticationFailed
     */
    name: string = 'AuthenticationFailed';
    /**
     * Not applicable.
     */
    solutions: string[] = [];

    constructor(message: string) {
      super(message, 20151);
      Object.setPrototypeOf(this, AuthorizationErrors.AuthenticationFailed.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * AuthorizationErrors.ExpirationTimeExceedsMaxTimeAllowed error.
   * Error code `20157`.
   */
  export class ExpirationTimeExceedsMaxTimeAllowed extends TwilioError {
    /**
     * Not applicable.
     */
    causes: string[] = [];
    /**
     * Expiration Time Exceeds Maximum Time Allowed
     */
    description: string = 'Expiration Time Exceeds Maximum Time Allowed';
    /**
     * The expiration time provided when creating the JWT exceeds the maximum duration allowed
     */
    explanation: string = 'The expiration time provided when creating the JWT exceeds the maximum duration allowed';
    /**
     * ExpirationTimeExceedsMaxTimeAllowed
     */
    name: string = 'ExpirationTimeExceedsMaxTimeAllowed';
    /**
     * Not applicable.
     */
    solutions: string[] = [];

    constructor(message: string) {
      super(message, 20157);
      Object.setPrototypeOf(this, AuthorizationErrors.ExpirationTimeExceedsMaxTimeAllowed.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * AuthorizationErrors.AuthorizationError error.
   * Error code `31201`.
   */
  export class AuthorizationError extends TwilioError {
    /**
     * Not applicable.
     */
    causes: string[] = [];
    /**
     * Authorization error
     */
    description: string = 'Authorization error';
    /**
     * The request requires user authentication. The server understood the request, but is refusing to fulfill it.
     */
    explanation: string = 'The request requires user authentication. The server understood the request, but is refusing to fulfill it.';
    /**
     * AuthorizationError
     */
    name: string = 'AuthorizationError';
    /**
     * Not applicable.
     */
    solutions: string[] = [];

    constructor(message: string) {
      super(message, 31201);
      Object.setPrototypeOf(this, AuthorizationErrors.AuthorizationError.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * AuthorizationErrors.RateExceededError error.
   * Error code `31206`.
   */
  export class RateExceededError extends TwilioError {
    /**
     * Rate limit exceeded.
     */
    causes: string[] = [
      'Rate limit exceeded.',
    ];
    /**
     * Rate exceeded authorized limit.
     */
    description: string = 'Rate exceeded authorized limit.';
    /**
     * The request performed exceeds the authorized limit.
     */
    explanation: string = 'The request performed exceeds the authorized limit.';
    /**
     * RateExceededError
     */
    name: string = 'RateExceededError';
    /**
     * Ensure message send rate does not exceed authorized limits.
     */
    solutions: string[] = [
      'Ensure message send rate does not exceed authorized limits.',
    ];

    constructor(message: string) {
      super(message, 31206);
      Object.setPrototypeOf(this, AuthorizationErrors.RateExceededError.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * AuthorizationErrors.CallMessageEventTypeInvalidError error.
   * Error code `31210`.
   */
  export class CallMessageEventTypeInvalidError extends TwilioError {
    /**
     * The Call Message Event Type is invalid and is not understood by Twilio Voice.
     */
    causes: string[] = [
      'The Call Message Event Type is invalid and is not understood by Twilio Voice.',
    ];
    /**
     * Call Message Event Type is invalid.
     */
    description: string = 'Call Message Event Type is invalid.';
    /**
     * The Call Message Event Type is invalid and is not understood by Twilio Voice.
     */
    explanation: string = 'The Call Message Event Type is invalid and is not understood by Twilio Voice.';
    /**
     * CallMessageEventTypeInvalidError
     */
    name: string = 'CallMessageEventTypeInvalidError';
    /**
     * Ensure the Call Message Event Type is Valid and understood by Twilio Voice and try again.
     */
    solutions: string[] = [
      'Ensure the Call Message Event Type is Valid and understood by Twilio Voice and try again.',
    ];

    constructor(message: string) {
      super(message, 31210);
      Object.setPrototypeOf(this, AuthorizationErrors.CallMessageEventTypeInvalidError.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * AuthorizationErrors.CallMessageUnexpectedStateError error.
   * Error code `31211`.
   */
  export class CallMessageUnexpectedStateError extends TwilioError {
    /**
     * The Call should be at least in the ringing state to subscribe and send Call Message.
     */
    causes: string[] = [
      'The Call should be at least in the ringing state to subscribe and send Call Message.',
    ];
    /**
     * Call is not in the expected state.
     */
    description: string = 'Call is not in the expected state.';
    /**
     * The Call should be at least in the ringing state to send Call Message.
     */
    explanation: string = 'The Call should be at least in the ringing state to send Call Message.';
    /**
     * CallMessageUnexpectedStateError
     */
    name: string = 'CallMessageUnexpectedStateError';
    /**
     * Ensure the Call is at least in the ringing state and the subscription is successful and try again.
     */
    solutions: string[] = [
      'Ensure the Call is at least in the ringing state and the subscription is successful and try again.',
    ];

    constructor(message: string) {
      super(message, 31211);
      Object.setPrototypeOf(this, AuthorizationErrors.CallMessageUnexpectedStateError.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * AuthorizationErrors.PayloadSizeExceededError error.
   * Error code `31212`.
   */
  export class PayloadSizeExceededError extends TwilioError {
    /**
     * The payload size of Call Message Event exceeds the authorized limit.
     */
    causes: string[] = [
      'The payload size of Call Message Event exceeds the authorized limit.',
    ];
    /**
     * Call Message Event Payload size exceeded authorized limit.
     */
    description: string = 'Call Message Event Payload size exceeded authorized limit.';
    /**
     * The request performed to send a Call Message Event exceeds the payload size authorized limit
     */
    explanation: string = 'The request performed to send a Call Message Event exceeds the payload size authorized limit';
    /**
     * PayloadSizeExceededError
     */
    name: string = 'PayloadSizeExceededError';
    /**
     * Reduce payload size of Call Message Event to be within the authorized limit and try again.
     */
    solutions: string[] = [
      'Reduce payload size of Call Message Event to be within the authorized limit and try again.',
    ];

    constructor(message: string) {
      super(message, 31212);
      Object.setPrototypeOf(this, AuthorizationErrors.PayloadSizeExceededError.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * AuthorizationErrors.AccessTokenRejected error.
   * Error code `51007`.
   */
  export class AccessTokenRejected extends TwilioError {
    /**
     * Not applicable.
     */
    causes: string[] = [];
    /**
     * Token authentication is rejected by authentication service
     */
    description: string = 'Token authentication is rejected by authentication service';
    /**
     * The authentication service has rejected the provided Access Token. To check whether the Access Token is structurally correct, you can use the tools available at https://jwt.io. For the details of Twilio's specific Access Token implementation including the grant format, check https://www.twilio.com/docs/iam/access-tokens.
     */
    explanation: string = 'The authentication service has rejected the provided Access Token. To check whether the Access Token is structurally correct, you can use the tools available at https://jwt.io. For the details of Twilio\'s specific Access Token implementation including the grant format, check https://www.twilio.com/docs/iam/access-tokens.';
    /**
     * AccessTokenRejected
     */
    name: string = 'AccessTokenRejected';
    /**
     * Not applicable.
     */
    solutions: string[] = [];

    constructor(message: string) {
      super(message, 51007);
      Object.setPrototypeOf(this, AuthorizationErrors.AccessTokenRejected.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
}

/**
 * @public
 * Forbidden errors.
 */
export namespace ForbiddenErrors {
  /**
   * @public
   * ForbiddenErrors.Forbidden error.
   * Error code `20403`.
   */
  export class Forbidden extends TwilioError {
    /**
     * Not applicable.
     */
    causes: string[] = [];
    /**
     * 403 Forbidden
     */
    description: string = '403 Forbidden';
    /**
     * The account lacks permission to access the Twilio API. Typically this means the account has been suspended or closed. For assistance, please contact support
     */
    explanation: string = 'The account lacks permission to access the Twilio API. Typically this means the account has been suspended or closed. For assistance, please contact support';
    /**
     * Forbidden
     */
    name: string = 'Forbidden';
    /**
     * Not applicable.
     */
    solutions: string[] = [];

    constructor(message: string) {
      super(message, 20403);
      Object.setPrototypeOf(this, ForbiddenErrors.Forbidden.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
}

/**
 * @public
 * Client errors.
 */
export namespace ClientErrors {
  /**
   * @public
   * ClientErrors.BadRequest error.
   * Error code `31400`.
   */
  export class BadRequest extends TwilioError {
    /**
     * Not applicable.
     */
    causes: string[] = [];
    /**
     * Bad Request (HTTP/SIP)
     */
    description: string = 'Bad Request (HTTP/SIP)';
    /**
     * The request could not be understood due to malformed syntax.
     */
    explanation: string = 'The request could not be understood due to malformed syntax.';
    /**
     * BadRequest
     */
    name: string = 'BadRequest';
    /**
     * Not applicable.
     */
    solutions: string[] = [];

    constructor(message: string) {
      super(message, 31400);
      Object.setPrototypeOf(this, ClientErrors.BadRequest.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * ClientErrors.Forbidden error.
   * Error code `31403`.
   */
  export class Forbidden extends TwilioError {
    /**
     * Not applicable.
     */
    causes: string[] = [];
    /**
     * Forbidden (HTTP/SIP)
     */
    description: string = 'Forbidden (HTTP/SIP)';
    /**
     * The server understood the request, but is refusing to fulfill it.
     */
    explanation: string = 'The server understood the request, but is refusing to fulfill it.';
    /**
     * Forbidden
     */
    name: string = 'Forbidden';
    /**
     * Not applicable.
     */
    solutions: string[] = [];

    constructor(message: string) {
      super(message, 31403);
      Object.setPrototypeOf(this, ClientErrors.Forbidden.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * ClientErrors.NotFound error.
   * Error code `31404`.
   */
  export class NotFound extends TwilioError {
    /**
     * The outbound call was made to an invalid phone number.
     * The TwiML application sid is missing a Voice URL.
     */
    causes: string[] = [
      'The outbound call was made to an invalid phone number.',
      'The TwiML application sid is missing a Voice URL.',
    ];
    /**
     * Not Found (HTTP/SIP)
     */
    description: string = 'Not Found (HTTP/SIP)';
    /**
     * The server has not found anything matching the request.
     */
    explanation: string = 'The server has not found anything matching the request.';
    /**
     * NotFound
     */
    name: string = 'NotFound';
    /**
     * Ensure the phone number dialed is valid.
     * Ensure the TwiML application is configured correctly with a Voice URL link.
     */
    solutions: string[] = [
      'Ensure the phone number dialed is valid.',
      'Ensure the TwiML application is configured correctly with a Voice URL link.',
    ];

    constructor(message: string) {
      super(message, 31404);
      Object.setPrototypeOf(this, ClientErrors.NotFound.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * ClientErrors.RequestTimeout error.
   * Error code `31408`.
   */
  export class RequestTimeout extends TwilioError {
    /**
     * Not applicable.
     */
    causes: string[] = [];
    /**
     * Request Timeout (HTTP/SIP)
     */
    description: string = 'Request Timeout (HTTP/SIP)';
    /**
     * A request timeout occurred.
     */
    explanation: string = 'A request timeout occurred.';
    /**
     * RequestTimeout
     */
    name: string = 'RequestTimeout';
    /**
     * Not applicable.
     */
    solutions: string[] = [];

    constructor(message: string) {
      super(message, 31408);
      Object.setPrototypeOf(this, ClientErrors.RequestTimeout.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * ClientErrors.Conflict error.
   * Error code `31409`.
   */
  export class Conflict extends TwilioError {
    /**
     * Not applicable.
     */
    causes: string[] = [];
    /**
     * Conflict (HTTP)
     */
    description: string = 'Conflict (HTTP)';
    /**
     * The request could not be processed because of a conflict in the current state of the resource. Another request may be in progress.
     */
    explanation: string = 'The request could not be processed because of a conflict in the current state of the resource. Another request may be in progress.';
    /**
     * Conflict
     */
    name: string = 'Conflict';
    /**
     * Not applicable.
     */
    solutions: string[] = [];

    constructor(message: string) {
      super(message, 31409);
      Object.setPrototypeOf(this, ClientErrors.Conflict.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * ClientErrors.UpgradeRequired error.
   * Error code `31426`.
   */
  export class UpgradeRequired extends TwilioError {
    /**
     * Not applicable.
     */
    causes: string[] = [];
    /**
     * Upgrade Required (HTTP)
     */
    description: string = 'Upgrade Required (HTTP)';
    /**
     * This error is raised when an HTTP 426 response is received. The reason for this is most likely because of an incompatible TLS version. To mitigate this, you may need to upgrade the OS or download a more recent version of the SDK.
     */
    explanation: string = 'This error is raised when an HTTP 426 response is received. The reason for this is most likely because of an incompatible TLS version. To mitigate this, you may need to upgrade the OS or download a more recent version of the SDK.';
    /**
     * UpgradeRequired
     */
    name: string = 'UpgradeRequired';
    /**
     * Not applicable.
     */
    solutions: string[] = [];

    constructor(message: string) {
      super(message, 31426);
      Object.setPrototypeOf(this, ClientErrors.UpgradeRequired.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * ClientErrors.TooManyRequests error.
   * Error code `31429`.
   */
  export class TooManyRequests extends TwilioError {
    /**
     * Not applicable.
     */
    causes: string[] = [];
    /**
     * Too Many Requests (HTTP)
     */
    description: string = 'Too Many Requests (HTTP)';
    /**
     * Too many requests were sent in a given amount of time.
     */
    explanation: string = 'Too many requests were sent in a given amount of time.';
    /**
     * TooManyRequests
     */
    name: string = 'TooManyRequests';
    /**
     * Not applicable.
     */
    solutions: string[] = [];

    constructor(message: string) {
      super(message, 31429);
      Object.setPrototypeOf(this, ClientErrors.TooManyRequests.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * ClientErrors.TemporarilyUnavailable error.
   * Error code `31480`.
   */
  export class TemporarilyUnavailable extends TwilioError {
    /**
     * Not applicable.
     */
    causes: string[] = [];
    /**
     * Temporarily Unavailable (SIP)
     */
    description: string = 'Temporarily Unavailable (SIP)';
    /**
     * The callee is currently unavailable.
     */
    explanation: string = 'The callee is currently unavailable.';
    /**
     * TemporarilyUnavailable
     */
    name: string = 'TemporarilyUnavailable';
    /**
     * Not applicable.
     */
    solutions: string[] = [];

    constructor(message: string) {
      super(message, 31480);
      Object.setPrototypeOf(this, ClientErrors.TemporarilyUnavailable.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * ClientErrors.CallTransactionDoesNotExist error.
   * Error code `31481`.
   */
  export class CallTransactionDoesNotExist extends TwilioError {
    /**
     * Not applicable.
     */
    causes: string[] = [];
    /**
     * Call/Transaction Does Not Exist (SIP)
     */
    description: string = 'Call/Transaction Does Not Exist (SIP)';
    /**
     * The call no longer exists.
     */
    explanation: string = 'The call no longer exists.';
    /**
     * CallTransactionDoesNotExist
     */
    name: string = 'CallTransactionDoesNotExist';
    /**
     * Not applicable.
     */
    solutions: string[] = [];

    constructor(message: string) {
      super(message, 31481);
      Object.setPrototypeOf(this, ClientErrors.CallTransactionDoesNotExist.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * ClientErrors.AddressIncomplete error.
   * Error code `31484`.
   */
  export class AddressIncomplete extends TwilioError {
    /**
     * The outbound call was made with a phone number that has an invalid format.
     */
    causes: string[] = [
      'The outbound call was made with a phone number that has an invalid format.',
    ];
    /**
     * Address Incomplete (SIP)
     */
    description: string = 'Address Incomplete (SIP)';
    /**
     * The provided phone number is malformed.
     */
    explanation: string = 'The provided phone number is malformed.';
    /**
     * AddressIncomplete
     */
    name: string = 'AddressIncomplete';
    /**
     * Ensure the phone number dialed is formatted correctly.
     */
    solutions: string[] = [
      'Ensure the phone number dialed is formatted correctly.',
    ];

    constructor(message: string) {
      super(message, 31484);
      Object.setPrototypeOf(this, ClientErrors.AddressIncomplete.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * ClientErrors.BusyHere error.
   * Error code `31486`.
   */
  export class BusyHere extends TwilioError {
    /**
     * Not applicable.
     */
    causes: string[] = [];
    /**
     * Busy Here (SIP)
     */
    description: string = 'Busy Here (SIP)';
    /**
     * The callee is busy.
     */
    explanation: string = 'The callee is busy.';
    /**
     * BusyHere
     */
    name: string = 'BusyHere';
    /**
     * Not applicable.
     */
    solutions: string[] = [];

    constructor(message: string) {
      super(message, 31486);
      Object.setPrototypeOf(this, ClientErrors.BusyHere.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * ClientErrors.RequestTerminated error.
   * Error code `31487`.
   */
  export class RequestTerminated extends TwilioError {
    /**
     * Not applicable.
     */
    causes: string[] = [];
    /**
     * Request Terminated (SIP)
     */
    description: string = 'Request Terminated (SIP)';
    /**
     * The request has terminated as a result of a bye or cancel.
     */
    explanation: string = 'The request has terminated as a result of a bye or cancel.';
    /**
     * RequestTerminated
     */
    name: string = 'RequestTerminated';
    /**
     * Not applicable.
     */
    solutions: string[] = [];

    constructor(message: string) {
      super(message, 31487);
      Object.setPrototypeOf(this, ClientErrors.RequestTerminated.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
}

/**
 * @public
 * Server errors.
 */
export namespace ServerErrors {
  /**
   * @public
   * ServerErrors.InternalServerError error.
   * Error code `31500`.
   */
  export class InternalServerError extends TwilioError {
    /**
     * Not applicable.
     */
    causes: string[] = [];
    /**
     * Internal Server Error (HTTP/SIP)
     */
    description: string = 'Internal Server Error (HTTP/SIP)';
    /**
     * The server could not fulfill the request due to some unexpected condition.
     */
    explanation: string = 'The server could not fulfill the request due to some unexpected condition.';
    /**
     * InternalServerError
     */
    name: string = 'InternalServerError';
    /**
     * Not applicable.
     */
    solutions: string[] = [];

    constructor(message: string) {
      super(message, 31500);
      Object.setPrototypeOf(this, ServerErrors.InternalServerError.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * ServerErrors.BadGateway error.
   * Error code `31502`.
   */
  export class BadGateway extends TwilioError {
    /**
     * Not applicable.
     */
    causes: string[] = [];
    /**
     * Bad Gateway (HTTP/SIP)
     */
    description: string = 'Bad Gateway (HTTP/SIP)';
    /**
     * The server is acting as a gateway or proxy, and received an invalid response from a downstream server while attempting to fulfill the request.
     */
    explanation: string = 'The server is acting as a gateway or proxy, and received an invalid response from a downstream server while attempting to fulfill the request.';
    /**
     * BadGateway
     */
    name: string = 'BadGateway';
    /**
     * Not applicable.
     */
    solutions: string[] = [];

    constructor(message: string) {
      super(message, 31502);
      Object.setPrototypeOf(this, ServerErrors.BadGateway.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * ServerErrors.ServiceUnavailable error.
   * Error code `31503`.
   */
  export class ServiceUnavailable extends TwilioError {
    /**
     * Not applicable.
     */
    causes: string[] = [];
    /**
     * Service Unavailable (HTTP/SIP)
     */
    description: string = 'Service Unavailable (HTTP/SIP)';
    /**
     * The server is currently unable to handle the request due to a temporary overloading or maintenance of the server. This error can also be caused by the Application SID provided in the access token pointing to an inaccessible URL.
     */
    explanation: string = 'The server is currently unable to handle the request due to a temporary overloading or maintenance of the server. This error can also be caused by the Application SID provided in the access token pointing to an inaccessible URL.';
    /**
     * ServiceUnavailable
     */
    name: string = 'ServiceUnavailable';
    /**
     * Not applicable.
     */
    solutions: string[] = [];

    constructor(message: string) {
      super(message, 31503);
      Object.setPrototypeOf(this, ServerErrors.ServiceUnavailable.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * ServerErrors.GatewayTimeout error.
   * Error code `31504`.
   */
  export class GatewayTimeout extends TwilioError {
    /**
     * Not applicable.
     */
    causes: string[] = [];
    /**
     * Gateway Timeout (HTTP/SIP)
     */
    description: string = 'Gateway Timeout (HTTP/SIP)';
    /**
     * The server, while acting as a gateway or proxy, did not receive a timely response from an upstream server.
     */
    explanation: string = 'The server, while acting as a gateway or proxy, did not receive a timely response from an upstream server.';
    /**
     * GatewayTimeout
     */
    name: string = 'GatewayTimeout';
    /**
     * Not applicable.
     */
    solutions: string[] = [];

    constructor(message: string) {
      super(message, 31504);
      Object.setPrototypeOf(this, ServerErrors.GatewayTimeout.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * ServerErrors.DNSResolutionError error.
   * Error code `31530`.
   */
  export class DNSResolutionError extends TwilioError {
    /**
     * Not applicable.
     */
    causes: string[] = [];
    /**
     * DNS Resolution Error (HTTP/SIP)
     */
    description: string = 'DNS Resolution Error (HTTP/SIP)';
    /**
     * Could not connect to the server.
     */
    explanation: string = 'Could not connect to the server.';
    /**
     * DNSResolutionError
     */
    name: string = 'DNSResolutionError';
    /**
     * Not applicable.
     */
    solutions: string[] = [];

    constructor(message: string) {
      super(message, 31530);
      Object.setPrototypeOf(this, ServerErrors.DNSResolutionError.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
}

/**
 * @public
 * SIPServer errors.
 */
export namespace SIPServerErrors {
  /**
   * @public
   * SIPServerErrors.BusyEverywhere error.
   * Error code `31600`.
   */
  export class BusyEverywhere extends TwilioError {
    /**
     * Not applicable.
     */
    causes: string[] = [];
    /**
     * Busy Everywhere (SIP)
     */
    description: string = 'Busy Everywhere (SIP)';
    /**
     * All possible destinations are busy.
     */
    explanation: string = 'All possible destinations are busy.';
    /**
     * BusyEverywhere
     */
    name: string = 'BusyEverywhere';
    /**
     * Not applicable.
     */
    solutions: string[] = [];

    constructor(message: string) {
      super(message, 31600);
      Object.setPrototypeOf(this, SIPServerErrors.BusyEverywhere.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * SIPServerErrors.Decline error.
   * Error code `31603`.
   */
  export class Decline extends TwilioError {
    /**
     * Not applicable.
     */
    causes: string[] = [];
    /**
     * Decline (SIP)
     */
    description: string = 'Decline (SIP)';
    /**
     * The callee does not wish to participate in the call.
     */
    explanation: string = 'The callee does not wish to participate in the call.';
    /**
     * Decline
     */
    name: string = 'Decline';
    /**
     * Not applicable.
     */
    solutions: string[] = [];

    constructor(message: string) {
      super(message, 31603);
      Object.setPrototypeOf(this, SIPServerErrors.Decline.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * SIPServerErrors.DoesNotExistAnywhere error.
   * Error code `31604`.
   */
  export class DoesNotExistAnywhere extends TwilioError {
    /**
     * Not applicable.
     */
    causes: string[] = [];
    /**
     * Does Not Exist Anywhere (SIP)
     */
    description: string = 'Does Not Exist Anywhere (SIP)';
    /**
     * The requested callee does not exist anywhere.
     */
    explanation: string = 'The requested callee does not exist anywhere.';
    /**
     * DoesNotExistAnywhere
     */
    name: string = 'DoesNotExistAnywhere';
    /**
     * Not applicable.
     */
    solutions: string[] = [];

    constructor(message: string) {
      super(message, 31604);
      Object.setPrototypeOf(this, SIPServerErrors.DoesNotExistAnywhere.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
}

/**
 * @public
 * TwiML errors.
 */
export namespace TwiMLErrors {
  /**
   * @public
   * TwiMLErrors.InvalidApplicationSid error.
   * Error code `21218`.
   */
  export class InvalidApplicationSid extends TwilioError {
    /**
     * Not applicable.
     */
    causes: string[] = [];
    /**
     * Invalid ApplicationSid
     */
    description: string = 'Invalid ApplicationSid';
    /**
     * You attempted to initiate an outbound phone call with an invalid ApplicationSid. The application may not exist anymore or may not be available within your account
     */
    explanation: string = 'You attempted to initiate an outbound phone call with an invalid ApplicationSid. The application may not exist anymore or may not be available within your account';
    /**
     * InvalidApplicationSid
     */
    name: string = 'InvalidApplicationSid';
    /**
     * Not applicable.
     */
    solutions: string[] = [];

    constructor(message: string) {
      super(message, 21218);
      Object.setPrototypeOf(this, TwiMLErrors.InvalidApplicationSid.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
}

/**
 * @public
 * General errors.
 */
export namespace GeneralErrors {
  /**
   * @public
   * GeneralErrors.ConnectionError error.
   * Error code `31005`.
   */
  export class ConnectionError extends TwilioError {
    /**
     * Not applicable.
     */
    causes: string[] = [];
    /**
     * Connection error
     */
    description: string = 'Connection error';
    /**
     * A connection error occurred during the call
     */
    explanation: string = 'A connection error occurred during the call';
    /**
     * ConnectionError
     */
    name: string = 'ConnectionError';
    /**
     * Not applicable.
     */
    solutions: string[] = [];

    constructor(message: string) {
      super(message, 31005);
      Object.setPrototypeOf(this, GeneralErrors.ConnectionError.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * GeneralErrors.CallCancelledError error.
   * Error code `31008`.
   */
  export class CallCancelledError extends TwilioError {
    /**
     * The incoming call was cancelled because it was not answered in time or it was accepted/rejected by another application instance registered with the same identity.
     */
    causes: string[] = [
      'The incoming call was cancelled because it was not answered in time or it was accepted/rejected by another application instance registered with the same identity.',
    ];
    /**
     * Call cancelled
     */
    description: string = 'Call cancelled';
    /**
     * Unable to answer because the call has ended
     */
    explanation: string = 'Unable to answer because the call has ended';
    /**
     * CallCancelledError
     */
    name: string = 'CallCancelledError';
    /**
     * Not applicable.
     */
    solutions: string[] = [];

    constructor(message: string) {
      super(message, 31008);
      Object.setPrototypeOf(this, GeneralErrors.CallCancelledError.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * GeneralErrors.TransportError error.
   * Error code `31009`.
   */
  export class TransportError extends TwilioError {
    /**
     * Not applicable.
     */
    causes: string[] = [];
    /**
     * Transport error
     */
    description: string = 'Transport error';
    /**
     * No transport available to send or receive messages
     */
    explanation: string = 'No transport available to send or receive messages';
    /**
     * TransportError
     */
    name: string = 'TransportError';
    /**
     * Not applicable.
     */
    solutions: string[] = [];

    constructor(message: string) {
      super(message, 31009);
      Object.setPrototypeOf(this, GeneralErrors.TransportError.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
}

/**
 * @public
 * MalformedRequest errors.
 */
export namespace MalformedRequestErrors {
  /**
   * @public
   * MalformedRequestErrors.MalformedRequestError error.
   * Error code `31100`.
   */
  export class MalformedRequestError extends TwilioError {
    /**
     * Invalid content or MessageType passed to sendMessage method.
     */
    causes: string[] = [
      'Invalid content or MessageType passed to sendMessage method.',
    ];
    /**
     * The request had malformed syntax.
     */
    description: string = 'The request had malformed syntax.';
    /**
     * The request could not be understood due to malformed syntax.
     */
    explanation: string = 'The request could not be understood due to malformed syntax.';
    /**
     * MalformedRequestError
     */
    name: string = 'MalformedRequestError';
    /**
     * Ensure content and MessageType passed to sendMessage method are valid.
     */
    solutions: string[] = [
      'Ensure content and MessageType passed to sendMessage method are valid.',
    ];

    constructor(message: string) {
      super(message, 31100);
      Object.setPrototypeOf(this, MalformedRequestErrors.MalformedRequestError.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
}

/**
 * @public
 * Registration errors.
 */
export namespace RegistrationErrors {
  /**
   * @public
   * RegistrationErrors.RegistrationError error.
   * Error code `31301`.
   */
  export class RegistrationError extends TwilioError {
    /**
     * Not applicable.
     */
    causes: string[] = [];
    /**
     * Registration error
     */
    description: string = 'Registration error';
    /**
     * 
     */
    explanation: string = '';
    /**
     * RegistrationError
     */
    name: string = 'RegistrationError';
    /**
     * Not applicable.
     */
    solutions: string[] = [];

    constructor(message: string) {
      super(message, 31301);
      Object.setPrototypeOf(this, RegistrationErrors.RegistrationError.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * RegistrationErrors.UnsupportedCancelMessageError error.
   * Error code `31302`.
   */
  export class UnsupportedCancelMessageError extends TwilioError {
    /**
     * The identity associated with the Twilio Voice SDK is still registered to receive cancel push notification messages.
     */
    causes: string[] = [
      'The identity associated with the Twilio Voice SDK is still registered to receive cancel push notification messages.',
    ];
    /**
     * Unsupported Cancel Message Error
     */
    description: string = 'Unsupported Cancel Message Error';
    /**
     * This version of the SDK no longer supports processing cancel push notification messages. You must register via Voice.register(...) on Android or [TwilioVoice registerWithAccessToken:deviceToken:completion:] on iOS with this version of the SDK to stop receiving cancel push notification messages. Cancellations are now handled internally and reported to you on behalf of the SDK.
     */
    explanation: string = 'This version of the SDK no longer supports processing cancel push notification messages. You must register via Voice.register(...) on Android or [TwilioVoice registerWithAccessToken:deviceToken:completion:] on iOS with this version of the SDK to stop receiving cancel push notification messages. Cancellations are now handled internally and reported to you on behalf of the SDK.';
    /**
     * UnsupportedCancelMessageError
     */
    name: string = 'UnsupportedCancelMessageError';
    /**
     * The application must register via Voice.register(...) on Android or [TwilioVoice registerWithAccessToken:deviceToken:completion:] on iOS to stop receiving cancel push notification messages.
     */
    solutions: string[] = [
      'The application must register via Voice.register(...) on Android or [TwilioVoice registerWithAccessToken:deviceToken:completion:] on iOS to stop receiving cancel push notification messages.',
    ];

    constructor(message: string) {
      super(message, 31302);
      Object.setPrototypeOf(this, RegistrationErrors.UnsupportedCancelMessageError.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
}

/**
 * @public
 * UserMedia errors.
 */
export namespace UserMediaErrors {
  /**
   * @public
   * UserMediaErrors.PermissionDeniedError error.
   * Error code `31401`.
   */
  export class PermissionDeniedError extends TwilioError {
    /**
     * The user denied the getUserMedia request.
     * The browser denied the getUserMedia request.
     * The application has not been configured with the proper permissions.
     */
    causes: string[] = [
      'The user denied the getUserMedia request.',
      'The browser denied the getUserMedia request.',
      'The application has not been configured with the proper permissions.',
    ];
    /**
     * UserMedia Permission Denied Error
     */
    description: string = 'UserMedia Permission Denied Error';
    /**
     * The browser or end-user denied permissions to user media. Therefore we were unable to acquire input audio.
     */
    explanation: string = 'The browser or end-user denied permissions to user media. Therefore we were unable to acquire input audio.';
    /**
     * PermissionDeniedError
     */
    name: string = 'PermissionDeniedError';
    /**
     * The user should accept the request next time prompted. If the browser saved the deny, the user should change that permission in their browser.
     * The user should to verify that the browser has permission to access the microphone at this address.
     * The user should ensure that the proper permissions have been granted in the mobile device OS.
     */
    solutions: string[] = [
      'The user should accept the request next time prompted. If the browser saved the deny, the user should change that permission in their browser.',
      'The user should to verify that the browser has permission to access the microphone at this address.',
      'The user should ensure that the proper permissions have been granted in the mobile device OS.',
    ];

    constructor(message: string) {
      super(message, 31401);
      Object.setPrototypeOf(this, UserMediaErrors.PermissionDeniedError.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
}

/**
 * @public
 * Signaling errors.
 */
export namespace SignalingErrors {
  /**
   * @public
   * SignalingErrors.ConnectionDisconnected error.
   * Error code `53001`.
   */
  export class ConnectionDisconnected extends TwilioError {
    /**
     * The device running your application lost its Internet connection.
     */
    causes: string[] = [
      'The device running your application lost its Internet connection.',
    ];
    /**
     * Signaling connection disconnected
     */
    description: string = 'Signaling connection disconnected';
    /**
     * Raised whenever the signaling connection is unexpectedly disconnected.
     */
    explanation: string = 'Raised whenever the signaling connection is unexpectedly disconnected.';
    /**
     * ConnectionDisconnected
     */
    name: string = 'ConnectionDisconnected';
    /**
     * Ensure the device running your application has access to a stable Internet connection.
     */
    solutions: string[] = [
      'Ensure the device running your application has access to a stable Internet connection.',
    ];

    constructor(message: string) {
      super(message, 53001);
      Object.setPrototypeOf(this, SignalingErrors.ConnectionDisconnected.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
}

/**
 * @public
 * Media errors.
 */
export namespace MediaErrors {
  /**
   * @public
   * MediaErrors.ClientLocalDescFailed error.
   * Error code `53400`.
   */
  export class ClientLocalDescFailed extends TwilioError {
    /**
     * The Client may not be using a supported WebRTC implementation.
     * The Client may not have the necessary resources to create or apply a new media description.
     */
    causes: string[] = [
      'The Client may not be using a supported WebRTC implementation.',
      'The Client may not have the necessary resources to create or apply a new media description.',
    ];
    /**
     * Client is unable to create or apply a local media description
     */
    description: string = 'Client is unable to create or apply a local media description';
    /**
     * Raised whenever a Client is unable to create or apply a local media description.
     */
    explanation: string = 'Raised whenever a Client is unable to create or apply a local media description.';
    /**
     * ClientLocalDescFailed
     */
    name: string = 'ClientLocalDescFailed';
    /**
     * If you are experiencing this error using the JavaScript SDK, ensure you are running it with a supported WebRTC implementation.
     */
    solutions: string[] = [
      'If you are experiencing this error using the JavaScript SDK, ensure you are running it with a supported WebRTC implementation.',
    ];

    constructor(message: string) {
      super(message, 53400);
      Object.setPrototypeOf(this, MediaErrors.ClientLocalDescFailed.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * MediaErrors.ServerLocalDescFailed error.
   * Error code `53401`.
   */
  export class ServerLocalDescFailed extends TwilioError {
    /**
     * A server-side error has occurred.
     */
    causes: string[] = [
      'A server-side error has occurred.',
    ];
    /**
     * Server is unable to create or apply a local media description
     */
    description: string = 'Server is unable to create or apply a local media description';
    /**
     * Raised whenever the Server is unable to create or apply a local media description.
     */
    explanation: string = 'Raised whenever the Server is unable to create or apply a local media description.';
    /**
     * ServerLocalDescFailed
     */
    name: string = 'ServerLocalDescFailed';
    /**
     * If the problem persists, try connecting to another region.
     */
    solutions: string[] = [
      'If the problem persists, try connecting to another region.',
    ];

    constructor(message: string) {
      super(message, 53401);
      Object.setPrototypeOf(this, MediaErrors.ServerLocalDescFailed.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * MediaErrors.ClientRemoteDescFailed error.
   * Error code `53402`.
   */
  export class ClientRemoteDescFailed extends TwilioError {
    /**
     * The Client may not be using a supported WebRTC implementation.
     * The Client may be connecting peer-to-peer with another Participant that is not using a supported WebRTC implementation.
     * The Client may not have the necessary resources to apply a new media description.
     */
    causes: string[] = [
      'The Client may not be using a supported WebRTC implementation.',
      'The Client may be connecting peer-to-peer with another Participant that is not using a supported WebRTC implementation.',
      'The Client may not have the necessary resources to apply a new media description.',
    ];
    /**
     * Client is unable to apply a remote media description
     */
    description: string = 'Client is unable to apply a remote media description';
    /**
     * Raised whenever the Client receives a remote media description but is unable to apply it.
     */
    explanation: string = 'Raised whenever the Client receives a remote media description but is unable to apply it.';
    /**
     * ClientRemoteDescFailed
     */
    name: string = 'ClientRemoteDescFailed';
    /**
     * If you are experiencing this error using the JavaScript SDK, ensure you are running it with a supported WebRTC implementation.
     */
    solutions: string[] = [
      'If you are experiencing this error using the JavaScript SDK, ensure you are running it with a supported WebRTC implementation.',
    ];

    constructor(message: string) {
      super(message, 53402);
      Object.setPrototypeOf(this, MediaErrors.ClientRemoteDescFailed.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * MediaErrors.ServerRemoteDescFailed error.
   * Error code `53403`.
   */
  export class ServerRemoteDescFailed extends TwilioError {
    /**
     * The Client may not be using a supported WebRTC implementation.
     * The Client may not have the necessary resources to apply a new media description.
     * A Server-side error may have caused the Server to generate an invalid media description.
     */
    causes: string[] = [
      'The Client may not be using a supported WebRTC implementation.',
      'The Client may not have the necessary resources to apply a new media description.',
      'A Server-side error may have caused the Server to generate an invalid media description.',
    ];
    /**
     * Server is unable to apply a remote media description
     */
    description: string = 'Server is unable to apply a remote media description';
    /**
     * Raised whenever the Server receives a remote media description but is unable to apply it.
     */
    explanation: string = 'Raised whenever the Server receives a remote media description but is unable to apply it.';
    /**
     * ServerRemoteDescFailed
     */
    name: string = 'ServerRemoteDescFailed';
    /**
     * If you are experiencing this error using the JavaScript SDK, ensure you are running it with a supported WebRTC implementation.
     * If the problem persists, try connecting to another region.
     */
    solutions: string[] = [
      'If you are experiencing this error using the JavaScript SDK, ensure you are running it with a supported WebRTC implementation.',
      'If the problem persists, try connecting to another region.',
    ];

    constructor(message: string) {
      super(message, 53403);
      Object.setPrototypeOf(this, MediaErrors.ServerRemoteDescFailed.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * MediaErrors.NoSupportedCodec error.
   * Error code `53404`.
   */
  export class NoSupportedCodec extends TwilioError {
    /**
     * The C++ SDK was built without the recommended set of codecs.
     * The JavaScript SDK is running in a browser that does not implement the recommended set of codecs.
     */
    causes: string[] = [
      'The C++ SDK was built without the recommended set of codecs.',
      'The JavaScript SDK is running in a browser that does not implement the recommended set of codecs.',
    ];
    /**
     * No supported codec
     */
    description: string = 'No supported codec';
    /**
     * Raised whenever the intersection of codecs supported by the Client and the Server (or, in peer-to-peer, the Client and another Participant) is empty.
     */
    explanation: string = 'Raised whenever the intersection of codecs supported by the Client and the Server (or, in peer-to-peer, the Client and another Participant) is empty.';
    /**
     * NoSupportedCodec
     */
    name: string = 'NoSupportedCodec';
    /**
     * If you are experiencing this error using the C++ SDK, ensure you build it with the recommended set of codecs.
     * If you are experiencing this error using the JavaScript SDK, ensure you are using a compatible browser.
     */
    solutions: string[] = [
      'If you are experiencing this error using the C++ SDK, ensure you build it with the recommended set of codecs.',
      'If you are experiencing this error using the JavaScript SDK, ensure you are using a compatible browser.',
    ];

    constructor(message: string) {
      super(message, 53404);
      Object.setPrototypeOf(this, MediaErrors.NoSupportedCodec.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * MediaErrors.ConnectionError error.
   * Error code `53405`.
   */
  export class ConnectionError extends TwilioError {
    /**
     * The Client was unable to establish a media connection.
     * A media connection which was active failed liveliness checks.
     */
    causes: string[] = [
      'The Client was unable to establish a media connection.',
      'A media connection which was active failed liveliness checks.',
    ];
    /**
     * Media connection failed
     */
    description: string = 'Media connection failed';
    /**
     * Raised by the Client or Server whenever a media connection fails.
     */
    explanation: string = 'Raised by the Client or Server whenever a media connection fails.';
    /**
     * ConnectionError
     */
    name: string = 'ConnectionError';
    /**
     * If the problem persists, try connecting to another region.
     * Check your Client's network connectivity.
     * If you've provided custom ICE Servers then ensure that the URLs and credentials are valid.
     */
    solutions: string[] = [
      'If the problem persists, try connecting to another region.',
      'Check your Client\'s network connectivity.',
      'If you\'ve provided custom ICE Servers then ensure that the URLs and credentials are valid.',
    ];

    constructor(message: string) {
      super(message, 53405);
      Object.setPrototypeOf(this, MediaErrors.ConnectionError.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }

  /**
   * @public
   * MediaErrors.MediaDtlsTransportFailedError error.
   * Error code `53407`.
   */
  export class MediaDtlsTransportFailedError extends TwilioError {
    /**
     * One or both of the DTLS peers have an invalid certificate.
     * One or both of the DTLS peers have an outdated version of DTLS.
     * One or both of the DTLS peers lost internet connectivity while performing a DTLS handshake.
     */
    causes: string[] = [
      'One or both of the DTLS peers have an invalid certificate.',
      'One or both of the DTLS peers have an outdated version of DTLS.',
      'One or both of the DTLS peers lost internet connectivity while performing a DTLS handshake.',
    ];
    /**
     * The media connection failed due to DTLS handshake failure
     */
    description: string = 'The media connection failed due to DTLS handshake failure';
    /**
     * There was a problem while negotiating with the remote DTLS peer. Therefore the Client will not be able to establish the media connection.
     */
    explanation: string = 'There was a problem while negotiating with the remote DTLS peer. Therefore the Client will not be able to establish the media connection.';
    /**
     * MediaDtlsTransportFailedError
     */
    name: string = 'MediaDtlsTransportFailedError';
    /**
     * Ensure that your certificate is valid.
     * Ensure that you have a stable internet connection.
     * Ensure that the browser or the Mobile SDK supports newer versions of DTLS.
     */
    solutions: string[] = [
      'Ensure that your certificate is valid.',
      'Ensure that you have a stable internet connection.',
      'Ensure that the browser or the Mobile SDK supports newer versions of DTLS.',
    ];

    constructor(message: string) {
      super(message, 53407);
      Object.setPrototypeOf(this, MediaErrors.MediaDtlsTransportFailedError.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
}

/**
 * @internal
 */
export const errorsByCode: ReadonlyMap<number, typeof TwilioError> = new Map([
  [20101, AuthorizationErrors.AccessTokenInvalid],
  [20102, AuthorizationErrors.AccessTokenHeaderInvalid],
  [20103, AuthorizationErrors.AccessTokenIssuerInvalid],
  [20104, AuthorizationErrors.AccessTokenExpired],
  [20105, AuthorizationErrors.AccessTokenNotYetValid],
  [20106, AuthorizationErrors.AccessTokenGrantsInvalid],
  [20107, AuthorizationErrors.AccessTokenSignatureInvalid],
  [20151, AuthorizationErrors.AuthenticationFailed],
  [20157, AuthorizationErrors.ExpirationTimeExceedsMaxTimeAllowed],
  [20403, ForbiddenErrors.Forbidden],
  [21218, TwiMLErrors.InvalidApplicationSid],
  [31005, GeneralErrors.ConnectionError],
  [31008, GeneralErrors.CallCancelledError],
  [31009, GeneralErrors.TransportError],
  [31100, MalformedRequestErrors.MalformedRequestError],
  [31201, AuthorizationErrors.AuthorizationError],
  [31206, AuthorizationErrors.RateExceededError],
  [31210, AuthorizationErrors.CallMessageEventTypeInvalidError],
  [31211, AuthorizationErrors.CallMessageUnexpectedStateError],
  [31212, AuthorizationErrors.PayloadSizeExceededError],
  [31301, RegistrationErrors.RegistrationError],
  [31302, RegistrationErrors.UnsupportedCancelMessageError],
  [31400, ClientErrors.BadRequest],
  [31401, UserMediaErrors.PermissionDeniedError],
  [31403, ClientErrors.Forbidden],
  [31404, ClientErrors.NotFound],
  [31408, ClientErrors.RequestTimeout],
  [31409, ClientErrors.Conflict],
  [31426, ClientErrors.UpgradeRequired],
  [31429, ClientErrors.TooManyRequests],
  [31480, ClientErrors.TemporarilyUnavailable],
  [31481, ClientErrors.CallTransactionDoesNotExist],
  [31484, ClientErrors.AddressIncomplete],
  [31486, ClientErrors.BusyHere],
  [31487, ClientErrors.RequestTerminated],
  [31500, ServerErrors.InternalServerError],
  [31502, ServerErrors.BadGateway],
  [31503, ServerErrors.ServiceUnavailable],
  [31504, ServerErrors.GatewayTimeout],
  [31530, ServerErrors.DNSResolutionError],
  [31600, SIPServerErrors.BusyEverywhere],
  [31603, SIPServerErrors.Decline],
  [31604, SIPServerErrors.DoesNotExistAnywhere],
  [51007, AuthorizationErrors.AccessTokenRejected],
  [53001, SignalingErrors.ConnectionDisconnected],
  [53400, MediaErrors.ClientLocalDescFailed],
  [53401, MediaErrors.ServerLocalDescFailed],
  [53402, MediaErrors.ClientRemoteDescFailed],
  [53403, MediaErrors.ServerRemoteDescFailed],
  [53404, MediaErrors.NoSupportedCodec],
  [53405, MediaErrors.ConnectionError],
  [53407, MediaErrors.MediaDtlsTransportFailedError],
]);

Object.freeze(errorsByCode);
