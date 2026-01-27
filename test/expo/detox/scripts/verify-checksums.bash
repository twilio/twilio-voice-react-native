grep "$(sha256sum android/build.gradle)" detox/checksums/root-build-gradle.sum && \
grep "$(sha256sum android/app/build.gradle)" detox/checksums/app-build-gradle.sum && \
grep "$(sha256sum android/app/src/main/AndroidManifest.xml)" detox/checksums/manifest.sum
