export default async function handler(req, res) {
  const { code, error } = req.query || {};
  if (error) {
    return res.status(400).send(`Google yetkilendirme hatası: ${error}`);
  }
  if (!code) {
    return res.status(400).send('Yetkilendirme kodu bulunamadı.');
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return res.status(500).send('Google OAuth ortam değişkenleri eksik.');
  }

  const redirectUri = 'https://www.geziplatformuu.com/api/google-analytics/callback';
  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code'
  });

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });

  const tokenData = await tokenResponse.json();
  if (!tokenResponse.ok) {
    return res.status(tokenResponse.status).json({ error: 'Token alınamadı', details: tokenData });
  }

  if (!tokenData.refresh_token) {
    return res.status(400).send('Refresh token alınamadı. Google hesabında erişimi kaldırıp tekrar deneyin.');
  }

  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(`<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Google Analytics Bağlandı</title><style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:760px;margin:40px auto;padding:0 20px;line-height:1.5}code{display:block;word-break:break-all;background:#f4f4f4;padding:16px;border-radius:10px}strong{color:#137333}</style></head><body><h1>Google Analytics bağlantısı tamamlandı</h1><p><strong>Son bir adım kaldı.</strong> Aşağıdaki değeri Vercel'de <code>GOOGLE_REFRESH_TOKEN</code> adlı hassas ortam değişkeni olarak kaydedin. Bu sayfayı başkasıyla paylaşmayın.</p><code>${tokenData.refresh_token}</code></body></html>`);
}
