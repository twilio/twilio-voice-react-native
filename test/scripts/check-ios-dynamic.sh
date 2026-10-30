#!/usr/bin/env bash
# Check that an iOS app bundle was built with USE_FRAMEWORKS=dynamic.
#
# In that mode the twilio-voice-react-native pod is its own dylib. The
# TwilioVoice-static library from SPM is linked into that dylib, not into the
# main executable. The static-framework and unset modes both link the pod into
# the main executable instead, so they fail these checks.
#
# Without an argument it checks the Release device build of the Expo harness,
# at the same default path as run-e2e-ios-device.sh.
#
# Usage: check-ios-dynamic.sh [path/to/App.app]
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DERIVED="${IOS_DERIVED_DATA:-$REPO/test/appium-harness/ios/build-device}"
APP="${1:-$DERIVED/Build/Products/Release-iphoneos/twiliovoicereactnativesdkappiumharness.app}"
[ -d "$APP" ] || { echo "no app bundle at $APP" >&2; exit 2; }

EXE="$APP/$(/usr/libexec/PlistBuddy -c 'Print :CFBundleExecutable' "$APP/Info.plist")"
POD="$APP/Frameworks/twilio_voice_react_native.framework/twilio_voice_react_native"

FAILED=0
pass() { echo "  ok    $1"; }
fail() { echo "  FAIL  $1"; FAILED=1; }

# `grep -c` prints 0 but exits 1 when nothing matches.
tvo_classes() { nm -gU "$1" 2>/dev/null | grep -c 'OBJC_CLASS_\$_TVO' || true; }

echo "app: $APP"

if [ -f "$POD" ]; then
  pass "twilio_voice_react_native.framework is embedded"
else
  fail "twilio_voice_react_native.framework is not embedded"
fi

# Capture before matching. Piping into `grep -q` can SIGPIPE the writer when
# `grep -q` exits early, and pipefail then reports the match as a failure.
POD_TYPE=""
[ -f "$POD" ] && POD_TYPE="$(file "$POD" || true)"
EXE_LIBS="$(otool -L "$EXE" || true)"

if [[ "$POD_TYPE" == *'dynamically linked shared library'* ]]; then
  pass "the pod binary is a dylib"
else
  fail "the pod binary is not a dylib"
fi

if [[ "$EXE_LIBS" == *'@rpath/twilio_voice_react_native.framework/twilio_voice_react_native'* ]]; then
  pass "the main executable loads the pod dylib"
else
  fail "the main executable does not load the pod dylib"
fi

POD_TVO=0
[ -f "$POD" ] && POD_TVO="$(tvo_classes "$POD")"
EXE_TVO="$(tvo_classes "$EXE")"

if [ "$POD_TVO" -gt 0 ]; then
  pass "the pod dylib defines $POD_TVO TVO classes"
else
  fail "the pod dylib defines no TVO classes"
fi

# A count here as well means TwilioVoice was linked twice.
if [ "$EXE_TVO" -eq 0 ]; then
  pass "the main executable defines no TVO classes"
else
  fail "the main executable defines $EXE_TVO TVO classes"
fi

# An embedded TwilioVoice.framework means the dynamic SPM product or the trunk
# pod was resolved instead of TwilioVoice-static.
if [ -d "$APP/Frameworks/TwilioVoice.framework" ]; then
  fail "TwilioVoice.framework is embedded"
else
  pass "TwilioVoice.framework is not embedded"
fi

echo ""
if [ "$FAILED" -ne 0 ]; then
  echo "not a dynamic framework build"
  exit 1
fi
echo "dynamic framework build"
