// detox will initialize the device during the import
import 'detox';

declare const device: {
  installApp: () => Promise<void>;
  launchApp: (param: any) => Promise<void>;
}

require('dotenv').config();
jest.setTimeout(60000);

beforeAll(async () => {
  await device.installApp();
  await device.launchApp({
    permissions: { calendar: 'YES', notifications: 'YES', microphone: 'YES' },
    delete: true,
  });
});
