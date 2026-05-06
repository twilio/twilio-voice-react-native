import * as React from 'react';
import { Voice } from '@twilio/voice-react-native-sdk';
import { type useLogging } from './useLogging';

export function useVoice(logging: ReturnType<typeof useLogging>) {
  const voice = React.useMemo<Voice>(() => new Voice(), []);

  React.useEffect(() => {
    voice
      .getVersion()
      .then((nativeSdkVersion) => {
        const message = JSON.stringify({ nativeSdkVersion });
        logging.log.info(message);
      })
      .catch((error) => {
        const errorStr = JSON.stringify({
          message: 'voice get version error',
          error,
        });
        logging.log.error(errorStr);
      });
  }, [voice, logging.log.info, logging.log.error]);

  return { voice };
}
