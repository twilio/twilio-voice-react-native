#!/usr/bin/env bash
# Run the Appium suites against one Android emulator.
#
# Sequence matters. The harness is a debug build with no embedded JS bundle, so
# Metro must be serving the harness project and reachable from the device before
# the app is launched. Getting this wrong produces a 2-of-3 marker failure that
# looks exactly like a product regression; see MASTER_TEST_PLAN section 10.
#
# Usage: run-e2e-android.sh <avd> [suite,suite,...]
set -euo pipefail

AVD="${1:?usage: run-e2e-android.sh <avd> [suites]}"
SUITES="${2:-}"

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Only one run at a time. Cleanup kills Metro and Appium by pattern, to clear
# strays from a previous run, so two concurrent runs kill each other's servers.
# That presented as a mid-run ECONNREFUSED and cost a debugging cycle.
# macOS has no flock(1); mkdir is atomic and portable.
LOCK="/tmp/twilio-voice-e2e-android.lock"
if ! mkdir "$LOCK" 2>/dev/null; then
  if [ -f "$LOCK/pid" ] && kill -0 "$(cat "$LOCK/pid")" 2>/dev/null; then
    echo "another e2e run (pid $(cat "$LOCK/pid")) holds $LOCK; refusing to start" >&2
    exit 3
  fi
  echo "clearing a stale lock from pid $(cat "$LOCK/pid" 2>/dev/null || echo unknown)" >&2
  rm -rf "$LOCK"
  mkdir "$LOCK"
fi
echo $$ > "$LOCK/pid"
SDK="$HOME/Library/Android/sdk"
ADB="$SDK/platform-tools/adb"
EMULATOR="$SDK/emulator/emulator"
APP_PACKAGE="com.twilio.voicereactnative.appiumharness"
# Which app hosts the suites. Defaults to the Expo harness; E2E_APK and
# E2E_METRO_DIR point the same runner at the bare app, whose native project
# builds the harness entry via -PentryFile=index.harness.js.
APK="${E2E_APK:-$REPO/test/appium-harness/android/app/build/outputs/apk/debug/app-debug.apk}"
METRO_DIR="${E2E_METRO_DIR:-$REPO/test/appium-harness}"
METRO_CMD="${E2E_METRO_CMD:-npx expo start --port 8081}"

export JAVA_HOME="$(brew --prefix openjdk@17)"
export PATH="$JAVA_HOME/bin:$PATH"

cleanup() {
  echo "--- cleanup ---"
  rm -rf "$LOCK"
  # Metro and Appium are npx wrappers, so the real node process is a child and
  # has to be killed too. Kill the child then the wrapper, never the process
  # group: these run in the caller's group, so a group kill also killed the
  # loop driving the matrix, which stopped it dead after exactly one AVD.
  for pid in "${METRO_PID:-}" "${APPIUM_PID:-}"; do
    [ -z "$pid" ] && continue
    pkill -P "$pid" 2>/dev/null || true
    kill "$pid" 2>/dev/null || true
  done
  pkill -f "expo start --port 8081" 2>/dev/null || true
  pkill -f "appium --port 4723" 2>/dev/null || true
}
trap cleanup EXIT

echo "--- gradle daemons down, so the emulator has memory ---"
(cd "$REPO/test/appium-harness/android" && ./gradlew --stop >/dev/null 2>&1) || true

echo "--- boot $AVD ---"
if ! "$ADB" devices | grep -q "emulator-5554"; then
  "$EMULATOR" -avd "$AVD" -port 5554 -no-window -no-snapshot -no-boot-anim \
    -gpu swiftshader_indirect >/dev/null 2>&1 &
  EMULATOR_PID=$!
fi
"$ADB" wait-for-device
until [ "$("$ADB" -s emulator-5554 shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ]; do
  sleep 3
done
echo "    up: api $("$ADB" -s emulator-5554 shell getprop ro.build.version.sdk | tr -d '\r')"

echo "--- metro for the harness project only ---"
pkill -f "expo start" 2>/dev/null || true
pkill -f "react-native start" 2>/dev/null || true
sleep 2
# Background at this level, not inside a subshell: `( ... &)` leaves $! unset,
# which under `set -u` aborts the script, and only when no earlier `&` happened
# to have set it.
( cd "$METRO_DIR" && exec $METRO_CMD ) >/tmp/harness-metro.log 2>&1 &
METRO_PID=$!
until curl -s -o /dev/null -w '%{http_code}' http://localhost:8081/status 2>/dev/null | grep -q 200; do
  sleep 3
done
"$ADB" -s emulator-5554 reverse tcp:8081 tcp:8081
echo "    metro up and reversed"

echo "--- mint fresh credentials ---"
bash "$(dirname "${BASH_SOURCE[0]}")/mint-e2e-credentials.sh" "$REPO"

echo "--- install harness ---"
"$ADB" -s emulator-5554 install -r -g "$APK" | tail -1

echo "--- appium ---"
( cd "$REPO/test/appium-orchestrator" && exec npx appium --port 4723 ) >/tmp/appium.log 2>&1 &
APPIUM_PID=$!
until curl -s -o /dev/null -w '%{http_code}' http://localhost:4723/status 2>/dev/null | grep -q 200; do
  sleep 2
done
echo "    appium up"

echo "--- suites ---"
# Stream logcat to a file for the duration of the run. The orchestrator reports
# only a suite's final status, so the per-step detail lives in the app's log,
# and reading it afterwards is unreliable: the emulator does not always outlive
# the run.
RESULTS_DIR="${RESULTS_DIR:-$REPO/test/results}"
mkdir -p "$RESULTS_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
HARNESS_LOG="$RESULTS_DIR/harness-$AVD-$STAMP.log"
"$ADB" -s emulator-5554 logcat -c
"$ADB" -s emulator-5554 logcat > "$HARNESS_LOG" 2>&1 &
LOGCAT_PID=$!

cd "$REPO/test/appium-orchestrator"
set +e
PLATFORM=android AVD="$AVD" SUITES="$SUITES" node test-suites/index.mjs
EXIT=$?
set -e

kill "$LOGCAT_PID" 2>/dev/null || true

echo "--- harness step detail ---"
grep "ReactNativeJS" "$HARNESS_LOG" 2>/dev/null \
  | sed "s/.*ReactNativeJS: //" \
  | grep -A30 '"summary"' | tail -32 || echo "  no summary captured"
echo "full app log: $HARNESS_LOG"

exit $EXIT
