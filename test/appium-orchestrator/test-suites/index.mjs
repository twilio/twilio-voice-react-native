// @ts-check

'use strict';

import { USE_SAUCE, accessToken, driver, testElements } from './setup.mjs';
import { outgoingCallTest } from './outgoing-call.mjs';

async function runTest() {
  await testElements.textInput.token.waitForExist({ timeout: 10000, interval: 1000 });
  await testElements.textInput.token.setValue(accessToken);

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

runTest()
  .then(async () => {
    if (USE_SAUCE) {
      await driver.execute('sauce:job-result=passed');
    }
  })
  .catch(async () => {
    if (USE_SAUCE) {
      await driver.execute('sauce:job-result=failed');
    }
    process.exitCode = 1;
  })
  .finally(() => driver.deleteSession());
