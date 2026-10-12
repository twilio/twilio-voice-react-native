import { TwilioError } from './TwilioError';
/**
 * Error describing that the SDK has entered or is attempting to enter an
 * invalid state.
 *
 * @public
 */
export declare class UnexpectedNativeError extends TwilioError {
    description: string;
    explanation: string;
    miscellaneousInfo: any;
    constructor(message: string, miscellaneousInfo?: any);
}
