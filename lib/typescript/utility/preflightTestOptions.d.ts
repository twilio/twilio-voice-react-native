import { InvalidArgumentError } from '../error/InvalidArgumentError';
import type { PreflightTest } from '../PreflightTest';
import { IceTransportPolicy, IceServer } from '../type/Ice';
export type InvalidOptions = {
    status: 'error';
    error: InvalidArgumentError;
};
export type ValidOptions<T> = {
    status: 'ok';
} & T;
export type OptionValidation<T> = InvalidOptions | ValidOptions<T>;
export declare function validateIceTransportPolicy(iceTransportPolicy: IceTransportPolicy): OptionValidation<{
    iceTransportPolicy: IceTransportPolicy;
}>;
export declare function validateIceServers(iceServers: IceServer[]): OptionValidation<{
    iceServers: IceServer[];
}>;
export declare function validatePreflightOptions(preflightTestOptions: PreflightTest.Options): OptionValidation<{
    preflightTestOptions: PreflightTest.Options;
}>;
