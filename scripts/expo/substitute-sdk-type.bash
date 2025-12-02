#!/bin/bash

###
# This script finds the regex for ReactNativeVoiceSDK=react-native and replaces
# it with ReactNativeVoiceSDK=react-native-expo
###

if [[ $1 == "expo" ]]; then
  sed \
    -i '' \
    -e 's/^ReactNativeVoiceSDK=react-native.*$/ReactNativeVoiceSDK=react-native-expo/g' \
    constants/constants.src &&
  exit 0
fi

if [[ $1 == "bare" ]]; then
  sed \
    -i '' \
    -e 's/^ReactNativeVoiceSDK=react-native.*$/ReactNativeVoiceSDK=react-native/g' \
    constants/constants.src &&
  exit 0
fi

exit 1
