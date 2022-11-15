/**
 * Generic Twilio error that the SDK will raise when encountering an error. Can
 * be used to describe backend errors.
 *
 * @public
 */
export class TwilioError extends Error {
  code: number | undefined;

  constructor(message: string, code?: number) {
    super(message);

    this.code = code;

    Object.setPrototypeOf(this, TwilioError.prototype);
    this.name = TwilioError.name;
  }
}
