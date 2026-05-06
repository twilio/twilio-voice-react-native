// @ts-check

'use strict';

import { remote } from 'webdriverio';

import secrets from '../secrets.json' with { type: 'json' };
import tokenJson from '../token.json' with { type: 'json' };

/** @type {Parameters<typeof remote>['0']['capabilities']} */
const COMMON_CAPABILITIES = {
  platformName: 'iOS',
  'appium:automationName': 'XCUITest',
  'appium:autoAcceptAlerts': true,
};

// NOTE: VBLOCKS-6582
// Consider adding other things to the env helper function, such as overriding
// hostname, port, Sauce Labs options, etc.
const getEnv = () => {
  return {
    USE_SAUCE: process.env.USE_SAUCE === 'true',
  };
};

const getLocalOptions = () => {
  /** @type {Parameters<typeof remote>['0']['capabilities']} */
  const capabilities = {
    ...COMMON_CAPABILITIES,
    'appium:udid': secrets.ios.udid,
    'appium:bundleId': secrets.ios.bundleId,
    'appium:xcodeOrgId': secrets.ios.xcodeOrgId,
    'appium:xcodeSigningId': 'Apple Development',
    'appium:updatedWDABundleId': secrets.ios.wdaBundleId,
    'appium:showXcodeLog': true,
    'appium:allowProvisioningDeviceRegistration': true,
  };

  /** @type {Parameters<typeof remote>['0']} */
  const remoteOptions = {
    hostname: process.env.APPIUM_HOST || 'localhost',
    port: parseInt(process.env.APPIUM_PORT || '') || 4723,
    logLevel: 'info',
    capabilities,
  };

  return remoteOptions;
};

const getSauceOptions = () => {
  /** @type {string} */
  const buildName = `build test ${Date.now()}`;

  /** @type {Parameters<typeof remote>['0']['capabilities']} */
  const capabilities = {
    ...COMMON_CAPABILITIES,
    'appium:deviceName': 'iPhone.*',
    'appium:platformVersion': '26',
    'appium:app': secrets.sauce.storageFilename,
    'sauce:options': {
      appiumVersion: 'latest',
      build: buildName,
      name: buildName,
    },
  };

  /** @type {Parameters<typeof remote>['0']} */
  const remoteOptions = {
    user: secrets.sauce.user,
    key: secrets.sauce.key,
    hostname: secrets.sauce.hostname,
    port: secrets.sauce.port,
    baseUrl: secrets.sauce.baseUrl,
    capabilities,
  };

  return remoteOptions;
};

/**
 * Perform test orchestration setup.
 */
export const setupTestOrchestrator = async () => {
  /** @type {string} */
  const accessToken = tokenJson.accessToken;

  const env = getEnv();

  const remoteOptions = env.USE_SAUCE
    ? getSauceOptions()
    : getLocalOptions();

  const driver = await remote(remoteOptions);

  const testElements = {
    textInput: {
      token: driver.$('~textInput_token'),
      testSuiteId: driver.$('~textInput_testSuiteId'),
    },
    button: {
      startTestSuite: driver.$('~button_startTestSuite'),
    },
    text: {
      testSuiteStatus: driver.$('~text_testSuiteStatus'),
    },
  };

  return { accessToken, driver, env, testElements };
};

/** @typedef {Awaited<ReturnType<typeof setupTestOrchestrator>>} TestOrchestratorSetup */
