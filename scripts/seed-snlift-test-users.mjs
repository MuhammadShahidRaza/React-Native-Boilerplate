#!/usr/bin/env node
/**
 * Seed SNLift QA accounts: user@mailinator.com, courier@mailinator.com, driver@mailinator.com
 * Password: Passward123!
 * Phones: local PK format 03XXXXXXXXX (one per role).
 *
 * Run: node scripts/seed-snlift-test-users.mjs
 */
const BASE = (
  process.env.API_BASE_URL ||
  'https://demo-cmolds1.com/projects/snlift_be_2026/public/api'
).replace(/\/$/, '');

const PASSWORD = 'Passward123!';
const STAGING_OTP = '9999';

const ACCOUNTS = [
  {
    email: 'user@mailinator.com',
    user_type: 'user',
    full_name: 'SNLift Test User',
    phone: '0987654321',
    loginPhones: ['0987654321', '03001111001'],
  },
  {
    email: 'courier@mailinator.com',
    user_type: 'courier',
    full_name: 'SNLift Test Courier',
    phone: '03001111002',
  },
  {
    email: 'driver@mailinator.com',
    user_type: 'driver',
    full_name: 'SNLift Test Driver',
    phone: '03001111003',
  },
];

async function api(method, path, { body, token, formData } = {}) {
  const headers = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !formData) headers['Content-Type'] = 'application/json';
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

async function existingUser(email) {
  const { status, json } = await api('POST', '/existing-user-check', {
    body: { email },
  });
  return status === 200 && json?.response?.data?.exists === true;
}

async function register(account) {
  const fd = new FormData();
  fd.append('full_name', account.full_name);
  fd.append('email', account.email);
  fd.append('password', PASSWORD);
  fd.append('phone', account.phone);
  fd.append('user_type', account.user_type);
  return api('POST', '/register', { formData: fd });
}

async function login(account, phone) {
  return api('POST', '/login', {
    body: {
      phone,
      password: PASSWORD,
      user_type: account.user_type,
      udid: 'seed-script',
      device_type: 'android',
      device_brand: 'Google',
      device_os: 'android',
      app_version: '1.0.0',
      device_token: 'seed',
    },
  });
}

async function tryLogin(account) {
  const phones = account.loginPhones ?? [account.phone];
  for (const phone of phones) {
    const log = await login(account, phone);
    if (log.status === 200 && log.json?.response?.data?.token) {
      return { log, phone };
    }
  }
  return { log: await login(account, account.phone), phone: account.phone };
}

async function verifyOtp(account) {
  return api('POST', '/verify-otp', {
    body: {
      phone: account.phone,
      otp_code: STAGING_OTP,
      user_type: account.user_type,
    },
  });
}

async function walletCheck(account, token) {
  const path =
    account.user_type === 'courier'
      ? '/courier/wallet/summary'
      : account.user_type === 'driver'
        ? '/driver/wallet/summary'
        : '/user/wallet-summary';
  return api('GET', path, { token });
}

async function ensureAccount(account) {
  console.log(`\n--- ${account.email} (${account.user_type}) ---`);

  const exists = await existingUser(account.email);
  if (!exists) {
    const reg = await register(account);
    if (reg.status === 201 || reg.status === 200) {
      console.log('  Registered');
    } else {
      console.log('  Register failed', reg.status, reg.json?.error?.messages || reg.json);
      return;
    }
    const ver = await verifyOtp(account);
    if (ver.status === 200) {
      console.log('  Verified OTP (staging)');
    } else {
      console.log('  Verify OTP', ver.status, ver.json?.error?.messages || ver.json?.message);
    }
  } else {
    console.log('  Email already exists — trying login');
  }

  const { log, phone: loginPhone } = await tryLogin(account);
  const data = log.json?.response?.data;
  if (log.status !== 200 || !data?.token) {
    console.log('  Login failed', log.status, log.json?.error?.messages || log.json);
    console.log(
      '  → Ask backend to DELETE this email (orphaned row), then re-run this script.',
    );
    return;
  }

  const roleOk =
    data.user_role === account.user_type || data.user_type === account.user_type;
  console.log(
    `  Login OK (phone ${loginPhone}) — user_role=${data.user_role}, user_type=${data.user_type}${roleOk ? '' : ' ⚠ role mismatch'}`,
  );

  const wallet = await walletCheck(account, data.token);
  const ok = wallet.status === 200;
  console.log(
    `  Wallet API: HTTP ${wallet.status}${ok ? '' : ' — ' + (wallet.json?.message || wallet.json?.error?.messages?.[0] || '')}`,
  );
}

(async () => {
  console.log(`API: ${BASE}`);
  console.log(`Password: ${PASSWORD}`);
  for (const account of ACCOUNTS) {
    await ensureAccount(account);
  }
  console.log('\nDone. See docs/SNLIFT_TEST_USERS.md for app login details.\n');
})();
