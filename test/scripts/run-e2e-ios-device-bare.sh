#!/usr/bin/env bash
# Run the Appium suites against the bare React Native app (test/app) on a
# physical iOS device. Build it first with build-e2e-ios-bare.sh, using the
# same IOS_DERIVED_DATA.
#
# This only points run-e2e-ios-device.sh at the bare app and its bundle
# identifier. Appium takes the device from `ios.udid` in the orchestrator's
# secrets.json, so IOS_UDID must match it.
#
# Usage: IOS_UDID=<udid> run-e2e-ios-device-bare.sh [suite,suite,...]
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
export IOS_DERIVED_DATA="${IOS_DERIVED_DATA:-$REPO/test/app/ios/build-device}"
export IOS_APP="${IOS_APP:-$IOS_DERIVED_DATA/Build/Products/Release-iphoneos/TwilioVoiceExampleNewArch.app}"
export IOS_BUNDLE_ID="${IOS_BUNDLE_ID:-com.twilio.TwilioVoiceReactNativeExample}"

exec "$(dirname "${BASH_SOURCE[0]}")/run-e2e-ios-device.sh" "$@"
