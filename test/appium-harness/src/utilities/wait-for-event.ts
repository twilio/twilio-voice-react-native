import type { Call, Voice } from '@twilio/voice-react-native-sdk';

/**
 * Event-race helpers shared by the test suites.
 *
 * Every suite that drives a call ends up needing the same shape: bind a
 * listener, race it against a deadline, and always unbind. Getting the unbind
 * wrong leaks a listener onto an object that outlives the suite - `Voice` in
 * particular is created once per app launch and shared by every suite - so this
 * lives in one place rather than being reimplemented per suite.
 */

/**
 * Races a call event against a timeout. Resolves `true` if the event landed
 * first, `false` on timeout. Always unbinds its listener.
 */
export const waitForCallEvent = (
  call: Call,
  eventName: Call.Event,
  timeoutMs: number,
): Promise<boolean> => new Promise((resolve) => {
  let settled = false;

  const settle = (didRaise: boolean) => {
    if (settled) {
      return;
    }
    settled = true;
    clearTimeout(timeoutId);
    call.off(eventName, onEvent);
    resolve(didRaise);
  };

  const timeoutId = setTimeout(() => settle(false), timeoutMs);

  function onEvent() {
    settle(true);
  }

  call.on(eventName, onEvent);
});

/**
 * Races a voice event against a timeout. Resolves with the arguments the event
 * carried, or `null` on timeout. Always unbinds its listener.
 *
 * Unbinding matters more here than for a call: the `Voice` object is shared
 * across every suite for the lifetime of the app, so a leaked listener would
 * still be attached the next time a different suite runs.
 */
export const waitForVoiceEvent = (
  voice: Voice,
  eventName: Voice.Event,
  timeoutMs: number,
): Promise<any[] | null> => new Promise((resolve) => {
  let settled = false;

  const settle = (args: any[] | null) => {
    if (settled) {
      return;
    }
    settled = true;
    clearTimeout(timeoutId);
    voice.off(eventName, onEvent);
    resolve(args);
  };

  const timeoutId = setTimeout(() => settle(null), timeoutMs);

  function onEvent(...args: any[]) {
    settle(args);
  }

  voice.on(eventName, onEvent);
});
