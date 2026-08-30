/**
 * A dependency-free, chainable `expect` shim.
 *
 * The Test Harness is a React Native application bundled by Metro and run on a
 * device, not a Jest environment, so test suites have no `expect` available to
 * them. Depending on the standalone `expect` package is not a good trade here:
 * it pulls in `jest-util`/`jest-matcher-utils`, which reach for Node builtins
 * Metro does not polyfill, and its failure messages are `pretty-format` output
 * carrying ANSI escape codes. Those messages end up in the harness log, which
 * is rendered into a `<Text>` element and scraped by the Appium orchestrator,
 * where escape sequences and multi-line diffs are noise.
 *
 * So: matcher names and call syntax match Jest where a Jest equivalent exists,
 * failures throw an `AssertionError` with a single-line plain-text message, and
 * the surface stays small.
 *
 * Extensions beyond Jest's API, for this harness's needs:
 * - An optional second argument to `expect` labels the value in failure
 *   messages, e.g. `expect(call.isMuted(), 'call.isMuted()')`. Jest gets that
 *   context from the enclosing test name; suites here are a flat list of steps.
 * - `toBeTypeOf` asserts on `typeof`.
 * - `toMatchRecordTypes` asserts the types of named keys of a record, without
 *   requiring the key set to be exhaustive - useful for native payloads such
 *   as RTC stats, which may gain fields.
 *
 * Deliberately omitted: `toEqual` (only the stricter `toStrictEqual` is
 * provided, so there is no subtly-different second deep equality to reason
 * about), snapshot matchers, mock matchers, and `toThrow` (suites settle
 * promises with `safelySettlePromise` and assert on the result instead).
 */

export class AssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AssertionError';
  }
}

export type ValueType =
  | 'bigint'
  | 'boolean'
  | 'function'
  | 'number'
  | 'object'
  | 'string'
  | 'symbol'
  | 'undefined';

/**
 * Single-line, human-readable rendering of a value for failure messages.
 */
const format = (value: unknown): string => {
  if (typeof value === 'undefined') {
    return 'undefined';
  }

  if (typeof value === 'function') {
    return `[Function ${value.name || 'anonymous'}]`;
  }

  if (typeof value === 'bigint') {
    return `${value}n`;
  }

  if (typeof value === 'symbol') {
    return value.toString();
  }

  if (value instanceof Error) {
    return `${value.name}: ${value.message}`;
  }

  if (value instanceof RegExp) {
    return value.toString();
  }

  try {
    const json = JSON.stringify(value);
    // `JSON.stringify` returns `undefined` for values it cannot represent.
    return typeof json === 'string' ? json : String(value);
  } catch {
    // Circular structures, mostly.
    return String(value);
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/**
 * Structural equality. `Object.is` at the leaves, so `NaN` equals `NaN` and
 * `0` does not equal `-0`, matching `toStrictEqual`.
 */
const deepStrictEqual = (a: unknown, b: unknown): boolean => {
  if (Object.is(a, b)) {
    return true;
  }

  if (a instanceof Date || b instanceof Date) {
    return (
      a instanceof Date && b instanceof Date && a.getTime() === b.getTime()
    );
  }

  if (Array.isArray(a) || Array.isArray(b)) {
    return (
      Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((element, index) => deepStrictEqual(element, b[index]))
    );
  }

  if (!isRecord(a) || !isRecord(b)) {
    return false;
  }

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  return (
    aKeys.length === bKeys.length &&
    aKeys.every(
      (key) =>
        Object.prototype.hasOwnProperty.call(b, key) &&
        deepStrictEqual(a[key], b[key]),
    )
  );
};

export interface Matchers {
  /**
   * `Object.is` reference/primitive equality.
   */
  toBe(expected: unknown): void;

  /**
   * Structural equality.
   */
  toStrictEqual(expected: unknown): void;

  toBeTruthy(): void;
  toBeFalsy(): void;
  toBeNull(): void;
  toBeDefined(): void;
  toBeUndefined(): void;

  toBeInstanceOf(expected: Function): void;

  /**
   * Substring containment for strings, element containment (by structural
   * equality) for arrays.
   */
  toContain(expected: unknown): void;

  /**
   * Length of a string or array.
   */
  toHaveLength(expected: number): void;

  /**
   * Regular expression or substring match against a string.
   */
  toMatch(expected: RegExp | string): void;

  /**
   * Not a Jest matcher. Asserts on `typeof`, or that the value is an array
   * when passed `'array'`.
   */
  toBeTypeOf(expected: ValueType | 'array'): void;

  /**
   * Not a Jest matcher. Asserts that each named key of a record holds a value
   * of the given type. Does not require the key set to be exhaustive.
   */
  toMatchRecordTypes(expected: Record<string, ValueType | 'array'>): void;
}

const isTypeOf = (value: unknown, expected: ValueType | 'array'): boolean =>
  expected === 'array' ? Array.isArray(value) : typeof value === expected;

const createMatchers = (
  received: unknown,
  label: string | undefined,
  isNot: boolean,
): Matchers => {
  const subject = label
    ? `${label} (${format(received)})`
    : format(received);

  /**
   * Throws unless the matcher outcome agrees with the negation state.
   *
   * `expectation` reads as the continuation of `expected <subject> [not] ...`,
   * e.g. `to be true`.
   */
  const check = (pass: boolean, expectation: string) => {
    if (pass !== isNot) {
      return;
    }

    throw new AssertionError(
      `expected ${subject}${isNot ? ' not' : ''} ${expectation}`,
    );
  };

  /**
   * Throws regardless of the negation state. For a matcher's own type guard -
   * a non-string handed to `toMatch` - `check(false, ...)` would pass silently
   * under `.not`, but such a value can neither satisfy nor violate the
   * assertion, and suites lean on `.not.toHaveLength(0)` to mean "non-empty".
   *
   * Annotated `never` so a call narrows, the way an early `return` did.
   */
  const fail: (expectation: string) => never = (expectation) => {
    throw new AssertionError(`expected ${subject} ${expectation}`);
  };

  return {
    toBe: (expected) =>
      check(Object.is(received, expected), `to be ${format(expected)}`),

    toStrictEqual: (expected) =>
      check(
        deepStrictEqual(received, expected),
        `to strictly equal ${format(expected)}`,
      ),

    toBeTruthy: () => check(Boolean(received), 'to be truthy'),

    toBeFalsy: () => check(!received, 'to be falsy'),

    toBeNull: () => check(received === null, 'to be null'),

    toBeDefined: () =>
      check(typeof received !== 'undefined', 'to be defined'),

    toBeUndefined: () =>
      check(typeof received === 'undefined', 'to be undefined'),

    toBeInstanceOf: (expected) =>
      check(
        received instanceof expected,
        `to be an instance of ${expected.name || format(expected)}`,
      ),

    toContain: (expected) => {
      if (typeof received === 'string') {
        check(
          typeof expected === 'string' && received.includes(expected),
          `to contain the substring ${format(expected)}`,
        );
        return;
      }

      check(
        Array.isArray(received) &&
          received.some((element) => deepStrictEqual(element, expected)),
        `to contain ${format(expected)}`,
      );
    },

    toHaveLength: (expected) => {
      if (typeof received !== 'string' && !Array.isArray(received)) {
        fail(`to have length ${expected}, but it has no length`);
      }

      check(received.length === expected, `to have length ${expected}`);
    },

    toMatch: (expected) => {
      if (typeof received !== 'string') {
        fail(`to match ${format(expected)}, but it is not a string`);
      }

      check(
        typeof expected === 'string'
          ? received.includes(expected)
          : expected.test(received),
        `to match ${format(expected)}`,
      );
    },

    toBeTypeOf: (expected) =>
      check(
        isTypeOf(received, expected),
        `to be of type ${expected}, but it is of type ` +
          `${Array.isArray(received) ? 'array' : typeof received}`,
      ),

    toMatchRecordTypes: (expected) => {
      if (!isRecord(received)) {
        fail(`to be a record, but it is of type ${typeof received}`);
      }

      const mismatches = Object.entries(expected)
        .filter(([key, expectedType]) => !isTypeOf(received[key], expectedType))
        .map(([key, expectedType]) => {
          const actual = Array.isArray(received[key])
            ? 'array'
            : typeof received[key];
          return `${key} is ${actual}, expected ${expectedType}`;
        });

      check(
        mismatches.length === 0,
        mismatches.length === 0
          ? 'to match the given record types'
          : `to match the given record types (${mismatches.join('; ')})`,
      );
    },
  };
};

/**
 * Chainable assertion entry point.
 *
 * @param received - the value under test.
 * @param label - optional description of the value, included in failure
 * messages. Not part of Jest's API; see the note at the top of this file.
 */
export function expect(
  received: unknown,
  label?: string,
): Matchers & { not: Matchers } {
  return {
    ...createMatchers(received, label, false),
    not: createMatchers(received, label, true),
  };
}
