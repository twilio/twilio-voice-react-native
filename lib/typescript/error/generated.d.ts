/**
 * This is a generated file. Any modifications here will be overwritten.
 * See scripts/errors.js.
 */
import { TwilioError } from './TwilioError';
/**
 * @public
 * Authorization errors.
 */
export declare namespace AuthorizationErrors {
    /**
     * @public
     * AuthorizationErrors.AccessTokenInvalid error.
     * Error code `20101`.
     */
    class AccessTokenInvalid extends TwilioError {
        /**
         * Not applicable.
         */
        causes: string[];
        /**
         * Invalid access token
         */
        description: string;
        /**
         * Twilio was unable to validate your Access Token
         */
        explanation: string;
        /**
         * AccessTokenInvalid
         */
        name: string;
        /**
         * Not applicable.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * AuthorizationErrors.AccessTokenHeaderInvalid error.
     * Error code `20102`.
     */
    class AccessTokenHeaderInvalid extends TwilioError {
        /**
         * Not applicable.
         */
        causes: string[];
        /**
         * Invalid access token header
         */
        description: string;
        /**
         * The header of the Access Token provided to the Twilio API was invalid
         */
        explanation: string;
        /**
         * AccessTokenHeaderInvalid
         */
        name: string;
        /**
         * Not applicable.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * AuthorizationErrors.AccessTokenIssuerInvalid error.
     * Error code `20103`.
     */
    class AccessTokenIssuerInvalid extends TwilioError {
        /**
         * Not applicable.
         */
        causes: string[];
        /**
         * Invalid access token issuer/subject
         */
        description: string;
        /**
         * The issuer or subject of the Access Token provided to the Twilio API was invalid
         */
        explanation: string;
        /**
         * AccessTokenIssuerInvalid
         */
        name: string;
        /**
         * Not applicable.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * AuthorizationErrors.AccessTokenExpired error.
     * Error code `20104`.
     */
    class AccessTokenExpired extends TwilioError {
        /**
         * Not applicable.
         */
        causes: string[];
        /**
         * Access token expired or expiration date invalid
         */
        description: string;
        /**
         * The Access Token provided to the Twilio API has expired, the expiration time specified in the token was invalid, or the expiration time specified was too far in the future
         */
        explanation: string;
        /**
         * AccessTokenExpired
         */
        name: string;
        /**
         * Not applicable.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * AuthorizationErrors.AccessTokenNotYetValid error.
     * Error code `20105`.
     */
    class AccessTokenNotYetValid extends TwilioError {
        /**
         * Not applicable.
         */
        causes: string[];
        /**
         * Access token not yet valid
         */
        description: string;
        /**
         * The Access Token provided to the Twilio API is not yet valid
         */
        explanation: string;
        /**
         * AccessTokenNotYetValid
         */
        name: string;
        /**
         * Not applicable.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * AuthorizationErrors.AccessTokenGrantsInvalid error.
     * Error code `20106`.
     */
    class AccessTokenGrantsInvalid extends TwilioError {
        /**
         * Not applicable.
         */
        causes: string[];
        /**
         * Invalid access token grants
         */
        description: string;
        /**
         * The Access Token signature and issuer were valid, but the grants specified in the token were invalid, unparseable, or did not authorize the action being requested
         */
        explanation: string;
        /**
         * AccessTokenGrantsInvalid
         */
        name: string;
        /**
         * Not applicable.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * AuthorizationErrors.AccessTokenSignatureInvalid error.
     * Error code `20107`.
     */
    class AccessTokenSignatureInvalid extends TwilioError {
        /**
         * Not applicable.
         */
        causes: string[];
        /**
         * Invalid access token signature
         */
        description: string;
        /**
         * The signature for the Access Token provided was invalid.
         */
        explanation: string;
        /**
         * AccessTokenSignatureInvalid
         */
        name: string;
        /**
         * Not applicable.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * AuthorizationErrors.AuthenticationFailed error.
     * Error code `20151`.
     */
    class AuthenticationFailed extends TwilioError {
        /**
         * Not applicable.
         */
        causes: string[];
        /**
         * Authentication Failed
         */
        description: string;
        /**
         * The Authentication with the provided JWT failed
         */
        explanation: string;
        /**
         * AuthenticationFailed
         */
        name: string;
        /**
         * Not applicable.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * AuthorizationErrors.ExpirationTimeExceedsMaxTimeAllowed error.
     * Error code `20157`.
     */
    class ExpirationTimeExceedsMaxTimeAllowed extends TwilioError {
        /**
         * Not applicable.
         */
        causes: string[];
        /**
         * Expiration Time Exceeds Maximum Time Allowed
         */
        description: string;
        /**
         * The expiration time provided when creating the JWT exceeds the maximum duration allowed
         */
        explanation: string;
        /**
         * ExpirationTimeExceedsMaxTimeAllowed
         */
        name: string;
        /**
         * Not applicable.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * AuthorizationErrors.AuthorizationError error.
     * Error code `31201`.
     */
    class AuthorizationError extends TwilioError {
        /**
         * Not applicable.
         */
        causes: string[];
        /**
         * Authorization error
         */
        description: string;
        /**
         * The request requires user authentication. The server understood the request, but is refusing to fulfill it.
         */
        explanation: string;
        /**
         * AuthorizationError
         */
        name: string;
        /**
         * Not applicable.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * AuthorizationErrors.RateExceededError error.
     * Error code `31206`.
     */
    class RateExceededError extends TwilioError {
        /**
         * Rate limit exceeded.
         */
        causes: string[];
        /**
         * Rate exceeded authorized limit.
         */
        description: string;
        /**
         * The request performed exceeds the authorized limit.
         */
        explanation: string;
        /**
         * RateExceededError
         */
        name: string;
        /**
         * Ensure message send rate does not exceed authorized limits.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * AuthorizationErrors.CallMessageEventTypeInvalidError error.
     * Error code `31210`.
     */
    class CallMessageEventTypeInvalidError extends TwilioError {
        /**
         * The Call Message Event Type is invalid and is not understood by Twilio Voice.
         */
        causes: string[];
        /**
         * Call Message Event Type is invalid.
         */
        description: string;
        /**
         * The Call Message Event Type is invalid and is not understood by Twilio Voice.
         */
        explanation: string;
        /**
         * CallMessageEventTypeInvalidError
         */
        name: string;
        /**
         * Ensure the Call Message Event Type is Valid and understood by Twilio Voice and try again.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * AuthorizationErrors.CallMessageUnexpectedStateError error.
     * Error code `31211`.
     */
    class CallMessageUnexpectedStateError extends TwilioError {
        /**
         * The Call should be at least in the ringing state to subscribe and send Call Message.
         */
        causes: string[];
        /**
         * Call is not in the expected state.
         */
        description: string;
        /**
         * The Call should be at least in the ringing state to send Call Message.
         */
        explanation: string;
        /**
         * CallMessageUnexpectedStateError
         */
        name: string;
        /**
         * Ensure the Call is at least in the ringing state and the subscription is successful and try again.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * AuthorizationErrors.PayloadSizeExceededError error.
     * Error code `31212`.
     */
    class PayloadSizeExceededError extends TwilioError {
        /**
         * The payload size of Call Message Event exceeds the authorized limit.
         */
        causes: string[];
        /**
         * Call Message Event Payload size exceeded authorized limit.
         */
        description: string;
        /**
         * The request performed to send a Call Message Event exceeds the payload size authorized limit
         */
        explanation: string;
        /**
         * PayloadSizeExceededError
         */
        name: string;
        /**
         * Reduce payload size of Call Message Event to be within the authorized limit and try again.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * AuthorizationErrors.AccessTokenRejected error.
     * Error code `51007`.
     */
    class AccessTokenRejected extends TwilioError {
        /**
         * Not applicable.
         */
        causes: string[];
        /**
         * Token authentication is rejected by authentication service
         */
        description: string;
        /**
         * The authentication service has rejected the provided Access Token. To check whether the Access Token is structurally correct, you can use the tools available at https://jwt.io. For the details of Twilio's specific Access Token implementation including the grant format, check https://www.twilio.com/docs/iam/access-tokens.
         */
        explanation: string;
        /**
         * AccessTokenRejected
         */
        name: string;
        /**
         * Not applicable.
         */
        solutions: string[];
        constructor(message: string);
    }
}
/**
 * @public
 * Forbidden errors.
 */
export declare namespace ForbiddenErrors {
    /**
     * @public
     * ForbiddenErrors.Forbidden error.
     * Error code `20403`.
     */
    class Forbidden extends TwilioError {
        /**
         * Not applicable.
         */
        causes: string[];
        /**
         * 403 Forbidden
         */
        description: string;
        /**
         * The account lacks permission to access the Twilio API. Typically this means the account has been suspended or closed. For assistance, please contact support
         */
        explanation: string;
        /**
         * Forbidden
         */
        name: string;
        /**
         * Not applicable.
         */
        solutions: string[];
        constructor(message: string);
    }
}
/**
 * @public
 * Client errors.
 */
export declare namespace ClientErrors {
    /**
     * @public
     * ClientErrors.BadRequest error.
     * Error code `31400`.
     */
    class BadRequest extends TwilioError {
        /**
         * Not applicable.
         */
        causes: string[];
        /**
         * Bad Request (HTTP/SIP)
         */
        description: string;
        /**
         * The request could not be understood due to malformed syntax.
         */
        explanation: string;
        /**
         * BadRequest
         */
        name: string;
        /**
         * Not applicable.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * ClientErrors.Forbidden error.
     * Error code `31403`.
     */
    class Forbidden extends TwilioError {
        /**
         * Not applicable.
         */
        causes: string[];
        /**
         * Forbidden (HTTP/SIP)
         */
        description: string;
        /**
         * The server understood the request, but is refusing to fulfill it.
         */
        explanation: string;
        /**
         * Forbidden
         */
        name: string;
        /**
         * Not applicable.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * ClientErrors.NotFound error.
     * Error code `31404`.
     */
    class NotFound extends TwilioError {
        /**
         * The outbound call was made to an invalid phone number.
         * The TwiML application sid is missing a Voice URL.
         */
        causes: string[];
        /**
         * Not Found (HTTP/SIP)
         */
        description: string;
        /**
         * The server has not found anything matching the request.
         */
        explanation: string;
        /**
         * NotFound
         */
        name: string;
        /**
         * Ensure the phone number dialed is valid.
         * Ensure the TwiML application is configured correctly with a Voice URL link.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * ClientErrors.RequestTimeout error.
     * Error code `31408`.
     */
    class RequestTimeout extends TwilioError {
        /**
         * Not applicable.
         */
        causes: string[];
        /**
         * Request Timeout (HTTP/SIP)
         */
        description: string;
        /**
         * A request timeout occurred.
         */
        explanation: string;
        /**
         * RequestTimeout
         */
        name: string;
        /**
         * Not applicable.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * ClientErrors.Conflict error.
     * Error code `31409`.
     */
    class Conflict extends TwilioError {
        /**
         * Not applicable.
         */
        causes: string[];
        /**
         * Conflict (HTTP)
         */
        description: string;
        /**
         * The request could not be processed because of a conflict in the current state of the resource. Another request may be in progress.
         */
        explanation: string;
        /**
         * Conflict
         */
        name: string;
        /**
         * Not applicable.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * ClientErrors.UpgradeRequired error.
     * Error code `31426`.
     */
    class UpgradeRequired extends TwilioError {
        /**
         * Not applicable.
         */
        causes: string[];
        /**
         * Upgrade Required (HTTP)
         */
        description: string;
        /**
         * This error is raised when an HTTP 426 response is received. The reason for this is most likely because of an incompatible TLS version. To mitigate this, you may need to upgrade the OS or download a more recent version of the SDK.
         */
        explanation: string;
        /**
         * UpgradeRequired
         */
        name: string;
        /**
         * Not applicable.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * ClientErrors.TooManyRequests error.
     * Error code `31429`.
     */
    class TooManyRequests extends TwilioError {
        /**
         * Not applicable.
         */
        causes: string[];
        /**
         * Too Many Requests (HTTP)
         */
        description: string;
        /**
         * Too many requests were sent in a given amount of time.
         */
        explanation: string;
        /**
         * TooManyRequests
         */
        name: string;
        /**
         * Not applicable.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * ClientErrors.TemporarilyUnavailable error.
     * Error code `31480`.
     */
    class TemporarilyUnavailable extends TwilioError {
        /**
         * Not applicable.
         */
        causes: string[];
        /**
         * Temporarily Unavailable (SIP)
         */
        description: string;
        /**
         * The callee is currently unavailable.
         */
        explanation: string;
        /**
         * TemporarilyUnavailable
         */
        name: string;
        /**
         * Not applicable.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * ClientErrors.CallTransactionDoesNotExist error.
     * Error code `31481`.
     */
    class CallTransactionDoesNotExist extends TwilioError {
        /**
         * Not applicable.
         */
        causes: string[];
        /**
         * Call/Transaction Does Not Exist (SIP)
         */
        description: string;
        /**
         * The call no longer exists.
         */
        explanation: string;
        /**
         * CallTransactionDoesNotExist
         */
        name: string;
        /**
         * Not applicable.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * ClientErrors.AddressIncomplete error.
     * Error code `31484`.
     */
    class AddressIncomplete extends TwilioError {
        /**
         * The outbound call was made with a phone number that has an invalid format.
         */
        causes: string[];
        /**
         * Address Incomplete (SIP)
         */
        description: string;
        /**
         * The provided phone number is malformed.
         */
        explanation: string;
        /**
         * AddressIncomplete
         */
        name: string;
        /**
         * Ensure the phone number dialed is formatted correctly.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * ClientErrors.BusyHere error.
     * Error code `31486`.
     */
    class BusyHere extends TwilioError {
        /**
         * Not applicable.
         */
        causes: string[];
        /**
         * Busy Here (SIP)
         */
        description: string;
        /**
         * The callee is busy.
         */
        explanation: string;
        /**
         * BusyHere
         */
        name: string;
        /**
         * Not applicable.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * ClientErrors.RequestTerminated error.
     * Error code `31487`.
     */
    class RequestTerminated extends TwilioError {
        /**
         * Not applicable.
         */
        causes: string[];
        /**
         * Request Terminated (SIP)
         */
        description: string;
        /**
         * The request has terminated as a result of a bye or cancel.
         */
        explanation: string;
        /**
         * RequestTerminated
         */
        name: string;
        /**
         * Not applicable.
         */
        solutions: string[];
        constructor(message: string);
    }
}
/**
 * @public
 * Server errors.
 */
export declare namespace ServerErrors {
    /**
     * @public
     * ServerErrors.InternalServerError error.
     * Error code `31500`.
     */
    class InternalServerError extends TwilioError {
        /**
         * Not applicable.
         */
        causes: string[];
        /**
         * Internal Server Error (HTTP/SIP)
         */
        description: string;
        /**
         * The server could not fulfill the request due to some unexpected condition.
         */
        explanation: string;
        /**
         * InternalServerError
         */
        name: string;
        /**
         * Not applicable.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * ServerErrors.BadGateway error.
     * Error code `31502`.
     */
    class BadGateway extends TwilioError {
        /**
         * Not applicable.
         */
        causes: string[];
        /**
         * Bad Gateway (HTTP/SIP)
         */
        description: string;
        /**
         * The server is acting as a gateway or proxy, and received an invalid response from a downstream server while attempting to fulfill the request.
         */
        explanation: string;
        /**
         * BadGateway
         */
        name: string;
        /**
         * Not applicable.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * ServerErrors.ServiceUnavailable error.
     * Error code `31503`.
     */
    class ServiceUnavailable extends TwilioError {
        /**
         * Not applicable.
         */
        causes: string[];
        /**
         * Service Unavailable (HTTP/SIP)
         */
        description: string;
        /**
         * The server is currently unable to handle the request due to a temporary overloading or maintenance of the server. This error can also be caused by the Application SID provided in the access token pointing to an inaccessible URL.
         */
        explanation: string;
        /**
         * ServiceUnavailable
         */
        name: string;
        /**
         * Not applicable.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * ServerErrors.GatewayTimeout error.
     * Error code `31504`.
     */
    class GatewayTimeout extends TwilioError {
        /**
         * Not applicable.
         */
        causes: string[];
        /**
         * Gateway Timeout (HTTP/SIP)
         */
        description: string;
        /**
         * The server, while acting as a gateway or proxy, did not receive a timely response from an upstream server.
         */
        explanation: string;
        /**
         * GatewayTimeout
         */
        name: string;
        /**
         * Not applicable.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * ServerErrors.DNSResolutionError error.
     * Error code `31530`.
     */
    class DNSResolutionError extends TwilioError {
        /**
         * Not applicable.
         */
        causes: string[];
        /**
         * DNS Resolution Error (HTTP/SIP)
         */
        description: string;
        /**
         * Could not connect to the server.
         */
        explanation: string;
        /**
         * DNSResolutionError
         */
        name: string;
        /**
         * Not applicable.
         */
        solutions: string[];
        constructor(message: string);
    }
}
/**
 * @public
 * SIPServer errors.
 */
export declare namespace SIPServerErrors {
    /**
     * @public
     * SIPServerErrors.BusyEverywhere error.
     * Error code `31600`.
     */
    class BusyEverywhere extends TwilioError {
        /**
         * Not applicable.
         */
        causes: string[];
        /**
         * Busy Everywhere (SIP)
         */
        description: string;
        /**
         * All possible destinations are busy.
         */
        explanation: string;
        /**
         * BusyEverywhere
         */
        name: string;
        /**
         * Not applicable.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * SIPServerErrors.Decline error.
     * Error code `31603`.
     */
    class Decline extends TwilioError {
        /**
         * Not applicable.
         */
        causes: string[];
        /**
         * Decline (SIP)
         */
        description: string;
        /**
         * The callee does not wish to participate in the call.
         */
        explanation: string;
        /**
         * Decline
         */
        name: string;
        /**
         * Not applicable.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * SIPServerErrors.DoesNotExistAnywhere error.
     * Error code `31604`.
     */
    class DoesNotExistAnywhere extends TwilioError {
        /**
         * Not applicable.
         */
        causes: string[];
        /**
         * Does Not Exist Anywhere (SIP)
         */
        description: string;
        /**
         * The requested callee does not exist anywhere.
         */
        explanation: string;
        /**
         * DoesNotExistAnywhere
         */
        name: string;
        /**
         * Not applicable.
         */
        solutions: string[];
        constructor(message: string);
    }
}
/**
 * @public
 * TwiML errors.
 */
export declare namespace TwiMLErrors {
    /**
     * @public
     * TwiMLErrors.InvalidApplicationSid error.
     * Error code `21218`.
     */
    class InvalidApplicationSid extends TwilioError {
        /**
         * Not applicable.
         */
        causes: string[];
        /**
         * Invalid ApplicationSid
         */
        description: string;
        /**
         * You attempted to initiate an outbound phone call with an invalid ApplicationSid. The application may not exist anymore or may not be available within your account
         */
        explanation: string;
        /**
         * InvalidApplicationSid
         */
        name: string;
        /**
         * Not applicable.
         */
        solutions: string[];
        constructor(message: string);
    }
}
/**
 * @public
 * General errors.
 */
export declare namespace GeneralErrors {
    /**
     * @public
     * GeneralErrors.ConnectionError error.
     * Error code `31005`.
     */
    class ConnectionError extends TwilioError {
        /**
         * Not applicable.
         */
        causes: string[];
        /**
         * Connection error
         */
        description: string;
        /**
         * A connection error occurred during the call
         */
        explanation: string;
        /**
         * ConnectionError
         */
        name: string;
        /**
         * Not applicable.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * GeneralErrors.CallCancelledError error.
     * Error code `31008`.
     */
    class CallCancelledError extends TwilioError {
        /**
         * The incoming call was cancelled because it was not answered in time or it was accepted/rejected by another application instance registered with the same identity.
         */
        causes: string[];
        /**
         * Call cancelled
         */
        description: string;
        /**
         * Unable to answer because the call has ended
         */
        explanation: string;
        /**
         * CallCancelledError
         */
        name: string;
        /**
         * Not applicable.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * GeneralErrors.TransportError error.
     * Error code `31009`.
     */
    class TransportError extends TwilioError {
        /**
         * Not applicable.
         */
        causes: string[];
        /**
         * Transport error
         */
        description: string;
        /**
         * No transport available to send or receive messages
         */
        explanation: string;
        /**
         * TransportError
         */
        name: string;
        /**
         * Not applicable.
         */
        solutions: string[];
        constructor(message: string);
    }
}
/**
 * @public
 * MalformedRequest errors.
 */
export declare namespace MalformedRequestErrors {
    /**
     * @public
     * MalformedRequestErrors.MalformedRequestError error.
     * Error code `31100`.
     */
    class MalformedRequestError extends TwilioError {
        /**
         * Invalid content or MessageType passed to sendMessage method.
         */
        causes: string[];
        /**
         * The request had malformed syntax.
         */
        description: string;
        /**
         * The request could not be understood due to malformed syntax.
         */
        explanation: string;
        /**
         * MalformedRequestError
         */
        name: string;
        /**
         * Ensure content and MessageType passed to sendMessage method are valid.
         */
        solutions: string[];
        constructor(message: string);
    }
}
/**
 * @public
 * Registration errors.
 */
export declare namespace RegistrationErrors {
    /**
     * @public
     * RegistrationErrors.RegistrationError error.
     * Error code `31301`.
     */
    class RegistrationError extends TwilioError {
        /**
         * Not applicable.
         */
        causes: string[];
        /**
         * Registration error
         */
        description: string;
        /**
         *
         */
        explanation: string;
        /**
         * RegistrationError
         */
        name: string;
        /**
         * Not applicable.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * RegistrationErrors.UnsupportedCancelMessageError error.
     * Error code `31302`.
     */
    class UnsupportedCancelMessageError extends TwilioError {
        /**
         * The identity associated with the Twilio Voice SDK is still registered to receive cancel push notification messages.
         */
        causes: string[];
        /**
         * Unsupported Cancel Message Error
         */
        description: string;
        /**
         * This version of the SDK no longer supports processing cancel push notification messages. You must register via Voice.register(...) on Android or [TwilioVoice registerWithAccessToken:deviceToken:completion:] on iOS with this version of the SDK to stop receiving cancel push notification messages. Cancellations are now handled internally and reported to you on behalf of the SDK.
         */
        explanation: string;
        /**
         * UnsupportedCancelMessageError
         */
        name: string;
        /**
         * The application must register via Voice.register(...) on Android or [TwilioVoice registerWithAccessToken:deviceToken:completion:] on iOS to stop receiving cancel push notification messages.
         */
        solutions: string[];
        constructor(message: string);
    }
}
/**
 * @public
 * UserMedia errors.
 */
export declare namespace UserMediaErrors {
    /**
     * @public
     * UserMediaErrors.PermissionDeniedError error.
     * Error code `31401`.
     */
    class PermissionDeniedError extends TwilioError {
        /**
         * The user denied the getUserMedia request.
         * The browser denied the getUserMedia request.
         * The application has not been configured with the proper permissions.
         */
        causes: string[];
        /**
         * UserMedia Permission Denied Error
         */
        description: string;
        /**
         * The browser or end-user denied permissions to user media. Therefore we were unable to acquire input audio.
         */
        explanation: string;
        /**
         * PermissionDeniedError
         */
        name: string;
        /**
         * The user should accept the request next time prompted. If the browser saved the deny, the user should change that permission in their browser.
         * The user should to verify that the browser has permission to access the microphone at this address.
         * The user should ensure that the proper permissions have been granted in the mobile device OS.
         */
        solutions: string[];
        constructor(message: string);
    }
}
/**
 * @public
 * Signaling errors.
 */
export declare namespace SignalingErrors {
    /**
     * @public
     * SignalingErrors.ConnectionDisconnected error.
     * Error code `53001`.
     */
    class ConnectionDisconnected extends TwilioError {
        /**
         * The device running your application lost its Internet connection.
         */
        causes: string[];
        /**
         * Signaling connection disconnected
         */
        description: string;
        /**
         * Raised whenever the signaling connection is unexpectedly disconnected.
         */
        explanation: string;
        /**
         * ConnectionDisconnected
         */
        name: string;
        /**
         * Ensure the device running your application has access to a stable Internet connection.
         */
        solutions: string[];
        constructor(message: string);
    }
}
/**
 * @public
 * Media errors.
 */
export declare namespace MediaErrors {
    /**
     * @public
     * MediaErrors.ClientLocalDescFailed error.
     * Error code `53400`.
     */
    class ClientLocalDescFailed extends TwilioError {
        /**
         * The Client may not be using a supported WebRTC implementation.
         * The Client may not have the necessary resources to create or apply a new media description.
         */
        causes: string[];
        /**
         * Client is unable to create or apply a local media description
         */
        description: string;
        /**
         * Raised whenever a Client is unable to create or apply a local media description.
         */
        explanation: string;
        /**
         * ClientLocalDescFailed
         */
        name: string;
        /**
         * If you are experiencing this error using the JavaScript SDK, ensure you are running it with a supported WebRTC implementation.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * MediaErrors.ServerLocalDescFailed error.
     * Error code `53401`.
     */
    class ServerLocalDescFailed extends TwilioError {
        /**
         * A server-side error has occurred.
         */
        causes: string[];
        /**
         * Server is unable to create or apply a local media description
         */
        description: string;
        /**
         * Raised whenever the Server is unable to create or apply a local media description.
         */
        explanation: string;
        /**
         * ServerLocalDescFailed
         */
        name: string;
        /**
         * If the problem persists, try connecting to another region.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * MediaErrors.ClientRemoteDescFailed error.
     * Error code `53402`.
     */
    class ClientRemoteDescFailed extends TwilioError {
        /**
         * The Client may not be using a supported WebRTC implementation.
         * The Client may be connecting peer-to-peer with another Participant that is not using a supported WebRTC implementation.
         * The Client may not have the necessary resources to apply a new media description.
         */
        causes: string[];
        /**
         * Client is unable to apply a remote media description
         */
        description: string;
        /**
         * Raised whenever the Client receives a remote media description but is unable to apply it.
         */
        explanation: string;
        /**
         * ClientRemoteDescFailed
         */
        name: string;
        /**
         * If you are experiencing this error using the JavaScript SDK, ensure you are running it with a supported WebRTC implementation.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * MediaErrors.ServerRemoteDescFailed error.
     * Error code `53403`.
     */
    class ServerRemoteDescFailed extends TwilioError {
        /**
         * The Client may not be using a supported WebRTC implementation.
         * The Client may not have the necessary resources to apply a new media description.
         * A Server-side error may have caused the Server to generate an invalid media description.
         */
        causes: string[];
        /**
         * Server is unable to apply a remote media description
         */
        description: string;
        /**
         * Raised whenever the Server receives a remote media description but is unable to apply it.
         */
        explanation: string;
        /**
         * ServerRemoteDescFailed
         */
        name: string;
        /**
         * If you are experiencing this error using the JavaScript SDK, ensure you are running it with a supported WebRTC implementation.
         * If the problem persists, try connecting to another region.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * MediaErrors.NoSupportedCodec error.
     * Error code `53404`.
     */
    class NoSupportedCodec extends TwilioError {
        /**
         * The C++ SDK was built without the recommended set of codecs.
         * The JavaScript SDK is running in a browser that does not implement the recommended set of codecs.
         */
        causes: string[];
        /**
         * No supported codec
         */
        description: string;
        /**
         * Raised whenever the intersection of codecs supported by the Client and the Server (or, in peer-to-peer, the Client and another Participant) is empty.
         */
        explanation: string;
        /**
         * NoSupportedCodec
         */
        name: string;
        /**
         * If you are experiencing this error using the C++ SDK, ensure you build it with the recommended set of codecs.
         * If you are experiencing this error using the JavaScript SDK, ensure you are using a compatible browser.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * MediaErrors.ConnectionError error.
     * Error code `53405`.
     */
    class ConnectionError extends TwilioError {
        /**
         * The Client was unable to establish a media connection.
         * A media connection which was active failed liveliness checks.
         */
        causes: string[];
        /**
         * Media connection failed
         */
        description: string;
        /**
         * Raised by the Client or Server whenever a media connection fails.
         */
        explanation: string;
        /**
         * ConnectionError
         */
        name: string;
        /**
         * If the problem persists, try connecting to another region.
         * Check your Client's network connectivity.
         * If you've provided custom ICE Servers then ensure that the URLs and credentials are valid.
         */
        solutions: string[];
        constructor(message: string);
    }
    /**
     * @public
     * MediaErrors.MediaDtlsTransportFailedError error.
     * Error code `53407`.
     */
    class MediaDtlsTransportFailedError extends TwilioError {
        /**
         * One or both of the DTLS peers have an invalid certificate.
         * One or both of the DTLS peers have an outdated version of DTLS.
         * One or both of the DTLS peers lost internet connectivity while performing a DTLS handshake.
         */
        causes: string[];
        /**
         * The media connection failed due to DTLS handshake failure
         */
        description: string;
        /**
         * There was a problem while negotiating with the remote DTLS peer. Therefore the Client will not be able to establish the media connection.
         */
        explanation: string;
        /**
         * MediaDtlsTransportFailedError
         */
        name: string;
        /**
         * Ensure that your certificate is valid.
         * Ensure that you have a stable internet connection.
         * Ensure that the browser or the Mobile SDK supports newer versions of DTLS.
         */
        solutions: string[];
        constructor(message: string);
    }
}
/**
 * @internal
 */
export declare const errorsByCode: ReadonlyMap<number, typeof TwilioError>;
