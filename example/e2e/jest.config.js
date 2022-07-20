const { defaults } = require('jest-config');
require('dotenv').config();
// Use regression test cases for default value;
const jestTestRegex = process.env.JEST_TEST_REGEX_PATTERN || '^(?!.*voice).*.spec.ts$';

module.exports = {
    testEnvironment: './environment',
    testTimeout: 120000,
    testRegex: jestTestRegex,
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
