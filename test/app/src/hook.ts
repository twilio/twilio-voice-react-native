import * as React from 'react';
import { Platform } from 'react-native';
import {
  AudioDevice,
  Call,
  CallInvite,
  CallMessage,
  IncomingCallMessage,
  OutgoingCallMessage,
  Voice,
  TwilioErrors,
} from '@twilio/voice-react-native-sdk';
import type {
  BoundCallInfo,
  BoundCallInvite,
  BoundCallMethod,
  EventLogItem,
} from './type';

import { generateAccessToken } from './tokenUtility';

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
        initialConnectedTimestamp: call.getInitialConnectedTimestamp(),
        isMuted: call.isMuted(),
        isOnHold: call.isOnHold(),
        state: call.getState(),
        sid: call.getSid(),
        to: call.getTo(),
      });

      Object.values(Call.Event).forEach((callEventName) => {
        call.on(callEventName, async (...callEvent) => {
          const _callInfo: BoundCallInfo = {
            customParameters: call.getCustomParameters(),
            from: call.getFrom(),
            initialConnectedTimestamp: call.getInitialConnectedTimestamp(),
            isMuted: call.isMuted(),
            isOnHold: call.isOnHold(),
            state: call.getState(),
            sid: call.getSid(),
            to: call.getTo(),
          };
          let message = `call event ${_callInfo.sid}: ${callEventName}`;
          if (callEvent.length) {
            message += '\n' + JSON.stringify(callEvent, null, 2);
          }
          if (callEventName === Call.Event.Connected) {
            message +=
              '\n' +
              'initial connected timestamp: ' +
              JSON.stringify(
                {
                  iso: _callInfo.initialConnectedTimestamp?.toISOString(),
                  locale: _callInfo.initialConnectedTimestamp?.toLocaleString(),
                },
                null,
                2
              );
          }

          call.addListener(
            Call.Event.MessageReceived,
            (_message: IncomingCallMessage) => {
              logEvent(`Call Message Received: ${_message.getContent()}`);
            }
          );

          logEvent(message);
          setCallInfo(_callInfo);
        });
      });

      setCallMethod({
        disconnect: () => call.disconnect(),
        getStats: async () => {
          const statsReport = await call.getStats();
          logEvent(`call stats: ${JSON.stringify(statsReport, null, 2)}`);
        },
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
        postFeedback: (_score: Call.Score, _issue: Call.Issue) => () =>
          call.postFeedback(_score, _issue),
        sendDigits: (_digits: string) => () => call.sendDigits(_digits),
        sendMessage: async (_message: CallMessage) => {
          const outgoingCallMessage: OutgoingCallMessage =
            await call.sendMessage(_message);
          outgoingCallMessage.addListener(
            OutgoingCallMessage.Event.Failure,
            (error) => {
              const errorInfo = `${error.name}(${error.code}): ${error.message}`;
              const msg = `call message failure ${outgoingCallMessage.getSid()}: ${errorInfo}`;
              logEvent(msg);
            }
          );
          outgoingCallMessage.addListener(
            OutgoingCallMessage.Event.Sent,
            () => {
              const msg = `call message sent ${outgoingCallMessage.getSid()}`;
              logEvent(msg);
            }
          );
        },
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

  const callInviteAcceptedHandler = React.useCallback(
    async (callInvite: CallInvite, call: Call) => {
      const callSid = callInvite.getCallSid();
      logEvent(`call invite accepted: ${callSid}`);
      removeCallInvite(callSid);
      callHandler(call);
    },
    [callHandler, logEvent, removeCallInvite]
  );

  const callInviteNotificationTappedHandler = React.useCallback(() => {
    logEvent(`call invite notification tapped`);
  }, [logEvent]);

  const callInviteRejectedHandler = React.useCallback(
    async (callInvite: CallInvite) => {
      const callSid = callInvite.getCallSid();
      logEvent(`call invite rejected: ${callSid}`);
      removeCallInvite(callSid);
    },
    [logEvent, removeCallInvite]
  );

  const callInviteCancelledHandler = React.useCallback(
    async (callInvite: CallInvite, error?: TwilioErrors.TwilioError) => {
      const callSid = callInvite.getCallSid();
      logEvent(`cancelled call invite: ${callSid}`);
      if (error) {
        logEvent(
          `cancelled call invite error: ${JSON.stringify({
            message: error.message,
            code: error.code,
          })}`
        );
      }
      removeCallInvite(callSid);
    },
    [logEvent, removeCallInvite]
  );

  const callInviteHandler = React.useCallback(
    async (callInvite: CallInvite) => {
      const callSid = callInvite.getCallSid();
      const from = callInvite.getFrom();
      const to = callInvite.getTo();

      callInvite.on(CallInvite.Event.Accepted, (call: Call) => {
        callInviteAcceptedHandler(callInvite, call);
      });

      callInvite.on(CallInvite.Event.Rejected, () => {
        callInviteRejectedHandler(callInvite);
      });

      callInvite.on(CallInvite.Event.Cancelled, (error) => {
        callInviteCancelledHandler(callInvite, error);
      });

      callInvite.on(CallInvite.Event.NotificationTapped, () => {
        callInviteNotificationTappedHandler();
      });

      setCallInvites((_callInvites) => [
        ..._callInvites,
        {
          accept: async () => {
            removeCallInvite(callInvite.getCallSid());
            try {
              await callInvite.accept();
            } catch (err) {
              const message = err.message;
              const code = err.code;
              logEvent(
                `accept rejected: ${JSON.stringify({ message, code }, null, 2)}`
              );
            }
          },
          callSid,
          customParameters: callInvite.getCustomParameters(),
          from,
          to,
          reject: async () => {
            removeCallInvite(callInvite.getCallSid());
            await callInvite.reject();
          },
          sendMessage: async (_message: CallMessage) => {
            const outgoingCallMessage: OutgoingCallMessage =
              await callInvite.sendMessage(_message);
            outgoingCallMessage.addListener(
              OutgoingCallMessage.Event.Failure,
              (error) => {
                const errorInfo = `${error.name}(${error.code}): ${error.message}`;
                const msg = `call message failure ${outgoingCallMessage.getSid()}: ${errorInfo}`;
                logEvent(msg);
              }
            );
            outgoingCallMessage.addListener(
              OutgoingCallMessage.Event.Sent,
              () => {
                const msg = `call invite message sent ${outgoingCallMessage.getSid()}`;
                logEvent(msg);
              }
            );
          },
        },
      ]);

      callInvite.addListener(
        CallInvite.Event.MessageReceived,
        (message: IncomingCallMessage) => {
          logEvent(`Call Invite Message Received: ${message.getContent()}`);
        }
      );

      logEvent(`call invite: ${callSid}`);
      logEvent(
        `call invite custom params: ${JSON.stringify(
          callInvite.getCustomParameters(),
          null,
          2
        )}`
      );
    },
    [
      logEvent,
      removeCallInvite,
      callInviteAcceptedHandler,
      callInviteCancelledHandler,
      callInviteNotificationTappedHandler,
      callInviteRejectedHandler,
    ]
  );

  const recentCallInvite = React.useMemo(
    () => (callInvites.length ? callInvites[callInvites.length - 1] : null),
    [callInvites]
  );

  return {
    callInvites,
    callInviteHandler,
    recentCallInvite,
  };
}

export function useVoice(token: string) {
  if (!token.length) {
    token = generateAccessToken();
  }

  const voice = React.useMemo(() => new Voice(), []);

  const [registered, setRegistered] = React.useState<boolean>(false);
  const [sdkVersion, setSdkVersion] = React.useState<string>('unknown');
  const [audioDeviceIdx, setAudioDeviceIdx] = React.useState<number>(0);

  const { events, logEvent } = useEventLog();
  const { callInfo, callMethod, callHandler } = useCall(logEvent);
  const { callInviteHandler, recentCallInvite } = useCallInvites(
    logEvent,
    callHandler
  );

  const logVoiceErrorHandler = React.useCallback<Voice.Listener.Error>(
    (error) => {
      const msg = {
        causes: error.causes,
        code: error.code,
        description: error.description,
        explanation: error.explanation,
        message: error.message,
        name: error.name,
        solutions: error.solutions,
      };
      logEvent(JSON.stringify(msg, null, 2));
    },
    [logEvent]
  );

  const connectHandler = React.useCallback(
    async (to: string) => {
      try {
        const call = await voice.connect(token, {
          params: {
            answerOnBridge: 'true',
            recipientType: 'client',
            to,
          },
        });
        callHandler(call);
      } catch (err) {
        const message = err.message;
        const code = err.code;
        logEvent(
          `connect rejected: ${JSON.stringify({ message, code }, null, 2)}`
        );
      }
    },
    [callHandler, token, voice, logEvent]
  );

  const registerHandler = React.useCallback(() => {
    voice
      .register(token)
      .then(() => {
        setRegistered(true);
      })
      .catch((error) => {
        logEvent(error);
      });
  }, [logEvent, token, voice]);

  const unregisterHandler = React.useCallback(() => {
    voice.unregister(token).then(() => {
      setRegistered(false);
    });
  }, [token, voice]);

  const logAudioDevicesHandler = React.useCallback(() => {
    voice
      .getAudioDevices()
      .then((audioDevices) =>
        logEvent('get audio devices ' + JSON.stringify(audioDevices, null, 2))
      );
  }, [voice, logEvent]);

  const selectAudioDeviceHandler = React.useCallback(() => {
    const idx = audioDeviceIdx + 1;
    logEvent(`setting audio device idx ${idx}`);
    voice.getAudioDevices().then(({ audioDevices }) => {
      const dev = audioDevices[idx % audioDevices.length];
      const { name, type, uuid } = dev;
      logEvent(
        'device to select ' + JSON.stringify({ name, type, uuid }, null, 2)
      );
      return dev.select();
    });
    setAudioDeviceIdx(idx);
  }, [voice, audioDeviceIdx, setAudioDeviceIdx, logEvent]);

  const audioDevicesUpdateHandler = React.useCallback(
    (audioDevices: AudioDevice[], selectedDevice?: AudioDevice) => {
      logEvent(
        'AudioDevicesUpdated event\n' +
          JSON.stringify({ audioDevices, selectedDevice }, null, 2)
      );
    },
    [logEvent]
  );

  const getCallsHandler = React.useCallback(() => {
    voice.getCalls().then((callsMap) => {
      const readableCalls: Record<string, any> = {};
      for (const [callUuid, _callInfo] of callsMap.entries()) {
        readableCalls[callUuid] = {
          sid: _callInfo.getSid(),
          state: _callInfo.getState(),
          initialConnectedTimestamp: _callInfo.getInitialConnectedTimestamp(),
        };
      }
      logEvent(JSON.stringify(readableCalls, null, 2));
    });
  }, [voice, logEvent]);

  const getCallInvitesHandler = React.useCallback(() => {
    voice.getCallInvites().then((callInvitesMap) => {
      const readableCallInvites: Record<string, any> = {};
      for (const [
        callInviteUuid,
        _callInviteInfo,
      ] of callInvitesMap.entries()) {
        readableCallInvites[callInviteUuid] = _callInviteInfo.getCallSid();
      }
      logEvent(JSON.stringify(readableCallInvites, null, 2));
    });
  }, [voice, logEvent]);

  React.useEffect(() => {
    voice.getVersion().then(setSdkVersion);

    const bootstrap = async () => {
      if (Platform.OS === 'ios') {
        await voice.initializePushRegistry();
      }

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
    voice.on(Voice.Event.AudioDevicesUpdated, audioDevicesUpdateHandler);
    voice.on(Voice.Event.Error, logVoiceErrorHandler);

    return () => {
      voice.off(Voice.Event.CallInvite, callInviteHandler);
      voice.off(Voice.Event.AudioDevicesUpdated, audioDevicesUpdateHandler);
      voice.off(Voice.Event.Error, logVoiceErrorHandler);
    };
  }, [
    audioDevicesUpdateHandler,
    callHandler,
    callInviteHandler,
    logVoiceErrorHandler,
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
    getCallsHandler,
    getCallInvitesHandler,
  };
}
