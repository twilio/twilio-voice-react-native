import axios from 'axios';
import { device, element, by, waitFor } from 'detox';
import { expect as jestExpect } from 'expect';
import type twilio from 'twilio';
import { bootstrapTwilioClient } from '../common/twilioClient';
import { pollValidateLog, getRegExpMatch } from '../common/logParser';

const DEFAULT_TIMEOUT = 10000;
const RELAY_SERVER_URL = 'http://localhost:4040'

describe('call', () => {
  let twilioClient: ReturnType<typeof twilio>;
  let clientId: string;

  beforeAll(() => {
    ({ twilioClient, clientId } = bootstrapTwilioClient());
  });

  const tapButton = async (buttonLabel: string) => {
    await waitFor(element(by.text(buttonLabel)))
      .toBeVisible()
      .withTimeout(DEFAULT_TIMEOUT);
    await element(by.text(buttonLabel)).tap();
  };

  const connect = async () => {
    await tapButton('CONNECT');

    await waitFor(element(by.text('Call State: connected')))
      .toBeVisible()
      .withTimeout(DEFAULT_TIMEOUT);

    // Let the call go for 5 seconds
    await new Promise((r) => setTimeout(r, 5000));
  };

  const register = async () => {
    await tapButton('REGISTER');

    await waitFor(element(by.text('Registered: true')))
      .toBeVisible()
      .withTimeout(DEFAULT_TIMEOUT);
  };

  const accept = async () => {
    await tapButton('ACCEPT');

    await waitFor(element(by.text('Call State: connected')))
      .toBeVisible()
      .withTimeout(DEFAULT_TIMEOUT);

    // Let the call go for 5 seconds
    await new Promise((r) => setTimeout(r, 5000));
  };

  const disconnect = async () => {
    await tapButton('DISCONNECT');

    await waitFor(element(by.text('Call State: disconnected')))
      .toBeVisible()
      .withTimeout(DEFAULT_TIMEOUT);
  };

  const toggleLogFormat = async () => {
    await tapButton('TOGGLE LOG FORMAT');
  };

  const sendValidMessageTest = async () => {
    const callSidRegExp = /call event (CA.+): connected/;
    const CallSid = await getRegExpMatch(callSidRegExp);
    await axios.post(
      `${RELAY_SERVER_URL}/create-subscription`,
      { CallSid },
    );

    await tapButton('SEND VALID MESSAGE');

    const success = await pollValidateLog((log) => {
      const found = log.find((item) => {
        return item.content.includes('call message sent');
      });
      return Boolean(found);
    });

    if (!success) {
      throw new Error('call message sent event not received');
    }

    const voiceEventSidRegExp = /call message sent (KX.+)/;
    const voiceEventSid = await getRegExpMatch(voiceEventSidRegExp);

    const receivedMessagesResponse = await axios.get(
      `${RELAY_SERVER_URL}/get-received-messages/${CallSid}`,
    );
    const receivedMessages = receivedMessagesResponse.data;

    jestExpect(Array.isArray(receivedMessages)).toBeTruthy();
    jestExpect(receivedMessages).toHaveLength(1);

    const [receivedMessage] = receivedMessages;
    jestExpect(typeof receivedMessage).toStrictEqual('object');
    jestExpect(receivedMessage.ContentType).toStrictEqual(
      'application/json',
    );
    jestExpect(receivedMessage.Content).toStrictEqual(JSON.stringify({
      ahoy: 'This is a message from a Call',
    }));
    jestExpect(receivedMessage.SequenceNumber).toStrictEqual('1');
    jestExpect(receivedMessage.CallSid).toStrictEqual(CallSid);
    jestExpect(receivedMessage.Sid).toStrictEqual(voiceEventSid);
  };

  const sendLargeMessageTest = async () => {
    await tapButton('SEND LARGE MESSAGE');

    const success = await pollValidateLog((log) => {
      const found = log.find((item) => {
        return item.content.match(new RegExp([
          /call message failure (KX\w+): PayloadSizeExceededError\(31212\): /,
          /PayloadSizeExceededError \(31212\): Call Message Event Payload size/,
          / exceeded authorized limit/,
        ].map((r) => r.source).join('')));
      });
      return Boolean(found);
    });

    if (!success) {
      throw new Error('large call message did not throw error');
    }
  };

  const sendInvalidMessageTypeTest = async () => {
    await tapButton('SEND INVALID MESSAGE TYPE');

    const success = await pollValidateLog((log) => {
      const found = log.some((item) => {
        const match = item.content.match(new RegExp(
          /call message failure (KX.+): /.source +
          /CallMessageEventTypeInvalidError\(31210\): /.source +
          /CallMessageEventTypeInvalidError \(31210\): /.source +
          /Call Message Event Type is invalid/.source
        ));
        return Boolean(match);
      });
      return found;
    });

    if (!success) {
      throw new Error('invalid message type did not throw error');
    }
  };

  const sendInvalidContentTypeTest = async () => {
    // NOTE(mhuynh): due to backend limitations, sending an invalid content
    // type will not throw an error on the client side.
    await tapButton('SEND INVALID CONTENT TYPE');

    const success = await pollValidateLog((log) => {
      const found = log.some((item) => {
        const match = item.content.match(/call message sent (KX.+)/);
        return Boolean(match);
      });
      return found;
    });

    if (!success) {
      throw new Error('invalid content type was not sent successfully');
    }
  };

  const performTests = () => {
    it('should send a valid message', sendValidMessageTest);
    it('should send a large message', sendLargeMessageTest);
    it(
      'should send a message with an invalid message type',
      sendInvalidMessageTypeTest,
    );
    it(
      'should send a message with an invalid content type',
      sendInvalidContentTypeTest,
    );
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

      performTests();
    });

    describe('incoming call', () => {
      beforeEach(async () => {
        await register();

        const testCall = await twilioClient.calls.create({
          twiml:
            '<Response><Say>Ahoy, world!</Say><Pause length="60" /></Response>',
          to: `client:${clientId}`,
          from: 'detox',
        });

        console.log(
          `Call created with SID: "${testCall.sid}" to identity "${clientId}".`
        );

        await accept();
      });

      afterEach(async () => {
        await disconnect();
      });

      performTests();
    });
  }
});
