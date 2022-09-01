import { GenericError } from './GenericError';
/**
 * Error describing that the SDK has entered or is attempting to enter an
 * invalid state.
 *
 * @public
 */
export declare class InvalidStateError extends GenericError {
    constructor(message: string);
}
