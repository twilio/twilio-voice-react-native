/**
 * Generic Twilio error that the SDK will raise when encountering an error. Can
 * be used to describe backend errors.
 *
 * @public
 */
export declare class TwilioError extends Error {
    causes: string[];
    code: number | undefined;
    description: string;
    explanation: string;
    solutions: string[];
    constructor(message: string, code?: number);
}
