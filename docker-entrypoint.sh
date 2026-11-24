#!/bin/sh
set -e

cat <<EOF > /usr/share/nginx/html/env-config.js
window.__ENV__ = {
  API_URL: "${API_URL:-}",
  APP_ENV: "${APP_ENV:-development}",
  APP_VERSION: "${APP_VERSION:-1.0.0}"
};
EOF

exec nginx -g "daemon off;"
