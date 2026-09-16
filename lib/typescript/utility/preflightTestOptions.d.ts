import type { PreflightTest } from '../PreflightTest';
import type { OptionValidation } from './IceOptions';
export type { InvalidOptions, ValidOptions, OptionValidation, } from './IceOptions';
export { validateIceServers, validateIceTransportPolicy } from './IceOptions';
export declare function validatePreflightOptions(preflightTestOptions: PreflightTest.Options): OptionValidation<{
    preflightTestOptions: PreflightTest.Options;
}>;
