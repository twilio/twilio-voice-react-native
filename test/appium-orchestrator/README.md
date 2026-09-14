# Appium/Webdriverio orchestrator

This project is an Appium/Webdriverio orchestrator that is meant to be used
with the Test Harness application found in `test/appium-harness/`. It is meant
to be used in CI.

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

## Scripted runs

`test/scripts/` holds one runner per target. Each boots or checks the device,
mints fresh credentials, starts Metro where the build needs it, starts Appium,
runs the suites and tears everything down. They take the place of steps 4 and 5
above.

| Script | Target | Notes |
| --- | --- | --- |
| `run-e2e-android.sh <avd> [suites]` | Android emulator | Needs `ANDROID_HOME` (or the SDK at `~/Library/Android/sdk`) and a JDK 17 on `JAVA_HOME` |
| `run-e2e-ios-sim.sh [suites]` | iOS Simulator | Registration and incoming suites cannot run: a simulator has no PushKit VoIP token |
| `run-e2e-ios-device.sh [suites]` | Physical iPhone | Set `IOS_UDID`. Needs iOS 17 or later, because Xcode's CoreDevice requires it for on-device XCUITest |

Both iOS runners expect an already-built app bundle and print the path they
looked in; each script's header comment carries the `xcodebuild` invocation.
Override the location with `IOS_APP`, or the derived-data directory with
`IOS_DERIVED_DATA`.

`suites` is an optional comma-separated list of suite ids; omit it to run all
of them. Logs land in `test/results/`, which is gitignored.

### Credentials for scripted runs

The runners source `test/e2e.env` if it exists and mint a fresh access token
and fresh TURN credentials from it on every run, because both carry a one hour
TTL. Copy `test/e2e.env.example` to `test/e2e.env` and fill it in. That file is
gitignored; never commit real values.

Without `test/e2e.env` the runners reuse whatever `secrets.json` and
`token.json` already hold, which is fine for a one-off but expires within the
hour.

## Architecture Overview

Please see the `Architecture Overview` section in the
`test/appium-harness/README.md` file for details.
