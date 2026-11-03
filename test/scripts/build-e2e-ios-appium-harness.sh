#!/usr/bin/env bash
# Build the Appium harness app for a physical iOS device. A Release build embeds
# the JavaScript bundle and lands where run-e2e-ios-device.sh reads by default.
# A Debug build needs Metro running, and run-e2e-ios-device.sh needs IOS_APP set
# to the Debug-iphoneos app path.
#
# A Release bundle embeds the TURN credentials from
# test/appium-harness/src/utilities/token/e2e-tests-ice-server.ts at build time.
# The runner mints new credentials after the build, and those new credentials
# do not reach an app that is already built. Run
# `mint-e2e-credentials.sh <repo-root>` before this script, and start the run
# within the one hour TTL of those credentials.
#
# Usage: IOS_UDID=<udid> build-e2e-ios-appium-harness.sh [Release|Debug]
set -euo pipefail

CONFIGURATION="${1:-Release}"
case "$CONFIGURATION" in
  Release|Debug) ;;
  *) echo "configuration must be Release or Debug, got $CONFIGURATION" >&2; exit 2 ;;
esac

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
HARNESS="$REPO/test/appium-harness"
UDID="${IOS_UDID:?set IOS_UDID to the target device UDID (xcrun xctrace list devices)}"
DERIVED="${IOS_DERIVED_DATA:-$HARNESS/ios/build-device}"
NAME=twiliovoicereactnativesdkappiumharness
WORKSPACE="$HARNESS/ios/$NAME.xcworkspace"

# shellcheck source=test/scripts/lib-xcode.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib-xcode.sh"
resolve_developer_dir

if [ ! -d "$WORKSPACE" ]; then
  echo "no workspace at $WORKSPACE; running prebuild"
  ( cd "$HARNESS" && yarn run prebuild --clean --platform=ios )
fi

xcodebuild \
  -workspace "$WORKSPACE" \
  -scheme "$NAME" \
  -configuration "$CONFIGURATION" \
  -destination "id=$UDID" \
  -derivedDataPath "$DERIVED" \
  -allowProvisioningUpdates \
  build

echo "built $DERIVED/Build/Products/$CONFIGURATION-iphoneos/$NAME.app"
