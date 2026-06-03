#!/bin/sh
# Build and install an iOS variant on a physical device (parallel xcodebuild; reuses DerivedData).
# Usage:
#   scripts/ios-build-device.sh sengo
#   scripts/ios-build-device.sh sengoWorkers [device-udid]
set -eu

VARIANT="${1:?Usage: ios-build-device.sh <sengo|sengoWorkers|snlift> [udid]}"
UDID="${2:-}"

ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
IOS="${ROOT}/ios"
WS="${IOS}/snlift.xcworkspace"
SCHEME="${VARIANT}"

if [ ! -d "${WS}" ]; then
  echo "error: workspace not found: ${WS}" >&2
  exit 1
fi

pkill -9 XCBBuildService 2>/dev/null || true

sh "${ROOT}/scripts/sync-ios-variant-xcode.sh" "${VARIANT}"

if [ -z "${UDID}" ]; then
  UDID="$(xcodebuild -workspace "${WS}" -scheme "${SCHEME}" -showdestinations 2>/dev/null \
    | sed -n 's/.*platform:iOS, arch:arm64, id:\([^,]*\), name:\(.*\).*/\1/p' \
    | head -1)"
fi

if [ -z "${UDID}" ]; then
  echo "error: no connected iOS device found" >&2
  exit 1
fi

echo "Building ${VARIANT} for device ${UDID} (parallel; first full build ~15–25 min)..."

cd "${IOS}"
xcodebuild \
  -workspace snlift.xcworkspace \
  -scheme "${SCHEME}" \
  -configuration Debug \
  -destination "id=${UDID}" \
  build

APP="$(xcodebuild -workspace snlift.xcworkspace -scheme "${SCHEME}" -configuration Debug -showBuildSettings 2>/dev/null \
  | sed -n 's/^ *TARGET_BUILD_DIR = \(.*\)/\1/p' | head -1)"
APP="${APP}/snlift.app"

if [ ! -d "${APP}" ] || [ ! -f "${APP}/Info.plist" ]; then
  echo "error: app not found at ${APP}" >&2
  exit 1
fi

BUNDLE_ID="$(/usr/libexec/PlistBuddy -c 'Print:CFBundleIdentifier' "${APP}/Info.plist")"
echo "Installing ${BUNDLE_ID} → device ${UDID}..."
xcrun devicectl device install app --device "${UDID}" "${APP}"
xcrun devicectl device process launch --device "${UDID}" "${BUNDLE_ID}" 2>/dev/null \
  || echo "Installed ${BUNDLE_ID}. Open the app on the device if launch failed."

echo "Done: ${VARIANT} (${BUNDLE_ID}) on device."
