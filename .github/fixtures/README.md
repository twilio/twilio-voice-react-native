# CI fixtures

Placeholder config the build jobs copy into place. These are not credentials and
not developer templates.

Each app statically imports a config file that must exist before its build can
run, and the Google Services Gradle plugin hard-fails when its file is absent.
CI has no real values for either, so it copies a fixture.

These are not developer templates. `test/appium-harness` and `test/expo` each
ship a `*.example.json` for each config file, explaining what a human should
fill in. The templates are deliberately separate from these fixtures. A template
can carry guidance text that would make a build fail, while a fixture has to be
valid. `test/app` ships no template, so a developer building `test/app` locally
supplies their own `android/app/google-services.json`.

A fixture's `package_name` must match the app's `applicationId`, because the
Google Services plugin rejects a file with no matching client.

| Fixture | Consumed by | applicationId it matches |
| --- | --- | --- |
| `appium-harness-secrets.json` | `build-android-expo`, `build-ios-expo` | n/a, read by `app.config.mjs` |
| `appium-harness-google-services.json` | `build-android-expo`, `build-ios-expo` | `com.example.twilioreactnativeappiumharness` |
| `bare-app-google-services.json` | `build-android-bare`, `build-android-expo-legacyArch`, `package-check-android-bare`, `package-check-android-expo` | `com.example.twiliovoicereactnative` |
| `test-expo-secrets.json` | `build-android-expo-legacyArch`, `build-ios-expo-legacyArch` | n/a, read by `test/expo/app.config.js` |

`build-ios-bare`, `package-check-ios-bare` and `package-check-ios-expo` consume
no fixture. Those iOS apps pull in no Firebase pods, so those iOS apps need no
`GoogleService-Info.plist`. `test/package-check/expo/app.json` names
`google-services.json` only under `android`, so the iOS prebuild never reads
`google-services.json`.

`build-ios-expo-legacyArch` consumes only `test-expo-secrets.json`.
`test/expo/app.config.js` names `google-services.json` only under `android`, so
the iOS prebuild never reads it.
