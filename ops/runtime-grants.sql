-- Execute as migration owner after the DBA creates clinic_runtime with a secret-managed password.
-- Connect to the application database. Never give this role schema/extension creation rights.
GRANT USAGE ON SCHEMA public TO clinic_runtime;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO clinic_runtime;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO clinic_runtime;
REVOKE ALL ON "_prisma_migrations" FROM clinic_runtime;
REVOKE UPDATE ON "AuditLog", "PackageLedger" FROM clinic_runtime;
GRANT DELETE ON "LoginSession", "Invite", "Idempotency" TO clinic_runtime;
-- Repeat grants explicitly after future migrations; do not grant DDL or DELETE on clinical history.
