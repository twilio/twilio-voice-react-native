#!/usr/bin/env bash
# Build the bare React Native app (test/app) hosting the Appium harness for a
# physical iOS device. Pass the result to run-e2e-ios-device.sh with IOS_APP.
#
# Release only. ENTRY_FILE selects the harness entry, and only a Release build
# embeds a bundle. A Debug build asks Metro for `index` and loads the example
# app instead of the harness.
#
# The project sets no signing team, so IOS_TEAM_ID is required. The bundle
# identifier cannot be overridden here. A command-line build setting applies to
# every target, so each embedded pod framework would take the app's identifier.
#
# Usage: IOS_UDID=<udid> IOS_TEAM_ID=<team> build-e2e-ios-bare.sh
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
APP_DIR="$REPO/test/app"
UDID="${IOS_UDID:?set IOS_UDID to the target device UDID (xcrun xctrace list devices)}"
TEAM="${IOS_TEAM_ID:?set IOS_TEAM_ID to the signing team ID}"
DERIVED="${IOS_DERIVED_DATA:-$APP_DIR/ios/build-device}"
NAME=TwilioVoiceExampleNewArch
WORKSPACE="$APP_DIR/ios/$NAME.xcworkspace"
APP="$DERIVED/Build/Products/Release-iphoneos/$NAME.app"

# shellcheck source=test/scripts/lib-xcode.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib-xcode.sh"
resolve_developer_dir

# USE_FRAMEWORKS passes through to pod install from the caller's environment.
if [ ! -d "$WORKSPACE" ]; then
  echo "no workspace at $WORKSPACE; running pods"
  ( cd "$REPO" && yarn run pods )
fi

xcodebuild \
  -workspace "$WORKSPACE" \
  -scheme "$NAME" \
  -configuration Release \
  -destination "id=$UDID" \
  -derivedDataPath "$DERIVED" \
  -allowProvisioningUpdates \
  DEVELOPMENT_TEAM="$TEAM" \
  ENTRY_FILE=index.harness.js \
  build

# The same check CI makes. Without the harness entry, the app builds and runs
# but hosts the example app, so every suite fails to find its inputs.
if ! grep -q textInput_testSuiteId "$APP/main.jsbundle"; then
  echo "$APP/main.jsbundle does not bundle the harness" >&2
  exit 1
fi

echo "built $APP"
