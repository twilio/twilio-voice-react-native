import { EventEmitter } from 'eventemitter3';

export class MockNativeEventEmitter extends EventEmitter {
  removeCurrentListener() {}
  removeSubscription() {}
}
