import * as React from 'react';
import { Voice } from '@twilio/voice-react-native-sdk';

export function useVoice() {
  const voice = React.useMemo<Voice>(() => new Voice(), []);

  const [nativeSdkVersion, setNativeSdkVersion] = React.useState<string>('unknown');

  React.useEffect(() => {
    voice.getVersion().then(setNativeSdkVersion);
  }, [voice]);

  React.useEffect(() => {
    console.log({ nativeSdkVersion });
  }, [nativeSdkVersion]);

  return { voice, nativeSdkVersion };
}
