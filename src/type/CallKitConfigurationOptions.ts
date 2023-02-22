import type { Constants } from '../constants';

/**
 * iOS CallKit configuration option keys.
 */
export type NativeCallKitConfigurationOptions =
  | Constants.CallKitMaximumCallGroups
  | Constants.CallKitMaximumCallsPerCallGroup
  | Constants.CallKitIncludesCallsInRecents
  | Constants.CallKitSupportedHandleTypes
  | Constants.CallKitIconTemplateImageData
  | Constants.CallKitRingtoneSound;

/**
 * Enumeration of all supported handle types by iOS CallKit.
 */
export enum CallKitHandleType {
  Generic = 0,
  PhoneNumber,
  EmailAddress,
}
