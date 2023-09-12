BASE_DIR=`dirname $0`
pushd "$BASE_DIR" >/dev/null

REACT_NATIVE_SDK_VERSION="$(jq '.version' ../package.json)"
VERSION_HEADER_FILE="../ios/TwilioVoiceReactNativeVersion.h"
echo ${VERSION_HEADER_FILE}

cat <<EOF >"${VERSION_HEADER_FILE}"
/* this file is auto-generated; do not edit! */

#define TWILIO_VOICE_REACT_NATIVE_VERSION   @${REACT_NATIVE_SDK_VERSION}

EOF

popd  >/dev/null
