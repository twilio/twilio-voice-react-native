// @ts-check

'use strict';

/**
 * @import { TestOrchestratorSetup } from './setup.mjs'
 */
import { setupTestOrchestrator } from './setup.mjs';
import { outgoingCallTest } from './outgoing-call.mjs';
import { safelySettlePromise } from '../utilities/safely-settle-promise.mjs';

/**
 * @param {TestOrchestratorSetup['accessToken']} accessToken
 * @param {TestOrchestratorSetup['driver']} driver
 * @param {TestOrchestratorSetup['testElements']} testElements
 */
async function runTest(accessToken, driver, testElements) {
  await testElements.textInput.token.waitForExist({ timeout: 10000, interval: 1000 });
  await testElements.textInput.token.setValue(accessToken, { mask: true });

  // NOTE: Increase code coverage: VBLOCKS-6582
  // for now, just hard code the test suite
  await outgoingCallTest(testElements);

  await testElements.button.startTestSuite.waitForExist();
  await testElements.button.startTestSuite.click();

  // NOTE: VBLOCKS-6582
  // consider checking for all test suite statuses just in case the test
  // immediately goes from 'not-started' to 'failure'
  await driver.waitUntil(async () => {
    return await testElements.text.testSuiteStatus.getText() === 'in-progress';
  }, { timeout: 5000, interval: 500 });

  await driver.waitUntil(async () => {
    const testSuiteStatus = await testElements.text.testSuiteStatus.getText();

    if (testSuiteStatus === 'success' || testSuiteStatus === 'failure') {
      return true;
    }
  }, { timeout: 120000, interval: 5000 });

  if (await testElements.text.testSuiteStatus.getText() === 'failure') {
    throw new Error('test failure');
  }
}

/** @typedef {{ source: string; error: any }} OrchestrationError */

/**
 * @param {OrchestrationError[]} errors
 * @returns {Promise<number>}
 */
const reportTestErrors = async (errors) => {
  /** @param {'PASSED' | 'FAILED'} result */
  const templateMessage =
    (result) => `test orchestration complete: ${result}`;

  if (errors.length > 0) {
    console.log(templateMessage('FAILED'));
    for (const error of errors) {
      console.log(error);
    }
    return 1;
  }

  console.log(templateMessage('PASSED'));
  return 0;
};

/** @returns {Promise<OrchestrationError[]>} */
const main = async () => {
  const setupResult = await safelySettlePromise(setupTestOrchestrator());
  if (setupResult.status === 'rejected') {
    return [
      {
        source: 'setup',
        error: setupResult.error,
      },
    ];
  }

  const { accessToken, driver, env, testElements } = setupResult.value;

  /** @type {OrchestrationError[]} */
  let errors = [];

  const testResult = await safelySettlePromise(runTest(
    accessToken,
    driver,
    testElements,
  ));

  /** @type {'passed' | 'failed'} */
  let sauceJobResult = 'passed';

  if (testResult.status === 'rejected') {
    sauceJobResult = 'failed';
    errors.push({
      source: 'test suite',
      error: testResult.error,
    });
  }

  if (env.USE_SAUCE) {
    const sauceExecute = await safelySettlePromise(driver.execute(
      `sauce:job-result=${sauceJobResult}`
    ));
    if (sauceExecute.status === 'rejected') {
      errors.push({
        source: 'driver.execute sauce:job-result',
        error: sauceExecute.error,
      });
    }
  }

  const deleteSessionResult = await safelySettlePromise(driver.deleteSession());
  if (deleteSessionResult.status === 'rejected') {
    errors.push({
      source: 'driver.deleteSession',
      error: deleteSessionResult.error,
    });
  }

  return errors;
};

main().then(reportTestErrors).then((exitCode) => process.exitCode = exitCode);
