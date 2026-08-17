const ALLOWED_HOST_SUFFIXES=['cdninstagram.com','fbcdn.net','instagram.com'];

function isAllowedHost(hostname){
  const host=String(hostname||'').toLowerCase();
  return ALLOWED_HOST_SUFFIXES.some(suffix=>host===suffix||host.endsWith(`.${suffix}`));
}

module.exports=async function handler(request,response){
  if(request.method!=='GET'){
    response.setHeader('Allow','GET');
    return response.status(405).end();
  }

  const raw=Array.isArray(request.query?.url)?request.query.url[0]:request.query?.url;
  if(!raw)return response.status(400).json({error:'Görsel URL eksik.'});

  let target;
  try{
    target=new URL(raw);
  }catch{
    return response.status(400).json({error:'Geçersiz görsel URL.'});
  }

  if(target.protocol!=='https:'||!isAllowedHost(target.hostname)){
    return response.status(403).json({error:'Bu görsel kaynağına izin verilmiyor.'});
  }

  try{
    const upstream=await fetch(target,{
      headers:{
        Accept:'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        Referer:'https://www.instagram.com/',
        'User-Agent':'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/126 Mobile Safari/537.36'
      },
      redirect:'follow',
      signal:AbortSignal.timeout(10000)
    });

    if(!upstream.ok)throw new Error(`Instagram image ${upstream.status}`);
    const contentType=upstream.headers.get('content-type')||'';
    if(!contentType.startsWith('image/'))throw new Error('Upstream response is not an image');

    const body=Buffer.from(await upstream.arrayBuffer());
    response.setHeader('Content-Type',contentType);
    response.setHeader('Cache-Control','public, s-maxage=300, stale-while-revalidate=86400');
    response.setHeader('Content-Length',String(body.length));
    return response.status(200).send(body);
  }catch(error){
    console.error('Instagram image proxy failed:',error.message);
    return response.status(502).json({error:'Instagram görseli alınamadı.'});
  }
};
