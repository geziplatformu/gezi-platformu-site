(()=>{
  const PROFILE='https://www.instagram.com/geziplatformuu/';

  function injectStyles(){
    if(document.getElementById('instagram-public-embed-styles')) return;
    const style=document.createElement('style');
    style.id='instagram-public-embed-styles';
    style.textContent=`
      .instagram-phone.instagram-public-mode{
        width:min(100%,540px)!important;
        padding:10px!important;
        border:7px solid #101114!important;
        border-radius:34px!important;
        background:#fff!important;
        overflow:hidden!important;
        box-shadow:0 26px 70px rgba(18,25,30,.22)!important;
      }
      .instagram-public-embed-shell{
        width:100%;
        min-height:540px;
        display:flex;
        align-items:flex-start;
        justify-content:center;
        overflow:hidden;
        border-radius:24px;
        background:#fff;
      }
      .instagram-public-embed-shell .instagram-media{
        width:100%!important;
        max-width:540px!important;
        min-width:0!important;
        margin:0!important;
        border:0!important;
        box-shadow:none!important;
      }
      .instagram-public-loading{
        min-height:540px;
        width:100%;
        display:grid;
        place-items:center;
        padding:28px;
        text-align:center;
        color:#657078;
        font-size:13px;
        line-height:1.6;
      }
      .instagram-public-loading strong{display:block;color:#152025;font-size:16px;margin-bottom:5px}
      @media(max-width:480px){
        .instagram-phone.instagram-public-mode{width:calc(100% - 4px)!important;border-width:6px!important;border-radius:30px!important;padding:7px!important}
        .instagram-public-embed-shell{border-radius:21px;min-height:500px}
      }
    `;
    document.head.appendChild(style);
  }

  function loadInstagramEmbed(){
    return new Promise(resolve=>{
      if(window.instgrm?.Embeds){ resolve(); return; }
      const existing=document.querySelector('script[src*="instagram.com/embed.js"]');
      if(existing){
        existing.addEventListener('load',()=>resolve(),{once:true});
        setTimeout(resolve,2500);
        return;
      }
      const script=document.createElement('script');
      script.async=true;
      script.src='https://www.instagram.com/embed.js';
      script.onload=()=>resolve();
      script.onerror=()=>resolve();
      document.body.appendChild(script);
    });
  }

  async function mountPublicProfile(){
    const phone=document.getElementById('instagramPhone');
    if(!phone || phone.dataset.publicEmbedMounted==='1') return;
    phone.dataset.publicEmbedMounted='1';
    injectStyles();
    phone.classList.add('instagram-public-mode');
    phone.innerHTML=`
      <div class="instagram-public-embed-shell" id="instagramPublicEmbedShell">
        <div class="instagram-public-loading" id="instagramPublicLoading">
          <div><strong>Instagram profili yükleniyor…</strong>@geziplatformuu herkese açık Instagram profilinden doğrudan yükleniyor.</div>
        </div>
        <blockquote class="instagram-media" data-instgrm-permalink="${PROFILE}" data-instgrm-version="14" style="display:none;width:100%;margin:0"></blockquote>
      </div>`;

    await loadInstagramEmbed();
    const block=phone.querySelector('.instagram-media');
    if(block) block.style.display='block';
    try{ window.instgrm?.Embeds?.process(); }catch{}

    const loading=document.getElementById('instagramPublicLoading');
    setTimeout(()=>{
      if(loading) loading.remove();
      try{ window.instgrm?.Embeds?.process(); }catch{}
    },1800);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mountPublicProfile,{once:true});
  else mountPublicProfile();
})();
