#!/bin/sh
# Build for iphoneos (no device wait during compile) then install on a physical iPhone.
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
LOG="${ROOT}/ios/build-device-${VARIANT}.log"

export DEVELOPER_DIR="${DEVELOPER_DIR:-/Applications/Xcode.app/Contents/Developer}"

if [ ! -d "${WS}" ]; then
  echo "error: workspace not found: ${WS}" >&2
  exit 1
fi

if [ "${IOS_SKIP_CLEAN:-}" != "1" ]; then
  sh "${ROOT}/scripts/ios-clean-build.sh"
fi
sh "${ROOT}/scripts/sync-ios-variant-xcode.sh" "${VARIANT}"

if [ -z "${UDID}" ]; then
  UDID="$(xcodebuild -workspace "${WS}" -scheme "${SCHEME}" -showdestinations 2>/dev/null \
    | sed -n 's/.*platform:iOS, arch:arm64, id:\([^,]*\), name:\([^,}]*\)$/\1/p' \
    | head -1)"
fi

if [ -z "${UDID}" ]; then
  echo "error: no ready iOS device. Unlock iPhone, enable Developer Mode, trust this Mac, replug USB." >&2
  exit 1
fi

echo "Building ${VARIANT} (iphoneos, -jobs 1). Log: ${LOG}"
echo "Install target device: ${UDID}"

cd "${IOS}"
# Build generic iphoneos — avoids \"Timed out waiting for destination\" during long compile.
xcodebuild \
  -workspace snlift.xcworkspace \
  -scheme "${SCHEME}" \
  -configuration Debug \
  -sdk iphoneos \
  -allowProvisioningUpdates \
  COMPILER_INDEX_STORE_ENABLE=NO \
  build 2>&1 | tee "${LOG}"

APP="$(xcodebuild -workspace snlift.xcworkspace -scheme "${SCHEME}" -configuration Debug -sdk iphoneos -showBuildSettings 2>/dev/null \
  | sed -n 's/^ *TARGET_BUILD_DIR = \(.*\)/\1/p' | head -1)"
APP="${APP}/snlift.app"

if [ ! -d "${APP}" ] || [ ! -f "${APP}/Info.plist" ]; then
  echo "error: app not found at ${APP}. See ${LOG}" >&2
  exit 1
fi

BUNDLE_ID="$(/usr/libexec/PlistBuddy -c 'Print:CFBundleIdentifier' "${APP}/Info.plist")"

echo "Waiting for device ${UDID} (unlock iPhone if prompted)..."
xcrun devicectl device info --device "${UDID}" >/dev/null 2>&1 \
  || echo "warn: device not responding yet — unlock phone and trust this Mac"

echo "Installing ${BUNDLE_ID} → ${UDID}..."
xcrun devicectl device install app --device "${UDID}" "${APP}"
xcrun devicectl device process launch --device "${UDID}" "${BUNDLE_ID}" 2>/dev/null \
  || echo "Installed ${BUNDLE_ID}. Open the app on the device if launch failed."

echo "Done: ${VARIANT} (${BUNDLE_ID}) on device ${UDID}."
