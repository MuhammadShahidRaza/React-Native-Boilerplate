# SNLift API — Backend Fix List (Mobile Integration)

> **Updated backend (2026-05-25):** Many items below are fixed on demo (`restaurants`, `address`, user wallet keys).  
> For the **current** failing/missing list only, see **[SNLIFT_API_ISSUES.md](./SNLIFT_API_ISSUES.md)**.

| | |
|---|---|
| **Base URL** | `https://demo-cmolds1.com/projects/snlift_be_2026/public/api` |
| **Auth** | `Authorization: Bearer {token}` |
| **Response wrapper** | `{ "response": { "code", "messages", "data" } }` |
| **Test date** | 2026-05-25 |
| **Reference** | Postman: *SNLift - Unified Booking API* |

---

## 1. APIs that are failing (must fix)

### 1.1 `GET /restaurants`

| | |
|---|---|
| **HTTP** | `500` |
| **When** | Authenticated user (Bearer token) |
| **Error** | `SQLSTATE[42S22]: Column not found: 1054 Unknown column 'is_active' in 'WHERE'` |
| **Query** | `select count(*) from restaurants where is_active = 1 and is_approved = 1 and deleted_at is null` |

**Required fix:** Add column `is_active` on `restaurants` table **or** remove `is_active` from the query.

---

### 1.2 `POST /forgot-password`

| | |
|---|---|
| **HTTP** | `500` |
| **Body** | `{ "email": "user@example.com" }` |
| **Error** | `Connection could not be established with host "127.0.0.2:1025"` (Symfony Mailer / SMTP) |

**Required fix:** Configure production mail transport (not local `127.0.0.2:1025`). OTP/email must be sent before user can reset password.

---

### 1.3 `POST /verify-code` (wrong OTP)

| | |
|---|---|
| **HTTP** | `404` (business error in body) |
| **Body** | `{ "email": "...", "otp_code": "9999" }` |
| **Response** | `{ "error": { "code": 404, "messages": ["Invalid OTP code"] } }` |

**Note:** Route exists. Confirm valid test OTP for QA. If signup uses a different endpoint, document it (see §3.1).

---

### 1.4 `GET /address` (and related)

| | |
|---|---|
| **HTTP** | `404` |
| **Message** | `The route api/address could not be found.` |

**Mobile still calls:** `GET/POST address`, `address/create`, `address/{id}` (update/delete).

**Required fix:** Implement address APIs **or** confirm deprecation and replacement endpoint.

---

## 2. Missing response fields (mobile reads these keys — please add or alias)

Mobile **will not remove** these keys. Return them in JSON (or document the canonical name if different).

---

### 2.1 User object — `POST /login`, `GET /user/user`, `PATCH /user/update`

Returned today on login (example): `id`, `full_name`, `email`, `phone`, `user_type`, `user_role`, `total_cfa_balance`, `total_earnings`, `is_email_verified`, `token`, …

| Mobile expects | API sends today | Action |
|----------------|-----------------|--------|
| `wallet_balance` | ❌ (only `total_cfa_balance`) | Add `wallet_balance` **or** alias `total_cfa_balance` → `wallet_balance` |
| `balance` | ❌ | Same numeric value as wallet (optional alias) |
| `email_verified_at` | ❌ (`is_email_verified` is a datetime **string**, wrong key name) | Add `email_verified_at` (ISO 8601) **or** stop using `is_email_verified` as datetime |
| `is_onboarded` | ❌ | Required for driver/courier gate (`0` / `1`) |
| `is_admin_verified` | ❌ | Required for worker approval gate |
| `is_approved` | ❌ (only `status`) | Add `is_approved` or document mapping: `status` → approved? |
| `notification_unread_count` | ❌ | Add integer for notification badge |
| `notification_count` | ❌ | Alias acceptable |
| `country_code` | ❌ | Needed if login is phone-based with country picker |
| `calling_code` | ❌ | Same |
| `phone_number` | Sometimes only `phone` | Return both or standardize on `phone_number` |
| `customer_stripe_id` | ❌ | Needed if card payments stay in app |
| `provider_account` | ❌ | Needed if Stripe Connect stays (nested object) |

---

### 2.2 Worker profile / documents — onboarding upload

Mobile checks **nested** `user.details.*`. API returns **flat** fields on user root.

| Mobile key (`user.details`) | API field today | Action |
|----------------------------|-----------------|--------|
| `driving_license_front` | `driver_license_front` (root) | Move under `details` **or** duplicate in `details` |
| `driving_license_back` | `driver_license_back` (root) | Same |
| `business_license_front` (MOT) | `mot_certificate` (root) | Rename/map to `business_license_front` in `details` |
| `vehicle_brand` | `vehicle_brand` (root) | OK on root; also expose in `details` if nested is canonical |
| `vehicle_model` | `vehicle_model` | Same |
| `vehicle_license_plate` | `vehicle_license_plate` | Same |
| `vehicle_year` | ❌ | Add |
| `vehicle_color` | `vehicle_color` | Same |
| `vehicle_type` | `vehicle_type` | Same |

**Also missing route:** `PATCH user/onboarding` (mobile calls `user/onboarding` for complete profile) — not in Postman collection; returns unknown until implemented.

---

### 2.3 `GET /driver/wallet/summary` & `GET /courier/wallet/summary`

Tested with **user** token → `403` (correct). With **driver/courier** token, confirm response includes:

| Mobile expects | Action |
|----------------|--------|
| `wallet_balance` | Return numeric/string balance |
| `total_earnings` | Confirm always present |
| `today_earnings` | Missing name — add (app also accepts `today`) |
| `week_earnings` | Add (`week`) |
| `month_earnings` | Add (`month`) |
| `total_cfa_balance` | OK if same as wallet |

**Transactions** `GET .../wallet/transactions` — each item should include:

| Mobile expects | Action |
|----------------|--------|
| `id` | Required |
| `name` or `title` | Commission label |
| `type` | e.g. `ride` / `food` / `parcel` |
| `amount` | Formatted or numeric (e.g. `-CFA 10.19`) |
| `created_at` | Optional |

---

### 2.4 `GET /bookings` & `GET /bookings/{id}`

| Mobile expects in each `booking` | API today | Action |
|----------------------------------|-----------|--------|
| `provider.full_name` | Often `null` until accepted | Populate after match |
| `provider.profile_image` | ❌ | URL string |
| `provider.vehicle_model` | Partial on user, not on `provider` embed | Include on `provider` |
| `provider.vehicle_license_plate` | ❌ | Include |
| `provider.vehicle_color` | ❌ | Include |
| `provider.vehicle_type` | ❌ | Include |
| `provider.phone` | ❌ | For call driver/courier |
| `restaurant` (food orders) | ❌ | Embed `{ id, name, image/logo }` |
| `items[].name` | ❌ (only `menu_item_id`, `quantity`) | Expand items with menu name, price, image |
| `items[].price` | ❌ | Add |
| `phase` (tracking UI) | ❌ (only `status`) | Add `phase` **or** publish status → phase mapping table |
| `estimated_fare` | Uses `total_amount` / `estimated_amount` | OK if always set after create |

**Worker list:** `GET /bookings?scope=available` with **driver/courier** token must return non-empty `bookings[]` when jobs exist (tested with user token → empty array).

---

### 2.5 `GET /restaurants` (after DB fix)

When endpoint works, each restaurant object should include:

| Field | Type | Notes |
|-------|------|--------|
| `id` | number | |
| `name` | string | |
| `cuisine` | string | Or `description` |
| `tags` | string[] | Categories: Burgers, Pizza, etc. |
| `delivery_time` | string | e.g. `"15-25 min"` |
| `delivery_fee` | number/string | |
| `is_featured` | 0/1 or boolean | |
| `image` or `logo` | string URL | Full URL, not null for list UI |

---

### 2.6 `GET /notification`

| Mobile expects | API today | Action |
|----------------|-----------|--------|
| Array of items with `title`, `body`, `read` / `is_read` | Paginated key `activities` (can be `[]`) | Confirm item shape; add `title`, `body`, `read`, `created_at` per activity |
| Unread count on user | See §2.1 | `notification_unread_count` on user |

---

## 3. Routes mobile calls but not in Postman / not on server

| Method | Route | HTTP on demo | Mobile usage |
|--------|-------|--------------|--------------|
| POST | `verify-otp` | Not in Postman | Email verification **after signup** |
| POST | `resend-otp` | Unknown | Resend verification code |
| POST | `social-login` | Not in Postman | Google / Apple sign-in |
| PATCH | `user/onboarding` | Not in Postman | Worker profile + vehicle + documents |
| GET | `address` | **404** | Saved addresses list |
| POST | `address/create` | **404** | Create address |
| PATCH | `address/{id}` | **404** | Update address |
| DELETE | `address/{id}` | **404** | Delete address |
| * | `userbooking/*` | Not in unified API | Legacy consumer bookings / bids |
| * | `dentorbooking/*` | Not in unified API | Legacy worker bids |
| GET | `wallet` | Not in Postman | Old wallet (replaced by driver/courier wallet?) |
| POST | `wallet/stripe-connect/link` | Not in Postman | Stripe onboarding |
| * | `conversation/*`, `message/*` | Not in Postman | In-app chat |
| POST | `review/create` | Not in Postman | Postman has `ratings/create` only |

**Decision needed:** Implement these routes **or** confirm mobile should migrate 100% to unified `bookings` + `ratings/create` only.

---

## 4. Auth / registration flow gaps

| Step | Postman endpoint | Issue |
|------|------------------|--------|
| Signup → verify email | `verify-otp` (mobile) vs `verify-code` (Postman) | Two different names; signup flow endpoint not documented in Postman |
| Forgot password | `forgot-password` → `verify-code` → `reset-password` | Step 1 broken (mailer); document OTP length and test code for staging |
| Register body | `register` (form-data: `full_name`, `email`, `password`, `phone`, `user_type`) | Confirm `user_type` values: `user`, `driver`, `courier` |

---

## 5. Priority order (suggested)

| P | Item |
|---|------|
| P0 | Fix `GET /restaurants` SQL (`is_active`) |
| P0 | Fix `POST /forgot-password` mailer |
| P1 | Add missing **user** fields on login/profile (§2.1) |
| P1 | Implement or deprecate **address** APIs (§1.4, §3) |
| P1 | Document/implement **signup verify** endpoint (`verify-otp` vs `verify-code`) |
| P2 | Worker `details` vs flat license fields (§2.2) |
| P2 | Booking embed: `provider`, `restaurant`, `items` (§2.4) |
| P2 | Wallet summary period fields (§2.3) |
| P3 | Notification item shape + unread count (§2.6) |

---

## 6. QA credentials used for testing

| Field | Value |
|-------|--------|
| Phone | `0987654321` |
| Password | `Qwerty@123` |
| `user_type` | `user` |

Re-test script (optional): `node scripts/test-snlift-api.mjs`

---

*This document lists only blockers and missing data for backend. Working endpoints are omitted intentionally.*
