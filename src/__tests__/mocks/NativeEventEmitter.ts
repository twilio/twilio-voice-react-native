import { EventEmitter } from 'events';

export class MockNativeEventEmitter extends EventEmitter {
  removeCurrentListener() {}
  removeSubscription() {}
}
