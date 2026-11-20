#!/usr/bin/env bash
# setup-cloud-environment.sh — Aikido Safe Chain bootstrap for Codespaces, Cursor Cloud Agents,
# Claude Code on the web, and Codex cloud.
#
# Fail closed: never install dependencies unless Safe Chain shims are on PATH.
# Copied into the target repo as scripts/setup-cloud-environment.sh.

set -euo pipefail

# Safe Chain 1.5.20 adds support for pnpm 12 (upstream PR 590).
# Release 1.5.23 fixes the gzip list cache.
# Release 1.5.24 skips the proxy for `pnpm publish`.
# An older release cannot install packages with the pnpm 12 pin in package.json.
# The pnpm 12 client ignores NODE_EXTRA_CA_CERTS, so each tarball fetch fails
# (upstream issue 575).
# Release 1.5.29 is the newest release that is at least 7 days old.
SAFE_CHAIN_VERSION="1.5.29"
SAFE_CHAIN_INSTALLER_SHA256="e9bfa05430bca0efcf26e5a0f06d09b9da8cc21de2e0ffab03f512dde649ebbe"
SAFE_CHAIN_INSTALLER_URL="https://github.com/AikidoSec/safe-chain/releases/download/${SAFE_CHAIN_VERSION}/install-safe-chain.sh"
SAFE_CHAIN_SHIMS="${HOME}/.safe-chain/shims"
SAFE_CHAIN_BIN="${HOME}/.safe-chain/bin"

persist_shim_path() {
  local rc="$1"
  local line="export PATH=\"${SAFE_CHAIN_SHIMS}:${SAFE_CHAIN_BIN}:\$PATH\""
  if [[ -f "$rc" ]] && grep -Fqx -- "$line" "$rc"; then
    return 0
  fi
  mkdir -p "$(dirname "$rc")"
  printf '\n# Aikido Safe Chain shims\n%s\n' "$line" >> "$rc"
}

# Claude Code starts each Bash command from a shell snapshot taken at launch, not the rc files,
# and runs CLAUDE_ENV_FILE before every command instead. A failed SessionStart hook does not stop
# the session, so the shims go on its PATH before anything here can fail, holding stubs that
# refuse to run until Safe Chain's setup-ci replaces them.
if [[ -n "${CLAUDE_ENV_FILE:-}" ]]; then
  mkdir -p "$SAFE_CHAIN_SHIMS"
  for cmd in npm npx pnpm pnpx; do
    if [[ ! -e "${SAFE_CHAIN_SHIMS}/${cmd}" ]]; then
      printf '#!/bin/sh\necho "error: Safe Chain is not set up, so %s is blocked; run bash ./scripts/setup-cloud-environment.sh" >&2\nexit 1\n' \
        "$cmd" > "${SAFE_CHAIN_SHIMS}/${cmd}"
      chmod +x "${SAFE_CHAIN_SHIMS}/${cmd}"
    fi
  done
  persist_shim_path "$CLAUDE_ENV_FILE"
fi

if git_root=$(git rev-parse --show-toplevel 2>/dev/null); then
  cd "$git_root"
fi

if [[ ! -f pnpm-lock.yaml ]]; then
  echo "error: pnpm-lock.yaml is required; refusing to install without a frozen lockfile" >&2
  exit 1
fi

if ! command -v pnpm >/dev/null \
  && [[ -f package.json ]] \
  && grep -q '"packageManager"' package.json \
  && command -v corepack >/dev/null; then
  mkdir -p "$SAFE_CHAIN_BIN"
  corepack enable --install-directory "$SAFE_CHAIN_BIN" pnpm
  export PATH="${SAFE_CHAIN_BIN}:${PATH}"
fi

if ! command -v pnpm >/dev/null; then
  echo "error: pnpm is required on PATH before Safe Chain can wrap it" >&2
  exit 1
fi

installer=$(mktemp)
trap 'rm -f "$installer"' EXIT

curl -fsSL "$SAFE_CHAIN_INSTALLER_URL" -o "$installer"
echo "${SAFE_CHAIN_INSTALLER_SHA256}  ${installer}" | sha256sum -c -

# SAFE_CHAIN_VERSION is deprecated. The installer warns when the variable is set,
# and then it selects the legacy linux build. The version stays in the installer URL.
# Remove the variable from the installer environment only.
# Run the installer outside the repository so NVM does not read .nvmrc.
(
  cd /
  env -u SAFE_CHAIN_VERSION sh "$installer" --ci
)

export PATH="${SAFE_CHAIN_SHIMS}:${SAFE_CHAIN_BIN}:${PATH}"

persist_shim_path "${HOME}/.profile"
persist_shim_path "${HOME}/.bashrc"
persist_shim_path "${HOME}/.zshrc"

if [[ -n "${GITHUB_PATH:-}" ]]; then
  printf '%s\n' "$SAFE_CHAIN_SHIMS" >> "$GITHUB_PATH"
  printf '%s\n' "$SAFE_CHAIN_BIN" >> "$GITHUB_PATH"
fi

# Require the Safe Chain pnpm shim on PATH. A package.json script or a
# node_modules/.bin entry named safe-chain-verify must not satisfy this gate.
SAFE_CHAIN_PNPM="${SAFE_CHAIN_SHIMS}/pnpm"
if [[ ! -x "$SAFE_CHAIN_PNPM" ]]; then
  echo "error: Safe Chain pnpm shim missing at ${SAFE_CHAIN_PNPM}; refusing to install" >&2
  exit 1
fi

resolved_pnpm="$(command -v pnpm || true)"
if [[ "$resolved_pnpm" != "$SAFE_CHAIN_PNPM" ]]; then
  echo "error: pnpm resolves to '${resolved_pnpm}', not the Safe Chain shim; refusing to install" >&2
  exit 1
fi

# Run the Safe Chain self-test. The test sends a request through the proxy and
# checks the shim. Safe Chain 1.5.20 and later support pnpm 12.
pnpm safe-chain-verify

pnpm install --frozen-lockfile
