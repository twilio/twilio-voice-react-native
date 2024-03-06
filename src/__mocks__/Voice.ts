import { Constants } from '../constants';
import { createNativeAudioDevicesInfo } from './AudioDevice';
import { createNativeCallInviteInfo } from './CallInvite';
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
    name: Constants.VoiceEventTypeValueIncomingCallInvite,
    nativeEvent: {
      type: Constants.VoiceEventTypeValueIncomingCallInvite,
      callInvite: createNativeCallInviteInfo(),
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
