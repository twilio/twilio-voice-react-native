// @ts-check

'use strict';

import { remote } from 'webdriverio';

import secrets from '../secrets.json' with { type: 'json' };
import tokenJson from '../token.json' with { type: 'json' };

/**
 * Capabilities shared by every platform. Platform-specific capabilities are
 * added by the per-platform helpers below.
 */
/** @type {Parameters<typeof remote>['0']['capabilities']} */
const COMMON_CAPABILITIES = {
  'appium:autoAcceptAlerts': true,
  'appium:newCommandTimeout': 300,
};

/** @type {Parameters<typeof remote>['0']['capabilities']} */
const IOS_CAPABILITIES = {
  ...COMMON_CAPABILITIES,
  platformName: 'iOS',
  'appium:automationName': 'XCUITest',
};

/**
 * Android runtime permissions are granted at install time rather than dismissed
 * from a dialog, because the SDK requests microphone, Bluetooth and
 * notification permissions on first activity create and a missed dialog stalls
 * every suite.
 */
/** @type {Parameters<typeof remote>['0']['capabilities']} */
const ANDROID_CAPABILITIES = {
  ...COMMON_CAPABILITIES,
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:autoGrantPermissions': true,
};

// NOTE: VBLOCKS-6582
// Consider adding other things to the env helper function, such as overriding
// hostname, port, Sauce Labs options, etc.
const getEnv = () => {
  const platform = (process.env.PLATFORM || 'ios').toLowerCase();
  if (platform !== 'ios' && platform !== 'android') {
    throw new Error(`PLATFORM must be "ios" or "android", got "${platform}".`);
  }

  return {
    USE_SAUCE: process.env.USE_SAUCE === 'true',
    PLATFORM: /** @type {'ios' | 'android'} */ (platform),
    /** Comma-separated suite ids, or all of them when unset. */
    SUITES: process.env.SUITES,
    /** Recorded in results so a run can be attributed to an API level. */
    AVD: process.env.AVD,
    /** 'simulator' or 'device'; only meaningful when PLATFORM is ios. */
    IOS_TARGET: (process.env.IOS_TARGET || 'device').toLowerCase(),
  };
};

const getLocalAndroidOptions = () => {
  /** @type {Parameters<typeof remote>['0']['capabilities']} */
  const capabilities = {
    ...ANDROID_CAPABILITIES,
    // Overridable so the same orchestrator drives the bare example app, whose
    // application id differs from the Expo harness's.
    'appium:appPackage': process.env.ANDROID_PACKAGE || secrets.android.appPackage,
    'appium:appActivity': secrets.android.appActivity || '.MainActivity',
    ...(secrets.android.udid ? { 'appium:udid': secrets.android.udid } : {}),
    ...(secrets.android.app ? { 'appium:app': secrets.android.app } : {}),
  };

  /** @type {Parameters<typeof remote>['0']} */
  return {
    hostname: process.env.APPIUM_HOST || 'localhost',
    port: parseInt(process.env.APPIUM_PORT || '') || 4723,
    logLevel: 'info',
    capabilities,
  };
};

/**
 * iOS Simulator. Useful for everything that does not need CallKit or PushKit:
 * the SDK initialises, enumerates audio devices and runs its JavaScript surface
 * there. Calls are expected to fail; what fails and how is worth recording
 * rather than assuming.
 */
const getLocalIosSimulatorOptions = () => {
  /** @type {Parameters<typeof remote>['0']['capabilities']} */
  const capabilities = {
    ...IOS_CAPABILITIES,
    'appium:deviceName': process.env.IOS_SIM_NAME || 'iPhone 17 Pro',
    'appium:platformVersion': process.env.IOS_SIM_VERSION || '26.5',
    'appium:bundleId': process.env.IOS_BUNDLE_ID || secrets.ios.bundleId,
    /**
     * `noReset` suppressed the launch: Appium attached a session but left the
     * simulator on its home screen, so every selector missed and it read as a
     * broken harness. Make Appium launch the app.
     */
    'appium:forceAppLaunch': true,
    'appium:shouldTerminateApp': true,
    'appium:wdaLaunchTimeout': 240000,
  };

  /** @type {Parameters<typeof remote>['0']} */
  return {
    hostname: process.env.APPIUM_HOST || 'localhost',
    port: parseInt(process.env.APPIUM_PORT || '') || 4723,
    logLevel: 'info',
    capabilities,
  };
};

const getLocalIosOptions = () => {
  /** @type {Parameters<typeof remote>['0']['capabilities']} */
  const capabilities = {
    ...IOS_CAPABILITIES,
    'appium:udid': secrets.ios.udid,
    'appium:bundleId': process.env.IOS_BUNDLE_ID || secrets.ios.bundleId,
    'appium:xcodeOrgId': secrets.ios.xcodeOrgId,
    'appium:xcodeSigningId': 'Apple Development',
    'appium:updatedWDABundleId': secrets.ios.wdaBundleId,
    'appium:showXcodeLog': true,
    'appium:allowProvisioningDeviceRegistration': true,
    /**
     * Same reason as the simulator path: without these Appium attaches to
     * whatever is already on screen instead of launching the harness. WDA has
     * to be built and installed on the device on a cold run, which is far
     * slower than on a simulator, hence the longer launch timeout.
     */
    'appium:forceAppLaunch': true,
    'appium:shouldTerminateApp': true,
    'appium:wdaLaunchTimeout': 360000,
  };

  /**
   * `devicectl` only drives iOS 17 and later, and `ios-deploy` is not
   * installed, so Appium performs the install when given a built `.app`.
   * Without IOS_APP the app is expected to be on the device already.
   */
  if (process.env.IOS_APP) {
    capabilities['appium:app'] = process.env.IOS_APP;
  }

  /** @type {Parameters<typeof remote>['0']} */
  const remoteOptions = {
    hostname: process.env.APPIUM_HOST || 'localhost',
    port: parseInt(process.env.APPIUM_PORT || '') || 4723,
    logLevel: 'info',
    capabilities,
  };

  return remoteOptions;
};

/**
 * @param {'ios' | 'android'} platform
 */
const getSauceOptions = (platform) => {
  /** @type {string} */
  const buildName = `build test ${Date.now()}`;

  /**
   * Stated so `restartApp` can fall back to the requested capabilities when
   * Sauce Labs does not echo the identifier back in the session capabilities.
   * Override when the uploaded build is not the Expo harness.
   *
   * Read with `?.` because a CI run writes a `secrets.json` holding only the
   * `sauce` block.
   */
  const androidPackage =
    process.env.ANDROID_PACKAGE || secrets.android?.appPackage;
  const iosBundleId = process.env.IOS_BUNDLE_ID || secrets.ios?.bundleId;

  const platformCapabilities =
    platform === 'android'
      ? {
          ...ANDROID_CAPABILITIES,
          'appium:deviceName': secrets.sauce.androidDeviceName || 'Google.*',
          'appium:platformVersion': secrets.sauce.androidPlatformVersion || '14',
          ...(androidPackage ? { 'appium:appPackage': androidPackage } : {}),
        }
      : {
          ...IOS_CAPABILITIES,
          'appium:deviceName': 'iPhone.*',
          'appium:platformVersion': '26',
          ...(iosBundleId ? { 'appium:bundleId': iosBundleId } : {}),
        };

  /** @type {Parameters<typeof remote>['0']['capabilities']} */
  const capabilities = {
    ...platformCapabilities,
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
    connectionRetryTimeout: 600000,
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
    : env.PLATFORM === 'android'
      ? getLocalAndroidOptions()
      : env.IOS_TARGET === 'simulator'
        ? getLocalIosSimulatorOptions()
        : getLocalIosOptions();

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
      /**
       * Selected by resource-id on Android and by accessibility id on iOS.
       *
       * This element carries no accessibilityLabel, because on iOS one would
       * replace the text XCUITest reports and the status could never be read.
       * Without a label, Android's "~" selector cannot find it, so Android
       * matches the testID as a resource-id instead.
       */
      testSuiteStatus:
        env.PLATFORM === 'android'
          ? driver.$('//*[@resource-id="text_testSuiteStatus"]')
          : driver.$('~text_testSuiteStatus'),

      /**
       * The suite's log entries, rendered by the harness. Read only when a
       * suite does not pass, so a failure carries the step that failed rather
       * than just the word "failure". Same selector rules as the status above.
       */
      testSuiteOutput:
        env.PLATFORM === 'android'
          ? driver.$('//*[@resource-id="text_testSuiteOutput"]')
          : driver.$('~text_testSuiteOutput'),
    },
  };

  return { accessToken, driver, env, testElements };
};

/** @typedef {Awaited<ReturnType<typeof setupTestOrchestrator>>} TestOrchestratorSetup */
