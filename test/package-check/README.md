# Package-check apps

These two apps are fresh template apps for the package checks. The package
checks install the packed SDK tarball into these apps. A customer installs
the published tarball into a new app, so these apps stay as close to an
untouched template as possible.

`test/app` and `test/expo` are not used for this, because each links the SDK
from the repository, configures Metro for that link, and carries extra native
dependencies that can hide a packaging gap in the SDK.

| App | Template | Native folders |
| --- | --- | --- |
| `bare/` | React Native `0.76.9` (`@react-native-community/cli` `15.0.1`) | `android/` and `ios/` are committed |
| `expo/` | Expo SDK 52 (`expo` `~52.0.49`, React Native `0.76.9`), `blank-typescript` | None. `yarn run prebuild` generates them |

Both apps use the Android `applicationId`
`com.example.twiliovoicereactnative`, the same as `test/app` and `test/expo`.
So both apps share the `.github/fixtures/bare-app-google-services.json`
fixture.

Neither app lists the SDK as a dependency. The package checks install the
tarball instead.

## How the apps were created

Each app was created with one command and committed with a single edit: the
Expo template's `AGENTS.md` and `.claude/` folder were deleted, because they
configure coding agents for whoever opens the folder and describe an Expo
Router layout that this blank app does not have. Every later change to an app
is a separate commit, so
`git log -p -- test/package-check` shows how each app differs from its
template.

```bash
cd test/package-check

npx @react-native-community/cli@latest init BarePackageCheck \
  --version 0.76.9 \
  --directory bare \
  --package-name com.example.twiliovoicereactnative \
  --pm yarn \
  --skip-install \
  --skip-git-init \
  --install-pods false

npx create-expo-app@latest ExpoPackageCheck \
  --template blank-typescript@sdk-52 \
  --no-install
mv ExpoPackageCheck expo
rm -r expo/AGENTS.md expo/.claude
```

- `init --version 0.76.9` uses the template for React Native 0.76.9, so the
  bare app pins `@react-native-community/cli` to `15.0.1`, whichever CLI ran
  `init`.
- `create-expo-app` names the app after its directory, and refuses the name
  `expo` because the name conflicts with the `expo` dependency. So the app is
  created as `ExpoPackageCheck` and the folder is renamed.

## Changes from the templates

These are the only changes after the template commit.

Both apps:

- `.yarnrc.yml` sets `nodeLinker: node-modules`, because React Native and Expo
  autolinking read `node_modules/`.
- `yarn.lock` is committed, so Yarn treats each app as its own project instead
  of part of the repository root project.
- `package.json` pins `packageManager` to Yarn `4.12.0`, so Corepack uses the
  same Yarn as the rest of the repository.

`bare/`:

- `android/app/build.gradle` sets `enableProguardInReleaseBuilds = true`, so
  the release build runs R8. The template ships with R8 off.
- `android/app/build.gradle` applies `com.google.gms.google-services`, and
  `android/build.gradle` adds its `classpath`. The SDK needs Firebase for push.
- `.gitignore` ignores `android/app/google-services.json`, which CI copies in
  from `.github/fixtures/`.

`expo/`:

- `package.json` adds a `prebuild` script that runs `expo prebuild`.
- `package.json` pins `postcss` to `8.5.28` in `resolutions`, the same pin as
  the root `package.json` and `test/expo`. Without the pin,
  `@expo/metro-config` resolves `postcss` `~8.4.32`.
- `app.json` sets `android.package` to `com.example.twiliovoicereactnative`
  and `android.googleServicesFile` to `./google-services.json`.
- `app.json` adds the `@twilio/voice-react-native-sdk` config plugin. The
  prebuild needs the SDK installed, so the prebuild runs only after CI installs
  the tarball.
- `.gitignore` ignores the generated `android/` and `ios/` folders, and the
  `google-services.json` that CI copies in. The prebuild reads
  `google-services.json`, so CI copies the file in before the prebuild.

R8 is not on in `expo/app.json`. The CI job passes
`-Pandroid.enableProguardInReleaseBuilds=true` to Gradle, because the prebuilt
`android/app/build.gradle` defaults R8 to off.

## Updating an app

To move an app to a new React Native or Expo version, re-create the app with
the commands above at the new version, and commit the template output on its
own. Then re-apply the changes listed above.
