import type { NativeCancelledCallInviteInfo } from './type/CallInvite';

export class CancelledCallInvite {
  private _callSid: string;
  private _from: string;
  private _to: string;

  constructor({ callSid, from, to }: NativeCancelledCallInviteInfo) {
    this._callSid = callSid;
    this._from = from;
    this._to = to;
  }

  getCallSid(): string {
    return this._callSid;
  }

  getFrom(): string {
    return this._from;
  }

  getTo(): string {
    return this._to;
  }
}
