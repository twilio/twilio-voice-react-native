// @ts-check

'use strict';

import { remote } from 'webdriverio';

import secrets from '../secrets.json' with { type: 'json' };
import tokenJson from '../token.json' with { type: 'json' };


// NOTE: VBLOCKS-6582
// Consider adding other things to the env helper function, such as overriding
// hostname, port, Sauce Labs options, etc.
const getEnv = () => {
  return {
    USE_SAUCE: process.env.USE_SAUCE === 'true',
  };
};

const getCapabilities = () => {
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
    'appium:bundleId': secrets.ios.bundleId,
    'appium:xcodeOrgId': secrets.ios.xcodeOrgId,
    'appium:xcodeSigningId': 'Apple Development',
    'appium:updatedWDABundleId': secrets.ios.wdaBundleId,
    'appium:showXcodeLog': true,
    'appium:allowProvisioningDeviceRegistration': true,
  };

  /** @type {string} */
  const buildName = `build test ${Date.now()}`;

  /** @type {Parameters<typeof remote>['0']['capabilities']} */
  const sauceCapabilities = {
    ...commonCapabilities,
    'appium:deviceName': 'iPhone.*',
    'appium:platformVersion': '26',
    'appium:app': secrets.sauce.storageFilename,
    'sauce:options': {
      appiumVersion: 'latest',
      build: buildName,
      name: buildName,
    },
  };

  return { localCapabilities, sauceCapabilities };
};

const getRemoteOptions = () => {
  const { localCapabilities, sauceCapabilities } = getCapabilities();

  /** @type {Parameters<typeof remote>['0']} */
  const localRemoteOptions = {
    hostname: process.env.APPIUM_HOST || 'localhost',
    port: parseInt(process.env.APPIUM_PORT || '') || 4723,
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
    capabilities: sauceCapabilities,
  };

  return { localRemoteOptions, sauceRemoteOptions };
};

/**
 * Perform test orchestration setup.
 */
export const setupTestOrchestrator = async () => {
  /** @type {string} */
  const accessToken = tokenJson.accessToken;

  const env = getEnv();

  const { localRemoteOptions, sauceRemoteOptions } = getRemoteOptions();

  const driver = await remote(
    env.USE_SAUCE
      ? sauceRemoteOptions
      : localRemoteOptions
  );

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
