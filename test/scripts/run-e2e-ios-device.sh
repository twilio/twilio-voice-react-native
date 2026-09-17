#!/usr/bin/env bash
# Run the Appium suites against a physical iOS device.
#
# The app is built Release, so no Metro is required; the JavaScript bundle is
# embedded. Registration and incoming suites need a PushKit VoIP token, which
# needs an `aps-environment` entitlement. A signing team that cannot issue that
# entitlement has to strip it, and those suites are then unrunnable.
#
# Xcode's CoreDevice requires iOS 17 or later for on-device XCUITest. Older
# devices install and launch but cannot be driven by Appium.
#
# Build the app bundle first, for example:
#
#   xcodebuild -workspace test/appium-harness/ios/<name>.xcworkspace \
#     -scheme <name> -configuration Release -destination "id=$IOS_UDID" \
#     -derivedDataPath test/appium-harness/ios/build-device
#
# Usage: IOS_UDID=<udid> run-e2e-ios-device.sh [suite,suite,...]
set -euo pipefail

SUITES="${1:-}"
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
UDID="${IOS_UDID:?set IOS_UDID to the target device UDID (xcrun xctrace list devices)}"
DERIVED="${IOS_DERIVED_DATA:-$REPO/test/appium-harness/ios/build-device}"
APP="${IOS_APP:-$DERIVED/Build/Products/Release-iphoneos/twiliovoicereactnativesdkappiumharness.app}"

# shellcheck source=test/scripts/lib-xcode.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib-xcode.sh"
resolve_developer_dir

[ -d "$APP" ] || { echo "no app bundle at $APP" >&2; exit 2; }

LOCK="/tmp/twilio-voice-e2e-ios-device.lock"
if ! mkdir "$LOCK" 2>/dev/null; then
  if [ -f "$LOCK/pid" ] && kill -0 "$(cat "$LOCK/pid")" 2>/dev/null; then
    echo "another iOS device run holds $LOCK" >&2; exit 3
  fi
  rm -rf "$LOCK"; mkdir "$LOCK"
fi
echo $$ > "$LOCK/pid"

cleanup() {
  echo "--- cleanup ---"
  rm -rf "$LOCK"
  [ -n "${APPIUM_PID:-}" ] && { pkill -P "$APPIUM_PID" 2>/dev/null || true; kill "$APPIUM_PID" 2>/dev/null || true; }
  return 0
}
trap cleanup EXIT

echo "--- device ---"
# Capture first: `grep -m1` closes the pipe early, xctrace dies with SIGPIPE,
# and pipefail then reports the whole pipeline as failed despite the match.
DEVICES="$(xcrun xctrace list devices 2>/dev/null || true)"
DEVICE_LINE="$(printf '%s\n' "$DEVICES" | grep "$UDID" | head -1 || true)"
[ -n "$DEVICE_LINE" ] || { echo "device $UDID not connected" >&2; exit 2; }
echo "    $DEVICE_LINE"
printf '%s\n' "$DEVICES" | sed -n '/== Devices Offline ==/,/== Simulators ==/p' | grep -q "$UDID" \
  && { echo "device $UDID is offline; unlock it and confirm the Trust prompt" >&2; exit 2; } || true

echo "--- mint fresh credentials ---"
bash "$(dirname "${BASH_SOURCE[0]}")/mint-e2e-credentials.sh" "$REPO"

echo "--- appium ---"
pkill -f "appium --port 4723" 2>/dev/null || true
( cd "$REPO/test/appium-orchestrator" && exec npx appium --port 4723 ) >/tmp/ios-device-appium.log 2>&1 &
APPIUM_PID=$!
until curl -s -o /dev/null -w '%{http_code}' http://localhost:4723/status 2>/dev/null | grep -q 200; do sleep 2; done
echo "    up"

echo "--- suites ---"
RESULTS_DIR="$REPO/test/results"; mkdir -p "$RESULTS_DIR"
cd "$REPO/test/appium-orchestrator"
set +e
PLATFORM=ios IOS_TARGET=device IOS_APP="$APP" SUITES="$SUITES" node test-suites/index.mjs
EXIT=$?
set -e
exit $EXIT
