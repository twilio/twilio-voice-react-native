// @ts-check

'use strict';

/**
 * @import { TestOrchestratorSetup } from './setup.mjs'
 */
import { setupTestOrchestrator } from './setup.mjs';
import { outgoingCallTest } from './outgoing-call.mjs';

/**
 * @param {Pick<TestOrchestratorSetup, 'accessToken' | 'driver' | 'testElements'>} testOrchestratorSetup
 */
async function runTest({ accessToken, driver, testElements }) {
  await testElements.textInput.token.waitForExist({ timeout: 10000, interval: 1000 });
  await testElements.textInput.token.setValue(accessToken, { mask: true });

  // NOTE: Increase code coverage: VBLOCKS-6582
  // for now, just hard code the test suite
  await outgoingCallTest(testElements);

  await testElements.button.startTestSuite.waitForExist();
  await testElements.button.startTestSuite.click();

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

const main = async () => {
  const { accessToken, driver, env, testElements } = await setupTestOrchestrator();

  return runTest({ accessToken, driver, testElements })
    .then(async () => {
      if (env.USE_SAUCE) {
        await driver.execute('sauce:job-result=passed');
      }
    })
    .catch(async (error) => {
      if (env.USE_SAUCE) {
        await driver.execute('sauce:job-result=failed');
      }
      throw error;
    })
    .finally(async () => {
      await driver.deleteSession();
    });
};

main()
  .then(() => {
    console.log('test orchestration complete');
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
