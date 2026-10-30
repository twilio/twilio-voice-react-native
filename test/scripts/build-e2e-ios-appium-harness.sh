#!/usr/bin/env bash
# Build the Appium harness app for a physical iOS device, into the location
# run-e2e-ios-device.sh reads from. That runner needs Release, which embeds the
# JavaScript bundle. Debug needs Metro running.
#
# Usage: IOS_UDID=<udid> build-e2e-ios.sh [Release|Debug]
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
