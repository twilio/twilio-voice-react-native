import { device, element, by, waitFor } from 'detox';
import { expect as jestExpect } from 'expect';
import type { EventLogItem } from '../../src/type';
import axios from 'axios';

const DEFAULT_TIMEOUT = 10000;
const RELAY_SERVER_URL = 'http://localhost:4040'

describe('call', () => {
  const connect = async () => {
    await element(by.text('CONNECT')).tap();
    await waitFor(element(by.text('Call State: connected')))
      .toBeVisible()
      .withTimeout(DEFAULT_TIMEOUT);

    // Let the call go for 5 seconds
    await new Promise((r) => setTimeout(r, 5000));
  };

  const disconnect = async () => {
    await element(by.text('DISCONNECT')).tap();
    await waitFor(element(by.text('Call State: disconnected')))
      .toBeVisible()
      .withTimeout(DEFAULT_TIMEOUT);
  };

  const toggleLogFormat = async () => {
    await waitFor(element(by.text('TOGGLE LOG FORMAT')))
      .toBeVisible()
      .withTimeout(DEFAULT_TIMEOUT);
    await element(by.text('TOGGLE LOG FORMAT')).tap();
  };

  const getLog = async (): Promise<Array<EventLogItem>> => {
    const eventLogAttr = await element(by.id('event_log')).getAttributes();
    if (!('label' in eventLogAttr) || !eventLogAttr.label) {
      throw new Error('cannot parse event log label');
    }

    const log: string = eventLogAttr.label;

    return JSON.parse(log);
  };

  const pollValidateLog = async (
    validator: (log: Array<EventLogItem>) => boolean,
    loops: number = 5,
  ) => {
    let wasValid = false;
    for (let i = 0; i < loops; i++) {
      const log = await getLog();
      if (validator(log)) {
        wasValid = true;
        break;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
    return wasValid;
  };

  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();

    if (device.getPlatform() !== 'ios') {
      await toggleLogFormat();
    }
  });

  if (device.getPlatform() === 'ios') {
    it('should pass the dummy test', () => {
      // by default jest does not pass a test suite if there are no tests
    });
  }

  if (device.getPlatform() === 'android') {
    describe('outgoing call', () => {
      beforeEach(async () => {
        await connect();
      });

      afterEach(async () => {
        await disconnect();
      });

      it('should make send a valid message', async () => {
        let log = await getLog();
        let CallSid;
        for (const entry of log) {
          const m = entry.content.match(/call event (CA.+): connected/);
          if (m) {
            CallSid = m[1];
            break;
          }
        }

        await axios.post(
          `${RELAY_SERVER_URL}/create-subscription`,
          { CallSid },
        );

        await waitFor(element(by.text('SEND VALID MESSAGE')))
          .toBeVisible()
          .withTimeout(DEFAULT_TIMEOUT);
        await element(by.text('SEND VALID MESSAGE')).tap();

        const success = await pollValidateLog((log) => {
          const found = log.find((item) => {
            return item.content.includes('call message sent');
          });
          return Boolean(found);
        });

        if (!success) {
          throw new Error('call message sent event not received');
        }

        log = await getLog();
        let voiceEventSid: string | undefined = undefined;
        for (const entry of log) {
          const m = entry.content.match(/call message sent (KX.+)/);
          if (m) {
            voiceEventSid = m[1];
            break;
          }
        }

        const receivedMessagesResponse = await axios.get(
          `${RELAY_SERVER_URL}/get-received-messages/${CallSid}`,
        );
        const receivedMessages = receivedMessagesResponse.data;

        jestExpect(Array.isArray(receivedMessages)).toBeTruthy();
        jestExpect(receivedMessages).toHaveLength(1);

        const [receivedMessage] = receivedMessages;
        jestExpect(typeof receivedMessage).toStrictEqual('object');
        jestExpect(receivedMessage.ContentType).toStrictEqual('application/json');
        jestExpect(receivedMessage.Content).toStrictEqual(JSON.stringify({ ahoy: 'This is a message from a Call' }));
        jestExpect(receivedMessage.SequenceNumber).toStrictEqual('1');
        jestExpect(receivedMessage.CallSid).toStrictEqual(CallSid);
        jestExpect(receivedMessage.Sid).toStrictEqual(voiceEventSid);
      });

      it('should send a large message', async () => {
        await waitFor(element(by.text('SEND LARGE MESSAGE')))
          .toBeVisible()
          .withTimeout(DEFAULT_TIMEOUT);
        await element(by.text('SEND LARGE MESSAGE')).tap();

        const success = await pollValidateLog((log) => {
          const found = log.find((item) => {
            return item.content.includes('TwilioError(31209): Call Message Event Payload size exceeded authorized limit');
          });
          return Boolean(found);
        });

        if (!success) {
          throw new Error('large call message did not throw error');
        }
      });
    });

    describe('incoming call', () => {});
  }
});
