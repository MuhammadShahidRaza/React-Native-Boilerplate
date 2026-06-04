#!/bin/sh
# Run one iOS variant on ONE device (avoids building for every connected iPhone).
# Usage:
#   sh scripts/ios-run-variant.sh sengo
#   IOS_DEVICE_UDID=00008110-... yarn ios:sengo
#   IOS_DEVICE_NAME="iPhone 13 prod" yarn ios:sengo
set -eu

VARIANT="${1:?Usage: ios-run-variant.sh <snlift|sengo|sengoWorkers> [extra run-ios args...]}"
shift

ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
export DEVELOPER_DIR="${DEVELOPER_DIR:-/Applications/Xcode.app/Contents/Developer}"

sh "${ROOT}/scripts/sync-ios-variant-xcode.sh" "${VARIANT}"
export APP_ENV="${VARIANT}"
export APP_VARIANT="${VARIANT}"

cd "${ROOT}"

if [ -n "${IOS_DEVICE_UDID:-}" ]; then
  set -- react-native run-ios --scheme "${VARIANT}" --verbose --udid "${IOS_DEVICE_UDID}" "$@"
elif [ -n "${IOS_DEVICE_NAME:-}" ]; then
  set -- react-native run-ios --scheme "${VARIANT}" --verbose --device "${IOS_DEVICE_NAME}" "$@"
else
  # Online physical devices only (not "Devices Offline")
  DEVICES_FILE="$(mktemp)"
  xcrun xctrace list devices 2>/dev/null | awk '
    /^== Devices ==$/ { on=1; next }
    /^==/ { on=0; next }
    on {
      if (match($0, /\([0-9A-F-]{25}\)$/)) {
        s = substr($0, RSTART + 1, RLENGTH - 2)
        print s
      }
    }
  ' > "${DEVICES_FILE}" || true

  COUNT="$(wc -l < "${DEVICES_FILE}" | tr -d ' ')"
  FIRST="$(head -1 "${DEVICES_FILE}" || true)"
  rm -f "${DEVICES_FILE}"

  if [ "${COUNT}" -gt 1 ]; then
    echo "error: ${COUNT} iPhones online. react-native run-ios would build on ALL of them (hours)." >&2
    xcrun xctrace list devices 2>/dev/null | awk '/^== Devices ==$/,/^== Devices Offline ==$/' | head -20 >&2 || true
    echo "" >&2
    echo "Pick one device:" >&2
    echo "  IOS_DEVICE_UDID=<udid> yarn ios:${VARIANT}" >&2
    echo "  IOS_DEVICE_NAME=\"iPhone 13 prod\" yarn ios:${VARIANT}" >&2
    exit 1
  fi

  if [ "${COUNT}" -eq 1 ] && [ -n "${FIRST}" ]; then
    echo "Using online device: ${FIRST}"
    set -- react-native run-ios --scheme "${VARIANT}" --verbose --udid "${FIRST}" "$@"
  else
    set -- react-native run-ios --scheme "${VARIANT}" --verbose "$@"
  fi
fi

exec "$@"
