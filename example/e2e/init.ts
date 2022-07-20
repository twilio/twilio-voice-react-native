import { init } from 'detox';

const config = require('../package.json').detox;
require('dotenv').config();
jest.setTimeout(150000);
jest.retryTimes(1);

beforeAll(async () => {
    await device.uninstallApp();
    await device.installApp();
});

beforeEach(async () => {
    await device.launchApp({
        permissions: { calendar: 'YES', notifications: 'YES', microphone: 'YES' },
        delete: true,
    });
});
