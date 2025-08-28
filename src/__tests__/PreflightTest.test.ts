import { PreflightTest } from '../PreflightTest';
import { Constants } from '../constants';

jest.mock('../common');

describe('PreflightTest', () => {
  describe('state enum', () => {
    it('should match the generated constants', () => {
      expect(PreflightTest.State.Completed).toStrictEqual(
        Constants.PreflightTestStateCompleted
      );
    });
  });
});
