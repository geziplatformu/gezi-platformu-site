(()=>{
  const PROFILE='https://www.instagram.com/geziplatformuu/';

  function injectStyles(){
    if(document.getElementById('instagram-public-embed-styles')) return;
    const style=document.createElement('style');
    style.id='instagram-public-embed-styles';
    style.textContent=`
      .instagram-phone.instagram-public-mode{
        position:relative!important;
        width:min(100%,430px)!important;
        margin:0 auto 24px!important;
        padding:38px 9px 28px!important;
        border:8px solid #111316!important;
        border-radius:52px!important;
        background:linear-gradient(145deg,#2b2e32 0%,#0c0d0f 35%,#1b1d20 70%,#050607 100%)!important;
        overflow:visible!important;
        box-shadow:0 30px 80px rgba(12,18,22,.34),0 7px 20px rgba(12,18,22,.2),inset 0 0 0 1px rgba(255,255,255,.12)!important;
        isolation:isolate;
      }
      .instagram-phone.instagram-public-mode::before{
        content:"";
        position:absolute;
        z-index:5;
        top:11px;
        left:50%;
        width:112px;
        height:27px;
        transform:translateX(-50%);
        border-radius:999px;
        background:#050506;
        box-shadow:inset 0 1px 2px rgba(255,255,255,.08),0 1px 3px rgba(0,0,0,.35);
      }
      .instagram-phone.instagram-public-mode::after{
        content:"";
        position:absolute;
        z-index:5;
        left:50%;
        bottom:11px;
        width:112px;
        height:5px;
        transform:translateX(-50%);
        border-radius:999px;
        background:rgba(255,255,255,.88);
        box-shadow:0 1px 2px rgba(0,0,0,.18);
      }
      .instagram-public-embed-shell{
        position:relative;
        width:100%;
        min-height:600px;
        display:flex;
        align-items:flex-start;
        justify-content:center;
        overflow:hidden;
        border-radius:34px;
        background:#fff;
        box-shadow:inset 0 0 0 1px rgba(0,0,0,.08);
      }
      .instagram-public-embed-shell::before{
        content:"";
        position:absolute;
        inset:0;
        z-index:2;
        pointer-events:none;
        border-radius:34px;
        box-shadow:inset 0 0 22px rgba(0,0,0,.045),inset 0 1px 0 rgba(255,255,255,.8);
      }
      .instagram-public-embed-shell .instagram-media{
        width:100%!important;
        max-width:100%!important;
        min-width:0!important;
        margin:0!important;
        border:0!important;
        box-shadow:none!important;
        background:#fff!important;
      }
      .instagram-public-loading{
        min-height:600px;
        width:100%;
        display:grid;
        place-items:center;
        padding:32px;
        text-align:center;
        color:#657078;
        font-size:13px;
        line-height:1.6;
        background:linear-gradient(180deg,#fff,#fafafa);
      }
      .instagram-public-loading strong{display:block;color:#152025;font-size:16px;margin-bottom:5px}
      .instagram-phone.instagram-public-mode .phone-island,
      .instagram-phone.instagram-public-mode .phone-statusbar,
      .instagram-phone.instagram-public-mode .phone-homebar{display:none!important}
      .instagram-phone.instagram-public-mode .instagram-side-key,
      .instagram-phone.instagram-public-mode .instagram-volume-key{position:absolute;display:block;background:#17191c;border-radius:3px;box-shadow:inset 1px 0 rgba(255,255,255,.08),0 1px 2px rgba(0,0,0,.4)}
      .instagram-phone.instagram-public-mode .instagram-side-key{right:-12px;top:156px;width:4px;height:82px}
      .instagram-phone.instagram-public-mode .instagram-volume-key{left:-12px;top:128px;width:4px;height:58px}
      .instagram-phone.instagram-public-mode .instagram-volume-key.second{top:196px;height:58px}
      @media(max-width:480px){
        .instagram-phone.instagram-public-mode{width:calc(100% - 12px)!important;padding:34px 7px 25px!important;border-width:7px!important;border-radius:46px!important}
        .instagram-public-embed-shell{border-radius:30px;min-height:560px}
        .instagram-public-embed-shell::before{border-radius:30px}
        .instagram-public-loading{min-height:560px}
        .instagram-phone.instagram-public-mode::before{top:10px;width:100px;height:25px}
        .instagram-phone.instagram-public-mode::after{bottom:9px;width:96px;height:4px}
        .instagram-phone.instagram-public-mode .instagram-side-key{right:-10px}
        .instagram-phone.instagram-public-mode .instagram-volume-key{left:-10px}
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
      <span class="instagram-side-key" aria-hidden="true"></span>
      <span class="instagram-volume-key" aria-hidden="true"></span>
      <span class="instagram-volume-key second" aria-hidden="true"></span>
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
