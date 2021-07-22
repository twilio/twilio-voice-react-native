/**
 * NOTE(mhuynh): This error class exists as future-proofing.
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
