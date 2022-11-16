/**
 * Generic Twilio error that the SDK will raise when encountering an error. Can
 * be used to describe backend errors.
 *
 * @public
 */
export class TwilioError extends Error {
  causes: string[] = [];
  code: number | undefined;
  description: string = 'Generic Twilio error.';
  explanation: string = 'The SDK has encountered an unexpected error.';
  solutions: string[] = [];

  constructor(message: string, code?: number) {
    super(message);

    this.code = code;

    Object.setPrototypeOf(this, TwilioError.prototype);
    this.name = TwilioError.name;
  }
}
