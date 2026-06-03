#!/bin/sh
# Run Android debug for a flavor. Sets APP_ENV so Metro (if started by CLI) loads the right .env.* file.
# For an already-running Metro, use the matching start script first: yarn start:sengo
set -e
VARIANT="${1:?Usage: android-run.sh <snlift|sengo|sengoWorkers> [extra run-android args]}"
shift

export APP_ENV="${VARIANT}"

case "${VARIANT}" in
  snlift)
    APP_ID="com.cmolds.snlift"
    MODE="snliftDebug"
    ;;
  sengo)
    APP_ID="com.cmolds.sengo"
    MODE="sengoDebug"
    ;;
  sengoWorkers)
    APP_ID="com.cmolds.sengoworkers"
    MODE="sengoWorkersDebug"
    ;;
  *)
    echo "Unknown variant: ${VARIANT}" >&2
    exit 1
    ;;
esac

exec react-native run-android --mode="${MODE}" --appId="${APP_ID}" "$@"
