#!/usr/bin/env bash
# Checks a package-check app's release build after `./gradlew assembleRelease`:
# the release APK exists, R8 ran, and React Native autolinking registered the
# SDK package.
#
# <android-dir> is the app's android/ folder.
set -uo pipefail

if [ $# -ne 1 ]; then
  echo "usage: check-android-package.sh <android-dir>" >&2
  exit 2
fi
if [ ! -d "$1" ]; then
  echo "::error::$1 is not a directory."
  exit 2
fi

APP="$1/app"
APK="${APP}/build/outputs/apk/release/app-release.apk"
MAPPING="${APP}/build/outputs/mapping/release/mapping.txt"
PACKAGE_LIST="${APP}/build/generated/autolinking/src/main/java/com/facebook/react/PackageList.java"

FAILURES=0
pass() { echo "ok    $1"; }
fail() {
  echo "::error::$1"
  FAILURES=$((FAILURES + 1))
}

if [ -f "$APK" ]; then
  pass "${APK} exists"
else
  fail "${APK} does not exist."
fi

# R8 writes a mapping file only when minification ran.
if [ -s "$MAPPING" ]; then
  pass "R8 ran (${MAPPING} exists)"
else
  fail "${MAPPING} is missing or empty, so R8 did not run. Check that minifyEnabled is on for release."
fi

if [ ! -f "$PACKAGE_LIST" ]; then
  fail "${PACKAGE_LIST} does not exist, so React Native autolinking did not run."
elif grep -qF 'new TwilioVoiceReactNativePackage()' "$PACKAGE_LIST"; then
  pass "PackageList.java registers TwilioVoiceReactNativePackage"
else
  fail "${PACKAGE_LIST} does not register TwilioVoiceReactNativePackage, so the SDK did not autolink."
fi

if [ "$FAILURES" != 0 ]; then
  echo "${FAILURES} check(s) failed."
  exit 1
fi
echo "all checks passed"
