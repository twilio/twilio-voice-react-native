// @ts-nocheck

import { init } from 'detox';

const config = require('../package.json').detox;
require('dotenv').config();
jest.setTimeout(60000);

beforeAll(async () => {
  await device.installApp();
  await device.launchApp({
    permissions: { calendar: 'YES', notifications: 'YES', microphone: 'YES' },
    delete: true,
  });
});

beforeEach(async () => {

});
