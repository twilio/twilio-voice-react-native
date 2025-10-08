'use strict';

/**
 * Attempt to parse an environment variable from the process.
 * @param {string} envVarKey The name of the environment variable.
 * @throws {Error} Will throw if the environment variable is missing.
 * @returns {string}
 */
export function parseEnvVar(envVarKey) {
  const envVarValue = process.env[envVarKey];
  if (typeof envVarValue === 'undefined') {
    throw new Error(`Environment variable with key "${envVarKey}" is missing.`);
  }
  if (envVarValue === '') {
    throw new Error(
      `Environment variable with key "${envVarKey}" evaluated to the empty string.`
    );
  }
  return envVarValue;
}

/**
 * Parse the script arguments.
 * @throws {Error} Will throw if the script was not executed with the correct
 * number of arguments or if an argument is invalid.
 */
export function parseScriptArgument() {
  if (process.argv.length !== 5) {
    throw new Error('Incorrect number of arguments.');
  }

  const identity = process.argv[2];
  if (identity === '') {
    throw new Error('Identity evaluated to empty string.');
  }

  const suite = process.argv[3];
  if (!['call', 'preflightTest'].includes(suite)) {
    throw new Error('Suite not valid.');
  }

  const path = process.argv[4];
  if (path === '') {
    throw new Error('Path evaluted to empty string.');
  }

  return { identity, suite, path };
}
