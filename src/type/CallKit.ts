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
    callKitIconTemplateImageData: string;
    /**
     * Include call history in system recents (`true` by default).
     *
     * @remarks
     * Only supported on iOS 11 and newer versions.
     */
    callKitIncludesCallsInRecents: boolean;
    /**
     * Maximum number of call groups (`2` by default).
     */
    callKitMaximumCallGroups: number;
    /**
     * Maximum number of calls per group (`5` by default).
     */
    callKitMaximumCallsPerCallGroup: number;
    /**
     * Filename of the incoming call ringing tone.
     */
    callKitRingtoneSound: string;
    /**
     * Supported handle types.
     *
     * @remarks
     * See {@link CallKit.HandleType}.
     */
    callKitSupportedHandleTypes: HandleType[];
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
