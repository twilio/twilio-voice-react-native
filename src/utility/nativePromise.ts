import { Constants } from '../constants';
import { InvalidArgumentError } from '../error/InvalidArgumentError';
import { InvalidStateError } from '../error/InvalidStateError';
import { UnexpectedNativeError } from '../error/UnexpectedNativeError';
import { constructTwilioError } from '../error/utility';
import { NativePromise } from '../type/NativeModule';

export const settleNativePromise = async <T>(
  nativePromise: NativePromise<T>
): Promise<T> => {
  const nativePromiseResult = await nativePromise;

  if (
    nativePromiseResult.promiseKeyStatus ===
    Constants.PromiseStatusValueRejectedWithCode
  ) {
    throw constructTwilioError(
      nativePromiseResult.promiseKeyErrorMessage,
      nativePromiseResult.promiseKeyErrorCode
    );
  }

  if (
    nativePromiseResult.promiseKeyStatus ===
    Constants.PromiseStatusValueRejectedWithName
  ) {
    const { promiseKeyErrorMessage: message } = nativePromiseResult;

    switch (nativePromiseResult.promiseKeyErrorName) {
      case Constants.ErrorCodeInvalidArgumentError:
        throw new InvalidArgumentError(message);
      case Constants.ErrorCodeInvalidStateError:
        throw new InvalidStateError(message);
      default:
        throw new UnexpectedNativeError(message);
    }
  }

  return nativePromiseResult.promiseKeyValue;
};
