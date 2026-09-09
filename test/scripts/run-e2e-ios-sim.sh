#!/usr/bin/env bash
# Run the Appium suites against an iOS Simulator.
#
# Registration and incoming suites are excluded: both need a PushKit VoIP token,
# which a simulator cannot obtain. Everything else, including outgoing calls,
# is expected to work.
set -euo pipefail

SUITES="${1:-}"
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BUNDLE_ID="com.twilio.voicereactnative.appiumharness"
APP="${IOS_APP:-/tmp/dd-h3/Build/Products/Debug-iphonesimulator/twiliovoicereactnativesdkappiumharness.app}"

export DEVELOPER_DIR="${DEVELOPER_DIR:-/Applications/Xcode-26.6.0.app/Contents/Developer}"

LOCK="/tmp/twilio-voice-e2e-ios.lock"
if ! mkdir "$LOCK" 2>/dev/null; then
  if [ -f "$LOCK/pid" ] && kill -0 "$(cat "$LOCK/pid")" 2>/dev/null; then
    echo "another iOS run holds $LOCK" >&2; exit 3
  fi
  rm -rf "$LOCK"; mkdir "$LOCK"
fi
echo $$ > "$LOCK/pid"

cleanup() {
  echo "--- cleanup ---"
  rm -rf "$LOCK"
  for pid in "${METRO_PID:-}" "${APPIUM_PID:-}"; do
    [ -z "$pid" ] && continue
    pkill -P "$pid" 2>/dev/null || true
    kill "$pid" 2>/dev/null || true
  done
  pkill -f "expo start --port 8081" 2>/dev/null || true
  pkill -f "appium --port 4723" 2>/dev/null || true
}
trap cleanup EXIT

SIM_NAME="${IOS_SIM_NAME:-iPhone 17 Pro}"
echo "--- boot simulator: $SIM_NAME ---"
SIM=$(xcrun simctl list devices available | grep -m1 "$SIM_NAME (" | grep -oE "[0-9A-F-]{36}")
[ -z "$SIM" ] && { echo "no simulator named $SIM_NAME" >&2; exit 2; }
xcrun simctl boot "$SIM" 2>/dev/null || true
xcrun simctl bootstatus "$SIM" -b >/dev/null 2>&1 || true
echo "    $SIM"

echo "--- mint fresh credentials ---"
bash "$(dirname "${BASH_SOURCE[0]}")/mint-e2e-credentials.sh" "$REPO"

echo "--- metro ---"
pkill -f "expo start" 2>/dev/null || true
sleep 2
( cd "$REPO/test/appium-harness" && exec npx expo start --port 8081 ) >/tmp/ios-metro.log 2>&1 &
METRO_PID=$!
until curl -s -o /dev/null -w '%{http_code}' http://localhost:8081/status 2>/dev/null | grep -q 200; do sleep 3; done
echo "    up"

echo "--- install app ---"
xcrun simctl install "$SIM" "$APP"

echo "--- appium ---"
( cd "$REPO/test/appium-orchestrator" && exec npx appium --port 4723 ) >/tmp/ios-appium.log 2>&1 &
APPIUM_PID=$!
until curl -s -o /dev/null -w '%{http_code}' http://localhost:4723/status 2>/dev/null | grep -q 200; do sleep 2; done
echo "    up"

echo "--- suites ---"
RESULTS_DIR="$REPO/test/results"; mkdir -p "$RESULTS_DIR"
SIMLOG="$RESULTS_DIR/ios-sim-$(date +%Y%m%d-%H%M%S).log"
# `processImagePath` matched almost nothing; the app's console output arrives
# under the process name. Stream broadly and filter after, and also take a
# `log show` dump at the end so a missed stream still leaves evidence.
xcrun simctl spawn "$SIM" log stream --level debug \
  --predicate 'process CONTAINS "appiumharness" OR senderImagePath CONTAINS "appiumharness"' \
  > "$SIMLOG" 2>&1 &
LOGPID=$!

cd "$REPO/test/appium-orchestrator"
set +e
PLATFORM=ios IOS_TARGET=simulator IOS_SIM_NAME="$SIM_NAME" SUITES="$SUITES" node test-suites/index.mjs
EXIT=$?
set -e
kill "$LOGPID" 2>/dev/null || true

# Belt and braces: a retrospective dump, in case the stream captured nothing.
xcrun simctl spawn "$SIM" log show --last 15m --level debug \
  --predicate 'process CONTAINS "appiumharness"' >> "$SIMLOG" 2>/dev/null || true

echo "full app log: $SIMLOG ($(wc -l < "$SIMLOG") lines)"
exit $EXIT
