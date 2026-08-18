const GRAPH_API_VERSION=process.env.META_GRAPH_API_VERSION||'v23.0';
const INSTAGRAM_USERNAME='geziplatformuu';
const PROFILE_URL=`https://www.instagram.com/${INSTAGRAM_USERNAME}/`;
const PUBLIC_PROFILE_URLS=[
  `https://i.instagram.com/api/v1/users/web_profile_info/?username=${INSTAGRAM_USERNAME}`,
  `https://www.instagram.com/api/v1/users/web_profile_info/?username=${INSTAGRAM_USERNAME}`
];

let lastGoodPayload=null;
let lastPublicAttempt=0;
const PUBLIC_RETRY_MS=15*60*1000;

function fallbackPayload(){
  return {
    username:INSTAGRAM_USERNAME,
    name:'GEZİ PLATFORMU',
    biography:'',
    profile_picture_url:'',
    followers_count:null,
    follows_count:null,
    media_count:null,
    media:[],
    profile_url:PROFILE_URL,
    source:'fallback'
  };
}

function normalizeOfficial(data){
  return {
    username:data.username,
    name:data.name,
    biography:data.biography,
    profile_picture_url:data.profile_picture_url,
    followers_count:data.followers_count,
    follows_count:null,
    media_count:data.media_count,
    media:(data.media?.data||[]).map(item=>({
      id:item.id,
      caption:item.caption||'',
      media_type:item.media_type,
      media_url:item.media_url,
      thumbnail_url:item.thumbnail_url,
      permalink:item.permalink,
      timestamp:item.timestamp
    })),
    profile_url:PROFILE_URL,
    source:'official'
  };
}

function normalizePublic(user){
  const edges=user.edge_owner_to_timeline_media?.edges||[];
  return {
    username:user.username,
    name:user.full_name,
    biography:user.biography,
    profile_picture_url:user.profile_pic_url_hd||user.profile_pic_url,
    followers_count:user.edge_followed_by?.count,
    follows_count:user.edge_follow?.count,
    media_count:user.edge_owner_to_timeline_media?.count,
    media:edges.slice(0,12).map(({node})=>({
      id:node.id,
      caption:node.edge_media_to_caption?.edges?.[0]?.node?.text||'',
      media_type:node.__typename==='GraphVideo'?'VIDEO':node.__typename==='GraphSidecar'?'CAROUSEL_ALBUM':'IMAGE',
      media_url:node.display_url,
      thumbnail_url:node.thumbnail_src||node.display_url,
      permalink:`https://www.instagram.com/p/${node.shortcode}/`,
      timestamp:node.taken_at_timestamp?new Date(node.taken_at_timestamp*1000).toISOString():null
    })),
    profile_url:PROFILE_URL,
    source:'public'
  };
}

async function fetchOfficialProfile(){
  const accessToken=process.env.INSTAGRAM_ACCESS_TOKEN;
  const instagramUserId=process.env.INSTAGRAM_USER_ID;
  if(!accessToken||!instagramUserId)return null;

  const fields='id,username,name,biography,profile_picture_url,followers_count,media_count,media.limit(12){id,caption,media_type,media_url,thumbnail_url,permalink,timestamp}';
  const endpoint=new URL(`https://graph.facebook.com/${GRAPH_API_VERSION}/${instagramUserId}`);
  endpoint.searchParams.set('fields',fields);
  endpoint.searchParams.set('access_token',accessToken);
  const result=await fetch(endpoint,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(8000)});
  if(!result.ok)throw new Error(`Graph API ${result.status}`);
  return normalizeOfficial(await result.json());
}

async function fetchPublicProfile(){
  if(Date.now()-lastPublicAttempt<PUBLIC_RETRY_MS)return null;
  lastPublicAttempt=Date.now();
  for(const endpoint of PUBLIC_PROFILE_URLS){
    try{
      const result=await fetch(endpoint,{
        headers:{
          Accept:'*/*',
          'Accept-Language':'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
          Referer:PROFILE_URL,
          'User-Agent':'Instagram 219.0.0.12.117 Android',
          'X-IG-App-ID':'936619743392459'
        },
        signal:AbortSignal.timeout(8000)
      });
      if(result.status===429)continue;
      if(!result.ok)continue;
      const data=await result.json();
      if(data?.data?.user)return normalizePublic(data.data.user);
    }catch{}
  }
  return null;
}

module.exports=async function handler(request,response){
  if(request.method!=='GET'){
    response.setHeader('Allow','GET');
    return response.status(405).json({error:'Yalnızca GET isteği destekleniyor.'});
  }

  let payload=null;
  try{payload=await fetchOfficialProfile();}catch{}
  if(!payload){
    try{payload=await fetchPublicProfile();}catch{}
  }
  if(payload)lastGoodPayload=payload;
  const result=payload||lastGoodPayload||fallbackPayload();

  response.setHeader('Cache-Control','public, max-age=300, s-maxage=900, stale-while-revalidate=86400');
  return response.status(200).json(result);
};
