import * as React from 'react';

type GenericLogEntry<T> = {
  id: number;
  type: T;
  body: string;
};

type LogEntry =
  | GenericLogEntry<'info'>
  | GenericLogEntry<'warn'>
  | GenericLogEntry<'error'>;

/**
 * Intentionally a global value. If `useLogging` is used more than once, this
 * ensures that IDs are unique even between hook usages.
 */
const idGenerator: Generator<number, never, unknown> = (function * () {
  let id: number = 0;

  while (true) {
    yield id++;
  }
})();

/**
 * Echo every log entry to the console, and therefore to Metro and logcat.
 *
 * On by default. The orchestrator only reads a suite's final status, so with
 * this off a failure arrives as the bare word "failure" with no indication of
 * which step failed or why, which makes an automated run unactionable. Entries
 * are redacted before they reach here, so tokens and ICE credentials are not
 * exposed by turning it on.
 */
const DO_CONSOLE_LOG: boolean = true;

export function useLogging() {
  const [logEntries, setLogEntries] = React.useState<LogEntry[]>([]);

  /**
   * Values that get scrubbed from every logged entry, e.g. real ICE server
   * credentials a test suite fills in for a device run. A ref rather than
   * state, since updating it should never itself trigger a re-render.
   */
  const masksRef = React.useRef<string[]>([]);

  const setMasks = React.useCallback((masks: string[]) => {
    masksRef.current = masks.filter(Boolean);
  }, []);

  const redact = React.useCallback((body: string) => (
    masksRef.current.reduce(
      (redacted, mask) => redacted.split(mask).join('<REDACTED>'),
      body,
    )
  ), []);

  const bindAddLogEntry = React.useCallback(
    (type: LogEntry['type']) => (body: LogEntry['body']) => {
      const redactedBody = redact(body);

      if (DO_CONSOLE_LOG) {
        try {
          const jsonBody = JSON.parse(redactedBody);
          console.log(JSON.stringify(jsonBody, null, 2));
        } catch {}
      }
      const newLogEntry: LogEntry = {
        id: idGenerator.next().value,
        type,
        body: redactedBody,
      };
      setLogEntries((currentLogEntries) => [...currentLogEntries, newLogEntry]);
    },
    [redact, setLogEntries],
  );

  const log = React.useMemo(() => ({
    info: bindAddLogEntry('info'),
    warn: bindAddLogEntry('warn'),
    error: bindAddLogEntry('error'),
  }), [bindAddLogEntry]);

  return React.useMemo(() => ({
    logEntries,
    log,
    setMasks,
  }), [logEntries, log, setMasks]);
}
