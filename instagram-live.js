(()=>{
  const phone=document.getElementById('instagramPhone');
  if(!phone)return;

  const API='https://gezi-instagram-api-test.vercel.app/api/instagram/public-feed';
  const PROFILE='https://www.instagram.com/geziplatformuu/';
  const LOGO='assets/gezi-platformu-logo.webp';
  const CACHE_KEY='gp_instagram_last_good_v1';
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

  if(verified)verified.hidden=true;
  if(avatar){
    avatar.addEventListener('error',()=>{avatar.src=LOGO;},{once:true});
  }

  const format=n=>typeof n==='number'?new Intl.NumberFormat('tr-TR').format(n):'—';
  const setStatus=(text,cls='')=>{
    if(!status)return;
    status.textContent=text;
    status.className='instagram-status'+(cls?' '+cls:'');
  };

  const renderBrandedFallback=()=>{
    if(!feed)return;
    feed.innerHTML='';
    for(let i=0;i<9;i++){
      const link=document.createElement('a');
      link.className='instagram-post instagram-fallback-post';
      link.href=PROFILE;
      link.target='_blank';
      link.rel='noopener';
      link.setAttribute('aria-label','Gezi Platformu Instagram profilini aç');
      link.style.display='grid';
      link.style.placeItems='center';
      link.style.background='linear-gradient(145deg,#f7f3ff,#fff4f7 55%,#fff8ee)';
      link.style.textDecoration='none';
      link.style.overflow='hidden';

      const img=document.createElement('img');
      img.src=LOGO;
      img.alt='Gezi Platformu';
      img.loading='lazy';
      img.decoding='async';
      img.style.width='58%';
      img.style.height='58%';
      img.style.objectFit='contain';
      link.appendChild(img);
      feed.appendChild(link);
    }
  };

  const renderPosts=posts=>{
    if(!feed)return false;
    feed.innerHTML='';
    const list=Array.isArray(posts)?posts.slice(0,9):[];
    if(!list.length){
      renderBrandedFallback();
      return false;
    }
    list.forEach(post=>{
      const link=document.createElement('a');
      link.className='instagram-post';
      link.href=post.permalink||PROFILE;
      link.target='_blank';
      link.rel='noopener';
      link.setAttribute('aria-label','Instagram gönderisini aç');

      const img=document.createElement('img');
      img.loading='lazy';
      img.decoding='async';
      img.alt=(post.caption||'Gezi Platformu Instagram gönderisi').slice(0,120);
      img.src=post.image_url||LOGO;
      img.addEventListener('error',()=>{
        img.src=LOGO;
        link.classList.add('image-error');
      },{once:true});
      link.appendChild(img);

      if(post.media_type==='VIDEO'){
        const type=document.createElement('span');
        type.className='instagram-post-type';
        type.textContent='▶';
        type.setAttribute('aria-hidden','true');
        link.appendChild(type);
      }else if(post.media_type==='CAROUSEL_ALBUM'){
        const type=document.createElement('span');
        type.className='instagram-post-type';
        type.textContent='▣';
        type.setAttribute('aria-hidden','true');
        link.appendChild(type);
      }
      feed.appendChild(link);
    });
    return true;
  };

  const applyData=data=>{
    if(!data||typeof data!=='object')return false;
    if(username)username.textContent=data.username||'geziplatformuu';
    if(name)name.textContent=data.name||'GEZİ PLATFORMU';
    if(bio&&data.biography)bio.textContent=data.biography;
    if(avatar)avatar.src=data.profile_picture_url||LOGO;
    if(postCount)postCount.textContent=format(data.media_count);
    if(followerCount)followerCount.textContent=format(data.followers_count);
    if(followingCount)followingCount.textContent=format(data.follows_count);
    if(verified)verified.hidden=data.is_verified!==true;
    renderPosts(data.posts);
    return true;
  };

  const loadCached=()=>{
    try{
      const raw=localStorage.getItem(CACHE_KEY);
      if(!raw)return null;
      const parsed=JSON.parse(raw);
      return parsed&&parsed.data?parsed:null;
    }catch{return null;}
  };

  const saveCached=data=>{
    try{localStorage.setItem(CACHE_KEY,JSON.stringify({savedAt:Date.now(),data}));}catch{}
  };

  async function refresh(){
    try{
      setStatus('Instagram verileri güncelleniyor…');
      const response=await fetch(API,{headers:{Accept:'application/json'},cache:'no-store'});
      if(!response.ok)throw new Error('Instagram API');
      const data=await response.json();
      applyData(data);
      saveCached(data);

      const refreshed=data.refreshed_at?new Date(data.refreshed_at):new Date();
      const time=new Intl.DateTimeFormat('tr-TR',{hour:'2-digit',minute:'2-digit'}).format(refreshed);
      setStatus('Canlı Instagram verileri • Son güncelleme '+time,'ready');
    }catch(error){
      if(verified)verified.hidden=true;
      const cached=loadCached();
      if(cached&&applyData(cached.data)){
        const time=new Intl.DateTimeFormat('tr-TR',{hour:'2-digit',minute:'2-digit'}).format(new Date(cached.savedAt));
        setStatus('Instagram bağlantısı yenileniyor • Son başarılı veri '+time,'ready');
      }else{
        if(username)username.textContent='geziplatformuu';
        if(name)name.textContent='GEZİ PLATFORMU';
        if(avatar)avatar.src=LOGO;
        if(postCount)postCount.textContent='—';
        if(followerCount)followerCount.textContent='—';
        if(followingCount)followingCount.textContent='—';
        renderBrandedFallback();
        setStatus('Instagram bağlantısı yenileniyor • Profilimizi aşağıdaki içeriklerden açabilirsiniz.','error');
      }
    }
  }

  phone.style.background='#fff';
  phone.style.overflow='hidden';
  renderBrandedFallback();
  refresh();
  setInterval(refresh,300000);
})();
