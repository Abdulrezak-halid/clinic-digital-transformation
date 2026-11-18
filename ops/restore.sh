#!/usr/bin/env bash
set -euo pipefail
: "${RESTORE_DATABASE_URL:?isolated restore database required}"
: "${BACKUP_FILE:?encrypted backup file required}"
: "${AGE_IDENTITY:?age identity path required}"
if [[ "$RESTORE_DATABASE_URL" != *"_restore"* ]]; then
  echo 'Restore only into an isolated *_restore database.' >&2
  exit 1
fi
age -d -i "$AGE_IDENTITY" "$BACKUP_FILE" | pg_restore --no-owner --no-privileges --dbname="$RESTORE_DATABASE_URL"
