/**
 * Generic Twilio error that the SDK will raise when encountering an error. Can
 * be used to describe backend errors.
 *
 * @public
 */
export class TwilioError extends Error {
    causes = [];
    code;
    description = 'Generic Twilio error.';
    explanation = 'The SDK has encountered an unexpected error.';
    solutions = [];
    constructor(message, code) {
        super(message);
        this.code = code;
        Object.setPrototypeOf(this, TwilioError.prototype);
        this.name = TwilioError.name;
    }
}
