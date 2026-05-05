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

const idGenerator: Generator<number, never, unknown> = (function * () {
  let id: number = 0;

  while (true) {
    yield id++;
  }
})();

export function useLogging() {
  const [logEntries, setLogEntries] = React.useState<LogEntry[]>([]);

  const bindAddLogEntry = React.useCallback(
    (type: LogEntry['type']) => (body: LogEntry['body']) => {
      const newLogEntry: LogEntry = { id: idGenerator.next().value, type, body };
      setLogEntries((currentLogEntries) => [...currentLogEntries, newLogEntry]);
    },
    [setLogEntries],
  );

  const log = React.useMemo(() => ({
    info: bindAddLogEntry('info'),
    warn: bindAddLogEntry('warn'),
    error: bindAddLogEntry('error'),
  }), [bindAddLogEntry]);

  return React.useMemo(() => ({
    logEntries,
    log,
  }), [logEntries, log]);
}
