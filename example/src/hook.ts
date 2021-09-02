import * as React from 'react';
import {
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
        from: call.getFrom(),
        isMuted: call.isMuted(),
        isOnHold: call.isOnHold(),
        state: call.getState(),
        sid: call.getSid(),
        to: call.getTo(),
      });

      Object.values(Call.Event).forEach((callEvent) => {
        call.on(callEvent, async () => {
          const _callInfo = {
            from: call.getFrom(),
            isMuted: call.isMuted(),
            isOnHold: call.isOnHold(),
            state: call.getState(),
            sid: call.getSid(),
            to: call.getTo(),
          };
          logEvent(`${_callInfo.sid}: ${callEvent}`);
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
          from,
          to,
          reject: async () => {
            removeCallInvite(callInvite.getCallSid());
            await callInvite.reject();
          },
        },
      ]);

      logEvent(`Call invite: ${callSid}`);
    },
    [callHandler, logEvent, removeCallInvite]
  );

  const callInviteAcceptedHandler = React.useCallback(
    async (callInvite: CallInvite, call: Call) => {
      const callSid = callInvite.getCallSid();
      removeCallInvite(callSid);
      callHandler(call);
      logEvent(`Call invite accepted: ${callSid}`);
    },
    [callHandler, logEvent, removeCallInvite]
  );

  const callInviteRejectedHandler = React.useCallback(
    async (callInvite: CallInvite) => {
      const callSid = callInvite.getCallSid();
      removeCallInvite(callSid);
      logEvent(`Call invite rejected: ${callSid}`);
    },
    [logEvent, removeCallInvite]
  );

  const cancelledCallInviteHandler = React.useCallback(
    async (cancelledCallInvite: CancelledCallInvite) => {
      const callSid = cancelledCallInvite.getCallSid();
      removeCallInvite(callSid);
      logEvent(`Cancelled call invite: ${callSid}`);
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

  React.useEffect(() => {
    voice.getVersion().then(setSdkVersion);

    voice.getAudioDevices().then(console.log);

    const bootstrap = async () => {
      const calls = await voice.getCalls();

      for (const call of calls.values()) {
        console.log('call', call.getSid(), call.getState());
        callHandler(call);
      }

      const callInvites = await voice.getCallInvites();

      for (const callInvite of callInvites.values()) {
        console.log('call invite', callInvite.getCallSid());
        callInviteHandler(callInvite);
      }
    };

    bootstrap();

    voice.on(Voice.Event.CallInvite, callInviteHandler);
    voice.on(Voice.Event.CallInviteAccepted, callInviteAcceptedHandler);
    voice.on(Voice.Event.CallInviteRejected, callInviteRejectedHandler);
    voice.on(Voice.Event.CancelledCallInvite, cancelledCallInviteHandler);

    return () => {
      voice.off(Voice.Event.CallInvite, callInviteHandler);
      voice.off(Voice.Event.CallInviteAccepted, callInviteAcceptedHandler);
      voice.off(Voice.Event.CallInviteRejected, callInviteRejectedHandler);
      voice.off(Voice.Event.CancelledCallInvite, cancelledCallInviteHandler);
    };
  }, [
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
  };
}
