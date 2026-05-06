/**
 * Wrapped promise types.
 */
export type PromiseResolution<T> = {
  status: 'resolved';
  value: T;
};

export type PromiseRejection<T> = {
  status: 'rejected';
  error: T;
};

export type PromiseResult<S, T> = PromiseResolution<S> | PromiseRejection<T>;

/**
 * Settle a promise and safely wrap the return value.
 */
export function safelySettlePromise<S, E = unknown>(
  promise: Promise<S>
): Promise<PromiseResult<S, E>> {
  return promise
    .then((value) => ({ status: 'resolved' as const, value }))
    .catch((error: E) => ({ status: 'rejected' as const, error }));
}
