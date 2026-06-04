#!/bin/sh
# Reset Xcode build state (fixes "dependency graph" / "database is locked" errors).
# Usage: sh scripts/ios-clean-build.sh [pod-install]
set -eu

ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
export DEVELOPER_DIR="${DEVELOPER_DIR:-/Applications/Xcode.app/Contents/Developer}"

echo "Stopping Xcode build services..."
killall -9 Xcode XCBBuildService xcodebuild SWBBuildService 2>/dev/null || true
sleep 2

echo "Clearing DerivedData for snlift..."
find "${HOME}/Library/Developer/Xcode/DerivedData" -maxdepth 1 -name 'snlift-*' -exec rm -rf {} + 2>/dev/null || true

if [ "${1:-}" = "pod-install" ] || [ "${1:-}" = "--pods" ]; then
  echo "Running pod install..."
  cd "${ROOT}/ios"
  bundle exec pod install
fi

echo "iOS build cache cleared."
