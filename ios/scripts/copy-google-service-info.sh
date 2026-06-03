#!/bin/bash
# Copies flavor-specific GoogleService-Info.plist before Xcode bundles resources.
# Place files in: ios/firebase/<flavor>/GoogleService-Info.plist
set -euo pipefail

VARIANT="${APP_VARIANT:-${APP_ENV:-}}"

if [ -z "$VARIANT" ]; then
  case "${PRODUCT_BUNDLE_IDENTIFIER:-}" in
    com.cmolds.sengo) VARIANT="sengo" ;;
    com.cmolds.sengoworkers) VARIANT="sengoWorkers" ;;
    *) VARIANT="snlift" ;;
  esac
fi

SRC="${PROJECT_DIR}/firebase/${VARIANT}/GoogleService-Info.plist"
DEST="${PROJECT_DIR}/GoogleService-Info.plist"

if [ ! -f "$SRC" ]; then
  echo "error: Missing ${SRC}" >&2
  echo "Add GoogleService-Info.plist from Firebase Console for flavor: ${VARIANT}" >&2
  exit 1
fi

cp "$SRC" "$DEST"
echo "Firebase: copied ${VARIANT} GoogleService-Info.plist"
