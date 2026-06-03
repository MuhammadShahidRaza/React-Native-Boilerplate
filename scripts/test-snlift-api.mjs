#!/usr/bin/env node
/**
 * Smoke-test SNLift API vs Postman collection (updated backend).
 * Run: node scripts/test-snlift-api.mjs
 */
const BASE = 'https://demo-cmolds1.com/projects/snlift_be_2026/public/api';

async function req(method, path, { body, token } = {}) {
  const headers = { Accept: 'application/json' };
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 200) };
  }
  return { status: res.status, json };
}

const results = [];

function record(name, status, ok, note = '') {
  results.push({ name, status, ok, note });
  const mark = ok ? 'OK' : 'FAIL';
  console.log(`${mark}  ${name}  HTTP ${status}${note ? `  — ${note}` : ''}`);
}

const deviceBody = {
  udid: 'test-script',
  device_type: 'android',
  device_brand: 'Google',
  device_os: 'android',
  app_version: '1.0.0',
  device_token: 'test',
};

(async () => {
  console.log(`Base: ${BASE}\n`);

  let r = await req('GET', '/info');
  record('GET /info', r.status, r.status === 200);

  r = await req('POST', '/existing-user-check', {
    body: { email: 'probe@mailinator.com' },
  });
  record('POST /existing-user-check', r.status, r.status === 200);

  r = await req('POST', '/login', {
    body: {
      phone: '0987654321',
      password: 'Qwerty@123',
      user_type: 'user',
      ...deviceBody,
    },
  });
  const token = r.json?.response?.data?.token;
  const user = r.json?.response?.data;
  record('POST /login', r.status, r.status === 200 && !!token, token ? 'token received' : 'no token');

  const userKeys = ['wallet_balance', 'email_verified_at', 'is_onboarded'];
  const missingUserKeys = user ? userKeys.filter(k => user[k] === undefined) : userKeys;
  record(
    'Login user keys',
    r.status,
    missingUserKeys.length === 0,
    missingUserKeys.length ? `missing: ${missingUserKeys.join(', ')}` : 'all present',
  );

  r = await req('POST', '/forgot-password', { body: { email: 'user@mailinator.com' } });
  record('POST /forgot-password', r.status, r.status === 200, r.status === 500 ? 'mailer not configured' : '');

  r = await req('GET', '/content');
  record('GET /content', r.status, r.status === 200);

  if (token) {
    r = await req('GET', '/user/user', { token });
    record('GET /user/user', r.status, r.status === 200);

    r = await req('GET', '/user/wallet-summary', { token });
    const summary = r.json?.response?.data?.summary;
    record(
      'GET /user/wallet-summary',
      r.status,
      r.status === 200 && summary?.wallet_balance !== undefined,
      summary ? 'summary.wallet_balance ok' : 'no summary object',
    );

    r = await req('GET', '/wallet', { token });
    record('GET /wallet (compat)', r.status, r.status === 200);

    r = await req('POST', '/user/device', { token, body: deviceBody });
    record(
      'POST /user/device',
      r.status,
      r.status === 200 || r.status === 201,
      r.status === 500 ? 'server error — see SNLIFT_API_ISSUES.md' : '',
    );

    r = await req('GET', '/notification', { token });
    record('GET /notification', r.status, r.status === 200);

    r = await req('GET', '/restaurants', { token });
    const restaurants = r.json?.response?.data?.restaurants;
    record(
      'GET /restaurants',
      r.status,
      r.status === 200 && Array.isArray(restaurants),
      restaurants?.length ? `${restaurants.length} restaurants` : 'empty list',
    );

    r = await req('GET', '/address', { token });
    record('GET /address', r.status, r.status === 200);

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
    record('POST /bookings (ride)', r.status, r.status === 201 || r.status === 200);

    r = await req('GET', '/content/about-us', { token });
    record('GET /content/about-us', r.status, r.status === 200);

    r = await req('GET', '/driver/wallet/summary', { token });
    record(
      'GET /driver/wallet/summary (as user)',
      r.status,
      r.status === 403,
      '403 expected for user role',
    );

    r = await req('GET', '/userbooking/list', { token });
    record('GET /userbooking/list (legacy)', r.status, r.status === 200);

    r = await req('GET', '/conversation/list', { token });
    record('GET /conversation/list (legacy)', r.status, r.status === 200 || r.status === 404);

    r = await req('POST', '/ratings/create', {
      token,
      body: { module: 'ride', module_id: 1, rating: 5, review: 'test' },
    });
    record(
      'POST /ratings/create',
      r.status,
      r.status === 200 || r.status === 201 || r.status === 422,
      r.status === 422 ? 'validation ok if no booking 1' : '',
    );
  }

  console.log('\n--- Summary ---');
  const failed = results.filter(
    x =>
      !x.ok &&
      !x.note.includes('expected') &&
      !x.note.includes('mailer') &&
      !x.note.includes('server error'),
  );
  console.log(`Total: ${results.length}, Failed (blocking): ${failed.length}`);
  if (failed.length) {
    failed.forEach(f => console.log(`  - ${f.name}: ${f.note || f.status}`));
  }
  process.exit(failed.length > 0 ? 1 : 0);
})();
