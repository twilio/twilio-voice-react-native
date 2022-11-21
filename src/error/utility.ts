import { errorsByCode } from './generated';
import { TwilioError } from './TwilioError';
import { InvalidArgumentError } from './InvalidArgumentError';

/**
 * Uses the generated error-code map to create the appropriate error.
 * If the code is "unexpected" such that there is no constructor for that
 * specific code, this function will default to a generic {@link TwilioError}.
 *
 * @param message an error message
 * @param code a Twilio error code, for example `31209`
 *
 * @returns a {@link TwilioError} or appropriate sub-class
 */
export function constructTwilioError(
  message: string,
  code: number
): TwilioError {
  if (typeof message !== 'string') {
    throw new InvalidArgumentError(
      'The "message" argument is not of type "string".'
    );
  }

  if (typeof code !== 'number') {
    throw new InvalidArgumentError(
      'The "code" argument is not of type "number".'
    );
  }

  const ErrorClass = errorsByCode.get(code);

  return typeof ErrorClass !== 'undefined'
    ? new ErrorClass(message)
    : new TwilioError(message, code);
}
