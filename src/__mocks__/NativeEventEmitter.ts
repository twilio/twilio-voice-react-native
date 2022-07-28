import { EventEmitter } from 'eventemitter3';
import * as Sinon from 'sinon';

export function createMockNativeEventEmitter() {
  const mockNativeEventEmitter = new EventEmitter();

  const spies = {
    addListener: Sinon.spy(mockNativeEventEmitter),
  };

  return { mockNativeEventEmitter, spies };
}
