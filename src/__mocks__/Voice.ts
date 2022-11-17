import { Constants } from '../constants';
import { createNativeAudioDevicesInfo } from './AudioDevice';
import { createNativeCallInviteInfo } from './CallInvite';
import { createNativeCancelledCallInviteInfo } from './CancelledCallInvite';
import { createNativeErrorInfo } from './Error';

/**
 * Reusable default native call events.
 */
export const mockVoiceNativeEvents = {
  audioDevicesUpdated: {
    name: Constants.VoiceEventAudioDevicesUpdated,
    nativeEvent: {
      type: Constants.VoiceEventAudioDevicesUpdated,
      ...createNativeAudioDevicesInfo(),
    },
  },
  callInvite: {
    name: Constants.VoiceEventCallInvite,
    nativeEvent: {
      type: Constants.VoiceEventCallInvite,
      callInvite: createNativeCallInviteInfo(),
    },
  },
  callInviteAccepted: {
    name: Constants.VoiceEventCallInviteAccepted,
    nativeEvent: {
      type: Constants.VoiceEventCallInviteAccepted,
      callInvite: createNativeCallInviteInfo(),
    },
  },
  callInviteRejected: {
    name: Constants.VoiceEventCallInviteRejected,
    nativeEvent: {
      type: Constants.VoiceEventCallInviteRejected,
      callInvite: createNativeCallInviteInfo(),
    },
  },
  cancelledCallInvite: {
    name: Constants.VoiceEventCallInviteCancelled,
    nativeEvent: {
      type: Constants.VoiceEventCallInviteCancelled,
      cancelledCallInvite: createNativeCancelledCallInviteInfo(),
      error: createNativeErrorInfo(),
    },
  },
  error: {
    name: Constants.VoiceEventError,
    nativeEvent: {
      type: Constants.VoiceEventError,
      error: createNativeErrorInfo(),
    },
  },
  registered: {
    name: Constants.VoiceEventRegistered,
    nativeEvent: {
      type: Constants.VoiceEventRegistered,
    },
  },
  unregistered: {
    name: Constants.VoiceEventUnregistered,
    nativeEvent: {
      type: Constants.VoiceEventUnregistered,
    },
  },
};
