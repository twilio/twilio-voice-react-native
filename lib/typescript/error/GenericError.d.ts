/**
 * Generic error that the SDK will raise when encountering an error. Can be
 * used to describe backend errors.
 *
 * @public
 */
export declare class GenericError extends Error {
    code: number | undefined;
    constructor(message: string, code?: number);
}
