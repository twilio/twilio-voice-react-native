#!/bin/bash

git apply expo-patches/ExpoActivityLifecycleListener.kt.diff &&
git apply expo-patches/ExpoApplicationLifecycleListener.kt.diff &&
git apply expo-patches/ExpoModule.kt.diff &&
git apply expo-patches/ExpoPackage.kt.diff &&
git apply expo-patches/build.gradle.diff &&
git apply expo-patches/expo-module.config.json.diff &&
git apply expo-patches/react-native.config.js.diff
