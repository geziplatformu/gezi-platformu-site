export default async function handler(req, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({ error: 'GOOGLE_CLIENT_ID eksik' });
  }

  const redirectUri = 'https://www.geziplatformuu.com/api/google-analytics/callback';
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true'
  });

  res.setHeader('Cache-Control', 'no-store');
  return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
