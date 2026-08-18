(()=>{
  const PROFILE='https://www.instagram.com/geziplatformuu/';
  const LOGO='assets/gezi-platformu-logo.webp';
  const KEY='gezi-instagram-last-visible-v2';
  const $=id=>document.getElementById(id);
  function safeTiles(){
    return Array.from({length:9},(_,i)=>`<a class="instagram-post instagram-resilience-tile" href="${PROFILE}" target="_blank" rel="noopener" aria-label="Gezi Platformu Instagram profilini aç"><img src="${LOGO}" alt="Gezi Platformu"><span>${i===4?'@geziplatformuu':'Instagram'}</span></a>`).join('');
  }
  function saveVisible(){
    const feed=$('instagramFeed'); if(!feed)return;
    if(feed.querySelector('a.instagram-post:not(.instagram-resilience-tile)')){
      try{localStorage.setItem(KEY,JSON.stringify({html:feed.innerHTML,post:$('instagramPostCount')?.textContent,followers:$('instagramFollowerCount')?.textContent,following:$('instagramFollowingCount')?.textContent,ts:Date.now()}))}catch{}
    }
  }
  function restore(){
    const feed=$('instagramFeed'); if(!feed)return;
    let cached=null;try{cached=JSON.parse(localStorage.getItem(KEY)||'null')}catch{}
    const real=feed.querySelector('a.instagram-post:not(.instagram-resilience-tile)');
    if(!real){
      if(cached?.html)feed.innerHTML=cached.html;else feed.innerHTML=safeTiles();
    }
    const post=$('instagramPostCount'), followers=$('instagramFollowerCount'), following=$('instagramFollowingCount');
    if(post&&(!post.textContent.trim()||post.textContent.trim()==='—'))post.textContent=(cached?.post&&cached.post!=='—')?cached.post:'Instagram';
    if(followers&&(!followers.textContent.trim()||followers.textContent.trim()==='—'))followers.textContent=(cached?.followers&&cached.followers!=='—')?cached.followers:'Instagram';
    if(following&&(!following.textContent.trim()||following.textContent.trim()==='—'))following.textContent=(cached?.following&&cached.following!=='—')?cached.following:'Profil';
    const status=$('instagramStatus');if(status&&(!status.textContent.trim()||/yüklen|bekle/i.test(status.textContent)))status.textContent='Instagram profilimiz';
  }
  function tick(){saveVisible();restore();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{tick();setInterval(tick,2500)});else{tick();setInterval(tick,2500)}
})();
