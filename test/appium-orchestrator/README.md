# Appium/Webdriverio orchestrator

This project is a Appium/Webdriverio orchestrator that is meant to be used with the Test Harness application found in `test/appium-harness/`. It is meant to be used in CI.

## How to use this project?

This project can be setup locally to be used with an attached (or emulated) mobile device.

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

2. Ensure that the Test Harness application is installed and available to run
   on the test device.

   See the setup instructions in `test/harness/README.md` for details.

3. Run the local Appium server.

   ```bash
   yarn run appium
   ```

4. Run a test suite.

   ```bash
   node test-suites/index.mjs
   ```

## Architecture Overview

Please see the `Architecture Overview` section in the `test/harness/README.md`
file for details.
