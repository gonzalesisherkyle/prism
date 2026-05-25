#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
PRODUCTION_ENV="$BACKEND_DIR/.env.production"
SERVER_ENTRYPOINT="$BACKEND_DIR/dist/server.js"

if [[ ! -f "$PRODUCTION_ENV" ]]; then
  echo "Missing $PRODUCTION_ENV. Create it from backend/.env.production.example." >&2
  exit 1
fi

git -C "$PROJECT_DIR" pull origin main

cd "$BACKEND_DIR"
# Build tooling is a dev dependency; include it even when the SSH session exports NODE_ENV=production.
npm ci --include=dev
npm run build

if [[ ! -f "$SERVER_ENTRYPOINT" ]]; then
  echo "Backend build completed without the expected PM2 entrypoint: $SERVER_ENTRYPOINT" >&2
  echo "Files emitted under $BACKEND_DIR/dist:" >&2
  find "$BACKEND_DIR/dist" -maxdepth 3 -type f -print >&2 || true
  exit 1
fi

# The compiled server no longer needs TypeScript or development-only packages at runtime.
npm prune --omit=dev
mkdir -p logs

# Export production values before PM2 reads ecosystem.config.js.
set -a
# shellcheck disable=SC1090
source "$PRODUCTION_ENV"
set +a

required_variables=(
  MONGODB_URI FRONTEND_URL PUBLIC_API_URL GITHUB_CLIENT_ID GITHUB_CLIENT_SECRET
  GITHUB_CALLBACK_URL GITHUB_WEBHOOK_SECRET OPENROUTER_API_KEY JWT_SECRET
)

for variable in "${required_variables[@]}"; do
  if [[ -z "${!variable:-}" ]]; then
    echo "Missing production environment variable: $variable" >&2
    exit 1
  fi
done

cd "$PROJECT_DIR"
# startOrReload starts cleanly on the first deployment and reloads on subsequent ones.
pm2 startOrReload ecosystem.config.js --env production --update-env
pm2 save
