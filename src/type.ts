export type Uuid = string;

export type CallEventType =
  | 'connected'
  | 'connectFailure'
  | 'reconnecting'
  | 'reconnected'
  | 'disconnected'
  | 'ringing';

export interface CallEvent {
  uuid: Uuid;
  type: CallEventType;
}

export type CallInviteEventType = 'invite' | 'inviteCancel';

export interface CallInviteEvent {
  uuid: Uuid;
  type: CallInviteEventType;
}
