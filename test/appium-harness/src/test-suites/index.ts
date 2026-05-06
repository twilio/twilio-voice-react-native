import { useLogging } from '../hooks/useLogging';
import { useVoice } from '../hooks/useVoice';

/**
 * Naming the expected test suite type UseTestSuite makes it clear that it will
 * be used as a React Hook.
 */
export type UseTestSuite = (
  token: string,
  voice: ReturnType<typeof useVoice>,
  logging: ReturnType<typeof useLogging>,
  setTestStatus: (testStatus: TestStatus) => void,
) => {
  perform: () => Promise<void>;
}

export type TestStatus =
  | 'not-started'
  | 'in-progress'
  | 'success'
  | 'failure';
