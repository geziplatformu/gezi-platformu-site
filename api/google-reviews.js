const PLACE_ID = 'ChIJd-def5XzJxURVCHoFcMzUxs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Yalnızca GET isteği desteklenir.' });
  }

  const apiKey =
    process.env.GOOGLE_YERLERI_API_ANAHTARI ||
    process.env.GOOGLE_YERLER_API_ANAHTARI ||
    process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Google Places API anahtarı tanımlı değil.' });
  }

  try {
    const fields = [
      'id',
      'displayName',
      'rating',
      'userRatingCount',
      'googleMapsUri',
      'reviews'
    ].join(',');

    const url = `https://places.googleapis.com/v1/places/${PLACE_ID}?languageCode=tr&regionCode=TR`;
    const response = await fetch(url, {
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': fields
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Google Places API error:', response.status, data);
      return res.status(response.status).json({
        error: data?.error?.message || 'Google yorumları alınamadı.'
      });
    }

    const reviews = (data.reviews || [])
      .filter((review) => Number(review.rating) >= 4)
      .map((review) => ({
        rating: Number(review.rating) || 0,
        text: review.text?.text || review.originalText?.text || '',
        relativeTime: review.relativePublishTimeDescription || '',
        publishTime: review.publishTime || '',
        googleMapsUri: review.googleMapsUri || data.googleMapsUri || '',
        author: {
          name: review.authorAttribution?.displayName || 'Google kullanıcısı',
          photoUri: review.authorAttribution?.photoUri || '',
          uri: review.authorAttribution?.uri || ''
        }
      }));

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=86400');
    return res.status(200).json({
      placeId: PLACE_ID,
      name: data.displayName?.text || 'Gezi Platformu',
      rating: Number(data.rating) || 0,
      userRatingCount: Number(data.userRatingCount) || 0,
      googleMapsUri: data.googleMapsUri || '',
      reviews,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Google reviews endpoint error:', error);
    return res.status(500).json({ error: 'Google yorumları alınırken bir hata oluştu.' });
  }
}
