#!/bin/sh
# Run one iOS variant on connected device / simulator.
# Usage:
#   sh scripts/ios-run-variant.sh sengo
#   yarn ios:sengo
set -eu

VARIANT="${1:?Usage: ios-run-variant.sh <snlift|sengo|sengoWorkers> [extra run-ios args...]}"
shift

ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
export DEVELOPER_DIR="${DEVELOPER_DIR:-/Applications/Xcode.app/Contents/Developer}"

# Copy the Firebase plist for this variant (bundle ID etc. come from build config)
sh "${ROOT}/scripts/sync-ios-variant-xcode.sh" "${VARIANT}"
export APP_ENV="${VARIANT}"
export APP_VARIANT="${VARIANT}"

cd "${ROOT}"
exec react-native run-ios --scheme "${VARIANT}" --verbose "$@"
