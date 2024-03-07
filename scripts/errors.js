'use strict';

/**
 * This script is used to generate Typescript error classes from the
 * `@twilio/voice-errors` repository for usage within the SDK.
 */

const fs = require('fs');
const VoiceErrors = require('@twilio/voice-errors');
const USED_ERRORS = [
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
  'AuthorizationErrors.PayloadSizeExceededError', // 31209

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
];

let output = `/**
 * This is a generated file. Any modifications here will be overwritten.
 * See scripts/errors.js.
 */
import { TwilioError } from './TwilioError';
\n`;

const escapeQuotes = (str) => str.replace("'", "\\'");
const generateStringArray = (arr) =>
  arr
    ? `[
      ${arr.map((value) => `'${escapeQuotes(value)}'`).join(',\n      ')},
    ]`
    : '[]';

const generateDocstring = (content) => [
  '/**',
  ...content.map((c) => ` * ${c}`),
  ' */',
];

const generateDefinition = ([code, subclassName, errorName, error]) => `\
  /**
   * @public
   * ${subclassName}Errors.${errorName} error.
   * Error code \`${code}\`.
   */
  export class ${errorName} extends TwilioError {
    ${generateDocstring(error.causes ?? ['Not applicable.']).join('\n    ')}
    causes: string[] = ${generateStringArray(error.causes)};
    ${generateDocstring([error.description]).join('\n    ')}
    description: string = '${escapeQuotes(error.description)}';
    ${generateDocstring([error.explanation]).join('\n    ')}
    explanation: string = '${escapeQuotes(error.explanation)}';
    ${generateDocstring([error.name]).join('\n    ')}
    name: string = '${escapeQuotes(errorName)}';
    ${generateDocstring(error.solutions ?? ['Not applicable.']).join('\n    ')}
    solutions: string[] = ${generateStringArray(error.solutions)};

    constructor(message: string) {
      super(message, ${code});
      Object.setPrototypeOf(this, ${subclassName}Errors.${errorName}.prototype);

      const msg: string = typeof message === 'string'
        ? message
        : this.explanation;

      this.message = \`\${this.name} (\${this.code}): \${msg}\`;
    }
  }`;

const generateNamespace = (name, contents) => `/**
 * @public
 * ${name} errors.
 */
export namespace ${name}Errors {
${contents}
}\n\n`;

const generateMapEntry = ([code, fullName]) => `[${code}, ${fullName}]`;

const sorter = ([codeA], [codeB]) => codeA - codeB;

const mapEntries = [];
const namespaceDefinitions = new Map();

for (const topClass of VoiceErrors) {
  for (const subclass of topClass.subclasses) {
    const subclassName = subclass.class.replace(' ', '');

    if (!namespaceDefinitions.has(subclassName)) {
      namespaceDefinitions.set(subclassName, []);
    }

    const definitions = namespaceDefinitions.get(subclassName);
    for (const error of subclass.errors) {
      const code =
        topClass.code * 1000 + (subclass.code || 0) * 100 + error.code;
      const errorName = error.name.replace(' ', '');

      const fullName = `${subclassName}Errors.${errorName}`;
      if (USED_ERRORS.includes(fullName)) {
        definitions.push([code, subclassName, errorName, error]);
        mapEntries.push([code, fullName]);
      }
    }
  }
}

for (const [subclassName, definitions] of namespaceDefinitions.entries()) {
  if (definitions.length) {
    output += generateNamespace(
      subclassName,
      definitions.sort(sorter).map(generateDefinition).join('\n\n')
    );
  }
}

output += `/**
 * @internal
 */
export const errorsByCode: ReadonlyMap<number, typeof TwilioError> = new Map([
  ${mapEntries.sort(sorter).map(generateMapEntry).join(',\n  ')},
]);

Object.freeze(errorsByCode);\n`;

fs.writeFileSync('./src/error/generated.ts', output, 'utf8');
