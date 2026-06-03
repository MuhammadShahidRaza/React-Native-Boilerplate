#!/bin/sh
# Xcode scheme pre-action: sync bundle id, display name, Firebase, app icon.
# Usage: scripts/sync-ios-variant-xcode.sh sengoWorkers
set -eu

VARIANT="${1:-${APP_ENV:-${APP_VARIANT:-snlift}}}"
ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
IOS_DIR="${ROOT}/ios"

export APP_ENV="${VARIANT}"
export APP_VARIANT="${VARIANT}"

# React Native: NODE_BINARY from ios/.xcode.env(.local)
if [ -f "${IOS_DIR}/.xcode.env.local" ]; then
  # shellcheck disable=SC1090
  . "${IOS_DIR}/.xcode.env.local"
fi
if [ -f "${IOS_DIR}/.xcode.env" ]; then
  # shellcheck disable=SC1090
  . "${IOS_DIR}/.xcode.env"
fi

NODE="${NODE_BINARY:-}"
if [ -z "${NODE}" ] || [ ! -x "${NODE}" ]; then
  NODE="$(command -v node 2>/dev/null || true)"
fi
if [ -z "${NODE}" ] || [ ! -x "${NODE}" ]; then
  for candidate in \
    "${HOME}/.nvm/versions/node/$(ls "${HOME}/.nvm/versions/node" 2>/dev/null | tail -1)/bin/node" \
    /opt/homebrew/bin/node \
    /usr/local/bin/node; do
    if [ -x "${candidate}" ]; then
      NODE="${candidate}"
      break
    fi
  done
fi

if [ -z "${NODE}" ] || [ ! -x "${NODE}" ]; then
  echo "error: node not found. Set NODE_BINARY in ios/.xcode.env.local" >&2
  exit 127
fi

exec "${NODE}" "${ROOT}/scripts/sync-ios-variant.mjs"
