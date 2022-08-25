// @ts-nocheck

require('dotenv').config();
jest.setTimeout(60000);

beforeAll(async () => {
  await device.installApp();
  await device.launchApp({
    permissions: { calendar: 'YES', notifications: 'YES', microphone: 'YES' },
    delete: true,
  });
});
