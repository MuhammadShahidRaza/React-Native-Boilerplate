# SNLift — QA test accounts

| Role | Email | Password | Phone (login) | `user_type` on login |
|------|-------|----------|---------------|----------------------|
| Consumer | `user@mailinator.com` | `Passward123!` | `0987654321` | `user` |
| Courier | `courier@mailinator.com` | `Passward123!` | `03001111002` | `courier` |
| Driver | `driver@mailinator.com` | `Passward123!` | `03001111003` | `driver` |

**Seed script:** `node scripts/seed-snlift-test-users.mjs`  
Registers missing accounts, attempts staging OTP `9999`, and checks wallet endpoints.

---

## OTP (signup / resend)

- Backend: **`POST /resend-otp`** and **`POST /verify-otp`** use **`phone` only** (no email).
- Mobile app: signup verification sends only `phone` + `otp_code` (+ `user_type` on verify).
- Forgot-password flow still uses **`POST /verify-code`** with email (unchanged).

---

## Current demo server status (2026-05-25)

| Account | Status |
|---------|--------|
| `user@mailinator.com` | **Ready** — login with phone `0987654321`, password `Passward123!`, role `user`. |
| `courier@mailinator.com` | Email exists in DB but **login not working** — backend should **delete** the row, then re-run seed script. Target phone: `03001111002`. |
| `driver@mailinator.com` | Same as courier — **delete** then re-run seed. Target phone: `03001111003`. |

### Wallet API

- Consumer: `GET /user/wallet-summary`
- Courier: `GET /courier/wallet/summary` (token must have `user_role: courier`)
- Driver: `GET /driver/wallet/summary` (token must have `user_role: driver`)

Logging in with `user_type: courier` but the same phone as the consumer account returns the **user** profile and **403** on courier wallet — each role needs its **own phone number**.

---

## Backend fixes needed for full QA

1. **`POST /resend-otp`** — `validatePhone` method missing (HTTP 500).
2. Delete orphaned `courier@mailinator.com` / `driver@mailinator.com` records so seed can recreate them with correct `user_role`.
