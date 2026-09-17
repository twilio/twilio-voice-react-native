#!/usr/bin/env bash
# Resolve DEVELOPER_DIR to a full Xcode, for sourcing by the iOS runners.
#
# `xcode-select -p` is not enough on its own: it commonly points at
# CommandLineTools, which has no `xctrace` and no simulator support, so the
# runners fail partway through with "unable to find utility" rather than at the
# point the requirement is missing.
#
# Order: an explicit DEVELOPER_DIR, then the selected developer directory when
# it is a full Xcode, then the newest /Applications/Xcode*.app.

resolve_developer_dir() {
  if [ -n "${DEVELOPER_DIR:-}" ]; then
    _xcode_require "$DEVELOPER_DIR" "DEVELOPER_DIR"
    return
  fi

  local selected
  selected="$(xcode-select -p 2>/dev/null || true)"
  if [ -n "$selected" ] && [ -x "$selected/usr/bin/xctrace" ]; then
    export DEVELOPER_DIR="$selected"
    return
  fi

  local candidate
  candidate="$(/bin/ls -d /Applications/Xcode*.app 2>/dev/null | sort -V | tail -1 || true)"
  if [ -n "$candidate" ] && [ -x "$candidate/Contents/Developer/usr/bin/xctrace" ]; then
    export DEVELOPER_DIR="$candidate/Contents/Developer"
    echo "    using $DEVELOPER_DIR (xcode-select points at ${selected:-nothing})" >&2
    return
  fi

  echo "no full Xcode found. Install Xcode, or set DEVELOPER_DIR to its" >&2
  echo "Contents/Developer directory. xcode-select points at ${selected:-nothing}," >&2
  echo "which has no xctrace." >&2
  exit 2
}

_xcode_require() {
  local dir="$1" source="$2"
  [ -x "$dir/usr/bin/xctrace" ] || {
    echo "$source=$dir has no usr/bin/xctrace; it is not a full Xcode" >&2
    exit 2
  }
  export DEVELOPER_DIR="$dir"
}
