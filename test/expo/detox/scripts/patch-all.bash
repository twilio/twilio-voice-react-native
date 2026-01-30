#!/bin/bash

# Please see `test/expo/README.md` for info on why this script exists

bash detox/scripts/verify-checksums.bash
if [[ $? -ne 0 ]]; then
  echo "Checksum validation failed"
  exit 1
fi

if [[ -e android/app/src/androidTest/java/com/example/twiliovoicereactnative/DetoxTest.java ]]; then
  echo "Existing DetoxTest.java file found"
  exit 1
fi

echo "No existing DetoxTest.java file"

if [[ -e android/app/src/main/res/xml/network_security_config.xml ]]; then
  echo "Existing network_security_config file found"
  exit 1
fi

echo "No existing network_security_config.xml file"

mkdir -p android/app/src/androidTest/java/com/example/twiliovoicereactnative/ &&

cp detox/files/DetoxTest.java android/app/src/androidTest/java/com/example/twiliovoicereactnative/ &&

mkdir -p android/app/src/main/res/xml/ &&

cp detox/files/network_security_config.xml android/app/src/main/res/xml/ &&

patch android/build.gradle detox/patches/root-build-gradle.patch &&

patch android/app/build.gradle detox/patches/app-build-gradle.patch &&

patch android/app/src/main/AndroidManifest.xml detox/patches/manifest.patch &&

patch android/gradle.properties detox/patches/gradle-properties.patch
