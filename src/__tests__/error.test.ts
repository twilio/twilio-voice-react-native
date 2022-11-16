import { TwilioError } from '../error/TwilioError';
import { InvalidStateError } from '../error/InvalidStateError';
import {
  AuthorizationErrors,
  ForbiddenErrors,
  TwiMLErrors,
  GeneralErrors,
  MalformedRequestErrors,
  RegistrationErrors,
  ClientErrors,
  ServerErrors,
  SIPServerErrors,
  SignalingErrors,
  MediaErrors,
  errorsByCode,
} from '../error/generated';

describe('TwilioError subclass', () => {
  for (const [code, ErrorClass] of errorsByCode.entries()) {
    describe(`${ErrorClass.name} - ${code}`, () => {
      it('constructs', () => {
        expect(() => new ErrorClass('foobar')).not.toThrow();
      });

      it('defaults the message to the explanation', () => {
        let error: InstanceType<typeof ErrorClass> | null = null;
        expect(
          () => (error = new (ErrorClass as any)(undefined))
        ).not.toThrow();
        expect(error).not.toBeNull();
        const msg = `${error!.name} (${error!.code}): ${error!.explanation}`;
        expect(error!.message).toBe(msg);
      });
    });
  }
});

describe('errorsByCode', () => {
  it('is a Map', () => {
    expect(errorsByCode).toBeInstanceOf(Map);
  });

  describe('contains the proper error class for each code', () => {
    (
      [
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
      ] as const
    ).forEach(([code, errorClass]) => {
      it(`${code} => ${errorClass.name}`, () => {
        expect(errorsByCode.get(code)).toBe(errorClass);
      });
    });
  });

  it('contains "undefined" for an error code that does not exist', () => {
    expect(errorsByCode.get(999999)).toBeUndefined();
  });
});

describe('TwilioError', () => {
  it('sets an error name', () => {
    const error = new TwilioError('mock-error-message');
    expect(error.name).toBe('TwilioError');
  });

  it.each([[undefined], [0]])('sets a code "%o"', (code) => {
    const error = new TwilioError('mock-error-message', code);
    expect(error.code).toBe(code);
  });

  it('properly sets the prototype', () => {
    const error = new TwilioError('mock-error-message');
    expect(error).toBeInstanceOf(TwilioError);
  });
});

describe('InvalidStateError', () => {
  it('sets an error name', () => {
    const error = new InvalidStateError('mock-error-message');
    expect(error.name).toBe('InvalidStateError');
  });

  it('properly sets the prototype', () => {
    const error = new InvalidStateError('mock-error-message');
    expect(error).toBeInstanceOf(InvalidStateError);
  });
});
