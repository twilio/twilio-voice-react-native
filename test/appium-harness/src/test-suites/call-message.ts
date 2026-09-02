import * as React from 'react';
import {
  Call,
  OutgoingCallMessage,
  TwilioErrors,
} from '@twilio/voice-react-native-sdk';
import type { CallMessage } from '@twilio/voice-react-native-sdk';
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
 * `call.sendMessage` and the `OutgoingCallMessage` object it resolves with.
 *
 * Places one outgoing call and sends every message variant over it.
 *
 * Sending side only: that a message is accepted, that the `OutgoingCallMessage`
 * is well-formed, and that `Sent` or `Failure` is raised. Verifying a message
 * *arrived* needs an out-of-band subscription to Twilio's voice events, which
 * the detox suite gets from `test/app/e2e/relay/server.js`.
 *
 * TODO: VBLOCKS-7132 - cover delivery and incoming messages
 * (`Call.Event.MessageReceived`, `IncomingCallMessage`) once a relay is
 * available to this harness.
 */

/**
 * How long to wait for `Call.Event.Connected` after `voice.connect` resolves.
 */
const CONNECT_TIMEOUT_MS = 30_000;

/**
 * How long to wait for `Call.Event.Disconnected` after `call.disconnect()`.
 */
const DISCONNECT_TIMEOUT_MS = 15_000;

/**
 * How long to wait for an `OutgoingCallMessage` to raise `Sent` or `Failure`.
 */
const MESSAGE_SETTLE_TIMEOUT_MS = 15_000;

/**
 * The only message type the API documents as accepted.
 */
const USER_DEFINED_MESSAGE = 'user-defined-message';

/**
 * The only content type the API documents as accepted, and the value the SDK
 * defaults to when `contentType` is omitted.
 */
const APPLICATION_JSON = 'application/json';

/**
 * Content comfortably past the documented 10 KB ceiling for a user-defined
 * message, used to drive the failure path.
 */
const OVERSIZED_CONTENT = { padding: 'x'.repeat(15 * 1024) };

/**
 * Message shapes `validateCallMessage` should refuse before `sendMessage`
 * reaches native.
 */
const INVALID_MESSAGES = {
  'validation-undefined-content': {
    description: 'content is undefined; should reject',
    message: { messageType: USER_DEFINED_MESSAGE } as any,
  },
  'validation-null-content': {
    description: 'content is null; should reject',
    message: { content: null, messageType: USER_DEFINED_MESSAGE } as any,
  },
  'validation-non-string-content-type': {
    description: 'contentType is not a string; should reject',
    message: {
      content: { key: 'value' },
      contentType: 1234,
      messageType: USER_DEFINED_MESSAGE,
    } as any,
  },
  'validation-non-string-message-type': {
    description: 'messageType is not a string; should reject',
    message: { content: { key: 'value' }, messageType: 1234 } as any,
  },
} satisfies Record<string, { description: string; message: any }>;

type InvalidMessageName = keyof typeof INVALID_MESSAGES;

/**
 * What an `OutgoingCallMessage` settled on.
 */
type MessageOutcome =
  | { settled: 'sent' }
  | { settled: 'failure'; error: unknown }
  | { settled: 'timeout' };

/**
 * Races `Sent` against `Failure` and a timeout. Whichever lands first wins.
 * Always unbinds both listeners.
 *
 * Bind this immediately after `sendMessage` resolves - the events are raised
 * against an object that only exists once the promise has settled, so there is
 * no earlier point at which to listen.
 */
const waitForMessageOutcome = (
  outgoingCallMessage: OutgoingCallMessage,
  timeoutMs: number,
): Promise<MessageOutcome> => new Promise((resolve) => {
  let settled = false;

  const settle = (outcome: MessageOutcome) => {
    if (settled) {
      return;
    }
    settled = true;
    clearTimeout(timeoutId);
    outgoingCallMessage.off(OutgoingCallMessage.Event.Sent, onSent);
    outgoingCallMessage.off(OutgoingCallMessage.Event.Failure, onFailure);
    resolve(outcome);
  };

  const timeoutId = setTimeout(() => settle({ settled: 'timeout' }), timeoutMs);

  function onSent() {
    settle({ settled: 'sent' });
  }

  function onFailure(error: unknown) {
    settle({ settled: 'failure', error });
  }

  outgoingCallMessage.on(OutgoingCallMessage.Event.Sent, onSent);
  outgoingCallMessage.on(OutgoingCallMessage.Event.Failure, onFailure);
});

/**
 * Asserts that an `OutgoingCallMessage` reports back what was sent.
 *
 * `content` is asserted against the *serialized* form: `validateCallMessage`
 * runs a non-string `content` through `JSON.stringify` before handing it to
 * native, and the `OutgoingCallMessage` is constructed from that serialized
 * value rather than the caller's object.
 */
const assertOutgoingCallMessage = (
  outgoingCallMessage: OutgoingCallMessage,
  expected: { content: unknown; contentType: string; messageType: string },
) => {
  expect(outgoingCallMessage, 'the resolved message').toBeInstanceOf(
    OutgoingCallMessage,
  );

  const expectedContent =
    typeof expected.content === 'string'
      ? expected.content
      : JSON.stringify(expected.content);

  expect(outgoingCallMessage.getContent(), 'getContent()').toBe(
    expectedContent,
  );
  expect(outgoingCallMessage.getContentType(), 'getContentType()').toBe(
    expected.contentType,
  );
  expect(outgoingCallMessage.getMessageType(), 'getMessageType()').toBe(
    expected.messageType,
  );

  const sid = outgoingCallMessage.getSid();
  expect(sid, 'getSid()').toBeTypeOf('string');
  expect(sid as string, 'getSid()').not.toHaveLength(0);
};

/**
 * Sends a message that is expected to be accepted, and asserts both the
 * resolved object and that it goes on to raise `Sent`.
 */
const sendAndExpectSent = async (
  call: Call,
  message: CallMessage,
  expectedContentType: string,
) => {
  const outgoingCallMessage = await call.sendMessage(message);

  const outcome = waitForMessageOutcome(
    outgoingCallMessage,
    MESSAGE_SETTLE_TIMEOUT_MS,
  );

  assertOutgoingCallMessage(outgoingCallMessage, {
    content: message.content,
    contentType: expectedContentType,
    messageType: message.messageType,
  });

  const settled = await outcome;

  expect(
    settled.settled,
    'the OutgoingCallMessage outcome',
  ).toBe('sent');
};

/**
 * Sends a message that is expected to be refused, and asserts that the refusal
 * arrives either as a rejection from `sendMessage` or as a `Failure` event.
 *
 * Which of the two it is depends on whether the native layer refuses the
 * message outright or accepts it and reports the failure asynchronously, so
 * both are treated as a pass and the actual path is logged.
 */
const sendAndExpectRefusal = async (
  call: Call,
  message: CallMessage,
  log: Log,
) => {
  const sendResult = await safelySettlePromise(call.sendMessage(message));

  if (sendResult.status === 'rejected') {
    log.info(JSON.stringify({
      refusedBy: 'sendMessage rejection',
      error: describeError(sendResult.error),
    }));

    // The rejection must come from native, not from JS validation - these
    // messages are structurally valid.
    expect(
      sendResult.error instanceof TwilioErrors.InvalidArgumentError,
      'the rejection came from JS validation',
    ).toBe(false);
    return;
  }

  const settled = await waitForMessageOutcome(
    sendResult.value,
    MESSAGE_SETTLE_TIMEOUT_MS,
  );

  log.info(JSON.stringify({
    refusedBy: 'OutgoingCallMessage event',
    outcome: settled.settled,
    error: settled.settled === 'failure'
      ? describeError(settled.error)
      : undefined,
  }));

  expect(settled.settled, 'the OutgoingCallMessage outcome').toBe('failure');
};

const STEPS: Array<Step<Call>> = [
  ...(Object.keys(INVALID_MESSAGES) as InvalidMessageName[]).map((name) => ({
    name,
    description: INVALID_MESSAGES[name].description,
    run: async (call: Call) => {
      const result = await safelySettlePromise(
        call.sendMessage(INVALID_MESSAGES[name].message),
      );

      expect(result.status, 'sendMessage with an invalid message').toBe(
        'rejected',
      );
      expect(
        result.status === 'rejected' ? result.error : undefined,
        'the rejection reason',
      ).toBeInstanceOf(TwilioErrors.InvalidArgumentError);
    },
  })),
  {
    name: 'send-message',
    description:
      'a user-defined message with an object content and an explicit content ' +
      'type is accepted and raises Sent',
    run: async (call) => {
      await sendAndExpectSent(
        call,
        {
          content: { message: 'ahoy from the appium harness' },
          contentType: APPLICATION_JSON,
          messageType: USER_DEFINED_MESSAGE,
        },
        APPLICATION_JSON,
      );
    },
  },
  {
    name: 'send-message-default-content-type',
    description:
      'omitting contentType defaults it to "application/json" on the ' +
      'resolved OutgoingCallMessage',
    run: async (call) => {
      await sendAndExpectSent(
        call,
        {
          content: { message: 'no explicit content type' },
          messageType: USER_DEFINED_MESSAGE,
        },
        APPLICATION_JSON,
      );
    },
  },
  {
    name: 'send-message-string-content',
    description:
      'a string content is passed through unchanged rather than being ' +
      'serialized again',
    run: async (call) => {
      await sendAndExpectSent(
        call,
        {
          content: JSON.stringify({ message: 'already serialized' }),
          contentType: APPLICATION_JSON,
          messageType: USER_DEFINED_MESSAGE,
        },
        APPLICATION_JSON,
      );
    },
  },
  {
    name: 'send-message-unrecognized-message-type',
    description:
      'a structurally valid message with an unrecognized messageType passes ' +
      'JS validation and is then refused, either by a rejection or a Failure ' +
      'event',
    run: async (call, log) => {
      await sendAndExpectRefusal(
        call,
        {
          content: { message: 'unrecognized message type' },
          contentType: APPLICATION_JSON,
          messageType: 'not-a-message-type',
        },
        log,
      );
    },
  },
  {
    name: 'send-message-oversized-content',
    description:
      'content past the documented 10 KB ceiling is refused, either by a ' +
      'rejection or a Failure event',
    run: async (call, log) => {
      await sendAndExpectRefusal(
        call,
        {
          content: OVERSIZED_CONTENT,
          contentType: APPLICATION_JSON,
          messageType: USER_DEFINED_MESSAGE,
        },
        log,
      );
    },
  },
];

/**
 * CallMessage suite.
 */
export const useCallMessageTest: UseTestSuite = (
  token,
  { voice },
  { log },
  setTestStatus,
) => {
  const perform = React.useCallback(async () => {
    setTestStatus('in-progress');


    const connectResult = await safelySettlePromise(voice.connect(token));
    if (connectResult.status === 'rejected') {
      log.error(JSON.stringify({
        message: 'voice.connect rejected',
        error: describeError(connectResult.error),
      }));
      setTestStatus('failure');
      return;
    }

    const call = connectResult.value;

    // Bound before waiting on `Connected` so nothing raised in the meantime is
    // missed. `MessageReceived` is logged here too - the far end of these
    // tests does not send anything back, but if it ever does, the log will
    // show it.
    Object.values(Call.Event).forEach((eventName) => {
      call.on(eventName, (...args: any[]) => {
        log.info(JSON.stringify({ eventName, args }));
      });
    });

    const didConnect = await waitForCallEvent(
      call,
      Call.Event.Connected,
      CONNECT_TIMEOUT_MS,
    );

    if (!didConnect) {
      await safelySettlePromise(call.disconnect());
      log.error(JSON.stringify({
        message: 'call did not raise Call.Event.Connected',
        note: `waited ${CONNECT_TIMEOUT_MS}ms`,
      }));
      setTestStatus('failure');
      return;
    }

    log.info(JSON.stringify({
      message: `established outgoing call ${call.getSid()}`,
    }));

    const results = await runSteps(STEPS, call, log);

    const disconnectedPromise = waitForCallEvent(
      call,
      Call.Event.Disconnected,
      DISCONNECT_TIMEOUT_MS,
    );

    await safelySettlePromise(call.disconnect());
    await disconnectedPromise;

    const { failed } = summarizeResults(results, log);

    setTestStatus(failed === 0 ? 'success' : 'failure');
  }, [token, voice, log, setTestStatus]);

  return { perform };
}
