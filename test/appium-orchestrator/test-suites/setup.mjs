// @ts-check

'use strict';

import { remote } from 'webdriverio';

import secrets from '../secrets.json' with { type: 'json' };
import tokenJson from '../token.json' with { type: 'json' };

const SUPPORTED_PLATFORMS = ['ios', 'android'];

// NOTE: VBLOCKS-6582
// Consider adding other things to the env helper function, such as overriding
// hostname, port, Sauce Labs options, etc.
const getEnv = () => {
  const platform = process.env.PLATFORM || 'ios';

  if (!SUPPORTED_PLATFORMS.includes(platform)) {
    throw new Error(
      `Unsupported PLATFORM "${platform}", expected one of: ` +
      SUPPORTED_PLATFORMS.join(', ')
    );
  }

  return {
    PLATFORM: /** @type {'ios' | 'android'} */ (platform),
    USE_SAUCE: process.env.USE_SAUCE === 'true',
  };
};

/**
 * Capabilities for a locally attached device.
 *
 * The `appium:autoAcceptAlerts` capability is XCUITest only. The
 * `appium:autoGrantPermissions` capability is the UiAutomator2 counterpart, and
 * without `appium:autoGrantPermissions` the notification permission dialog
 * blocks the run.
 *
 * @param {'ios' | 'android'} platform
 * @returns {Parameters<typeof remote>['0']['capabilities']}
 */
const getLocalCapabilities = (platform) => {
  if (platform === 'android') {
    return {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:autoGrantPermissions': true,
      'appium:udid': secrets.android.udid,
      'appium:appPackage': secrets.android.appPackage,
      'appium:appActivity': secrets.android.appActivity,
    };
  }

  return {
    platformName: 'iOS',
    'appium:automationName': 'XCUITest',
    'appium:autoAcceptAlerts': true,
    'appium:udid': secrets.ios.udid,
    'appium:bundleId': secrets.ios.bundleId,
    'appium:xcodeOrgId': secrets.ios.xcodeOrgId,
    'appium:xcodeSigningId': 'Apple Development',
    'appium:updatedWDABundleId': secrets.ios.wdaBundleId,
    'appium:showXcodeLog': true,
    'appium:allowProvisioningDeviceRegistration': true,
  };
};

/**
 * Capabilities for a Sauce Labs real device.
 *
 * The device name and the platform version are deliberately hardcoded, so
 * widening the device pool is an edit to this one file.
 *
 * @param {'ios' | 'android'} platform
 * @returns {Parameters<typeof remote>['0']['capabilities']}
 */
const getSauceCapabilities = (platform) => {
  if (platform === 'android') {
    return {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:autoGrantPermissions': true,
      'appium:deviceName': 'Google Pixel.*',
      'appium:platformVersion': '16',
    };
  }

  return {
    platformName: 'iOS',
    'appium:automationName': 'XCUITest',
    'appium:autoAcceptAlerts': true,
    'appium:deviceName': 'iPhone.*',
    'appium:platformVersion': '26',
  };
};

/**
 * @param {'ios' | 'android'} platform
 */
const getLocalOptions = (platform) => {
  /** @type {Parameters<typeof remote>['0']} */
  const remoteOptions = {
    hostname: process.env.APPIUM_HOST || 'localhost',
    port: parseInt(process.env.APPIUM_PORT || '') || 4723,
    logLevel: 'info',
    capabilities: getLocalCapabilities(platform),
  };

  return remoteOptions;
};

/**
 * @param {'ios' | 'android'} platform
 */
const getSauceOptions = (platform) => {
  /** @type {string} */
  const buildName = `build test ${Date.now()}`;

  /** @type {Parameters<typeof remote>['0']['capabilities']} */
  const capabilities = {
    ...getSauceCapabilities(platform),
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
    ? getSauceOptions(env.PLATFORM)
    : getLocalOptions(env.PLATFORM);

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
