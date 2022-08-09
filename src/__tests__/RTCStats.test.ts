import { RTCStats } from '../type/RTCStats';

describe('RTCStats', () => {
  describe('IceCandidatePairState', () => {
    it('is exported an enumeration', () => {
      expect(RTCStats.IceCandidatePairState).toBeDefined();
      expect(typeof RTCStats.IceCandidatePairState).toBe('object');
    });
  });
});
