/**
 * Wrapped promise types.
 */

/**
 * @template T
 * @typedef {{ status: 'resolved'; value: T }} PromiseResolution
 */

/**
 * @template T
 * @typedef {{ status: 'rejected'; error: T }} PromiseRejection
 */

/**
 * @template S
 * @template T
 * @typedef {PromiseResolution<S> | PromiseRejection<T>} PromiseResult
 */

/**
 * Settle a promise and safely wrap the return value.
 * @template S
 * @template [E=unknown]
 * @param {Promise<S>} promise
 * @returns {Promise<PromiseResult<S, E>>}
 */
export function safelySettlePromise(promise) {
  return promise
    .then((value) => /** @type {PromiseResolution<S>} */ ({ status: 'resolved', value }))
    .catch((error) => /** @type {PromiseRejection<E>} */ ({ status: 'rejected', error }));
}
