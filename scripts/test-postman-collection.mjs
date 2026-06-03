#!/usr/bin/env node
/**
 * Smoke-test all routes from SNLift Postman collection (updated).
 * Run: node scripts/test-postman-collection.mjs
 */
const BASE =
  process.env.API_BASE_URL?.replace(/\/$/, '') ||
  'https://demo-cmolds1.com/projects/snlift_be_2026/public/api';

const deviceBody = {
  udid: 'postman-test',
  device_type: 'ios',
  device_brand: 'Apple',
  device_os: 'ios',
  app_version: '1.0.4',
  device_token: 'test-token',
};

const LOGIN_CANDIDATES = [
  { phone: '0987654321', password: 'Passward123!', user_type: 'user' },
  { phone: '+923242445623', password: 'Passward123!', user_type: 'user' },
  { phone: '+9230012345677', password: 'Qwerty@123', user_type: 'user' },
];

const results = [];

function record(name, status, ok, note = '', extras = {}) {
  results.push({ name, status, ok, note, ...extras });
  const mark = ok ? 'OK' : 'FAIL';
  console.log(`${mark}  ${name}  HTTP ${status}${note ? ` — ${note}` : ''}`);
}

async function req(method, path, { body, token, formData } = {}) {
  const headers = { Accept: 'application/json' };
  if (body && !formData) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: formData ? formData : body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 300) };
  }
  return { status: res.status, json };
}

function msg(json) {
  const m = json?.error?.messages?.[0] || json?.response?.messages?.[0];
  return typeof m === 'string' ? m : JSON.stringify(m)?.slice(0, 80);
}

function dataKeys(json) {
  const d = json?.response?.data;
  if (!d || typeof d !== 'object') return [];
  if (Array.isArray(d)) return d[0] ? Object.keys(d[0]) : [];
  return Object.keys(d);
}

async function login() {
  for (const cred of LOGIN_CANDIDATES) {
    const r = await req('POST', '/login', { body: { ...cred, ...deviceBody } });
    const token = r.json?.response?.data?.token;
    if (r.status === 200 && token) return { token, user: r.json.response.data, cred };
  }
  return null;
}

function checkKeys(name, keys, expected, optional = []) {
  const missing = expected.filter(k => !keys.includes(k));
  const present = expected.filter(k => keys.includes(k));
  record(
    `${name} keys`,
    200,
    missing.length === 0,
    missing.length ? `missing: ${missing.join(', ')}` : `ok (${present.length})`,
    { missingKeys: missing, presentKeys: present, optional },
  );
}

(async () => {
  console.log(`Base: ${BASE}\n`);

  let r = await req('GET', '/info');
  record('GET /info', r.status, r.status === 200, msg(r.json));

  r = await req('POST', '/existing-user-check', { body: { email: 'probe@mailinator.com' } });
  record('POST /existing-user-check', r.status, r.status === 200);

  const auth = await login();
  if (!auth) {
    record('POST /login', 0, false, 'no working test user — seed users first');
    console.log('\n--- Stopping: need token for authenticated routes ---');
    process.exit(1);
  }
  const { token, user } = auth;
  record('POST /login', 200, true, `user ${user?.email || user?.phone}`);

  checkKeys('Login user', dataKeys({ response: { data: user } }), [
    'id',
    'token',
    'user_type',
    'wallet_balance',
    'email_verified_at',
  ]);

  r = await req('GET', '/home', { token });
  const home = r.json?.response?.data;
  const homeKeys = home && typeof home === 'object' ? Object.keys(home) : [];
  record('GET /home', r.status, r.status === 200, homeKeys.length ? `keys: ${homeKeys.join(', ')}` : msg(r.json));
  if (r.status === 200 && home) {
    const banners = home.banners ?? home.banner ?? home.home_banners;
    const promos = home.promo_codes ?? home.promoCodes ?? home.promos ?? home.promotions;
    record(
      'GET /home banners',
      r.status,
      Array.isArray(banners) ? banners.length > 0 : !!banners,
      Array.isArray(banners) ? `${banners.length} item(s)` : banners ? 'object' : 'missing banners',
    );
    record(
      'GET /home promo_codes',
      r.status,
      Array.isArray(promos) ? promos.length > 0 : !!promos,
      Array.isArray(promos) ? `${promos.length} item(s)` : promos ? 'object' : 'missing promo_codes',
    );
    if (Array.isArray(banners) && banners[0]) {
      const bk = Object.keys(banners[0]);
      checkKeys('home.banner[0]', bk, ['id', 'title'], ['image', 'media', 'banner', 'subtitle', 'code']);
    }
    if (Array.isArray(promos) && promos[0]) {
      const pk = Object.keys(promos[0]);
      checkKeys('home.promo[0]', pk, ['code'], ['title', 'description', 'discount', 'valid_until']);
    }
  }

  r = await req('GET', '/content', { token });
  record('GET /content', r.status, r.status === 200);

  r = await req('GET', '/content/about-us', { token });
  record('GET /content/about-us', r.status, r.status === 200);

  r = await req('GET', '/user/user', { token });
  record('GET /user/user', r.status, r.status === 200);

  r = await req('GET', '/user/wallet-summary', { token });
  const summary = r.json?.response?.data?.summary ?? r.json?.response?.data;
  record(
    'GET /user/wallet-summary',
    r.status,
    r.status === 200 && summary?.wallet_balance !== undefined,
    summary ? '' : 'no wallet_balance in summary',
  );

  r = await req('GET', '/wallet', { token });
  record('GET /wallet (compat)', r.status, r.status === 200);

  r = await req('POST', '/user/device', { token, body: deviceBody });
  record('POST /user/device', r.status, r.status === 200 || r.status === 201, msg(r.json));

  r = await req('GET', '/notification', { token });
  record('GET /notification', r.status, r.status === 200);

  r = await req('GET', '/bookings', { token });
  record('GET /bookings', r.status, r.status === 200);

  r = await req('GET', '/bookings?scope=available', { token });
  record('GET /bookings?scope=available', r.status, r.status === 200);

  r = await req('POST', '/bookings', {
    token,
    body: {
      booking_type: 'ride',
      ride_category: 'standard',
      pickup_address: 'A',
      dropoff_address: 'B',
      pickup_latitude: 24.86,
      pickup_longitude: 67.0,
      dropoff_latitude: 24.88,
      dropoff_longitude: 67.1,
      distance_km: 5,
      promo_code: '',
    },
  });
  const bookingId = r.json?.response?.data?.id;
  record(
    'POST /bookings (ride)',
    r.status,
    r.status === 200 || r.status === 201,
    bookingId ? `id=${bookingId}` : msg(r.json),
  );

  if (bookingId) {
    r = await req('GET', `/bookings/${bookingId}`, { token });
    record(`GET /bookings/${bookingId}`, r.status, r.status === 200);

    r = await req('GET', `/bookings/${bookingId}/tracking`, { token });
    record(
      `GET /bookings/${bookingId}/tracking`,
      r.status,
      r.status === 200,
      r.status === 404 ? 'not implemented' : msg(r.json),
    );
  }

  r = await req('POST', '/bookings', {
    token,
    body: {
      booking_type: 'food',
      restaurant_id: 1,
      delivery_address: 'Test',
      distance_km: 4,
      items: [{ menu_item_id: 1, quantity: 1 }],
      promo_code: '',
    },
  });
  record('POST /bookings (food)', r.status, r.status === 200 || r.status === 201, msg(r.json));

  r = await req('GET', '/address', { token });
  record('GET /address', r.status, r.status === 200);

  r = await req('GET', '/restaurants', { token });
  record(
    'GET /restaurants',
    r.status,
    r.status === 200,
    r.status === 404 ? 'not in Postman — may be removed' : msg(r.json),
  );

  r = await req('POST', '/forgot-password', { body: { email: 'user@mailinator.com' } });
  record('POST /forgot-password', r.status, r.status === 200, msg(r.json));

  r = await req('POST', '/resend-otp', { body: { phone: auth.cred.phone } });
  record('POST /resend-otp', r.status, r.status === 200, msg(r.json));

  r = await req('GET', '/driver/wallet/summary', { token });
  record('GET /driver/wallet/summary (as user)', r.status, r.status === 403, '403 expected');

  r = await req('GET', '/userbooking/list', { token });
  record('GET /userbooking/list (legacy)', r.status, r.status === 200);

  r = await req('GET', '/conversation/list', { token });
  record('GET /conversation/list (legacy)', r.status, r.status === 200 || r.status === 404);

  console.log('\n--- App vs Postman (not wired in mobile) ---');
  const appGaps = [
    'GET /home — Postman has it; app Home.tsx uses hardcoded banner/promos (not API)',
    'API_ROUTES.HOME is user/home but Postman uses GET /home',
    'GET /restaurants — app uses it; not in updated Postman folder list',
  ];
  appGaps.forEach(g => console.log(`  • ${g}`));

  console.log('\n--- Summary ---');
  const failed = results.filter(x => !x.ok && !x.note.includes('expected') && !x.note.includes('403'));
  console.log(`Total checks: ${results.length}, Failed: ${failed.length}`);
  failed.forEach(f => console.log(`  - ${f.name}: ${f.note || f.status}`));

  const homeFail = results.filter(x => x.name.includes('home') && !x.ok);
  if (homeFail.length) console.log('\nHome/promo issues:', homeFail.map(x => x.name).join(', '));

  process.exit(failed.length > 0 ? 1 : 0);
})();
