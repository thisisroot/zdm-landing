#!/usr/bin/env bash
# Run this ON THE VPS, inside /var/www/zeddm.ir, to pull the latest commit live.
set -euo pipefail
cd "$(dirname "$0")/.."
git pull --ff-only origin main
echo "Deployed $(git rev-parse --short HEAD)"
