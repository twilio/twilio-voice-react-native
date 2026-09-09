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
  /**
   * Everything runnable passed, but at least one step could not run in this
   * environment. Distinct from `success` so a run against an incomplete
   * environment is not reported as full coverage, and distinct from `failure`
   * so a missing dependency is not reported as a defect.
   */
  | 'blocked'
  | 'failure';
