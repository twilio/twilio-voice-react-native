import {
  AuthorizationErrors,
  InvalidArgumentError,
  InvalidStateError,
  UnexpectedNativeError,
} from '../error';
import { settleNativePromise } from '../utility/nativePromise';
import { Constants } from '../constants';

describe('settleNativePromise', () => {
  it('resolves with the unwrapped value', async () => {
    const testAsyncFn = async () => ({
      [Constants.PromiseKeyStatus]:
        Constants.PromiseStatusValueResolved as const,
      [Constants.PromiseKeyValue]: 'foobar',
    });
    await expect(settleNativePromise(testAsyncFn())).resolves.toBe('foobar');
  });

  it('rejects with an error code', async () => {
    expect.assertions(2);

    const testAsyncFn = async () => ({
      [Constants.PromiseKeyStatus]:
        Constants.PromiseStatusValueRejectedWithCode as const,
      [Constants.PromiseKeyErrorCode]: 20101,
      [Constants.PromiseKeyErrorMessage]: 'foobar',
    });
    await settleNativePromise(testAsyncFn()).catch((error) => {
      expect(error).toBeInstanceOf(AuthorizationErrors.AccessTokenInvalid);
      expect(error.message).toBe('AccessTokenInvalid (20101): foobar');
    });
  });

  it('rejects with an invalid argument error', async () => {
    expect.assertions(2);

    const testAsyncFn = async () => ({
      [Constants.PromiseKeyStatus]:
        Constants.PromiseStatusValueRejectedWithName as const,
      [Constants.PromiseKeyErrorName]:
        Constants.ErrorCodeInvalidArgumentError as const,
      [Constants.PromiseKeyErrorMessage]: 'foobar',
    });
    await settleNativePromise(testAsyncFn()).catch((error) => {
      expect(error).toBeInstanceOf(InvalidArgumentError);
      expect(error.message).toBe('foobar');
    });
  });

  it('rejects with an invalid state error', async () => {
    expect.assertions(2);

    const testAsyncFn = async () => ({
      [Constants.PromiseKeyStatus]:
        Constants.PromiseStatusValueRejectedWithName as const,
      [Constants.PromiseKeyErrorName]:
        Constants.ErrorCodeInvalidStateError as const,
      [Constants.PromiseKeyErrorMessage]: 'foobar',
    });
    await settleNativePromise(testAsyncFn()).catch((error) => {
      expect(error).toBeInstanceOf(InvalidStateError);
      expect(error.message).toBe('foobar');
    });
  });

  it('rejects with an unexpected native error', async () => {
    expect.assertions(2);

    const testAsyncFn = async () => ({
      [Constants.PromiseKeyStatus]:
        Constants.PromiseStatusValueRejectedWithName as const,
      [Constants.PromiseKeyErrorName]: 'foo' as any,
      [Constants.PromiseKeyErrorMessage]: 'bar',
    });
    await settleNativePromise(testAsyncFn()).catch((error) => {
      expect(error).toBeInstanceOf(UnexpectedNativeError);
      expect(error.message).toBe('bar');
    });
  });

  it('rejects if the native promise is unexpectedly rejected', async () => {
    expect.assertions(1);

    class SomeMockNativeError extends Error {}

    const testAsyncFn = async () => {
      throw new SomeMockNativeError();
    };
    await settleNativePromise(testAsyncFn()).catch((error) => {
      expect(error).toBeInstanceOf(SomeMockNativeError);
    });
  });
});
