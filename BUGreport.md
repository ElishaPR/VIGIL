# Vigil 1.0 — Comprehensive Bug Report

> **Scope:** Full static analysis of every source file in Backend/ and Frontend/src/.
> **Date:** 2026-03-30
> **Method:** Code review (no runtime execution).

---

## Summary Table

| # | Severity | Module | Title |
|---|----------|--------|-------|
| B1 | CRITICAL | Scheduler | Push-notification FCM status never committed to DB |
| B2 | CRITICAL | Scheduler | Notification logs are never written anywhere |
| B3 | CRITICAL | Backend - Reminders | update_reminder_service silently sets a past reminder time on DEFAULT-schedule edits |
| B4 | CRITICAL | Frontend - AddReminder | Broken JSX structure — Expiry Date field is outside the space-y-5 container |
| B5 | HIGH | Backend - Auth | logout / logout-all require no authentication |
| B6 | HIGH | Backend - Reminders | AddReminderRequest schema vs. form field mismatch for category |
| B7 | HIGH | Backend - Documents | update_document_service ignores the expiry_date parameter entirely |
| B8 | HIGH | Backend - Email | Reminder notification email contains a broken deep-link (/reminder/:id does not exist) |
| B9 | HIGH | Backend - Reminders | Potential AttributeError in update router when fetching old document |
| B10 | MEDIUM | Backend - Security | Startup crash if ACCESS_TOKEN_EXPIRE_MINUTES env var is missing |
| B11 | MEDIUM | Frontend - Dashboard | Status (Expired/Expiring) based on reminder time, not document expiry date |
| B12 | MEDIUM | Frontend - AddReminder | Custom reminder time fixed at 09:00 with no disclosure to the user |
| B13 | MEDIUM | Frontend - AdminPage | Failed stat counts only the current page items, not all failed logs |
| B14 | MEDIUM | Backend + Frontend | Admin email hardcoded in config and leaked as visible text in the UI |
| B15 | MEDIUM | Backend - Reminders | crud/reminders.create_reminder() commits internally, breaking transaction ownership |
| B16 | MEDIUM | Frontend - VerifyPage | Stale closure / missing dependency in OTP auto-submit useEffect |
| B17 | MEDIUM | Backend - Supabase | get_signed_url uses dict key response["signedURL"] — SDK v2 returns an object |
| B18 | MEDIUM | Backend - Reports | User PDF report includes virtual (empty) document records |
| B19 | LOW | Frontend - App.jsx | Auth state never refreshes after JWT expiry during a session |
| B20 | LOW | Frontend - Dashboard | formatDate() appends T00:00:00 to full ISO timestamps — may produce wrong dates |
| B21 | LOW | Backend - Reminders | Production DEBUG print statements left in router and service files |
| B22 | LOW | Backend - CORS | CORS only allows localhost — no production domain and no env-based override |
| B23 | LOW | Frontend - Profile | change-email/verify sends new_email_address that the backend schema does not accept |
| B24 | LOW | Backend - Models | Stray file random.txt committed inside Backend/app/models/ |

