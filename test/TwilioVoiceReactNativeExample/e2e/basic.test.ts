import { device, element, expect as detoxExpect, by, waitFor } from 'detox';
import { expect as jestExpect } from 'expect';
import twilio from 'twilio';

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

describe('basic', () => {
  let twilioClient: ReturnType<typeof twilio>;
  let clientId: string;

  const doRegister = async () => {
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

  it('should show the SDK version', async () => {
    const el = element(by.id('sdk_version'));
    await detoxExpect(el).toBeVisible();
    const sdkVersionAttr = await el.getAttributes();
    if (!('text' in sdkVersionAttr)) {
      throw new Error('could not parse text of sdk version element');
    }
    const sdkVersionText = sdkVersionAttr.text;
    jestExpect(sdkVersionText).toMatch('SDK Version: ');
    jestExpect(sdkVersionText).not.toMatch('SDK Version: unknown');
  });

  it('should start unregistered', async () => {
    await detoxExpect(element(by.text('Registered: false'))).toBeVisible();
  });

  if (device.getPlatform() === 'android') {
    it('should register', async () => {
      await doRegister();
    });

    it('should unregister', async () => {
      await doRegister();

      await element(by.text('UNREGISTER')).tap();
      await waitFor(element(by.text('Registered: false')))
        .toBeVisible()
        .withTimeout(DEFAULT_TIMEOUT);
    });

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

    it('should receive an incoming call and then disconnect', async () => {
      await doRegister();

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
  }
});
