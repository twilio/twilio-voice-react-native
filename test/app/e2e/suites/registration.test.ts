import { device, element, expect as detoxExpect, by, waitFor } from 'detox';

const DEFAULT_TIMEOUT = 10000;

describe('registration', () => {
  const register = async () => {
    await element(by.text('REGISTER')).tap();
    await waitFor(element(by.text('Registered: true')))
      .toBeVisible()
      .withTimeout(DEFAULT_TIMEOUT);
  };

  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should start unregistered', async () => {
    await detoxExpect(element(by.text('Registered: false'))).toBeVisible();
  });

  if (device.getPlatform() === 'android') {
    it('should register', async () => {
      await register();
    });

    it('should unregister', async () => {
      await register();

      await element(by.text('UNREGISTER')).tap();
      await waitFor(element(by.text('Registered: false')))
        .toBeVisible()
        .withTimeout(DEFAULT_TIMEOUT);
    });
  }
});
