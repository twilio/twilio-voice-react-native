import { TwilioError } from './TwilioError';
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
export declare function constructTwilioError(message: string, code: number): TwilioError;
