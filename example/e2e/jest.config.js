const { defaults } = require('jest-config');
require('dotenv').config();

module.exports = {
  testEnvironment: './environment',
  testTimeout: 120000,
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
  verbose: true,
  preset: 'ts-jest',
  setupFilesAfterEnv: ['./init.ts'],
};
