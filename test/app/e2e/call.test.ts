import { device, element, by, waitFor } from 'detox';
import twilio from 'twilio';
import { expect as jestExpect } from 'expect';

const DEFAULT_TIMEOUT = 10000;

const bootstrap = () => {
  const accountSid = process.env.ACCOUNT_SID;
  const authToken = process.env.AUTH_TOKEN;
  const mockClientId = process.env.CLIENT_IDENTITY;

  if (
    [accountSid, authToken, mockClientId].some((v) => typeof v !== 'string')
  ) {
    throw new Error('Missing env var.');
  }

  const twilioClient = twilio(accountSid, authToken);

  return { twilioClient, clientId: mockClientId as string };
};

describe('call', () => {
  let twilioClient: ReturnType<typeof twilio>;
  let clientId: string;

  const register = async () => {
    await element(by.text('REGISTER')).tap();
    await waitFor(element(by.text('Registered: true')))
      .toBeVisible()
      .withTimeout(DEFAULT_TIMEOUT);
  };

  beforeAll(async () => {
    ({ twilioClient, clientId } = bootstrap());

    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  if (device.getPlatform() === 'ios') {
    it('should pass the dummy test', () => {
      // by default jest does not pass a test suite if there are no tests
    });
  }

  if (device.getPlatform() === 'android') {
    describe('outgoing call', () => {
      it('should make an outgoing call and then disconnect', async () => {
        await element(by.text('CONNECT')).tap();
        await waitFor(element(by.text('Call State: connected')))
          .toBeVisible()
          .withTimeout(DEFAULT_TIMEOUT);

        // Let the call go for 5 seconds
        await new Promise((r) => setTimeout(r, 5000));

        await element(by.text('DISCONNECT')).tap();
        await waitFor(element(by.text('Call State: disconnected')))
          .toBeVisible()
          .withTimeout(DEFAULT_TIMEOUT);
      });

      it('should log a constant-audio-input-level quality warning', async () => {
        await element(by.text('CONNECT')).tap();
        await waitFor(element(by.text('Call State: connected')))
          .toBeVisible()
          .withTimeout(DEFAULT_TIMEOUT);

        // Let the call go for 3 minutes
        await new Promise((r) => setTimeout(r, 1000 * 60 * 3));

        const eventLogAttr = await element(by.id('event_log')).getAttributes();
        if (!('label' in eventLogAttr) || !eventLogAttr.label) {
          throw new Error('cannot parse event log label');
        }
        const searchString =
          'qualityWarningsChanged\n' +
          JSON.stringify(
            [['constant-audio-input-level'], []],
            null,
            2
          );
        console.log('attempting to find the search string within the log', {
          searchString,
          log: eventLogAttr.label,
        });
        jestExpect(eventLogAttr.label.includes(searchString)).toBeTruthy();

        await element(by.text('DISCONNECT')).tap();
        await waitFor(element(by.text('Call State: disconnected')))
          .toBeVisible()
          .withTimeout(DEFAULT_TIMEOUT);
      });
    });

    describe('incoming call', () => {
      it('should reject an incoming call', async () => {
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

        await waitFor(element(by.text(`Call Invite To: client:${clientId}`)))
          .toBeVisible()
          .withTimeout(DEFAULT_TIMEOUT);

        await waitFor(element(by.text('REJECT')))
          .toBeVisible()
          .withTimeout(DEFAULT_TIMEOUT);
        await element(by.text('REJECT')).tap();

        await waitFor(element(by.text('Call Invite To: undefined')))
          .toBeVisible()
          .withTimeout(DEFAULT_TIMEOUT);
      });

      it('should let an incoming call timeout', async () => {
        await register();

        const testCall = await twilioClient.calls.create({
          twiml:
            '<Response><Say>Ahoy, world!</Say><Pause length="10" /></Response>',
          to: `client:${clientId}`,
          from: 'detox',
        });

        console.log(
          `Call created with SID: "${testCall.sid}" to identity "${clientId}".`
        );

        await waitFor(element(by.text(`Call Invite To: client:${clientId}`)))
          .toBeVisible()
          .withTimeout(DEFAULT_TIMEOUT);

        await waitFor(element(by.text('Call Invite To: undefined')))
          .toBeVisible()
          .withTimeout(60000);
      });

      it('should accept an incoming call', async () => {
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

        await waitFor(element(by.text('ACCEPT')))
          .toBeVisible()
          .withTimeout(DEFAULT_TIMEOUT);
        await element(by.text('ACCEPT')).tap();
        await waitFor(element(by.text('Call State: connected')))
          .toBeVisible()
          .withTimeout(DEFAULT_TIMEOUT);

        // Let the call go for 5 seconds
        await new Promise((r) => setTimeout(r, 5000));

        await element(by.text('DISCONNECT')).tap();
        await waitFor(element(by.text('Call State: disconnected')))
          .toBeVisible()
          .withTimeout(DEFAULT_TIMEOUT);
      });
    });
  }
});
