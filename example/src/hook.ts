import * as React from 'react';
import {
  AudioDevice,
  Call,
  CallInvite,
  CancelledCallInvite,
  Voice,
} from 'twilio-voice-react-native';
import type {
  BoundCallInfo,
  BoundCallInvite,
  BoundCallMethod,
  EventLogItem,
} from './type';

export function useNoOp(usage: string) {
  return React.useCallback(() => {
    console.log(usage);
  }, [usage]);
}

export function useEventLog() {
  const [events, setEvents] = React.useState<EventLogItem[]>([]);

  const logEvent = React.useCallback((event: string) => {
    setEvents((_events) => [
      ..._events,
      {
        id: `${_events.length}`,
        content: event,
      },
    ]);
  }, []);

  return {
    logEvent,
    events,
    setEvents,
  };
}

export function useCall(logEvent: (event: string) => void) {
  const [callInfo, setCallInfo] = React.useState<BoundCallInfo | null>(null);
  const [callMethod, setCallMethod] = React.useState<BoundCallMethod | null>(
    null
  );

  const callHandler = React.useCallback(
    async (call: Call) => {
      setCallInfo({
        customParameters: call.getCustomParameters(),
        from: call.getFrom(),
        isMuted: call.isMuted(),
        isOnHold: call.isOnHold(),
        state: call.getState(),
        sid: call.getSid(),
        to: call.getTo(),
      });

      Object.values(Call.Event).forEach((callEventName) => {
        call.on(callEventName, async (callEvent) => {
          const _callInfo = {
            customParameters: call.getCustomParameters(),
            from: call.getFrom(),
            isMuted: call.isMuted(),
            isOnHold: call.isOnHold(),
            state: call.getState(),
            sid: call.getSid(),
            to: call.getTo(),
          };
          logEvent(`call event ${_callInfo.sid}: ${callEventName}`);
          if (callEvent) {
            logEvent(JSON.stringify(callEvent, null, 2));
          }
          setCallInfo(_callInfo);
        });
      });

      setCallMethod({
        disconnect: () => call.disconnect(),
        hold: async () => {
          let isOnHold = call.isOnHold();
          isOnHold = await call.hold(!isOnHold);
          setCallInfo((_callInfo) =>
            _callInfo
              ? {
                  ..._callInfo,
                  isOnHold,
                }
              : null
          );
        },
        mute: async () => {
          let isMuted = call.isMuted();
          isMuted = await call.mute(!isMuted);
          setCallInfo((_callInfo) =>
            _callInfo
              ? {
                  ..._callInfo,
                  isMuted,
                }
              : null
          );
        },
        sendDigits: (_digits: string) => () => call.sendDigits(_digits),
      });

      logEvent(`call sid: ${call.getSid()}`);
      logEvent(
        `call custom params: ${JSON.stringify(
          call.getCustomParameters(),
          null,
          2
        )}`
      );
    },
    [logEvent]
  );

  return {
    callInfo,
    callMethod,
    callHandler,
  };
}

export function useCallInvites(
  logEvent: (event: string) => void,
  callHandler: (call: Call) => void
) {
  const [callInvites, setCallInvites] = React.useState<BoundCallInvite[]>([]);

  const removeCallInvite = React.useCallback((callSid: string) => {
    setCallInvites((_callInvites) =>
      _callInvites.filter(({ callSid: _callSid }) => _callSid !== callSid)
    );
  }, []);

  const callInviteHandler = React.useCallback(
    async (callInvite: CallInvite) => {
      const callSid = callInvite.getCallSid();
      const from = callInvite.getFrom();
      const to = callInvite.getTo();

      setCallInvites((_callInvites) => [
        ..._callInvites,
        {
          accept: async () => {
            removeCallInvite(callInvite.getCallSid());
            const call = await callInvite.accept();
            callHandler(call);
          },
          callSid,
          customParameters: callInvite.getCustomParameters(),
          from,
          to,
          reject: async () => {
            removeCallInvite(callInvite.getCallSid());
            await callInvite.reject();
          },
        },
      ]);

      logEvent(`call invite: ${callSid}`);
      logEvent(
        `call invite custom params: ${JSON.stringify(
          callInvite.getCustomParameters(),
          null,
          2
        )}`
      );
    },
    [callHandler, logEvent, removeCallInvite]
  );

  const callInviteAcceptedHandler = React.useCallback(
    async (callInvite: CallInvite, call: Call) => {
      const callSid = callInvite.getCallSid();
      logEvent(`call invite accepted: ${callSid}`);
      removeCallInvite(callSid);
      callHandler(call);
    },
    [callHandler, logEvent, removeCallInvite]
  );

  const callInviteRejectedHandler = React.useCallback(
    async (callInvite: CallInvite) => {
      const callSid = callInvite.getCallSid();
      logEvent(`call invite rejected: ${callSid}`);
      removeCallInvite(callSid);
    },
    [logEvent, removeCallInvite]
  );

  const cancelledCallInviteHandler = React.useCallback(
    async (cancelledCallInvite: CancelledCallInvite) => {
      const callSid = cancelledCallInvite.getCallSid();
      logEvent(`cancelled call invite: ${callSid}`);
      removeCallInvite(callSid);
    },
    [logEvent, removeCallInvite]
  );

  const recentCallInvite = React.useMemo(
    () => (callInvites.length ? callInvites[callInvites.length - 1] : null),
    [callInvites]
  );

  return {
    callInvites,
    callInviteHandler,
    callInviteAcceptedHandler,
    callInviteRejectedHandler,
    cancelledCallInviteHandler,
    recentCallInvite,
  };
}

export function useVoice(token: string) {
  const voice = React.useMemo(() => new Voice(), []);

  const [registered, setRegistered] = React.useState<boolean>(false);
  const [sdkVersion, setSdkVersion] = React.useState<string>('unknown');
  const [audioDeviceIdx, setAudioDeviceIdx] = React.useState<number>(0);

  const { events, logEvent } = useEventLog();
  const { callInfo, callMethod, callHandler } = useCall(logEvent);
  const {
    callInviteHandler,
    callInviteAcceptedHandler,
    callInviteRejectedHandler,
    cancelledCallInviteHandler,
    recentCallInvite,
  } = useCallInvites(logEvent, callHandler);

  const connectHandler = React.useCallback(
    async (to: string) => {
      const call = await voice.connect(token, {
        recipientType: 'client',
        To: to,
      });
      callHandler(call);
    },
    [callHandler, token, voice]
  );

  const registerHandler = React.useCallback(() => {
    voice.register(token).then(() => {
      setRegistered(true);
    });
  }, [token, voice]);

  const unregisterHandler = React.useCallback(() => {
    voice.unregister(token).then(() => {
      setRegistered(false);
    });
  }, [token, voice]);

  const logAudioDevicesHandler = React.useCallback(() => {
    voice
      .getAudioDevices()
      .then((audioDevices) => logEvent(JSON.stringify(audioDevices, null, 2)));
  }, [voice, logEvent]);

  const selectAudioDeviceHandler = React.useCallback(() => {
    const idx = audioDeviceIdx + 1;
    logEvent(`setting audio device idx ${idx}`);
    voice.getAudioDevices().then(({ audioDevices }) => {
      audioDevices[idx % audioDevices.length].select();
    });
    setAudioDeviceIdx(idx);
  }, [voice, audioDeviceIdx, setAudioDeviceIdx, logEvent]);

  const audioDevicesUpdateHandler = React.useCallback(
    (audioDevices: AudioDevice[], selectedDevice: AudioDevice | null) => {
      logEvent(JSON.stringify(audioDevices, null, 2));
      logEvent(JSON.stringify(selectedDevice, null, 2));
    },
    [logEvent]
  );

  React.useEffect(() => {
    voice.getVersion().then(setSdkVersion);

    const bootstrap = async () => {
      const calls = await voice.getCalls();

      for (const call of calls.values()) {
        console.log('existing call', call.getSid(), call.getState());
        callHandler(call);
      }

      const callInvites = await voice.getCallInvites();

      for (const callInvite of callInvites.values()) {
        console.log('existing call invite', callInvite.getCallSid());
        callInviteHandler(callInvite);
      }
    };

    bootstrap();

    voice.on(Voice.Event.CallInvite, callInviteHandler);
    voice.on(Voice.Event.CallInviteAccepted, callInviteAcceptedHandler);
    voice.on(Voice.Event.CallInviteRejected, callInviteRejectedHandler);
    voice.on(Voice.Event.CancelledCallInvite, cancelledCallInviteHandler);
    voice.on(Voice.Event.AudioDevicesUpdated, audioDevicesUpdateHandler);

    return () => {
      voice.off(Voice.Event.CallInvite, callInviteHandler);
      voice.off(Voice.Event.CallInviteAccepted, callInviteAcceptedHandler);
      voice.off(Voice.Event.CallInviteRejected, callInviteRejectedHandler);
      voice.off(Voice.Event.CancelledCallInvite, cancelledCallInviteHandler);
      voice.off(Voice.Event.AudioDevicesUpdated, audioDevicesUpdateHandler);
    };
  }, [
    audioDevicesUpdateHandler,
    callHandler,
    callInviteHandler,
    callInviteAcceptedHandler,
    callInviteRejectedHandler,
    cancelledCallInviteHandler,
    voice,
  ]);

  return {
    registered,
    sdkVersion,
    events,
    callInfo,
    callMethod,
    recentCallInvite,
    connectHandler,
    registerHandler,
    unregisterHandler,
    logAudioDevicesHandler,
    selectAudioDeviceHandler,
  };
}
