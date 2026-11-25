#!/usr/bin/env bash
# Checks a package-check app's build after `pod install` and an unsigned
# Release `xcodebuild` with `-derivedDataPath ./build`: the app exists with its
# JS bundle, CocoaPods autolinked the SDK pod, the SDK pod linked the way
# <linkage> asks, and the TwilioVoice framework is embedded in the app.
#
# <ios-dir> is the app's ios/ folder. <app-name> is the Xcode scheme and
# product name. <linkage> is the USE_FRAMEWORKS value that `pod install` saw:
# `static`, `dynamic`, or `unset` when USE_FRAMEWORKS was not set.
#
# The build must start from an empty ios/build, because Xcode does not remove
# products that an earlier build with another linkage left behind.
set -uo pipefail

if [ $# -ne 3 ]; then
  echo "usage: check-ios-package.sh <ios-dir> <app-name> <static|dynamic|unset>" >&2
  exit 2
fi
if [ ! -d "$1" ]; then
  echo "::error::$1 is not a directory."
  exit 2
fi
case "$3" in
  static | dynamic | unset) ;;
  *)
    echo "::error::<linkage> is $3, not static, dynamic or unset."
    exit 2
    ;;
esac

LINKAGE="$3"
PODFILE_LOCK="$1/Podfile.lock"
PRODUCTS_DIR="$1/build/Build/Products/Release-iphoneos"
APP="${PRODUCTS_DIR}/$2.app"
SDK_PRODUCTS_DIR="${PRODUCTS_DIR}/twilio-voice-react-native"
# CocoaPods names the SDK pod's framework module after the pod name, with each
# `-` replaced by `_`.
SDK_FRAMEWORK_NAME="twilio_voice_react_native.framework"
SDK_FRAMEWORK_BINARY="${SDK_PRODUCTS_DIR}/${SDK_FRAMEWORK_NAME}/twilio_voice_react_native"
SDK_LIBRARY="${SDK_PRODUCTS_DIR}/libtwilio-voice-react-native.a"

FAILURES=0
pass() { echo "ok    $1"; }
fail() {
  echo "::error::$1"
  FAILURES=$((FAILURES + 1))
}

if [ -d "$APP" ]; then
  pass "${APP} exists"
else
  fail "${APP} does not exist. Products dir contains: $(ls -1 "$PRODUCTS_DIR" 2>/dev/null | tr '\n' ' ')"
fi

if [ -f "${APP}/main.jsbundle" ]; then
  pass "${APP} embeds main.jsbundle"
else
  fail "${APP} has no main.jsbundle, so the JS was not embedded."
fi

if [ ! -f "$PODFILE_LOCK" ]; then
  fail "${PODFILE_LOCK} does not exist, so pod install did not run."
elif grep -qE '^  - twilio-voice-react-native \(' "$PODFILE_LOCK"; then
  pass "${PODFILE_LOCK} lists the twilio-voice-react-native pod"
else
  fail "${PODFILE_LOCK} does not list the twilio-voice-react-native pod, so the SDK did not autolink."
fi

# Without use_frameworks!, CocoaPods builds the SDK pod as a static library.
# With use_frameworks!, CocoaPods builds the SDK pod as a framework. A static
# framework holds an ar archive, and a dynamic framework holds a Mach-O dylib.
case "$LINKAGE" in
  unset)
    if [ -f "$SDK_LIBRARY" ]; then
      pass "the twilio-voice-react-native pod built as a static library"
    else
      fail "${SDK_LIBRARY} was not built. Products for the pod: $(ls -1 "$SDK_PRODUCTS_DIR" 2>/dev/null | tr '\n' ' ')"
    fi
    ;;
  static | dynamic)
    if [ "$LINKAGE" = static ]; then
      EXPECTED_TYPE='ar archive'
    else
      EXPECTED_TYPE='dynamically linked shared library'
    fi
    if [ ! -f "$SDK_FRAMEWORK_BINARY" ]; then
      fail "${SDK_FRAMEWORK_BINARY} was not built, so the SDK pod did not build as a framework. Check that USE_FRAMEWORKS=${LINKAGE} reached pod install."
    else
      BINARY_TYPE="$(file -b "$SDK_FRAMEWORK_BINARY")"
      if [[ "$BINARY_TYPE" == *"$EXPECTED_TYPE"* ]]; then
        pass "the twilio-voice-react-native pod built as a ${LINKAGE} framework"
      else
        fail "${SDK_FRAMEWORK_BINARY} is not a ${LINKAGE} framework binary (${BINARY_TYPE})."
      fi
    fi
    ;;
esac

# Xcode links a static library or a static framework into the app binary, so
# the app embeds the SDK framework only for dynamic linkage.
if [ "$LINKAGE" = dynamic ]; then
  if [ -d "${APP}/Frameworks/${SDK_FRAMEWORK_NAME}" ]; then
    pass "${APP} embeds ${SDK_FRAMEWORK_NAME}"
  else
    fail "${APP} does not embed ${SDK_FRAMEWORK_NAME}, so the app would crash at launch."
  fi
elif [ -d "${APP}/Frameworks/${SDK_FRAMEWORK_NAME}" ]; then
  fail "${APP} embeds ${SDK_FRAMEWORK_NAME}, so the SDK pod did not link statically."
else
  pass "${APP} does not embed ${SDK_FRAMEWORK_NAME}"
fi

# TwilioVoice ships as a dynamic framework, so the app must embed it. A
# missing embed builds fine and crashes at launch.
if [ -d "${APP}/Frameworks/TwilioVoice.framework" ]; then
  pass "${APP} embeds TwilioVoice.framework"
else
  fail "${APP} does not embed TwilioVoice.framework, so the app would crash at launch."
fi

if [ "$FAILURES" != 0 ]; then
  echo "${FAILURES} check(s) failed."
  exit 1
fi
echo "all checks passed"
