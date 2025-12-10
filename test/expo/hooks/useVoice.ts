import React from 'react';

import { Call, PreflightTest, Voice } from '@twilio/voice-react-native-sdk';

// @ts-ignore
import { token } from '@/constants/token';

export function useVoice() {
  const voice = React.useMemo(() => new Voice(), []);

  React.useEffect(() => {
    voice.addListener(Voice.Event.Registered, () => {
      console.log('voice registered event');
    });

    voice.addListener(Voice.Event.Unregistered, () => {
      console.log('voice unregistered event');
    });

    voice.addListener(Voice.Event.Error, (error) => {
      console.log('voice error event', error);
    });
  }, [voice]);

  const voiceRegister = async () => {
    voice
      .register(token)
      .then(() => {
        console.log('register resolved');
      })
      .catch((error) => {
        console.log('register rejected', error);
      });
  };

  const voiceStartPreflight = async () => {
    // const preflightOptions: PreflightTest.Options = {
    //   iceServers: [
    //     {
    //       password: 'foo',
    //       username: 'bar',
    //       serverUrl: 'biff',
    //     },
    //   ],
    //   iceTransportPolicy: IceTransportPolicy.All,
    //   preferredAudioCodecs: [
    //     {
    //       type: AudioCodecType.Opus,
    //       maxAverageBitrate: 1000,
    //     },
    //   ],
    // };

    const preflightTestPromise = await voice
      .runPreflight(token)
      .then((preflightTest) => ({ status: 'resolved', preflightTest } as const))
      .catch((error) => ({ status: 'rejected', error } as const));

    if (preflightTestPromise.status === 'rejected') {
      console.log('preflight rejected', preflightTestPromise.error);
      return;
    }

    console.log('preflight resolved');

    const preflightTest = preflightTestPromise.preflightTest;

    preflightTest.on(PreflightTest.Event.Connected, () => {
      console.log('preflight connected');
    });

    preflightTest.on(PreflightTest.Event.Completed, (report) => {
      console.log('preflight completed', report);
    });

    preflightTest.on(PreflightTest.Event.Failed, (error) => {
      console.log('preflight failed', error);
    });

    preflightTest.on(
      PreflightTest.Event.QualityWarning,
      (currentWarnings, previousWarnings) => {
        console.log(
          'preflight quality warning',
          currentWarnings,
          previousWarnings
        );
      }
    );

    preflightTest.on(PreflightTest.Event.Sample, (sample) => {
      console.log('preflight sample', sample);
    });
  };

  const voiceUnregister = async () => {
    await voice.unregister(token);
  };

  const callDisconnect = async () => {};

  const voiceConnect = async () => {
    const callPromise = await voice
      .connect(token)
      .then((call) => ({ status: 'resolved', call } as const))
      .catch((error) => ({ status: 'rejected', error } as const));

    if (callPromise.status === 'rejected') {
      console.log('connect rejected', callPromise.error);
      return;
    }

    const call = callPromise.call;

    call.on(Call.Event.Connected, () => {
      console.log('call connected');
    });

    call.on(Call.Event.ConnectFailure, () => {
      console.log('call connectFailure');
    });

    call.on(Call.Event.Disconnected, () => {
      console.log('call disconnected');
    });

    call.on(Call.Event.MessageReceived, (message) => {
      console.log('call message received', message);
    });

    call.on(Call.Event.QualityWarningsChanged, (current, previous) => {
      console.log('call quality warnings changed', current, previous);
    });

    call.on(Call.Event.Reconnected, () => {
      console.log('call reconnected');
    });

    call.on(Call.Event.Reconnecting, () => {
      console.log('call reconnecting');
    });

    call.on(Call.Event.Ringing, () => {
      console.log('call ringing');
    });

    console.log('connect resolved');
  };

  return {
    callDisconnect,
    voiceConnect,
    voiceRegister,
    voiceStartPreflight,
    voiceUnregister,
  };
}
