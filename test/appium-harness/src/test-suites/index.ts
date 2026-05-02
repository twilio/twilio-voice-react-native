import { useLogging } from '../hooks/useLogging';
import { useVoice } from '../hooks/useVoice';

export type TestSuite = (
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
