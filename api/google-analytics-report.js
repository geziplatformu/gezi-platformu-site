const PROPERTY_TIMEZONE = 'America/Los_Angeles';

function env(name, fallbackName) {
  return process.env[name] || (fallbackName ? process.env[fallbackName] : undefined);
}

function hourKeyForInstant(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: PROPERTY_TIMEZONE,
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date);
  const get = type => parts.find(p => p.type === type)?.value || '';
  return `${get('year')}${get('month')}${get('day')}${get('hour')}`;
}

async function getAccessToken() {
  const clientId = env('GOOGLE_CLIENT_ID');
  const clientSecret = env('GOOGLE_CLIENT_SECRET');
  const refreshToken = env('GOOGLE_REFRESH_TOKEN', 'GOOGLE_YENILEME_TOKENI');

  if (!clientId || !clientSecret || !refreshToken) {
    const missing = [];
    if (!clientId) missing.push('GOOGLE_CLIENT_ID');
    if (!clientSecret) missing.push('GOOGLE_CLIENT_SECRET');
    if (!refreshToken) missing.push('GOOGLE_REFRESH_TOKEN / GOOGLE_YENILEME_TOKENI');
    throw new Error(`Eksik ortam değişkeni: ${missing.join(', ')}`);
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token'
  });

  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  const data = await r.json();
  if (!r.ok || !data.access_token) {
    throw new Error(`Google erişim belirteci alınamadı: ${data.error_description || data.error || r.status}`);
  }
  return data.access_token;
}

async function gaRequest(accessToken, propertyId, path, payload) {
  const r = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const data = await r.json();
  if (!r.ok) {
    throw new Error(data?.error?.message || `Google Analytics API hatası (${r.status})`);
  }
  return data;
}

function metric(row, idx) {
  return Number(row?.metricValues?.[idx]?.value || 0);
}

function sumHourRows(rows, threshold) {
  return (rows || []).reduce((acc, row) => {
    const hour = row?.dimensionValues?.[0]?.value || '';
    if (hour >= threshold) {
      acc.sessions += metric(row, 0);
      acc.pageViews += metric(row, 1);
    }
    return acc;
  }, { sessions: 0, pageViews: 0 });
}

function groupRecent(rows, threshold, dimensionIndex, limit = 10) {
  const map = new Map();
  for (const row of rows || []) {
    const hour = row?.dimensionValues?.[0]?.value || '';
    if (hour < threshold) continue;
    const key = row?.dimensionValues?.[dimensionIndex]?.value || '(bilinmiyor)';
    map.set(key, (map.get(key) || 0) + metric(row, 0));
  }
  return [...map.entries()]
    .map(([name, sessions]) => ({ name, sessions }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, limit);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');

  try {
    const propertyId = env('GA_PROPERTY_ID');
    if (!propertyId) throw new Error('GA_PROPERTY_ID ortam değişkeni eksik.');

    const accessToken = await getAccessToken();
    const now = new Date();
    const threshold24 = hourKeyForInstant(new Date(now.getTime() - 24 * 60 * 60 * 1000));
    const threshold48 = hourKeyForInstant(new Date(now.getTime() - 48 * 60 * 60 * 1000));

    const [hourly, city, source, device, realtime] = await Promise.all([
      gaRequest(accessToken, propertyId, 'runReport', {
        dateRanges: [{ startDate: '3daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'dateHour' }],
        metrics: [{ name: 'sessions' }, { name: 'screenPageViews' }],
        limit: 10000
      }),
      gaRequest(accessToken, propertyId, 'runReport', {
        dateRanges: [{ startDate: '3daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'dateHour' }, { name: 'city' }],
        metrics: [{ name: 'sessions' }],
        limit: 10000
      }),
      gaRequest(accessToken, propertyId, 'runReport', {
        dateRanges: [{ startDate: '3daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'dateHour' }, { name: 'sessionSourceMedium' }],
        metrics: [{ name: 'sessions' }],
        limit: 10000
      }),
      gaRequest(accessToken, propertyId, 'runReport', {
        dateRanges: [{ startDate: '3daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'dateHour' }, { name: 'deviceCategory' }],
        metrics: [{ name: 'sessions' }],
        limit: 10000
      }),
      gaRequest(accessToken, propertyId, 'runRealtimeReport', {
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'activeUsers' }],
        limit: 50
      })
    ]);

    const last24 = sumHourRows(hourly.rows, threshold24);
    const last48 = sumHourRows(hourly.rows, threshold48);
    const activeNow = (realtime.rows || []).reduce((n, row) => n + metric(row, 0), 0);

    return res.status(200).json({
      ok: true,
      generatedAt: new Date().toISOString(),
      propertyId,
      propertyTimezone: PROPERTY_TIMEZONE,
      activeUsersLast30Minutes: activeNow,
      last24Hours: last24,
      last48Hours: last48,
      cities24Hours: groupRecent(city.rows, threshold24, 1),
      sources24Hours: groupRecent(source.rows, threshold24, 1),
      devices24Hours: groupRecent(device.rows, threshold24, 1, 5)
    });
  } catch (error) {
    console.error('Analytics report error:', error);
    return res.status(500).json({ ok: false, error: error?.message || 'Bilinmeyen hata' });
  }
}
