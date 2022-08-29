// detox will initialize the device during the import
import 'detox';

declare const device: {
  installApp: () => void;
  launchApp: (param: any) => void;
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
