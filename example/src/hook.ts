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
import {
  getCallInfo,
  getCallInviteInfo,
  getCancelledCallInviteInfo,
} from './util';

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
      setCallInfo(await getCallInfo(call));

      Object.values(Call.Event).forEach((callEvent) => {
        call.on(callEvent, async () => {
          const _callInfo = await getCallInfo(call);
          logEvent(`${_callInfo.sid}: ${callEvent}`);
          setCallInfo(_callInfo);
        });
      });

      setCallMethod({
        disconnect: () => call.disconnect(),
        hold: () => {
          setCallInfo((_callInfo) => {
            if (_callInfo === null) {
              return null;
            }

            const isCallOnHold = !_callInfo.isOnHold;
            call.hold(!isCallOnHold);
            return {
              ..._callInfo,
              isCallOnHold,
            };
          });
        },
        mute: () => {
          setCallInfo((_callInfo) => {
            if (_callInfo === null) {
              return null;
            }

            const isCallMuted = !_callInfo.isMuted;
            call.mute(isCallMuted);
            return {
              ..._callInfo,
              isCallMuted,
            };
          });
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

  const callInviteHandler = React.useCallback(
    async (callInvite: CallInvite) => {
      const { callSid, from, to } = await getCallInviteInfo(callInvite);

      setCallInvites((_callInvites) => [
        ..._callInvites,
        {
          accept: async () => {
            const call = await callInvite.accept();
            callHandler(call);
          },
          callSid,
          from,
          to,
          reject: async () => {
            await callInvite.reject();
            setCallInvites((__callInvites) =>
              __callInvites.filter(
                ({ callSid: _callSid }) => _callSid !== callSid
              )
            );
          },
        },
      ]);

      logEvent(`Call invite: ${callSid}`);
    },
    [callHandler, logEvent]
  );

  const cancelledCallInviteHandler = React.useCallback(
    async (cancelledCallInvite: CancelledCallInvite) => {
      const { callSid } = await getCancelledCallInviteInfo(cancelledCallInvite);
      setCallInvites((_callInvites) =>
        _callInvites.filter(({ callSid: _callSid }) => _callSid !== callSid)
      );
      logEvent(`Cancelled call invite: ${callSid}`);
    },
    [logEvent]
  );

  const recentCallInvite = React.useMemo(
    () => (callInvites.length ? callInvites[callInvites.length - 1] : null),
    [callInvites]
  );

  return {
    callInvites,
    callInviteHandler,
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
  const { callInviteHandler, cancelledCallInviteHandler, recentCallInvite } =
    useCallInvites(logEvent, callHandler);

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
    voice.on(Voice.Event.CallInvite, callInviteHandler);
    voice.on(Voice.Event.CancelledCallInvite, cancelledCallInviteHandler);
  }, [callInviteHandler, cancelledCallInviteHandler, voice]);

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
