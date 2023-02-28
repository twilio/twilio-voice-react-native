import type { Constants } from '../constants';

/**
 * @public
 * CallKit related types.
 */
export namespace CallKit {
  /**
   * @public
   * iOS CallKit configuration options.
   */
  export type ConfigurationOptions = {
    /**
     * Filename of a 80x80 PNG image that will show in the system call UI as the app icon.
     */
    [Constants.CallKitIconTemplateImageData]: string;
    /**
     * Include call history in system recents (`true` by default).
     *
     * @remarks
     * Only supported on iOS 11 and newer versions.
     */
    [Constants.CallKitIncludesCallsInRecents]: boolean;
    /**
     * Maximum number of call groups (`2` by default).
     */
    [Constants.CallKitMaximumCallGroups]: number;
    /**
     * Maximum number of calls per group (`5` by default).
     */
    [Constants.CallKitMaximumCallsPerCallGroup]: number;
    /**
     * Filename of the incoming call ringing tone.
     */
    [Constants.CallKitRingtoneSound]: string;
    /**
     * Supported handle types.
     *
     * @remarks
     * See {@link CallKitHandleType}.
     */
    [Constants.CallKitSupportedHandleTypes]: HandleType[];
  };

  /**
   * @public
   * Enumeration of all supported handle types by iOS CallKit.
   */
  export enum HandleType {
    /**
     * Generic handle.
     */
    Generic = 0,
    /**
     * Phone number handle.
     */
    PhoneNumber = 1,
    /**
     * Email address handle.
     */
    EmailAddress = 2,
  }
}
