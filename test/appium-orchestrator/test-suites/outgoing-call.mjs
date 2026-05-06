// @ts-check

'use strict';

/**
 * @import { TestOrchestratorSetup } from './setup.mjs'
 */

/**
 * @param {TestOrchestratorSetup['testElements']} testElements
 */
export async function outgoingCallTest(testElements) {
  await testElements.textInput.testSuiteId.waitForExist({ timeout: 1000, interval: 500 });
  await testElements.textInput.testSuiteId.setValue('outgoing-call-test');
}
