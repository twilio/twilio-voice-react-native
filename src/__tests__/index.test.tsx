import { MockNativeEventEmitter } from './mocks/NativeEventEmitter';
import { Voice } from '../Voice';

describe('Voice', () => {
  describe('.connect', () => {
    it('should call the native connect', () => {
      const voice = new Voice({
        nativeEventEmitter: new MockNativeEventEmitter() as any,
      });
      voice.connect('fake token');
    });
  });
});
