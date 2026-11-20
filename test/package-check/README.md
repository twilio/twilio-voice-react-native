# Package-check apps

These two apps are fresh template apps for the package checks. The package
checks will install the packed SDK tarball into these apps. A customer installs
the published tarball into a new app, so these apps stay as close to an
untouched template as possible.

`test/app` and `test/expo` are not used for this, because each links the SDK
from the repository, configures Metro for that link, and carries extra native
dependencies that can hide a packaging gap in the SDK.

| App | Template | Native folders |
| --- | --- | --- |
| `bare/` | React Native `0.76.9` (`@react-native-community/cli` `15.0.1`) | `android/` and `ios/` are committed |
| `expo/` | Expo SDK 52 (`expo` `~52.0.49`, React Native `0.76.9`), `blank-typescript` | None. `yarn run prebuild` generates them |

The bare app uses the Android `applicationId`
`com.example.twiliovoicereactnative`, the same as `test/app` and `test/expo`.
The Expo app does not set `android.package` yet.

Neither app lists the SDK as a dependency. The package checks will install the
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

`expo/`:

- `package.json` adds a `prebuild` script that runs `expo prebuild`.
- `package.json` pins `postcss` to `8.5.28` in `resolutions`, the same pin as
  the root `package.json` and `test/expo`. Without the pin,
  `@expo/metro-config` resolves `postcss` `~8.4.32`.

## Updating an app

To move an app to a new React Native or Expo version, re-create the app with
the commands above at the new version, and commit the template output on its
own. Then re-apply the changes listed above.
