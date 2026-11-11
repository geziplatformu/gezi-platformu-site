(()=>{
  const phone=document.getElementById('instagramPhone');
  if(!phone)return;

  const API='https://gezi-instagram-api-test.vercel.app/api/instagram/public-feed';
  const PROFILE='https://www.instagram.com/geziplatformuu/';
  const LOGO='assets/gezi-platformu-logo.webp';
  const CACHE_KEY='gp_instagram_last_good_v2';
  const CACHE_MAX_AGE=6*60*60*1000;
  const feed=document.getElementById('instagramFeed');
  const status=document.getElementById('instagramStatus');
  const username=document.getElementById('instagramUsername');
  const avatar=document.getElementById('instagramAvatar');
  const name=document.getElementById('instagramName');
  const bio=document.getElementById('instagramBio');
  const postCount=document.getElementById('instagramPostCount');
  const followerCount=document.getElementById('instagramFollowerCount');
  const followingCount=document.getElementById('instagramFollowingCount');
  const verified=document.querySelector('.verified-badge');
  let renderVersion=0;

  const format=n=>typeof n==='number'?new Intl.NumberFormat('tr-TR').format(n):'—';
  const setStatus=(text,cls='')=>{
    if(!status)return;
    status.textContent=text;
    status.className='instagram-status'+(cls?' '+cls:'');
  };
  const clearCache=()=>{try{localStorage.removeItem(CACHE_KEY);}catch{}};
  const imageUrl=value=>{
    try{const url=new URL(value);return url.protocol==='https:'?url.href:'';}catch{return '';}
  };
  const postUrl=value=>{
    try{const url=new URL(value);return url.protocol==='https:'&&['instagram.com','www.instagram.com'].includes(url.hostname)?url.href:PROFILE;}catch{return PROFILE;}
  };

  function renderProfileFallback(){
    renderVersion++;
    phone.classList.add('instagram-offline');
    if(verified)verified.hidden=true;
    if(avatar)avatar.src=LOGO;
    for(const count of [postCount,followerCount,followingCount])if(count)count.textContent='—';
    if(feed)feed.innerHTML='<div class="instagram-profile-preview"><span class="instagram-preview-icon" aria-hidden="true">📸</span><strong>Gezilerimizden daha fazlası Instagram’da</strong><p>Tur fotoğraflarımız, videolarımız ve güncel paylaşımlarımız için profilimize göz atın.</p><a class="instagram-preview-link" href="'+PROFILE+'" target="_blank" rel="noopener">Instagram profilini aç ↗</a></div>';
    setStatus('Güncel paylaşımlarımızı Instagram’da keşfedin.');
  }

  function renderPosts(posts){
    const list=Array.isArray(posts)?posts.filter(post=>post&&imageUrl(post.image_url)).slice(0,9):[];
    if(!feed||!list.length)return false;
    const version=++renderVersion;
    feed.innerHTML='';
    phone.classList.remove('instagram-offline');
    list.forEach(post=>{
      const link=document.createElement('a');
      link.className='instagram-post';
      link.href=postUrl(post.permalink);
      link.target='_blank';
      link.rel='noopener';
      link.setAttribute('aria-label','Instagram gönderisini aç');

      const img=document.createElement('img');
      img.loading='lazy';
      img.decoding='async';
      img.referrerPolicy='no-referrer';
      img.alt=String(post.caption||'Gezi Platformu Instagram gönderisi').slice(0,120);
      img.addEventListener('error',()=>{
        if(version!==renderVersion)return;
        link.remove();
        if(!feed.querySelector('.instagram-post')){
          clearCache();
          renderProfileFallback();
        }
      },{once:true});
      img.src=imageUrl(post.image_url);
      link.appendChild(img);

      if(post.media_type==='VIDEO'||post.media_type==='CAROUSEL_ALBUM'){
        const type=document.createElement('span');
        type.className='instagram-post-type';
        type.textContent=post.media_type==='VIDEO'?'▶':'▣';
        type.setAttribute('aria-hidden','true');
        link.appendChild(type);
      }
      feed.appendChild(link);
    });
    return true;
  }

  function applyData(data){
    if(!data||typeof data!=='object'||!renderPosts(data.posts))return false;
    if(username)username.textContent=data.username||'geziplatformuu';
    if(name)name.textContent=data.name||'GEZİ PLATFORMU';
    if(bio&&data.biography)bio.textContent=data.biography;
    if(avatar)avatar.src=imageUrl(data.profile_picture_url)||LOGO;
    if(postCount)postCount.textContent=format(data.media_count);
    if(followerCount)followerCount.textContent=format(data.followers_count);
    if(followingCount)followingCount.textContent=format(data.follows_count);
    if(verified)verified.hidden=data.is_verified!==true;
    return true;
  }

  function loadCached(){
    try{
      const cached=JSON.parse(localStorage.getItem(CACHE_KEY)||'null');
      const age=Date.now()-cached?.savedAt;
      if(cached?.data&&Number.isFinite(age)&&age>=0&&age<CACHE_MAX_AGE)return cached;
    }catch{}
    clearCache();
    return null;
  }

  async function refresh(){
    try{
      const response=await fetch(API,{headers:{Accept:'application/json'},cache:'no-store',signal:AbortSignal.timeout(10000)});
      if(!response.ok)throw new Error('Instagram API');
      const data=await response.json();
      if(!applyData(data))throw new Error('Instagram feed is empty');
      try{localStorage.setItem(CACHE_KEY,JSON.stringify({savedAt:Date.now(),data}));}catch{}
      const refreshed=new Date(data.refreshed_at||Date.now());
      const time=new Intl.DateTimeFormat('tr-TR',{timeZone:'Europe/Istanbul',hour:'2-digit',minute:'2-digit'}).format(Number.isNaN(refreshed.getTime())?new Date():refreshed);
      setStatus('Instagram paylaşımları • Son güncelleme '+time,'ready');
    }catch{
      const cached=loadCached();
      if(cached&&applyData(cached.data)){
        if(verified)verified.hidden=true;
        const time=new Intl.DateTimeFormat('tr-TR',{timeZone:'Europe/Istanbul',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'}).format(new Date(cached.savedAt));
        setStatus('Son alınan Instagram paylaşımları • '+time);
      }else renderProfileFallback();
    }
  }

  if(avatar)avatar.addEventListener('error',()=>{avatar.src=LOGO;},{once:true});
  try{localStorage.removeItem('gp_instagram_last_good_v1');}catch{}
  renderProfileFallback();
  refresh();
  setInterval(refresh,300000);
})();
