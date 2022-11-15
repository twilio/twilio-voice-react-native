import { createNativeCancelledCallInviteInfo } from '../__mocks__/CancelledCallInvite';
import { CancelledCallInvite } from '../../../src/CancelledCallInvite';

describe('CancelledCallInvite class', () => {
  describe('constructor', () => {
    it('uses the passed CancelledCallInvite info', () => {
      const cancelledCallInvite = new CancelledCallInvite(
        createNativeCancelledCallInviteInfo()
      );
      expect({
        // eslint-disable-next-line dot-notation
        callSid: cancelledCallInvite['_callSid'],
        // eslint-disable-next-line dot-notation
        from: cancelledCallInvite['_from'],
        // eslint-disable-next-line dot-notation
        to: cancelledCallInvite['_to'],
      }).toEqual(createNativeCancelledCallInviteInfo());
    });
  });

  describe('.getCallSid()', () => {
    it('returns the callSid', () => {
      const callSid = new CancelledCallInvite(
        createNativeCancelledCallInviteInfo()
      ).getCallSid();
      expect(typeof callSid).toBe('string');
      expect(callSid).toBe(createNativeCancelledCallInviteInfo().callSid);
    });
  });

  describe('.getFrom()', () => {
    it('returns the from value', () => {
      const from = new CancelledCallInvite(
        createNativeCancelledCallInviteInfo()
      ).getFrom();
      expect(typeof from).toBe('string');
      expect(from).toBe(createNativeCancelledCallInviteInfo().from);
    });
  });

  describe('.getTo()', () => {
    it('returns the to value', () => {
      const to = new CancelledCallInvite(
        createNativeCancelledCallInviteInfo()
      ).getTo();
      expect(typeof to).toBe('string');
      expect(to).toBe(createNativeCancelledCallInviteInfo().to);
    });
  });
});
