#!/bin/bash

# Note:
# git diff returns a value > 1 if an error occurred
# git diff returns 0 if there is no diff
# git diff returns 1 if there was a valid diff
# therefore, we want to only exit this script early if the return value was
# greater than 1

git diff --no-index \
  /dev/null \
  android/src/main/java/com/twiliovoicereactnative/ExpoActivityLifecycleListener.kt \
  > scripts/expo/patches/ExpoActivityLifecycleListener.kt.diff
if [[ $? -gt 1 ]]; then
  exit 1
fi

git diff --no-index \
  /dev/null \
  android/src/main/java/com/twiliovoicereactnative/ExpoApplicationLifecycleListener.kt \
  > scripts/expo/patches/ExpoApplicationLifecycleListener.kt.diff
if [[ $? -gt 1 ]]; then
  exit 1
fi

git diff --no-index \
  /dev/null \
  android/src/main/java/com/twiliovoicereactnative/ExpoModule.kt \
  > scripts/expo/patches/ExpoModule.kt.diff
if [[ $? -gt 1 ]]; then
  exit 1
fi

git diff --no-index \
  /dev/null \
  android/src/main/java/com/twiliovoicereactnative/ExpoPackage.kt \
  > scripts/expo/patches/ExpoPackage.kt.diff
if [[ $? -gt 1 ]]; then
  exit 1
fi

git diff --no-index \
  /dev/null \
  expo-module.config.json \
  > scripts/expo/patches/expo-module.config.json.diff
if [[ $? -gt 1 ]]; then
  exit 1
fi

git diff --no-index \
  /dev/null \
  react-native.config.js \
  > scripts/expo/patches/react-native.config.js.diff
if [[ $? -gt 1 ]]; then
  exit 1
fi

git diff \
  -- \
  android/build.gradle \
  > scripts/expo/patches/build.gradle.diff
if [[ $? -gt 1 ]]; then
  exit 1
fi

exit 0
