/**
 * This is a generated file. Any modifications here will be overwritten.
 * See scripts/errors.js.
 */
import { TwilioError } from './TwilioError';

/**
 * @public
 * Authorization related errors.
 */
export namespace AuthorizationErrors {
  /**
   * @public
   * AuthorizationErrors.AccessTokenInvalid error.
   * Error code `20101`.
   */
  export class AccessTokenInvalid extends TwilioError {
    causes: string[] = [];
    description: string = 'Invalid access token';
    explanation: string = 'Twilio was unable to validate your Access Token';
    name: string = 'AccessTokenInvalid';
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
    causes: string[] = [];
    description: string = 'Invalid access token header';
    explanation: string = 'The header of the Access Token provided to the Twilio API was invalid';
    name: string = 'AccessTokenHeaderInvalid';
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
    causes: string[] = [];
    description: string = 'Invalid access token issuer/subject';
    explanation: string = 'The issuer or subject of the Access Token provided to the Twilio API was invalid';
    name: string = 'AccessTokenIssuerInvalid';
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
    causes: string[] = [];
    description: string = 'Access token expired or expiration date invalid';
    explanation: string = 'The Access Token provided to the Twilio API has expired, the expiration time specified in the token was invalid, or the expiration time specified was too far in the future';
    name: string = 'AccessTokenExpired';
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
    causes: string[] = [];
    description: string = 'Access token not yet valid';
    explanation: string = 'The Access Token provided to the Twilio API is not yet valid';
    name: string = 'AccessTokenNotYetValid';
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
    causes: string[] = [];
    description: string = 'Invalid access token grants';
    explanation: string = 'The Access Token signature and issuer were valid, but the grants specified in the token were invalid, unparseable, or did not authorize the action being requested';
    name: string = 'AccessTokenGrantsInvalid';
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
    causes: string[] = [];
    description: string = 'Invalid access token signature';
    explanation: string = 'The signature for the Access Token provided was invalid.';
    name: string = 'AccessTokenSignatureInvalid';
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
    causes: string[] = [];
    description: string = 'Authentication Failed';
    explanation: string = 'The Authentication with the provided JWT failed';
    name: string = 'AuthenticationFailed';
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
    causes: string[] = [];
    description: string = 'Expiration Time Exceeds Maximum Time Allowed';
    explanation: string = 'The expiration time provided when creating the JWT exceeds the maximum duration allowed';
    name: string = 'ExpirationTimeExceedsMaxTimeAllowed';
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
    causes: string[] = [];
    description: string = 'Authorization error';
    explanation: string = 'The request requires user authentication. The server understood the request, but is refusing to fulfill it.';
    name: string = 'AuthorizationError';
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
    causes: string[] = [
      'Message payload size limit exceeded.',
      'Rate limit exceeded.',
    ];
    description: string = 'Rate exceeded authorized limit.';
    explanation: string = 'The request performed exceeds the authorized limit.';
    name: string = 'RateExceededError';
    solutions: string[] = [
      'Ensure the message payload does not exceed size limits.',
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
   * AuthorizationErrors.AccessTokenRejected error.
   * Error code `51007`.
   */
  export class AccessTokenRejected extends TwilioError {
    causes: string[] = [];
    description: string = 'Token authentication is rejected by authentication service';
    explanation: string = 'The authentication service has rejected the provided Access Token. To check whether the Access Token is structurally correct, you can use the tools available at https://jwt.io. For the details of Twilio\'s specific Access Token implementation including the grant format, check https://www.twilio.com/docs/iam/access-tokens.';
    name: string = 'AccessTokenRejected';
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
 * Forbidden related errors.
 */
export namespace ForbiddenErrors {
  /**
   * @public
   * ForbiddenErrors.Forbidden error.
   * Error code `20403`.
   */
  export class Forbidden extends TwilioError {
    causes: string[] = [];
    description: string = '403 Forbidden';
    explanation: string = 'The account lacks permission to access the Twilio API. Typically this means the account has been suspended or closed. For assistance, please contact support';
    name: string = 'Forbidden';
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
 * SignatureValidation related errors.
 */
export namespace SignatureValidationErrors {

}

/**
 * @public
 * Client related errors.
 */
export namespace ClientErrors {
  /**
   * @public
   * ClientErrors.BadRequest error.
   * Error code `31400`.
   */
  export class BadRequest extends TwilioError {
    causes: string[] = [];
    description: string = 'Bad Request (HTTP/SIP)';
    explanation: string = 'The request could not be understood due to malformed syntax.';
    name: string = 'BadRequest';
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
    causes: string[] = [];
    description: string = 'Forbidden (HTTP/SIP)';
    explanation: string = 'The server understood the request, but is refusing to fulfill it.';
    name: string = 'Forbidden';
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
    causes: string[] = [
      'The outbound call was made to an invalid phone number.',
      'The TwiML application sid is missing a Voice URL.',
    ];
    description: string = 'Not Found (HTTP/SIP)';
    explanation: string = 'The server has not found anything matching the request.';
    name: string = 'NotFound';
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
    causes: string[] = [];
    description: string = 'Request Timeout (HTTP/SIP)';
    explanation: string = 'A request timeout occurred.';
    name: string = 'RequestTimeout';
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
    causes: string[] = [];
    description: string = 'Conflict (HTTP)';
    explanation: string = 'The request could not be processed because of a conflict in the current state of the resource. Another request may be in progress.';
    name: string = 'Conflict';
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
    causes: string[] = [];
    description: string = 'Upgrade Required (HTTP)';
    explanation: string = 'This error is raised when an HTTP 426 response is received. The reason for this is most likely because of an incompatible TLS version. To mitigate this, you may need to upgrade the OS or download a more recent version of the SDK.';
    name: string = 'UpgradeRequired';
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
    causes: string[] = [];
    description: string = 'Too Many Requests (HTTP)';
    explanation: string = 'Too many requests were sent in a given amount of time.';
    name: string = 'TooManyRequests';
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
    causes: string[] = [];
    description: string = 'Temporarily Unavailable (SIP)';
    explanation: string = 'The callee is currently unavailable.';
    name: string = 'TemporarilyUnavailable';
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
    causes: string[] = [];
    description: string = 'Call/Transaction Does Not Exist (SIP)';
    explanation: string = 'The call no longer exists.';
    name: string = 'CallTransactionDoesNotExist';
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
    causes: string[] = [
      'The outbound call was made with a phone number that has an invalid format.',
    ];
    description: string = 'Address Incomplete (SIP)';
    explanation: string = 'The provided phone number is malformed.';
    name: string = 'AddressIncomplete';
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
    causes: string[] = [];
    description: string = 'Busy Here (SIP)';
    explanation: string = 'The callee is busy.';
    name: string = 'BusyHere';
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
    causes: string[] = [];
    description: string = 'Request Terminated (SIP)';
    explanation: string = 'The request has terminated as a result of a bye or cancel.';
    name: string = 'RequestTerminated';
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
 * Server related errors.
 */
export namespace ServerErrors {
  /**
   * @public
   * ServerErrors.InternalServerError error.
   * Error code `31500`.
   */
  export class InternalServerError extends TwilioError {
    causes: string[] = [];
    description: string = 'Internal Server Error (HTTP/SIP)';
    explanation: string = 'The server could not fulfill the request due to some unexpected condition.';
    name: string = 'InternalServerError';
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
    causes: string[] = [];
    description: string = 'Bad Gateway (HTTP/SIP)';
    explanation: string = 'The server is acting as a gateway or proxy, and received an invalid response from a downstream server while attempting to fulfill the request.';
    name: string = 'BadGateway';
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
    causes: string[] = [];
    description: string = 'Service Unavailable (HTTP/SIP)';
    explanation: string = 'The server is currently unable to handle the request due to a temporary overloading or maintenance of the server. This error can also be caused by the Application SID provided in the access token pointing to an inaccessible URL.';
    name: string = 'ServiceUnavailable';
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
    causes: string[] = [];
    description: string = 'Gateway Timeout (HTTP/SIP)';
    explanation: string = 'The server, while acting as a gateway or proxy, did not receive a timely response from an upstream server.';
    name: string = 'GatewayTimeout';
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
    causes: string[] = [];
    description: string = 'DNS Resolution Error (HTTP/SIP)';
    explanation: string = 'Could not connect to the server.';
    name: string = 'DNSResolutionError';
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
 * SIPServer related errors.
 */
export namespace SIPServerErrors {
  /**
   * @public
   * SIPServerErrors.BusyEverywhere error.
   * Error code `31600`.
   */
  export class BusyEverywhere extends TwilioError {
    causes: string[] = [];
    description: string = 'Busy Everywhere (SIP)';
    explanation: string = 'All possible destinations are busy.';
    name: string = 'BusyEverywhere';
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
    causes: string[] = [];
    description: string = 'Decline (SIP)';
    explanation: string = 'The callee does not wish to participate in the call.';
    name: string = 'Decline';
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
    causes: string[] = [];
    description: string = 'Does Not Exist Anywhere (SIP)';
    explanation: string = 'The requested callee does not exist anywhere.';
    name: string = 'DoesNotExistAnywhere';
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
 * TwiML related errors.
 */
export namespace TwiMLErrors {
  /**
   * @public
   * TwiMLErrors.InvalidApplicationSid error.
   * Error code `21218`.
   */
  export class InvalidApplicationSid extends TwilioError {
    causes: string[] = [];
    description: string = 'Invalid ApplicationSid';
    explanation: string = 'You attempted to initiate an outbound phone call with an invalid ApplicationSid. The application may not exist anymore or may not be available within your account';
    name: string = 'InvalidApplicationSid';
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
 * General related errors.
 */
export namespace GeneralErrors {
  /**
   * @public
   * GeneralErrors.ConnectionError error.
   * Error code `31005`.
   */
  export class ConnectionError extends TwilioError {
    causes: string[] = [];
    description: string = 'Connection error';
    explanation: string = 'A connection error occurred during the call';
    name: string = 'ConnectionError';
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
    causes: string[] = [
      'The incoming call was cancelled because it was not answered in time or it was accepted/rejected by another application instance registered with the same identity.',
    ];
    description: string = 'Call cancelled';
    explanation: string = 'Unable to answer because the call has ended';
    name: string = 'CallCancelledError';
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
    causes: string[] = [];
    description: string = 'Transport error';
    explanation: string = 'No transport available to send or receive messages';
    name: string = 'TransportError';
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
 * MalformedRequest related errors.
 */
export namespace MalformedRequestErrors {
  /**
   * @public
   * MalformedRequestErrors.MalformedRequestError error.
   * Error code `31100`.
   */
  export class MalformedRequestError extends TwilioError {
    causes: string[] = [
      'No CallSid in the message object.',
      'No VoiceEventSid in the message object.',
      'No payload in the message object.',
      'Invalid or missing payload in the message object.',
      'No message type in the message object.',
    ];
    description: string = 'The request had malformed syntax.';
    explanation: string = 'The request could not be understood due to malformed syntax.';
    name: string = 'MalformedRequestError';
    solutions: string[] = [
      'Ensure the message object contains a valid CallSid.',
      'Ensure the message object contains a valid VoiceEventSid.',
      'Ensure the message object has a valid payload.',
      'Ensure the message object has a valid message type.',
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
 * Registration related errors.
 */
export namespace RegistrationErrors {
  /**
   * @public
   * RegistrationErrors.RegistrationError error.
   * Error code `31301`.
   */
  export class RegistrationError extends TwilioError {
    causes: string[] = [];
    description: string = 'Registration error';
    explanation: string = '';
    name: string = 'RegistrationError';
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
    causes: string[] = [
      'The identity associated with the Twilio Voice SDK is still registered to receive cancel push notification messages.',
    ];
    description: string = 'Unsupported Cancel Message Error';
    explanation: string = 'This version of the SDK no longer supports processing cancel push notification messages. You must register via Voice.register(...) on Android or [TwilioVoice registerWithAccessToken:deviceToken:completion:] on iOS with this version of the SDK to stop receiving cancel push notification messages. Cancellations are now handled internally and reported to you on behalf of the SDK.';
    name: string = 'UnsupportedCancelMessageError';
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
 * UserMedia related errors.
 */
export namespace UserMediaErrors {

}

/**
 * @public
 * Signaling related errors.
 */
export namespace SignalingErrors {
  /**
   * @public
   * SignalingErrors.ConnectionDisconnected error.
   * Error code `53001`.
   */
  export class ConnectionDisconnected extends TwilioError {
    causes: string[] = [
      'The device running your application lost its Internet connection.',
    ];
    description: string = 'Signaling connection disconnected';
    explanation: string = 'Raised whenever the signaling connection is unexpectedly disconnected.';
    name: string = 'ConnectionDisconnected';
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
 * Media related errors.
 */
export namespace MediaErrors {
  /**
   * @public
   * MediaErrors.ClientLocalDescFailed error.
   * Error code `53400`.
   */
  export class ClientLocalDescFailed extends TwilioError {
    causes: string[] = [
      'The Client may not be using a supported WebRTC implementation.',
      'The Client may not have the necessary resources to create or apply a new media description.',
    ];
    description: string = 'Client is unable to create or apply a local media description';
    explanation: string = 'Raised whenever a Client is unable to create or apply a local media description.';
    name: string = 'ClientLocalDescFailed';
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
    causes: string[] = [
      'A server-side error has occurred.',
    ];
    description: string = 'Server is unable to create or apply a local media description';
    explanation: string = 'Raised whenever the Server is unable to create or apply a local media description.';
    name: string = 'ServerLocalDescFailed';
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
    causes: string[] = [
      'The Client may not be using a supported WebRTC implementation.',
      'The Client may be connecting peer-to-peer with another Participant that is not using a supported WebRTC implementation.',
      'The Client may not have the necessary resources to apply a new media description.',
    ];
    description: string = 'Client is unable to apply a remote media description';
    explanation: string = 'Raised whenever the Client receives a remote media description but is unable to apply it.';
    name: string = 'ClientRemoteDescFailed';
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
    causes: string[] = [
      'The Client may not be using a supported WebRTC implementation.',
      'The Client may not have the necessary resources to apply a new media description.',
      'A Server-side error may have caused the Server to generate an invalid media description.',
    ];
    description: string = 'Server is unable to apply a remote media description';
    explanation: string = 'Raised whenever the Server receives a remote media description but is unable to apply it.';
    name: string = 'ServerRemoteDescFailed';
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
    causes: string[] = [
      'The C++ SDK was built without the recommended set of codecs.',
      'The JavaScript SDK is running in a browser that does not implement the recommended set of codecs.',
    ];
    description: string = 'No supported codec';
    explanation: string = 'Raised whenever the intersection of codecs supported by the Client and the Server (or, in peer-to-peer, the Client and another Participant) is empty.';
    name: string = 'NoSupportedCodec';
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
    causes: string[] = [
      'The Client was unable to establish a media connection.',
      'A media connection which was active failed liveliness checks.',
    ];
    description: string = 'Media connection failed';
    explanation: string = 'Raised by the Client or Server whenever a media connection fails.';
    name: string = 'ConnectionError';
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
    causes: string[] = [
      'One or both of the DTLS peers have an invalid certificate.',
      'One or both of the DTLS peers have an outdated version of DTLS.',
      'One or both of the DTLS peers lost internet connectivity while performing a DTLS handshake.',
    ];
    description: string = 'The media connection failed due to DTLS handshake failure';
    explanation: string = 'There was a problem while negotiating with the remote DTLS peer. Therefore the Client will not be able to establish the media connection.';
    name: string = 'MediaDtlsTransportFailedError';
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
  [31301, RegistrationErrors.RegistrationError],
  [31302, RegistrationErrors.UnsupportedCancelMessageError],
  [31400, ClientErrors.BadRequest],
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
