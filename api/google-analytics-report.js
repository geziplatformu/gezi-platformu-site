function env(name, fallbackName) {
  return process.env[name] || (fallbackName ? process.env[fallbackName] : undefined);
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
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error?.message || `Google Analytics API hatası (${r.status})`);
  return data;
}

const metric = (row, idx) => Number(row?.metricValues?.[idx]?.value || 0);
const dim = (row, idx) => row?.dimensionValues?.[idx]?.value || '(bilinmiyor)';

function periodConfig(raw) {
  const period = String(raw || '7');
  if (period === 'today') return { key: period, label: 'Bugün', startDate: 'today', endDate: 'today' };
  if (period === 'yesterday') return { key: period, label: 'Dün', startDate: 'yesterday', endDate: 'yesterday' };
  const days = [7, 14, 30].includes(Number(period)) ? Number(period) : 7;
  return { key: String(days), label: `Son ${days} gün`, startDate: `${days - 1}daysAgo`, endDate: 'today' };
}

function rowsAsList(report, nameIndex = 0, sessionMetricIndex = 0, userMetricIndex = 1, limit = 15) {
  return (report.rows || []).slice(0, limit).map(row => ({
    name: dim(row, nameIndex),
    sessions: metric(row, sessionMetricIndex),
    activeUsers: metric(row, userMetricIndex)
  }));
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  try {
    const propertyId = env('GA_PROPERTY_ID');
    if (!propertyId) throw new Error('GA_PROPERTY_ID ortam değişkeni eksik.');
    const accessToken = await getAccessToken();
    const period = periodConfig(req.query?.period);
    const dateRanges = [{ startDate: period.startDate, endDate: period.endDate }];

    const [summary, pages, city, source, device, daily, realtime] = await Promise.all([
      gaRequest(accessToken, propertyId, 'runReport', {
        dateRanges,
        metrics: [
          { name: 'sessions' }, { name: 'activeUsers' }, { name: 'newUsers' },
          { name: 'screenPageViews' }, { name: 'averageSessionDuration' },
          { name: 'engagementRate' }, { name: 'engagedSessions' }
        ]
      }),
      gaRequest(accessToken, propertyId, 'runReport', {
        dateRanges,
        dimensions: [{ name: 'pagePathPlusQueryString' }, { name: 'pageTitle' }],
        metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }, { name: 'userEngagementDuration' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 500
      }),
      gaRequest(accessToken, propertyId, 'runReport', {
        dateRanges,
        dimensions: [{ name: 'city' }],
        metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 100
      }),
      gaRequest(accessToken, propertyId, 'runReport', {
        dateRanges,
        dimensions: [{ name: 'sessionSourceMedium' }],
        metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 100
      }),
      gaRequest(accessToken, propertyId, 'runReport', {
        dateRanges,
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10
      }),
      gaRequest(accessToken, propertyId, 'runReport', {
        dateRanges,
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'sessions' }, { name: 'activeUsers' }, { name: 'screenPageViews' }],
        orderBys: [{ dimension: { dimensionName: 'date' } }],
        limit: 100
      }),
      gaRequest(accessToken, propertyId, 'runRealtimeReport', {
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 50
      })
    ]);

    const s = summary.rows?.[0];
    const pageRows = (pages.rows || []).map(row => {
      const views = metric(row, 0);
      const users = metric(row, 1);
      const engagementSeconds = metric(row, 2);
      return {
        path: dim(row, 0),
        title: dim(row, 1),
        views,
        activeUsers: users,
        totalEngagementSeconds: engagementSeconds,
        avgEngagementSecondsPerUser: users ? engagementSeconds / users : 0
      };
    });

    const dailyRows = (daily.rows || []).map(row => ({
      date: dim(row, 0), sessions: metric(row, 0), activeUsers: metric(row, 1), pageViews: metric(row, 2)
    }));
    const realtimeCountries = (realtime.rows || []).map(row => ({ name: dim(row, 0), activeUsers: metric(row, 0) }));
    const activeNow = realtimeCountries.reduce((sum, item) => sum + item.activeUsers, 0);

    return res.status(200).json({
      ok: true,
      generatedAt: new Date().toISOString(),
      period,
      activeUsersLast30Minutes: activeNow,
      realtimeCountries,
      summary: {
        sessions: metric(s, 0), activeUsers: metric(s, 1), newUsers: metric(s, 2), pageViews: metric(s, 3),
        averageSessionDurationSeconds: metric(s, 4), engagementRate: metric(s, 5), engagedSessions: metric(s, 6)
      },
      pages: pageRows,
      cities: rowsAsList(city, 0, 0, 1, 25),
      sources: rowsAsList(source, 0, 0, 1, 25),
      devices: rowsAsList(device, 0, 0, 1, 10),
      daily: dailyRows
    });
  } catch (error) {
    console.error('Analytics report error:', error);
    return res.status(500).json({ ok: false, error: error?.message || 'Bilinmeyen hata' });
  }
}
