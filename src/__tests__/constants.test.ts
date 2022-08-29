import { Constants } from '../constants';

describe('Constants', () => {
  it('is exported as an enumeration', () => {
    expect(Constants).toBeDefined();
    expect(typeof Constants).toBe('object');
  });
});
