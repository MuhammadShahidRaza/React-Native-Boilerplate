# SNLift API — Issues & Gaps (Backend)

| | |
|---|---|
| **Base URL** | `https://demo-cmolds1.com/projects/snlift_be_2026/public/api` |
| **Reference** | Postman: *SNLift - Unified Booking API* (updated collection) |
| **Tested** | 2026-05-25 (`node scripts/test-snlift-api.mjs`) |
| **Mobile** | Normalizers in `src/api/normalizers/snlift.ts` — app keys are **not removed** |

This document lists only **broken endpoints**, **missing APIs**, and **response gaps**. Working endpoints are integrated in the app and are not listed here.

### Mobile integration (Postman collection)

| Area | App module / screen |
|------|---------------------|
| Auth, OTP, profile, device | `api/functions/auth.tsx`, `api/functions/snlift/user.ts` |
| Bookings (ride / food / parcel) | `api/functions/snlift/bookings.ts` → consumer + worker flows |
| Wallet | `api/functions/snlift/wallet.ts` |
| Restaurants, content, ratings | `snlift/restaurants`, `content`, `ratings` |
| Address | `api/functions/app/address.ts` (list unwrap + create alias) |
| Legacy lists | `api/functions/snlift/legacy.ts` (falls back to `/bookings`) |
| App info | `api/functions/snlift/info.ts` |

Smoke test: `node scripts/test-snlift-api.mjs`

---

## 1. Failing endpoints

### 1.1 `POST /forgot-password`

| | |
|---|---|
| **HTTP** | `500` |
| **Body** | `{ "email": "user@example.com" }` |
| **Message** | `Email service is not configured correctly. Please contact support.` |

**Fix:** Configure SMTP / mail transport on the server. Until fixed, password reset from the app will not send OTP emails.

---

### 1.2 `POST /verify-code` (invalid OTP)

| | |
|---|---|
| **HTTP** | `404` (error wrapper) |
| **Body** | `{ "email": "...", "otp_code": "9999" }` |

Route works; invalid OTP returns business error. Provide a **test OTP** for QA or document the bypass for staging.

---

### 1.3 `POST /user/device`

| | |
|---|---|
| **HTTP** | `500` |
| **Body** | `{ udid, device_type, device_brand, device_os, app_version, device_token }` |

**Error:** `Cannot use object of type stdClass as array` in `User.php` line 133 (`userDevice`).

Mobile registers device after login (Postman parity). Failures are caught silently so login is not blocked.

---

### 1.4 Driver / courier wallet (role mismatch on demo account)

| | |
|---|---|
| **Endpoints** | `GET /driver/wallet/summary`, `GET /driver/wallet/transactions`, `GET /courier/wallet/*` |
| **HTTP** | `403` when logging in with `user_type: "driver"` but token role remains `user` |

**Message example:** `Access denied… allowed_roles: ["driver"], your_role: "user"`

**Fix:** Ensure `POST /login` with `user_type: driver|courier` returns a user whose `user_role` / `user_type` matches, or provide dedicated driver/courier test credentials for mobile QA.

---

## 2. Missing APIs (app needs these — not in Postman)

| Feature | What mobile needs | Status |
|---------|-------------------|--------|
| **Restaurant menu** | `GET /restaurants/{id}/menu` or `menu_items` list for cart | ❌ Not in collection; food booking uses hardcoded `menu_item_id` in mock flow |
| **Parcel booking** | `POST /bookings` body for `booking_type: "parcel"` | ❌ Not documented in Postman (only ride + food samples) |
| **Booking tracking** | Real-time provider location on active booking | ❌ No WebSocket/polling endpoint documented |
| **Promo validation** | Validate `promo_code` before checkout | ❌ Not documented |

---

## 3. Response shape notes (handled in app — confirm with backend)

These are **not bugs** if the backend keeps the documented shape; the app normalizes aliases.

| Endpoint | Backend shape | App handling |
|----------|---------------|--------------|
| `GET /user/wallet-summary`, `GET /wallet` | `{ summary: { wallet_balance, today, week, month, … } }` | `unwrapWalletPayload()` |
| `GET /restaurants` | Paginated `{ restaurants: [...] }` | `extractApiList(['restaurants'])` |
| `GET /bookings` | Paginated `{ bookings: [...] }` | `extractApiList(['bookings'])` |
| `GET /notification` | `{ activities: [...] }` or paginated `data` | `normalizeActivity()` |
| Wallet transactions | `title` / `name` / `label` for row title | `normalizeWalletTransaction()` |

---

## 4. Legacy / compatibility routes (Postman only — optional for mobile)

| Endpoint | Notes |
|----------|--------|
| `GET /userbooking/list` | Legacy; app uses `GET /bookings` |
| `GET /dentorbooking/list` | Legacy marketplace flow |
| `GET /conversation/list`, `GET /message/list` | Chat; app may use Firebase paths |
| `POST /review/create` | Alias of `POST /ratings/create` — app uses `ratings/create` |

---

## 5. Implemented in mobile (Postman parity)

| Area | Routes |
|------|--------|
| Auth | `existing-user-check`, `register`, `login`, `social-login`, `verify-otp`, `resend-otp`, `verify-code`, `reset-password`, `forgot-password` |
| Profile | `user/user`, `user/update`, `user/onboarding`, `user/logout`, `user/delete-account`, `user/device` |
| Bookings | `bookings` CRUD, accept, status, cancel, delete |
| Food | `restaurants`, `bookings` (food) |
| Wallet | `user/wallet-summary`, `driver|courier/wallet/*`, `wallet` |
| Content | `content`, `content/{slug}` |
| Other | `notification`, `address/*`, `ratings/create`, `contact/create` |

---

## 6. QA checklist for backend

- [ ] Fix mailer for `POST /forgot-password`
- [ ] Fix `POST /resend-otp` — `validatePhone` method missing (HTTP 500)
- [ ] Delete orphaned `courier@mailinator.com` / `driver@mailinator.com` and re-run `node scripts/seed-snlift-test-users.mjs` (see [SNLIFT_TEST_USERS.md](./SNLIFT_TEST_USERS.md))
- [ ] Add restaurant menu endpoint for food ordering
- [ ] Document parcel booking payload
- [x] Signup OTP — **phone only** on `resend-otp` / `verify-otp` (mobile updated; email not sent on those routes)
