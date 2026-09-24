import { InvalidArgumentError } from '../error/InvalidArgumentError';
import type { IceServer } from '../type/Ice';
import { IceTransportPolicy } from '../type/Ice';
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
