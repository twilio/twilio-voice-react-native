#!/usr/bin/env bash
# Builds the SDK and packs the SDK into a tarball in <destination-dir>.
#
# The tarball skips the pack lifecycle scripts, the same as the
# `npm publish --ignore-scripts` in release.yml, so the tarball has the
# published shape.
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "usage: build-tarball.sh <destination-dir>" >&2
  exit 2
fi
if [ ! -d "$1" ]; then
  echo "::error::$1 is not a directory."
  exit 2
fi

yarn run prepare
npm pack --ignore-scripts --pack-destination "$1"
