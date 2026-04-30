// @ts-check

'use strict';

import { remote } from 'webdriverio';

import secrets from '../secrets.json' with { type: 'json' };
import token from '../token.json' with { type: 'json' };

/** @type {boolean} */
const USE_SAUCE = true;

/** @type {Parameters<typeof remote>['0']['capabilities']} */
const commonCapabilities = {
  platformName: 'iOS',
  'appium:automationName': 'XCUITest',
  'appium:autoAcceptAlerts': true,
};

/** @type {Parameters<typeof remote>['0']['capabilities']} */
const localCapabilities = {
  ...commonCapabilities,
  'appium:udid': secrets.ios.udid,
  'appium:bundleId': 'com.twilio.TwilioVoiceReactNativeExample',
  'appium:xcodeOrgId': secrets.ios.xcodeOrgId,
  'appium:xcodeSigningId': 'Apple Development',
  'appium:updatedWDABundleId': 'com.twilio.TwilioVoiceReactNativeUIAutomation',
  'appium:showXcodeLog': true,
  'appium:allowProvisioningDeviceRegistration': true,
};

/** @type {string} */
const buildName = `build test ${Date.now()}`;

/** @type {Parameters<typeof remote>['0']['capabilities']} */
const sauceCapabilties = {
  ...commonCapabilities,
  'appium:deviceName': 'iPhone.*',
  'appium:platformVersion': '26',
  'appium:app': 'storage:filename=twiliovoicereactnativesdkappiumharness.ipa',
  'sauce:options': {
    appiumVersion: 'latest',
    build: buildName,
    name: buildName,
  },
};

/** @type {Parameters<typeof remote>['0']} */
const localRemoteOptions = {
  hostname: process.env.APPIUM_HOST || 'localhost',
  port: parseInt(process.env.APPIUM_PORT || '4723') || 4723,
  logLevel: 'info',
  capabilities: localCapabilities,
};

/** @type {Parameters<typeof remote>['0']} */
const sauceRemoteOptions = {
  user: secrets.sauce.user,
  key: secrets.sauce.key,
  hostname: secrets.sauce.hostname,
  port: secrets.sauce.port,
  baseUrl: secrets.sauce.baseUrl,
  capabilities: sauceCapabilties,
};

const driver = await remote(USE_SAUCE ? sauceRemoteOptions : localRemoteOptions);

async function runTest() {
  const testElements = {
    textInput_token: driver.$('~textInput_token'),
    button_startTestSuite: driver.$('~button_startTestSuite'),
    text_testSuiteStatus: driver.$('~text_testSuiteStatus'),
  };

  await testElements.textInput_token.waitForExist({ timeout: 10000, interval: 1000 });
  await testElements.textInput_token.setValue(token);

  await testElements.button_startTestSuite.waitForExist();
  await testElements.button_startTestSuite.click();

  await driver.waitUntil(async () => {
    return await testElements.text_testSuiteStatus.getText() === 'in-progress';
  }, { timeout: 5000, interval: 500 });

  await driver.waitUntil(async () => {
    const testSuiteStatus = await testElements.text_testSuiteStatus.getText();

    if (testSuiteStatus === 'success' || testSuiteStatus === 'failure') {
      return true;
    }
  }, { timeout: 120000, interval: 5000 });

  if (await testElements.text_testSuiteStatus.getText() === 'failure') {
    throw new Error('test failure');
  }
}

runTest()
  .then(() => driver.execute('sauce:job-result=passed'))
  .catch(() => driver.execute('sauce:job-result=failed'))
  .finally(() => driver.deleteSession());
