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

const idGenerator = (function * () {
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

  const info = React.useCallback(bindAddLogEntry('info'), [bindAddLogEntry]);
  const warn = React.useCallback(bindAddLogEntry('warn'), [bindAddLogEntry]);
  const error = React.useCallback(bindAddLogEntry('error'), [bindAddLogEntry]);

  return { logEntries, log: { info, warn, error } };
}
