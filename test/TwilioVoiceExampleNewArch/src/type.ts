import type { Call, CallMessage } from '@twilio/voice-react-native-sdk';

export interface BoundCallMethod {
  disconnect: () => void;
  getStats: () => void;
  hold: () => void;
  mute: () => void;
  postFeedback: (score: Call.Score, issue: Call.Issue) => () => void;
  sendDigits: (digits: string) => void;
  sendMessage: (message: CallMessage) => void;
}

export interface BoundCallInfo {
  customParameters: Record<any, any>;
  from?: string;
  to?: string;
  state?: Call.State;
  sid?: string;
  initialConnectedTimestamp?: Date;
  isMuted?: boolean;
  isOnHold?: boolean;
}

export interface BoundCallInvite {
  accept: () => void;
  callSid: string;
  customParameters: Record<any, any>;
  from: string;
  to: string;
  reject: () => void;
  sendMessage: (message: CallMessage) => void;
}

export interface EventLogItem {
  id: string;
  content: string;
}
