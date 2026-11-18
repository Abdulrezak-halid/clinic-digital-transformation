#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?required}"
: "${BACKUP_RECIPIENT:?age public recipient required}"
: "${BACKUP_DIR:?encrypted backup destination required}"
umask 077
mkdir -p "$BACKUP_DIR"
pg_dump "$DATABASE_URL" --format=custom | age -r "$BACKUP_RECIPIENT" > "$BACKUP_DIR/clinic-$(date -u +%Y%m%dT%H%M%SZ).dump.age"
# Retention is deliberate and separate: review inventory before deleting backups.
