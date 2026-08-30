(()=>{
  const phone=document.getElementById('instagramPhone');
  if(!phone)return;

  const API='https://gezi-instagram-api-test.vercel.app/api/instagram/public-feed';
  const PROFILE='https://www.instagram.com/geziplatformuu/';
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

  const format=n=>typeof n==='number'?new Intl.NumberFormat('tr-TR').format(n):'—';
  const setStatus=(text,cls='')=>{
    if(!status)return;
    status.textContent=text;
    status.className='instagram-status'+(cls?' '+cls:'');
  };

  const renderPosts=posts=>{
    if(!feed)return;
    feed.innerHTML='';
    const list=Array.isArray(posts)?posts.slice(0,9):[];
    if(!list.length){
      feed.innerHTML='<div class="instagram-loading"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>';
      return;
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
      img.src=post.image_url||'';
      img.addEventListener('error',()=>link.classList.add('image-error'),{once:true});
      link.appendChild(img);

      if(post.media_type==='VIDEO'){
        const type=document.createElement('span');
        type.className='instagram-post-type';
        type.textContent='▶';
        type.setAttribute('aria-hidden','true');
        link.appendChild(type);
      } else if(post.media_type==='CAROUSEL_ALBUM'){
        const type=document.createElement('span');
        type.className='instagram-post-type';
        type.textContent='▣';
        type.setAttribute('aria-hidden','true');
        link.appendChild(type);
      }
      feed.appendChild(link);
    });
  };

  async function refresh(){
    try{
      setStatus('Instagram verileri güncelleniyor…');
      const response=await fetch(API,{headers:{Accept:'application/json'},cache:'no-store'});
      if(!response.ok)throw new Error('Instagram API');
      const data=await response.json();

      if(username)username.textContent=data.username||'geziplatformuu';
      if(name)name.textContent=data.name||'GEZİ PLATFORMU';
      if(bio&&data.biography)bio.textContent=data.biography;
      if(avatar&&data.profile_picture_url)avatar.src=data.profile_picture_url;
      if(postCount)postCount.textContent=format(data.media_count);
      if(followerCount)followerCount.textContent=format(data.followers_count);
      if(followingCount)followingCount.textContent=format(data.follows_count);
      if(verified)verified.hidden=data.is_verified!==true;
      renderPosts(data.posts);

      const refreshed=data.refreshed_at?new Date(data.refreshed_at):new Date();
      const time=new Intl.DateTimeFormat('tr-TR',{hour:'2-digit',minute:'2-digit'}).format(refreshed);
      setStatus('Canlı Instagram verileri • Son güncelleme '+time,'ready');
    }catch(error){
      if(verified)verified.hidden=true;
      setStatus('Instagram verileri şu anda yenilenemiyor. Profili açmak için gönderilere dokunabilirsiniz.','error');
    }
  }

  phone.style.background='#fff';
  phone.style.overflow='hidden';
  refresh();
  setInterval(refresh,300000);
})();
