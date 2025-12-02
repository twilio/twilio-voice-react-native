#!/bin/bash

git apply scripts/expo/patches/ExpoActivityLifecycleListener.kt.diff &&
git apply scripts/expo/patches/ExpoApplicationLifecycleListener.kt.diff &&
git apply scripts/expo/patches/ExpoModule.kt.diff &&
git apply scripts/expo/patches/ExpoPackage.kt.diff &&
git apply scripts/expo/patches/build.gradle.diff &&
git apply scripts/expo/patches/expo-module.config.json.diff &&
git apply scripts/expo/patches/react-native.config.js.diff &&

bash scripts/expo/substitute-sdk-type.bash expo
