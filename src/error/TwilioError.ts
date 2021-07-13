/**
 * NOTE(mhuynh): This error class exists as future-proofing.
 */
export class TwilioError extends Error {
  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, TwilioError.prototype);
    this.name = TwilioError.name;
  }
}
