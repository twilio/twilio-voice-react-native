import { device, element, expect as detoxExpect, by } from 'detox';
import { expect as jestExpect } from 'expect';

describe('voice', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show a valid SDK version', async () => {
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
});
