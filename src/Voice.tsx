import { EventEmitter } from 'events';
import { NativeEventEmitter } from 'react-native';
import { Call } from './Call';
import { CallInvite } from './CallInvite';
import { TwilioVoiceReactNative } from './const';
import type { CallEvent, CallInviteEvent, Uuid } from './type';

const UuidCallMapping = new Map<Uuid, Call>();
const UuidCallInviteMapping = new Map<Uuid, CallInvite>();

export interface VoiceOptions {
  nativeEventEmitter: NativeEventEmitter;
}

export class Voice extends EventEmitter {
  nativeEventEmitter: NativeEventEmitter;
  token: string;

  constructor(token: string, options: Partial<VoiceOptions> = {}) {
    super();

    this.token = token;

    this.nativeEventEmitter =
      options.nativeEventEmitter ||
      new NativeEventEmitter(TwilioVoiceReactNative);

    this.nativeEventEmitter.addListener('CallEvent', this._handleCallEvent);
    this.nativeEventEmitter.addListener(
      'CallInviteEvent',
      this._handleCallInviteEvent
    );
  }

  private _handleCallEvent = ({ uuid, type }: CallEvent) => {
    const call =
      UuidCallMapping.get(uuid) ||
      new Call(uuid, { nativeEventEmitter: this.nativeEventEmitter });

    switch (type) {
      case 'connected': {
        // TODO
      }
    }

    UuidCallMapping.set(uuid, call);
  };

  private _handleCallInviteEvent = ({ uuid, type }: CallInviteEvent) => {
    const callInvite =
      UuidCallMapping.get(uuid) ||
      new CallInvite(uuid, { nativeEventEmitter: this.nativeEventEmitter });

    switch (type) {
      case 'invite': {
        this.emit('callInvite', callInvite);
      }
    }

    UuidCallInviteMapping.set(uuid, callInvite);
  };

  connect(params: Record<string, any>) {
    TwilioVoiceReactNative.connect(this.token, params);
  }
}

export default Voice;
