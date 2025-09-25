const { suite } = require('../e2e-tests-config.js');

const suiteFiles = suite === 'preflight' ? [
  'preflightTest',
] : [
  'call', 'callMessage', 'registration', 'voice',
];

const testMatch = suiteFiles.map((f) => `<rootDir>/e2e/suites/${f}.test.ts`);

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  rootDir: '..',
  testMatch,
  testTimeout: 120000,
  maxWorkers: 1,
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  reporters: ['detox/runners/jest/reporter'],
  testEnvironment: 'detox/runners/jest/testEnvironment',
  verbose: true,
};
