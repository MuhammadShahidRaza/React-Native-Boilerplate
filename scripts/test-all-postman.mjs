#!/usr/bin/env node
/**
 * Test all 50 Postman collection endpoints against live API.
 */
const BASE =
  process.env.API_BASE_URL?.replace(/\/$/, '') ||
  'https://demo-cmolds1.com/projects/snlift_be_2026/public/api';

const deviceBody = {
  udid: 'postman-audit',
  device_type: 'ios',
  device_brand: 'Apple',
  device_os: 'ios',
  app_version: '1.0.4',
  device_token: 'audit-token',
};

const USER = { phone: '0987654321', password: 'Passward123!', user_type: 'user' };
const DRIVER = { phone: '+923242445623', password: 'Passward123!', user_type: 'driver' };
const COURIER = { phone: '+9230012345677', password: 'Qwerty@123', user_type: 'courier' };

const report = { ok: [], fail: [], skip: [], keyIssues: [] };

async function req(method, path, opts = {}) {
  const { body, token, formData } = opts;
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
    json = { raw: text.slice(0, 200) };
  }
  const msg =
    json?.error?.messages?.[0] ||
    json?.response?.messages?.[0] ||
    (typeof json?.message === 'string' ? json.message : '');
  return { status: res.status, json, msg: String(msg).slice(0, 120) };
}

async function login(cred) {
  const r = await req('POST', '/login', { body: { ...cred, ...deviceBody } });
  const token = r.json?.response?.data?.token;
  return token ? { token, user: r.json.response.data } : null;
}

function logResult(name, r, expectOk = true, note = '') {
  const ok = expectOk ? r.status >= 200 && r.status < 300 : true;
  const entry = { name, status: r.status, msg: r.msg || note };
  if (ok) report.ok.push(entry);
  else report.fail.push(entry);
  console.log(`${ok ? 'OK' : 'FAIL'} ${name} → ${r.status} ${r.msg || note}`);
}

function checkAppKeys(label, obj, expected, optional = []) {
  if (!obj) {
    report.keyIssues.push({ label, missing: expected, note: 'no data object' });
    return;
  }
  const keys = Object.keys(obj);
  const missing = expected.filter(k => !keys.includes(k));
  if (missing.length) {
    report.keyIssues.push({ label, missing, present: keys, optional });
    console.log(`  KEYS ${label}: missing ${missing.join(', ')}`);
  }
}

(async () => {
  console.log(`Testing ${BASE}\n`);

  // --- Public ---
  logResult('GET /info', await req('GET', '/info'));
  logResult('POST /existing-user-check', await req('POST', '/existing-user-check', { body: { email: 'user@mailinator.com' } }));

  const ts = Date.now();
  const regEmail = `audit${ts}@mailinator.com`;
  const regPhone = `300${String(ts).slice(-8)}`;
  const fd = new FormData();
  fd.append('full_name', 'Audit User');
  fd.append('email', regEmail);
  fd.append('password', 'SecurePass123');
  fd.append('phone', regPhone);
  fd.append('user_type', 'user');
  logResult('POST /register', await req('POST', '/register', { formData: fd }));

  logResult('POST /resend-otp', await req('POST', '/resend-otp', { body: { phone: regPhone } }));
  logResult('POST /verify-otp', await req('POST', '/verify-otp', { body: { phone: regPhone, otp_code: '9999' } }));

  const userAuth = await login(USER);
  if (!userAuth) {
    console.error('Cannot login user');
    process.exit(1);
  }
  const { token: userToken, user } = userAuth;
  logResult('POST /login (user)', { status: 200, msg: user.email });

  logResult(
    'POST /social-login',
    await req('POST', '/social-login', {
      body: { provider: 'google', access_token: 'invalid-test' },
    }),
    false,
  );

  logResult(
    'POST /forgot-password (email only)',
    await req('POST', '/forgot-password', { body: { email: 'user@mailinator.com' } }),
    false,
  );
  logResult(
    'POST /forgot-password (phone)',
    await req('POST', '/forgot-password', { body: { phone: USER.phone } }),
  );
  logResult(
    'POST /verify-code',
    await req('POST', '/verify-code', { body: { phone: USER.phone, code: '1234' } }),
    false,
  );
  logResult(
    'POST /reset-password',
    await req('POST', '/reset-password', {
      body: { phone: USER.phone, code: '1234', password: 'NewPass123!', password_confirmation: 'NewPass123!' },
    }),
    false,
  );

  logResult('GET /content', await req('GET', '/content', { token: userToken }));
  logResult('GET /content/about-us', await req('GET', '/content/about-us', { token: userToken }));
  logResult('GET /user/user', await req('GET', '/user/user', { token: userToken }));
  logResult(
    'PATCH /user/update',
    await req('PATCH', '/user/update', { token: userToken, body: { full_name: user.full_name || 'Test User' } }),
  );
  logResult(
    'POST /user/update-password',
    await req('POST', '/user/update-password', {
      token: userToken,
      body: { current_password: USER.password, password: USER.password, password_confirmation: USER.password },
    }),
  );
  logResult(
    'PATCH /user/onboarding',
    await req('PATCH', '/user/onboarding', { token: userToken, body: { step: 1 } }),
  );
  logResult('GET /user/wallet-summary', await req('GET', '/user/wallet-summary', { token: userToken }));
  logResult('POST /user/device', await req('POST', '/user/device', { token: userToken, body: deviceBody }));
  logResult('DELETE /user/device', await req('DELETE', '/user/device', { token: userToken, body: deviceBody }));

  logResult(
    'POST /contact/create',
    await req('POST', '/contact/create', {
      token: userToken,
      body: { name: 'Test', email: 'test@mailinator.com', message: 'audit' },
    }),
  );
  logResult('GET /notification', await req('GET', '/notification', { token: userToken }));

  const ride = await req('POST', '/bookings', {
    token: userToken,
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
      promo_code: 'RIDE20',
    },
  });
  const bookingId = ride.json?.response?.data?.id ?? ride.json?.response?.data?.booking?.id;
  logResult('POST /bookings (ride)', ride);

  const food = await req('POST', '/bookings', {
    token: userToken,
    body: {
      booking_type: 'food',
      restaurant_id: 1,
      delivery_address: 'Test St',
      distance_km: 4,
      items: [{ menu_item_id: 1, quantity: 1 }],
      promo_code: 'WELCOME10',
    },
  });
  logResult('POST /bookings (food)', food);

  logResult('GET /bookings', await req('GET', '/bookings', { token: userToken }));

  if (bookingId) {
    logResult(`GET /bookings/${bookingId}`, await req('GET', `/bookings/${bookingId}`, { token: userToken }));
    logResult(
      `GET /bookings/${bookingId}/tracking`,
      await req('GET', `/bookings/${bookingId}/tracking`, { token: userToken }),
    );
    logResult(
      `POST /bookings/${bookingId}/cancel`,
      await req('POST', `/bookings/${bookingId}/cancel`, { token: userToken, body: { reason: 'audit' } }),
    );
  } else {
    report.skip.push({ name: 'booking detail/tracking/cancel', reason: 'no booking id from create' });
    console.log('SKIP booking routes — no id in create response');
    const keys = ride.json?.response?.data ? Object.keys(ride.json.response.data) : [];
    if (keys.length) report.keyIssues.push({ label: 'POST /bookings response', missing: ['id'], present: keys });
  }

  const homeR = await req('GET', '/home', { token: userToken });
  logResult('GET /home', homeR);
  const home = homeR.json?.response?.data;
  if (home) {
    const banner = home.banners?.[0];
    const promo = home.promo_codes?.[0];
    // App Home.tsx expects: banner title, subtitle, image; promo code + desc
    checkAppKeys('banner[0] for UI', banner, ['id', 'title', 'image'], ['sub_title', 'sub_title as desc']);
    checkAppKeys('promo[0] for UI', promo, ['code'], ['description', 'desc']);
    if (banner && !banner.description && !banner.desc && banner.sub_title) {
      console.log('  NOTE: app uses desc — API has sub_title (map in app)');
    }
    if (promo && !promo.description && !promo.desc) {
      report.keyIssues.push({
        label: 'promo_codes[0] for Home.tsx desc line',
        missing: ['description', 'desc'],
        present: Object.keys(promo),
        note: 'Build desc from discount_type + discount_value in app',
      });
      console.log('  KEYS promo UI desc: missing description/desc (derive from discount_*)');
    }
  }

  logResult('POST /ratings/create', await req('POST', '/ratings/create', { token: userToken, body: { booking_id: bookingId || 1, rating: 5, comment: 'ok' } }));
  logResult('POST /review/create', await req('POST', '/review/create', { token: userToken, body: { booking_id: bookingId || 1, rating: 5, comment: 'ok' } }));

  logResult('GET /wallet', await req('GET', '/wallet', { token: userToken }));
  logResult(
    'POST /wallet/stripe-connect/link',
    await req('POST', '/wallet/stripe-connect/link', { token: userToken }),
  );

  logResult('GET /address', await req('GET', '/address', { token: userToken }));
  const addr = await req('POST', '/address/create', {
    token: userToken,
    body: { label: 'Home', address: '123 Test', latitude: 24.86, longitude: 67.0 },
  });
  logResult('POST /address/create', addr);
  const addrId = addr.json?.response?.data?.id;
  logResult('POST /address (alias)', await req('POST', '/address', { token: userToken, body: { label: 'Work', address: '456 Test', latitude: 24.87, longitude: 67.01 } }));
  if (addrId) {
    logResult(`PATCH /address/${addrId}`, await req('PATCH', `/address/${addrId}`, { token: userToken, body: { label: 'Home Updated' } }));
    logResult(`DELETE /address/${addrId}`, await req('DELETE', `/address/${addrId}`, { token: userToken }));
  }

  // Legacy
  logResult('GET /userbooking/list', await req('GET', '/userbooking/list', { token: userToken }), false);
  logResult('GET /dentorbooking/list', await req('GET', '/dentorbooking/list', { token: userToken }), false);
  logResult('GET /conversation/list', await req('GET', '/conversation/list', { token: userToken }), false);
  logResult('GET /message/list', await req('GET', '/message/list', { token: userToken }), false);

  // Driver / courier wallets
  const driverAuth = await login(DRIVER);
  if (driverAuth) {
    logResult('GET /driver/wallet/summary', await req('GET', '/driver/wallet/summary', { token: driverAuth.token }));
    logResult('GET /driver/wallet/transactions', await req('GET', '/driver/wallet/transactions', { token: driverAuth.token }));
    const avail = await req('GET', '/bookings?scope=available', { token: driverAuth.token });
    logResult('GET /bookings?scope=available (driver)', avail);
    if (bookingId) {
      logResult(
        `POST /bookings/${bookingId}/accept (driver)`,
        await req('POST', `/bookings/${bookingId}/accept`, { token: driverAuth.token }),
        false,
      );
    }
  } else {
    report.skip.push({ name: 'driver routes', reason: 'driver login failed' });
  }

  const courierAuth = await login(COURIER);
  if (courierAuth) {
    logResult('GET /courier/wallet/summary', await req('GET', '/courier/wallet/summary', { token: courierAuth.token }));
    logResult('GET /courier/wallet/transactions', await req('GET', '/courier/wallet/transactions', { token: courierAuth.token }));
  } else {
    report.skip.push({ name: 'courier routes', reason: 'courier login failed' });
  }

  // App-only route not in Postman
  const rest = await req('GET', '/restaurants', { token: userToken });
  logResult('GET /restaurants (app, not in Postman)', rest);

  // user/home legacy app route
  const oldHome = await req('GET', '/user/home', { token: userToken });
  logResult('GET /user/home (old app route)', oldHome, false);

  console.log('\n========== SUMMARY ==========');
  console.log(`Pass: ${report.ok.length}  Fail: ${report.fail.length}  Skip: ${report.skip.length}`);
  if (report.fail.length) {
    console.log('\nNot working / wrong status:');
    report.fail.forEach(f => console.log(`  • ${f.name} — HTTP ${f.status}: ${f.msg}`));
  }
  if (report.keyIssues.length) {
    console.log('\nMissing keys (vs app UI expectations):');
    report.keyIssues.forEach(k => console.log(`  • ${k.label}: missing [${k.missing?.join(', ')}]${k.note ? ` (${k.note})` : ''}`));
  }
  if (report.skip.length) {
    console.log('\nSkipped:');
    report.skip.forEach(s => console.log(`  • ${s.name}: ${s.reason}`));
  }

  const fs = await import('fs');
  const out = '/Users/shahidraza/Documents/CMOLDS/Boilerplate/docs/SNLIFT_API_AUDIT_LATEST.json';
  fs.writeFileSync(out, JSON.stringify(report, null, 2));
  console.log(`\nWrote ${out}`);
})();
