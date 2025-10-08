import { InvalidArgumentError } from '../error/InvalidArgumentError';
import type { PreflightTest } from '../PreflightTest';
export declare type InvalidOptions = {
    status: 'error';
    error: InvalidArgumentError;
};
export declare type ValidOptions<T> = {
    status: 'ok';
} & T;
export declare type OptionValidation<T> = InvalidOptions | ValidOptions<T>;
export declare function validatePreflightOptions(preflightTestOptions: PreflightTest.Options): OptionValidation<{
    preflightTestOptions: PreflightTest.Options;
}>;
