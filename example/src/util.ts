import type {
  Call,
  CallInvite,
  CancelledCallInvite,
} from 'twilio-voice-react-native';

export async function getCallInfo(call: Call) {
  const [from, isMuted, isOnHold, sid, state, to] = await Promise.all([
    call.getFrom(),
    call.isMuted(),
    call.isOnHold(),
    call.getSid(),
    call.getState(),
    call.getTo(),
  ]);
  return { from, isMuted, isOnHold, sid, state, to };
}

export async function getCallInviteInfo(callInvite: CallInvite) {
  const [callSid, from, to] = await Promise.all([
    callInvite.getCallSid(),
    callInvite.getFrom(),
    callInvite.getTo(),
  ]);
  return { callSid, from, to };
}

export async function getCancelledCallInviteInfo(
  cancelledCallInvite: CancelledCallInvite
) {
  const [callSid, from, to] = await Promise.all([
    cancelledCallInvite.getCallSid(),
    cancelledCallInvite.getFrom(),
    cancelledCallInvite.getTo(),
  ]);
  return { callSid, from, to };
}
