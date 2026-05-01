# Appium/Webdriverio orchestrator

This project is a Appium/Webdriverio orchestrator that is meant to be used with
the Test Harness application found in `test/appium-harness/`. It is meant to be
used in CI.

## How to use this project?

This project can be setup locally to be used with an attached (or emulated)
mobile device.

1. Install dependencies

   If you're performing tests for an RC or a release, consider deleting the
   `node_modules/` folder and pulling fresh dependencies.

   Using the following install flags will ensure that there are no issues with
   the lockfile and that CI will cleanly build the RC or release.

   ```bash
   yarn install --immutable
   ```

   If you have updated the dependencies of the package, or otherwise have issues
   performing a Yarn install, try without the flags:

   ```bash
   yarn install
   ```

2. Save secrets for usage by the orchestrator.

   See `secrets.example.json` and `token.example.json`. Make a copy of those
   files and remove `.example`: `secrets.json` and `token.json`. Then,
   using the example files as a template, fill out the required information in
   the secrets files.

3. Ensure that the Test Harness application is installed and available to run
   on the test device.

   See the setup instructions in `test/appium-harness/README.md` for details.

4. Run the local Appium server.

   ```bash
   yarn run appium
   ```

5. Run a test suite.

   ```bash
   USE_SAUCE=... node test-suites/index.mjs
   ```

   The `USE_SAUCE` environment variable is inferred `false` by default. If you
   intend to test locally, there is no need to have the environment variable
   defined, or you can explicitly define `USE_SAUCE=false`.

   To test using Sauce Labs, ensure that `USE_SAUCE=true`.

## Architecture Overview

Please see the `Architecture Overview` section in the
`test/appium-harness/README.md` file for details.
