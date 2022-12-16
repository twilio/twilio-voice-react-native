const { defaults } = require('jest-config');
require('dotenv').config();

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  testEnvironment: './environment',
  rootDir: '..',
  testMatch: ['<rootDir>/e2e/**/*.spec.ts'],
  testTimeout: 120000,
  maxWorkers: 1,
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  reporters: [
    'detox/runners/jest/streamlineReporter',
    [
      'jest-html-reporter',
      {
        pageTitle: 'Test Report',
        includeFailureMsg: true,
      },
    ],
  ],
  testEnvironment: 'detox/runners/jest/testEnvironment',
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/e2e/init.ts'],
};
