# Appium Test Harness

This project is a React Native Expo application that provides a very basic
UI/UX. It is intended to be used in CI applications.

## How to run the application?

The Test Harness application can be run locally (or manually, otherwise).
Installing dependencies and building/running the application is no different
than a typical Expo application.

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

2. Ensure that secrets are available before prebuild

   There are two secrets files that you will need to build the app:

   - Google Services

     The `google-services.json` file is generated through Firebase and used for
     Firebase Cloud Messaging. This file should be located in the root of the
     Expo test app folder `./google-services.json` (adjacent to `package.json`).

     If you are testing incoming calls, please ensure that the
     `google-services.json` file defines a package name consistent with the one
     defined in `./app.config.js`. Modify the `./app.config.js` package names
     for your use case.

     It suffices to copy the `google-services.example.json` file to
     `google-services.json` and replace the content of the file with the content
     of your generated `google-services.json` file.

   - Secrets

     The `secrets.json` file is used by the Expo prebuild step to autofill the
     Apple Signing Team. This file should be located in the root of the
     Expo test app folder `./secrets.json` (adjacent to `package.json`).

     The contents of the file should be a JSON-encoded object with a single
     key-value pair:

     ```json
     {
       "appleTeamId": "foobar"
     }
     ```

     It suffices to copy the `secrets.example.json` file to `secrets.json` and
     replace the content of the file with the `"appleTeamId"` consistent with
     your use-case.

3. Prebuild the app for the platform(s) you wish to test on

  ```bash
  yarn run expo prebuild --clean --platform=android
  ```

  ```bash
  yarn run expo prebuild --clean --platform=ios
  ```

4. Start the bundler

   ```bash
   yarn run start
   ```

5. Open and run the app in Android Studio or Xcode

   ```bash
   studio android/
   ```

   ```bash
   open ios/TwilioVoiceExpoExample.xcworkspace/
   ```

   Note that you may need to expose the bundler to the Android Virtual Device
   (AVD):

   ```bash
   adb reverse tcp:8081 tcp:8081
   ```

6. Build and run the app through the native IDE (Android Studio or Xcode)

7. Use the `test/appium-orchestrator/` project to conduct tests on the Test
   Harness application

   Follow the instructions in `test/appium-orchestrator/README.md` for setting
   up the orchestrator and conducting tests on the Test Harness application.

## Architecture Overview

Because this application is intended for CI usage, the UI/UX is very barebones
and only serves to report test results and basic logging to the
Appium/Webdriverio orchestrator.

Test Suite behavior is defined client-side, meaning the test code and
functionality exists in this codebase. The orchestrator simply requests from
the app to start a test, i.e. "outgoing-call-test", and waits for the result
from the Test Harness app.

```
+---------------------------------------------------------------+
|                          CI PIPELINE                          |
|                               |                               |
|                               v                               |
|  +---------------------------------------------------------+  |
|  |                      ORCHESTRATOR                       |  |
|  |                   (WebdriverIO / Node)                  |  |
|  |                                                         |  |
|  |  it("outgoing call", async () => {                      |  |
|  |    await sendCommand("outgoing-call-test")              |  |
|  |    await waitForResult()                                |  |
|  |  });                                                    |  |
|  +---------------------------------------------------------+  |
+------------------------------+--------------------------------+
                               |
                               |  Appium WebDriver protocol
                               |  (tap element / set text / etc.)
                               v
+---------------------------------------------------------------+
|                   SauceLabs (CI) or Local                     |
|                                                               |
|  +---------------------------------------------------------+  |
|  |                     APPIUM SERVER                       |  |
|  |                  Real or virtual device                 |  |
|  +---------------------------------------------------------+  |
+---------------------------------------------------------------+
                               |
                               |  XCUITest / UIAutomator2
                               v
+---------------------------------------------------------------+
|                          TEST HARNESS                         |
|                      (Expo / React Native)                    |
|                                                               |
|  receives command string e.g. "outgoing-call-test"            |
|                               |                               |
|                               v                               |
|  +---------------------------------------------------------+  |
|  |             TEST SUITE (e.g. OutgoingCallTest)          |  |
|  |                                                         |  |
|  |   - calls Twilio Voice SDK directly                     |  |
|  |   - asserts on call state, events, etc.                 |  |
|  |   - writes pass/fail result to UI                       |  |
|  +---------------------------------------------------------+  |
|                               |                               |
|                               v                               |
|  +---------------------------------------------------------+  |
|  |                         RESULT UI                       |  |
|  |             (orchestrator polls and asserts)            |  |
|  +---------------------------------------------------------+  |
+---------------------------------------------------------------+
```
