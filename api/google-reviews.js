const PLACE_ID='ChIJd-def5XzJxURVCHoFcMzUxs';
const GOOGLE_PROFILE_URL='https://share.google/sFKyAVuwoehO2aJFh';

function fallbackPayload(reason='unavailable'){
  return {
    placeId:PLACE_ID,
    name:'Gezi Platformu',
    rating:0,
    userRatingCount:0,
    googleMapsUri:GOOGLE_PROFILE_URL,
    reviews:[],
    available:false,
    reason,
    updatedAt:new Date().toISOString()
  };
}

export default async function handler(req,res){
  if(req.method!=='GET'){
    res.setHeader('Allow','GET');
    return res.status(405).json({error:'Yalnızca GET isteği desteklenir.'});
  }

  const apiKey=
    process.env.GOOGLE_YERLERI_API_ANAHTARI||
    process.env.GOOGLE_YERLER_API_ANAHTARI||
    process.env.GOOGLE_PLACES_API_KEY;

  // Anahtar yoksa sayfayı kırmak yerine Google işletme profiline güvenli geri dönüş yap.
  if(!apiKey){
    res.setHeader('Cache-Control','public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json(fallbackPayload('api-key-missing'));
  }

  try{
    const fields=['id','displayName','rating','userRatingCount','googleMapsUri','reviews'].join(',');
    const url=`https://places.googleapis.com/v1/places/${PLACE_ID}?languageCode=tr&regionCode=TR`;
    const upstream=await fetch(url,{
      headers:{'X-Goog-Api-Key':apiKey,'X-Goog-FieldMask':fields},
      signal:AbortSignal.timeout(8000)
    });
    const data=await upstream.json().catch(()=>({}));

    if(!upstream.ok){
      // Yanlış API kısıtı / geçici Google hatası kullanıcıya 4xx/5xx olarak yansımasın.
      res.setHeader('Cache-Control','public, s-maxage=1800, stale-while-revalidate=86400');
      return res.status(200).json(fallbackPayload(`google-${upstream.status}`));
    }

    const reviews=(data.reviews||[])
      .filter(review=>Number(review.rating)>=4)
      .map(review=>({
        rating:Number(review.rating)||0,
        text:review.text?.text||review.originalText?.text||'',
        relativeTime:review.relativePublishTimeDescription||'',
        publishTime:review.publishTime||'',
        googleMapsUri:review.googleMapsUri||data.googleMapsUri||GOOGLE_PROFILE_URL,
        author:{
          name:review.authorAttribution?.displayName||'Google kullanıcısı',
          photoUri:review.authorAttribution?.photoUri||'',
          uri:review.authorAttribution?.uri||''
        }
      }));

    res.setHeader('Cache-Control','public, s-maxage=1800, stale-while-revalidate=86400');
    return res.status(200).json({
      placeId:PLACE_ID,
      name:data.displayName?.text||'Gezi Platformu',
      rating:Number(data.rating)||0,
      userRatingCount:Number(data.userRatingCount)||0,
      googleMapsUri:data.googleMapsUri||GOOGLE_PROFILE_URL,
      reviews,
      available:true,
      updatedAt:new Date().toISOString()
    });
  }catch{
    res.setHeader('Cache-Control','public, s-maxage=300, stale-while-revalidate=86400');
    return res.status(200).json(fallbackPayload('network-error'));
  }
}
