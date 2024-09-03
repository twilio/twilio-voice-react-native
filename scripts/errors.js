'use strict';

const ERRORS = [
  /**
   * AuthorizationErrors
   */
  'AuthorizationErrors.AccessTokenInvalid', // 20101
  'AuthorizationErrors.AccessTokenHeaderInvalid', // 20102
  'AuthorizationErrors.AccessTokenIssuerInvalid', // 20103
  'AuthorizationErrors.AccessTokenExpired', // 20104
  'AuthorizationErrors.AccessTokenNotYetValid', // 20105
  'AuthorizationErrors.AccessTokenGrantsInvalid', // 20106
  'AuthorizationErrors.AccessTokenSignatureInvalid', // 20107
  'AuthorizationErrors.AuthenticationFailed', // 20151
  'AuthorizationErrors.ExpirationTimeExceedsMaxTimeAllowed', // 20157

  /**
   * ForbiddenErrors
   */
  'ForbiddenErrors.Forbidden', // 20403

  /**
   * TwiMLErrors
   */
  'TwiMLErrors.InvalidApplicationSid', // 21218

  /**
   * GeneralErrors
   */
  'GeneralErrors.ConnectionError', // 31005
  'GeneralErrors.CallCancelledError', // 31008
  'GeneralErrors.TransportError', // 31009

  /**
   * MalformedRequestErrors
   */
  'MalformedRequestErrors.MalformedRequestError', // 31100

  /**
   * AuthorizationErrors
   */
  'AuthorizationErrors.AuthorizationError', // 31201
  'AuthorizationErrors.RateExceededError', // 31206
  'AuthorizationErrors.CallMessageEventTypeInvalidError', // 31210
  'AuthorizationErrors.CallMessageUnexpectedStateError', // 31211
  'AuthorizationErrors.PayloadSizeExceededError', // 31212

  /**
   * RegistrationErrors
   */
  'RegistrationErrors.RegistrationError', // 31301
  'RegistrationErrors.UnsupportedCancelMessageError', // 31302

  /**
   * ClientErrors
   */
  'ClientErrors.BadRequest', // 31400
  'ClientErrors.Forbidden', // 31403
  'ClientErrors.NotFound', // 31404
  'ClientErrors.RequestTimeout', // 31408
  'ClientErrors.Conflict', // 31409
  'ClientErrors.UpgradeRequired', // 31426
  'ClientErrors.TooManyRequests', // 31429
  'ClientErrors.TemporarilyUnavailable', // 31480
  'ClientErrors.CallTransactionDoesNotExist', // 31481
  'ClientErrors.AddressIncomplete', // 31484
  'ClientErrors.BusyHere', // 31486
  'ClientErrors.RequestTerminated', // 31487

  /**
   * ServerErrors
   */
  'ServerErrors.InternalServerError', // 31500
  'ServerErrors.BadGateway', // 31502
  'ServerErrors.ServiceUnavailable', // 31503
  'ServerErrors.GatewayTimeout', // 31504
  'ServerErrors.DNSResolutionError', // 31530

  /**
   * SIPServerErrors
   */
  'SIPServerErrors.BusyEverywhere', // 31600
  'SIPServerErrors.Decline', // 31603
  'SIPServerErrors.DoesNotExistAnywhere', // 31604

  /**
   * AuthorizationErrors
   */
  'AuthorizationErrors.AccessTokenRejected', // 51007

  /**
   * SignalingErrors
   */
  'SignalingErrors.ConnectionDisconnected', // 53001

  /**
   * MediaErrors
   */
  'MediaErrors.ClientLocalDescFailed', // 53400
  'MediaErrors.ServerLocalDescFailed', // 53401
  'MediaErrors.ClientRemoteDescFailed', // 53402
  'MediaErrors.ServerRemoteDescFailed', // 53403
  'MediaErrors.NoSupportedCodec', // 53404
  'MediaErrors.ConnectionError', // 53405
  'MediaErrors.MediaDtlsTransportFailedError', // 53407

  /**
   * UserMediaErrors
   */
  'UserMediaErrors.PermissionDeniedError', // 31401
];

module.exports = {
  ERRORS,
};
