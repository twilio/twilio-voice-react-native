# CI fixtures

Placeholder config the build jobs copy into place. These are not credentials and
not developer templates.

Each app statically imports a config file that must exist before its build can
run, and the Google Services Gradle plugin hard-fails when its file is absent.
CI has no real values for either, so it copies a fixture.

These are not developer templates. `test/appium-harness` ships a
`*.example.json` for each config file, explaining what a human should fill in.
The templates are deliberately separate from these fixtures. A template can
carry guidance text that would make a build fail, while a fixture has to be
valid. `test/app` ships no template, so a developer building `test/app` locally
supplies their own `android/app/google-services.json`.

A fixture's `package_name` must match the app's `applicationId`, because the
Google Services plugin rejects a file with no matching client.

| Fixture | Consumed by | applicationId it matches |
| --- | --- | --- |
| `appium-harness-secrets.json` | `build-android-expo`, `build-ios-expo` | n/a, read by `app.config.mjs` |
| `appium-harness-google-services.json` | `build-android-expo`, `build-ios-expo` | `com.example.twilioreactnativeappiumharness` |
| `bare-app-google-services.json` | `build-android-bare` | `com.example.twiliovoicereactnative` |

`build-ios-bare` consumes no fixture. The bare iOS app pulls in no Firebase
pods, so it needs no `GoogleService-Info.plist`.
