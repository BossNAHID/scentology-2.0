# Scentology BD security status

This is an administration foundation, not a production-ready shop. Real customer checkout must stay disabled until the remaining controls are completed and verified.

## Implemented foundation
- Public signup disabled. Owner role assigned only to the designated verified email. No default password or account.
- Managed password authentication, leaked-password checks, current-password requirement. Hashing is managed by Cloud, not custom Argon2id.
- Server-side TOTP enrollment/verification required before private access. No access/refresh tokens returned to browser code.
- Encrypted Secure, httpOnly, SameSite=Strict __Host- cookie; two-hour idle/twelve-hour absolute expiry; revocable database sessions checked per private action.
- Atomic per-account/server-observed-IP attempt reservation: five-attempt/fifteen-minute window. Hosted proxy IP behavior requires verification; unknown-IP buckets fail closed and may affect multiple visitors.
- RLS plus explicit grants on all tables. Private order/session/attempt/audit tables have no browser access. Public catalog hides drafts and deleted products.
- Separate roles checked after verified identity and MFA. Same-origin checks plus framework CSRF middleware. Strict Zod inputs. Append-only audit trigger.

## Pending before launch
- Owner account creation and authenticated end-to-end login/TOTP/session verification. Current policy tests do not prove hosted authentication.
- Twelve-character password policy in Cloud Auth, forced first-login password change, one-time recovery codes, password reset with fifteen-minute token, device/password emails, sessions viewer/revoke-others.
- Product/mood CRUD and all resource permissions, secure upload magic-byte checking and image re-encoding.
- Server-priced transactional checkout/stock, idempotency, duplicate transaction IDs, bot protection, encrypted customer fields and export/delete.
- CSP/nonces, HSTS, nosniff, frame restrictions, referrer/permissions/COOP headers, WAF and monitoring.
- Secret-scanning/vulnerability CI and fully pinned dependencies.
- Restore-tested encrypted daily backups and a retention policy. Cloud backup availability is not verified here.
- Integration tests for real lockout, TOTP failure/replay, IDOR, CSRF, fake uploads and tampered prices.

## Secret rotation
Update SESSION_SECRET in Project Settings > Secrets, revoke active session records and publish. Verify old encrypted cookies are rejected. Never print credentials in diagnostics.

## Backup restore
Not configured/tested. Document Cloud backup/export availability, encrypt exports and define retention, restore to an isolated environment, verify counts/private access, then rehearse. Repository history is not a database backup.

## Pre-launch checklist
- [ ] Owner created through Users, strong password policy set, TOTP and recovery verified.
- [ ] Published HTTPS login, role restrictions, lockouts, expiry, logout and token tampering tested.
- [ ] No plaintext personal data or private credentials in client/logs.
- [ ] Transactional prices/stock and anti-abuse verified before real orders.
- [ ] Headers, alerts and backup restore verified.
