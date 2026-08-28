#!/bin/sh
set -eu

python -m uvicorn voice_service.main:app --host 127.0.0.1 --port 8000 &
voice_pid=$!

for attempt in $(seq 1 240); do
  if curl --fail --silent http://127.0.0.1:8000/docs >/dev/null; then
    exec node --env-file-if-exists=.env server/index.js
  fi
  sleep 1
done

echo "Local speech service did not become ready." >&2
kill "$voice_pid" 2>/dev/null || true
exit 1
