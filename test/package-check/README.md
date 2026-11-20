# Package-check apps

These two apps are fresh template apps that the package checks build the
published SDK into. A customer installs the published tarball into a new app,
so these apps stay as close to an untouched template as possible.

`test/app` and `test/expo` are not used for this, because each links the SDK
from the repository, configures Metro for that link, and carries extra native
dependencies that can hide a packaging gap in the SDK.

| App | Template | Native folders |
| --- | --- | --- |
| `bare/` | React Native `0.76.9` (`@react-native-community/cli` `15.0.1`) | `android/` and `ios/` are committed |
| `expo/` | Expo SDK 52 (`expo` `~52.0.49`, React Native `0.76.9`), `blank-typescript` | None. CI generates them with `expo prebuild` |

Both apps use the Android `applicationId` `com.example.twiliovoicereactnative`,
the same as `test/app` and `test/expo`. So the apps share the existing Google
Services fixture and the existing Firebase and push setup for that package.

Neither app lists the SDK as a dependency. The CI jobs install the tarball
that the `pack` job builds.

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

## Updating an app

To move an app to a new React Native or Expo version, re-create the app with
the commands above at the new version, commit the template output on its own,
and then re-apply the later changes from `git log -p -- test/package-check`.
