import { InvalidArgumentError } from '../error/InvalidArgumentError';
import type { PreflightTest } from '../PreflightTest';
export type InvalidOptions = {
    status: 'error';
    error: InvalidArgumentError;
};
export type ValidOptions<T> = {
    status: 'ok';
} & T;
export type OptionValidation<T> = InvalidOptions | ValidOptions<T>;
export declare function validatePreflightOptions(preflightTestOptions: PreflightTest.Options): OptionValidation<{
    preflightTestOptions: PreflightTest.Options;
}>;
