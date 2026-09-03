import * as React from 'react';
import { Call, TwilioErrors, Voice } from '@twilio/voice-react-native-sdk';
import type { UseTestSuite } from '../test-suites';
import { expect } from '../utilities/expect';
import {
  describeError,
  runSteps,
  summarizeResults,
  type Log,
  type Step,
} from '../utilities/run-steps';
import { safelySettlePromise } from '../utilities/safely-settle-promise';
import { waitForCallEvent } from '../utilities/wait-for-event';

/**
 * The error surface: the `TwilioErrors` classes, the JS validation layer in
 * `Voice.connect`, and the mapping that turns a native rejection into a typed
 * error.
 *
 * Worth running on a device rather than under Jest for two reasons. Every
 * generated class rebuilds its prototype chain with `Object.setPrototypeOf`,
 * and whether that survives depends on the transpile - Metro here, Jest/Babel
 * for the unit tests - so `instanceof` can break in a shipped app while passing
 * in CI. And the native-rejection-to-typed-error mapping only exists at the
 * bridge, where no mock reaches it.
 *
 * No specific error codes are asserted anywhere here: they live in generated
 * code, so hardcoding them would duplicate that data and go stale. What is
 * asserted is the contract every class must satisfy, discovered by walking the
 * namespace at runtime.
 */

/**
 * How long to wait for `Call.Event.ConnectFailure` when connecting with a
 * token the far end will refuse. Longer than a normal connect, because the
 * failure comes back from the far end rather than from local validation.
 */
const CONNECT_FAILURE_TIMEOUT_MS = 45_000;

/**
 * A token that is not a JWT at all, so it is refused without depending on any
 * particular account state.
 */
const MALFORMED_TOKEN = 'not-a-jwt';

/**
 * Message handed to every constructed error, so the `message` round-trip can be
 * asserted.
 */
const TEST_MESSAGE = 'harness error contract probe';

/**
 * What the steps in this suite work against.
 */
type Context = {
  voice: Voice;
  token: string;
};

/**
 * Anything constructible with a single message argument.
 */
type ErrorConstructor = new (message: string) => unknown;

const isErrorConstructor = (value: unknown): value is ErrorConstructor =>
  typeof value === 'function';

/**
 * Every error class the SDK exposes, discovered by walking `TwilioErrors` at
 * runtime rather than being listed here.
 *
 * The namespace holds a mix: classes directly on it (`TwilioError`,
 * `InvalidArgumentError`, ...) and sub-namespaces of generated classes
 * (`AuthorizationErrors`, `ClientErrors`, ...). The two are held to slightly
 * different contracts - only the generated ones carry a Twilio error code - so
 * they are collected separately.
 */
const collectErrorClasses = () => {
  const topLevel: Array<{ name: string; Ctor: ErrorConstructor }> = [];
  const generated: Array<{
    namespace: string;
    name: string;
    Ctor: ErrorConstructor;
  }> = [];

  for (const [exportName, exported] of Object.entries(
    TwilioErrors as unknown as Record<string, unknown>,
  )) {
    if (isErrorConstructor(exported)) {
      topLevel.push({ name: exportName, Ctor: exported });
      continue;
    }

    if (typeof exported !== 'object' || exported === null) {
      continue;
    }

    for (const [className, maybeCtor] of Object.entries(
      exported as Record<string, unknown>,
    )) {
      if (isErrorConstructor(maybeCtor)) {
        generated.push({
          namespace: exportName,
          name: className,
          Ctor: maybeCtor,
        });
      }
    }
  }

  return { topLevel, generated };
};

/**
 * The contract every error class is expected to satisfy, whatever its code.
 *
 * `instanceof` is checked three ways on purpose: against `Error`, against
 * `TwilioError`, and against the class itself. Each is a different link in the
 * chain the constructors rebuild by hand, and a transpile-level regression can
 * break one while leaving the others intact.
 */
const assertErrorContract = (
  Ctor: ErrorConstructor,
  className: string,
  { expectCode }: { expectCode: boolean },
) => {
  const error = new Ctor(TEST_MESSAGE) as TwilioErrors.TwilioError;

  expect(error, `new ${className}()`).toBeInstanceOf(Error);
  expect(error, `new ${className}()`).toBeInstanceOf(TwilioErrors.TwilioError);
  expect(error, `new ${className}()`).toBeInstanceOf(Ctor as any);

  if (expectCode) {
    // A generated class sets `name` from a string literal, so it survives
    // minification and can be compared exactly.
    expect(error.name, `${className}.name`).toBe(className);
  } else {
    // The hand-written classes set `this.name = X.name`, reading the class's
    // own function name. A minifier is free to rename the class, so an exact
    // comparison here would pass in a debug bundle and fail in a release one.
    expect(error.name, `${className}.name`).toBeTypeOf('string');
    expect(error.name, `${className}.name`).not.toHaveLength(0);
  }

  if (expectCode) {
    // Generated classes deliberately rewrite `message` into
    // `"<name> (<code>): <message>"`. Asserting the shape rather than equality
    // pins that documented format instead of fighting it - and would catch the
    // caller's message being dropped, which is the failure that would actually
    // matter.
    expect(error.message, `${className}.message`).toContain(TEST_MESSAGE);
    expect(error.message, `${className}.message`).toContain(
      `(${error.code}):`,
    );
  } else {
    expect(error.message, `${className}.message`).toBe(TEST_MESSAGE);
  }

  // `description` is asserted non-empty; every class has one.
  expect(error.description, `${className}.description`).toBeTypeOf('string');
  expect(error.description, `${className}.description`).not.toHaveLength(0);

  // `explanation` is only asserted to be a string. It is emitted verbatim from
  // `@twilio/voice-errors` by `scripts/generate-errors.js`, and 12 of that
  // package's errors have an empty explanation - of which this SDK re-exports
  // one, `RegistrationErrors.RegistrationError`. Requiring it to be non-empty
  // would fail on a content gap in an upstream package rather than on anything
  // this SDK controls.
  expect(error.explanation, `${className}.explanation`).toBeTypeOf('string');

  expect(error.causes, `${className}.causes`).toBeTypeOf('array');
  expect(error.solutions, `${className}.solutions`).toBeTypeOf('array');

  if (expectCode) {
    expect(error.code, `${className}.code`).toBeTypeOf('number');
  }
};

/**
 * Settles a `voice.connect` that JS validation is expected to refuse, asserts
 * the rejection, and returns the error so a caller can assert more about it.
 *
 * The disconnect on the unexpected-resolution path matters: if validation ever
 * lets one of these through, the step would not only fail, it would leave a live
 * call running through every step that follows - and later steps here, in
 * `voice-api-test`, and in `connect-options-test` assert that no call is up.
 * Cleaning up means a validation regression fails one step instead of
 * cascading.
 */
const expectConnectRejectedByValidation = async (
  connect: () => Promise<Call>,
  label: string,
  log: Log,
): Promise<unknown> => {
  const result = await safelySettlePromise(connect());

  log.info(JSON.stringify({
    settled: result.status,
    error: result.status === 'rejected'
      ? describeError(result.error)
      : undefined,
  }));

  if (result.status === 'resolved') {
    await safelySettlePromise(result.value.disconnect());
  }

  expect(result.status, label).toBe('rejected');

  const error = result.status === 'rejected' ? result.error : undefined;

  expect(error, 'the rejection reason').toBeInstanceOf(
    TwilioErrors.InvalidArgumentError,
  );

  return error;
};

const STEPS: Array<Step<Context>> = [
  {
    name: 'generated-error-classes',
    description:
      'every class in every TwilioErrors sub-namespace satisfies the error ' +
      'contract, including the instanceof chains its constructor rebuilds by ' +
      'hand, as bundled by Metro',
    run: async (_context, log) => {
      const { generated } = collectErrorClasses();

      // A namespace that silently stopped being exported would otherwise make
      // this step pass by having nothing to check.
      log.info(JSON.stringify({
        generatedClassCount: generated.length,
        namespaces: Object.entries(
          generated.reduce<Record<string, number>>((counts, entry) => {
            counts[entry.namespace] = (counts[entry.namespace] ?? 0) + 1;
            return counts;
          }, {}),
        ).map(([namespace, count]) => `${namespace}: ${count}`),
      }));

      expect(
        generated.length > 0,
        'TwilioErrors exposes at least one generated error class',
      ).toBe(true);

      const failures: string[] = [];

      for (const { namespace, name, Ctor } of generated) {
        try {
          assertErrorContract(Ctor, name, { expectCode: true });
        } catch (error) {
          failures.push(`${namespace}.${name}: ${describeError(error)}`);
        }
      }

      // Collected rather than thrown one at a time, so one broken class does
      // not hide the other ninety-nine.
      log.info(JSON.stringify({
        checked: generated.length,
        failed: failures.length,
        failures,
      }));

      expect(failures, 'generated error classes failing the contract')
        .toHaveLength(0);
    },
  },
  {
    name: 'top-level-error-classes',
    description:
      'the error classes exposed directly on TwilioErrors - TwilioError, ' +
      'InvalidArgumentError, InvalidStateError, UnsupportedPlatformError, ' +
      'UnexpectedNativeError - satisfy the same contract minus the code, ' +
      'which they do not carry',
    run: async (_context, log) => {
      const { topLevel } = collectErrorClasses();

      log.info(JSON.stringify({
        topLevelClasses: topLevel.map(({ name }) => name),
      }));

      expect(
        topLevel.length > 0,
        'TwilioErrors exposes at least one top-level error class',
      ).toBe(true);

      const failures: string[] = [];

      for (const { name, Ctor } of topLevel) {
        try {
          assertErrorContract(Ctor, name, { expectCode: false });
        } catch (error) {
          failures.push(`${name}: ${describeError(error)}`);
        }
      }

      log.info(JSON.stringify({
        checked: topLevel.length,
        failed: failures.length,
        failures,
      }));

      expect(failures, 'top-level error classes failing the contract')
        .toHaveLength(0);
    },
  },
  {
    name: 'connect-non-string-token',
    description:
      'connect rejects with an InvalidArgumentError for a non-string token, ' +
      'out of the JS validation layer and without reaching native',
    run: async ({ voice }, log) => {
      await expectConnectRejectedByValidation(
        () => voice.connect(1234 as unknown as string),
        'connect with a non-string token',
        log,
      );
    },
  },
  {
    name: 'connect-non-string-contact-handle',
    description:
      'connect rejects with an InvalidArgumentError for a non-string ' +
      'contactHandle',
    run: async ({ voice, token }, log) => {
      await expectConnectRejectedByValidation(
        () => voice.connect(token, {
          contactHandle: 1234 as unknown as string,
        }),
        'connect with a non-string contactHandle',
        log,
      );
    },
  },
  {
    name: 'connect-non-object-params',
    description:
      'connect rejects with an InvalidArgumentError when params is not an ' +
      'object',
    run: async ({ voice, token }, log) => {
      await expectConnectRejectedByValidation(
        () => voice.connect(token, {
          params: 'nope' as unknown as Record<string, string>,
        }),
        'connect with non-object params',
        log,
      );
    },
  },
  {
    name: 'connect-non-string-param-value',
    description:
      'connect rejects with an InvalidArgumentError when a params value is ' +
      'not a string, and the message names the offending key so a caller can ' +
      'find it',
    run: async ({ voice, token }, log) => {
      const offendingKey = 'harnessNumericParam';

      const error = await expectConnectRejectedByValidation(
        () => voice.connect(token, {
          params: { [offendingKey]: 1234 } as unknown as Record<string, string>,
        }),
        'connect with a non-string param value',
        log,
      );

      expect(
        (error as Error).message,
        'the rejection message',
      ).toContain(offendingKey);
    },
  },
  {
    name: 'connect-malformed-token-maps-native-error',
    description:
      'connecting with a token the far end refuses raises ' +
      'Call.Event.ConnectFailure carrying a mapped TwilioError, rather than a ' +
      'bare Error. This is the only step that exercises the real ' +
      'native-rejection-to-typed-error path',
    run: async ({ voice }, log) => {
      // Note that this is an outgoing call, so `connect` resolves before the
      // outcome is known - the refusal arrives later as an event. See the
      // comment at the top of `incoming-ice-test.ts` for why the accept side
      // behaves differently.
      const connectResult = await safelySettlePromise(
        voice.connect(MALFORMED_TOKEN),
      );

      if (connectResult.status === 'rejected') {
        // Some platforms may refuse before returning a call object. That is
        // still a mapped error, so assert the same contract against it.
        log.info(JSON.stringify({
          refusedBy: 'connect rejection',
          error: describeError(connectResult.error),
        }));

        expect(
          connectResult.error,
          'the connect rejection reason',
        ).toBeInstanceOf(TwilioErrors.TwilioError);
        return;
      }

      const call = connectResult.value;

      let connectFailureError: unknown;
      call.on(Call.Event.ConnectFailure, (error) => {
        connectFailureError = error;
      });

      const didFail = await waitForCallEvent(
        call,
        Call.Event.ConnectFailure,
        CONNECT_FAILURE_TIMEOUT_MS,
      );

      // Tear down regardless, so a call is never left up for the next step.
      await safelySettlePromise(call.disconnect());

      log.info(JSON.stringify({
        connectFailureRaised: didFail,
        error: connectFailureError instanceof TwilioErrors.TwilioError
          ? {
              name: connectFailureError.name,
              code: connectFailureError.code,
              message: connectFailureError.message,
            }
          : describeError(connectFailureError),
      }));

      expect(
        didFail,
        'Call.Event.ConnectFailure was raised within ' +
          `${CONNECT_FAILURE_TIMEOUT_MS}ms`,
      ).toBe(true);

      expect(
        connectFailureError,
        'the ConnectFailure error',
      ).toBeInstanceOf(TwilioErrors.TwilioError);

      // A numeric code is what distinguishes an error that came back through
      // `constructTwilioError`'s code mapping from one constructed without a
      // code. The specific value is not asserted - see the note at the top of
      // this file.
      expect(
        (connectFailureError as TwilioErrors.TwilioError).code,
        'the ConnectFailure error code',
      ).toBeTypeOf('number');
    },
  },
];

/**
 * Error surface suite.
 */
export const useErrorsTest: UseTestSuite = (
  token,
  { voice },
  { log },
  setTestStatus,
) => {
  const perform = React.useCallback(async () => {
    setTestStatus('in-progress');

    const results = await runSteps(STEPS, { voice, token }, log);
    const { failed } = summarizeResults(results, log);

    setTestStatus(failed === 0 ? 'success' : 'failure');
  }, [token, voice, log, setTestStatus]);

  return { perform };
}
