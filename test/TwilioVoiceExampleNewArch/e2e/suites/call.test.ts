import { device, element, by, waitFor } from 'detox';
import type twilio from 'twilio';
import { bootstrapTwilioClient } from '../common/twilioClient';
import { getRegExpMatch } from '../common/logParser';
import { validateRtcStats } from '../common/rtcStatsValidators';

const DEFAULT_TIMEOUT = 10000;

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
    ({ twilioClient, clientId } = bootstrapTwilioClient());

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

        // check the event log for the call quality warning
        const checkLog = async () => {
          await new Promise((r) => setTimeout(r, 5000));

          await element(by.id('event_log')).swipe('up');

          const eventLogAttr = await element(by.id('event_log')).getAttributes();
          if (!('label' in eventLogAttr) || !eventLogAttr.label) {
            throw new Error('cannot parse event log label');
          }

          const log: string = eventLogAttr.label;

          const qualityWarningsChangedEvent =
            log.includes('qualityWarningsChanged');
          const constantAudioInputWarning =
            log.includes('constant-audio-input-level');
          const constantAudioOutputWarning =
            log.includes('constant-audio-output-level');

          return qualityWarningsChangedEvent && (constantAudioInputWarning || constantAudioOutputWarning);
        }

        // check the call quality warnings every 5 seconds
        // for a total of 30 seconds
        // ideally, the warning will be raised after approx 10 seconds
        let wasCallQualityWarningRaised = false;
        for (let i = 0; i < 6; i++) {
          wasCallQualityWarningRaised = await checkLog();
          if (wasCallQualityWarningRaised) {
            break;
          }
        }

        // we want to tear down the call regardless of success
        await element(by.text('DISCONNECT')).tap();
        await waitFor(element(by.text('Call State: disconnected')))
          .toBeVisible()
          .withTimeout(DEFAULT_TIMEOUT);

        if (!wasCallQualityWarningRaised) {
          throw new Error('call quality warning was not raised');
        }
      });

      it('should get valid rtc stats', async () => {
        await element(by.text('TOGGLE LOG FORMAT')).tap();

        await element(by.text('CONNECT')).tap();
        await waitFor(element(by.text('Call State: connected')))
          .toBeVisible()
          .withTimeout(DEFAULT_TIMEOUT);

        // Let the call go for 5 seconds
        await new Promise((r) => setTimeout(r, 5000));

        await element(by.text('GET STATS')).tap();

        // we want to tear down the call regardless of success
        await element(by.text('DISCONNECT')).tap();
        await waitFor(element(by.text('Call State: disconnected')))
          .toBeVisible()
          .withTimeout(DEFAULT_TIMEOUT);

        const rtcStatsMessage = /call stats: ([\s\S]*)/;
        const rtcStatsStr = await getRegExpMatch(rtcStatsMessage);
        if (typeof rtcStatsStr !== 'string') {
          throw new Error('unable to parse rtc stats');
        }

        const rtcStats = JSON.parse(rtcStatsStr);
        validateRtcStats(rtcStats);
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

      it('should get valid rtc stats', async () => {
        await element(by.text('TOGGLE LOG FORMAT')).tap();

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

        await element(by.text('GET STATS')).tap();

        await element(by.text('DISCONNECT')).tap();
        await waitFor(element(by.text('Call State: disconnected')))
          .toBeVisible()
          .withTimeout(DEFAULT_TIMEOUT);

        const rtcStatsMessage = /call stats: ([\s\S]*)/;
        const rtcStatsStr = await getRegExpMatch(rtcStatsMessage);
        if (typeof rtcStatsStr !== 'string') {
          throw new Error('unable to parse rtc stats');
        }

        const rtcStats = JSON.parse(rtcStatsStr);
        validateRtcStats(rtcStats);
      });
    });
  }
});
