import { TwilioError } from './TwilioError';

/**
 * Error describing that the SDK has entered or is attempting to enter an
 * invalid state.
 *
 * @public
 */
export class UnexpectedNativeError extends TwilioError {
  description: string = 'Unexpected native error.';
  explanation: string = 'An unexpected native error has occurred.';
  miscellaneousInfo: any;

  constructor(message: string, miscellaneousInfo?: any) {
    super(message);

    Object.setPrototypeOf(this, UnexpectedNativeError.prototype);
    this.name = UnexpectedNativeError.name;
    this.miscellaneousInfo = miscellaneousInfo;
  }
}
