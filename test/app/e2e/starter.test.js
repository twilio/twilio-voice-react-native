describe('Test Initialization', () => {
  beforeAll(async () => {
    await device.installApp();
    await device.launchApp({
      permissions: { calendar: 'YES', notifications: 'YES', microphone: 'YES' }
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });
});
