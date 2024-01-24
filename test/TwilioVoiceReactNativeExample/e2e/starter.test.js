import { device, element, by } from 'detox';

describe('Example', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show the SDK version', async () => {
    await expect(element(by.id('app_info'))).toBeVisible();
    await expect(element(by.id('sdk_version'))).toBeVisible();
  });
});
